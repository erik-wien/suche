<?php
/**
 * inc/rss.php — fetch + render RSS with a simple disk TTL cache.
 *
 * Cache layout: <app_root>/data/cache/rss/<md5(url)>.xml
 * TTL: 600 seconds (10 min). Fetch timeout: 3 seconds. Stale-while-error: the
 * last successful snapshot is returned if a refresh attempt fails.
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
            return $xml;
        }
    }

    // ── Stale-while-error ──────────────────────────────────────────────────
    if (is_file($path)) {
        return rss_parse((string) file_get_contents($path));
    }

    return null;
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
