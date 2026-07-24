<?php
/**
 * inc/rss.php — fetch + render RSS with a simple disk TTL cache.
 *
 * Cache layout: <app_root>/data/cache/rss/<md5(url)>.xml
 * TTL: 600 seconds (10 min). Fetch timeout: 3 seconds. Stale-while-error: the
 * last successful snapshot is returned if a refresh attempt fails.
 *
 * Failure-log throttle: <app_root>/data/cache/rss/<md5(url)>.logged marks the
 * last time a failure was logged for that URL; rss_log_error() skips logging
 * while that marker is younger than RSS_TTL (a dead feed hit repeatedly —
 * e.g. lazy-loaded tabs or the synchronously-rendered first tab on every
 * landing-page view — would otherwise spam the log once per request). A
 * successful fetch removes the marker so a later failure re-arms logging
 * immediately.
 *
 * Hardening: SimpleXMLElement is constructed with LIBXML_NONET so no network
 * access happens during parsing (XXE defense-in-depth).
 */

const RSS_TTL              = 600;
const RSS_FETCH_TIMEOUT    = 3;
const RSS_USER_AGENT       = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Suche/3.0';
const RSS_CACHE_DIR_REL    = '/data/cache/rss';

function rss_cache_dir(): string {
    $dir = dirname(__DIR__) . RSS_CACHE_DIR_REL;
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir;
}

function rss_cache_path(string $url): string {
    return rss_cache_dir() . '/' . md5($url) . '.xml';
}

function rss_log_marker_path(string $url): string {
    return rss_cache_dir() . '/' . md5($url) . '.logged';
}

/**
 * Log an RSS fetch failure with the feed URL and a concrete reason — but only
 * once per RSS_TTL window per URL (see file header). Uses appendLog()
 * (visible in the Admin-Log view) when a DB connection is available in the
 * global scope; falls back to error_log() otherwise (e.g. unit tests that
 * don't bootstrap $con).
 */
function rss_log_error(string $url, string $reason): void {
    $marker = rss_log_marker_path($url);
    if (is_file($marker) && (time() - filemtime($marker)) < RSS_TTL) {
        return;
    }
    @touch($marker);

    global $con;
    $message = 'RSS-Feed-Fehler: ' . $url . ' — ' . $reason;
    if (isset($con) && $con instanceof \mysqli) {
        appendLog($con, 'rss', $message);
    } else {
        error_log('[suche/rss] ' . $message);
    }
}

/**
 * Returns parsed XML or null if neither a fresh fetch nor a cached copy works.
 * Side effect: writes fresh content to the cache file on success.
 */
function rss_fetch(string $url): ?SimpleXMLElement {
    $path = rss_cache_path($url);

    // ── Fresh path ─────────────────────────────────────────────────────────
    if (is_file($path) && (time() - filemtime($path)) < RSS_TTL) {
        return rss_parse((string) file_get_contents($path));
    }

    // ── Try to refresh ─────────────────────────────────────────────────────
    $ctx = stream_context_create([
        'http'  => [
            'header'          => 'User-Agent: ' . RSS_USER_AGENT . "\r\n",
            'timeout'         => RSS_FETCH_TIMEOUT,
            'follow_location' => 1,
        ],
        'https' => [
            'header'          => 'User-Agent: ' . RSS_USER_AGENT . "\r\n",
            'timeout'         => RSS_FETCH_TIMEOUT,
            'follow_location' => 1,
        ],
    ]);
    $fresh = @file_get_contents($url, false, $ctx);

    if ($fresh !== false && $fresh !== '') {
        $xml = rss_parse($fresh);
        if ($xml !== null) {
            @file_put_contents($path, $fresh);
            @unlink(rss_log_marker_path($url));
            return $xml;
        }
        rss_log_error($url, 'Antwort ist kein gültiges XML/RSS.');
    } elseif ($fresh === false) {
        rss_log_error($url, 'Fetch fehlgeschlagen (Timeout, DNS- oder HTTP-Fehler).');
    } else {
        rss_log_error($url, 'Leere Antwort vom Feed-Server.');
    }

    // ── Stale-while-error ──────────────────────────────────────────────────
    if (is_file($path)) {
        return rss_parse((string) file_get_contents($path));
    }

    rss_log_error($url, 'Kein Cache mehr verfügbar — Feed dauerhaft nicht erreichbar.');
    return null;
}

/**
 * Aggregate RSS health for web/status.php (TASK-8). s_feeds has no
 * per-feed "last successful fetch" column — the only signal on disk is the
 * cache file's mtime (rss_cache_path()), which rss_fetch() only touches on a
 * successful fetch (see file header). Actually live-fetching every configured
 * feed on every status-page load would defeat the whole point of the RSS
 * cache/§21 external-call discipline, so this is a lightweight AGGREGATE
 * heuristic over the existing cache, not a per-feed live check:
 *
 *   - "fresh" = a feed's cache file mtime is within RSS_TTL (i.e. rss_fetch()
 *     would currently serve it without attempting a refetch).
 *   - state = ok when ALL feeds are fresh, warn when SOME are, fail when NONE
 *     are (incl. never fetched at all) — the ratio-based heuristic requested
 *     for TASK-8.
 *   - last_success_ts = the newest cache-file mtime across all feeds (most
 *     recent successful fetch recorded on disk, not per-feed).
 *
 * Caveat: a "stale" feed isn't necessarily broken — refetching only happens
 * on page view (no background cron), so a feed nobody has viewed within the
 * last RSS_TTL window (10 min) reads as stale/dead here even though it may be
 * fine. Low-traffic periods can therefore show warn/fail without anything
 * actually being down; a genuinely dead feed remains visible per-URL in the
 * admin Log tab via rss_log_error(), which is the authoritative signal.
 *
 * Split into a pure part (testable without a DB) and a thin $pdo wrapper.
 */
function rss_status_from_urls(array $urls): array {
    if ($urls === []) {
        return ['state' => 'ok', 'detail' => 'Keine aktiven Feeds konfiguriert.'];
    }

    $total = count($urls);
    $fresh = 0;
    $lastSuccessTs = null;

    foreach ($urls as $url) {
        $path = rss_cache_path((string) $url);
        if (!is_file($path)) {
            continue;
        }
        $mtime = filemtime($path);
        if ($mtime === false) {
            continue;
        }
        if ($lastSuccessTs === null || $mtime > $lastSuccessTs) {
            $lastSuccessTs = $mtime;
        }
        if ((time() - $mtime) < RSS_TTL) {
            $fresh++;
        }
    }

    $state = $fresh === $total ? 'ok' : ($fresh > 0 ? 'warn' : 'fail');

    return [
        'state'           => $state,
        'detail'          => "$fresh/$total Feeds mit frischem Cache (< " . RSS_TTL . 's).',
        'last_success_ts' => $lastSuccessTs,
    ];
}

function rss_status_check(): array {
    global $pdo;
    $urls = $pdo->query('SELECT DISTINCT url FROM s_feeds WHERE enabled = 1')
        ->fetchAll(PDO::FETCH_COLUMN);
    return rss_status_from_urls($urls);
}

function rss_parse(string $raw): ?SimpleXMLElement {
    if ($raw === '') return null;
    libxml_use_internal_errors(true);
    try {
        return new SimpleXMLElement($raw, LIBXML_NONET);
    } catch (\Throwable $e) {
        return null;
    } finally {
        libxml_clear_errors();
    }
}

/**
 * Render an RSS feed as a grid of cards. Extracts the first inline <img>
 * from a description, or falls back to <enclosure url="...">.
 */
function rss_render(SimpleXMLElement $xml): string {
    $items = $xml->channel->item ?? $xml->item ?? $xml;
    $out = '<div class="rss-cards">';

    foreach ($items as $item) {
        $title = (string) ($item->title ?? '');
        $link  = (string) ($item->link  ?? '');
        $desc  = (string) ($item->description ?? '');

        $imgSrc = null;
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $desc, $m)) {
            $imgSrc = $m[1];
            $desc   = preg_replace('/<img[^>]*>/', '', $desc);
        } elseif (isset($item->enclosure) && !empty($item->enclosure['url'])) {
            $imgSrc = (string) $item->enclosure['url'];
        }

        $pub = (string) ($item->pubDate ?? '');

        $out .= '<article class="rss-card">';
        if ($imgSrc) {
            $out .= '<img src="' . htmlspecialchars($imgSrc, ENT_QUOTES, 'UTF-8') . '" alt="">';
        }
        $out .= '<div class="rss-body">';
        $out .= '<h3><a href="' . htmlspecialchars($link, ENT_QUOTES, 'UTF-8') . '" target="_blank" rel="noopener noreferrer">';
        $out .= htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $out .= '</a></h3>';
        $out .= '<p>' . strip_tags($desc, '<br><em><strong>') . '</p>';
        if ($pub !== '') {
            $out .= '<p class="small text-muted">' . htmlspecialchars($pub, ENT_QUOTES, 'UTF-8') . '</p>';
        }
        $out .= '</div></article>';
    }

    $out .= '</div>';
    return $out;
}
