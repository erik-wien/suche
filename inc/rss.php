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
 * Newest cache-file mtime across the given feed URLs — der letzte auf Platte
 * belegte ERFOLGREICHE Abruf (rss_fetch() schreibt die Datei nur bei Erfolg).
 * Quelle für `last_success_ts` der Statusseite (Suite-Policy §5: Zeitstempel des
 * letzten Erfolgs). null, wenn kein Feed je erfolgreich geholt wurde.
 */
function rss_cache_newest_mtime(array $urls): ?int {
    $newest = null;
    foreach ($urls as $url) {
        $path = rss_cache_path((string) $url);
        if (!is_file($path)) {
            continue;
        }
        $mtime = filemtime($path);
        if ($mtime === false) {
            continue;
        }
        if ($newest === null || $mtime > $newest) {
            $newest = $mtime;
        }
    }
    return $newest;
}

/**
 * Aggregiert die Feed-Erreichbarkeit für web/status.php — reine Funktion über
 * bereits erhobene Probe-Ergebnisse (Netzwerk macht rss_status_check()).
 *
 * $probes: URL => Ergebnis in der Form von Chrome\Status::httpCheck()
 * (`['state' => 'ok'|'fail', 'detail' => …]`); alles außer 'ok' zählt als
 * nicht erreichbar.
 *
 *   - state = ok wenn ALLE erreichbar, warn wenn EINIGE, fail wenn KEINER.
 *   - Leere Feed-Liste = ok (nichts konfiguriert ist kein Fehler).
 *
 * WARUM Erreichbarkeit statt Cache-Alter (Fix 2026-07-26): der Vorgänger
 * (rss_status_from_urls) verlangte für „ok" bei JEDEM Feed einen Cache jünger
 * als RSS_TTL. web/index.php holt aber nur den aktiven Tab synchron (§20-Lazy-
 * Load), die übrigen Feeds erst beim Anklicken — die Bedingung war praktisch nie
 * erfüllbar: bestes Ergebnis nach einem Seitenaufruf 1/4 (gelb), nach 10 Minuten
 * Leerlauf 0/4 (rot), obwohl alle Feeds HTTP 200 lieferten. Der Check maß „hat
 * jemand alle Tabs durchgeklickt", nicht „sind die Feeds erreichbar".
 *
 * KEINE URLs/Hostnamen im Detailtext: der RSS-Check ist nicht `adminOnly`, also
 * lesen ihn alle eingeloggten User — und `s_feeds` ist user-scoped, während
 * dieser Check über ALLE User aggregiert (fremde Feed-URLs sind nichts für
 * andere Augen, Suite-Policy §5). Die konkret ausgefallenen Feeds nennt
 * rss_status_check() per rss_log_error() im Admin-Log (§21).
 *
 * @param array<string,array{state?:string,detail?:string}> $probes
 * @return array{state:string, detail:string, last_success_ts:?int}
 */
function rss_status_from_probes(array $probes, ?int $lastSuccessTs = null): array {
    if ($probes === []) {
        return [
            'state'           => 'ok',
            'detail'          => 'Keine aktiven Feeds konfiguriert.',
            'last_success_ts' => $lastSuccessTs,
        ];
    }

    $total = count($probes);
    $ok    = 0;
    foreach ($probes as $probe) {
        if (($probe['state'] ?? '') === 'ok') {
            $ok++;
        }
    }

    return [
        'state'           => $ok === $total ? 'ok' : ($ok > 0 ? 'warn' : 'fail'),
        'detail'          => "{$ok}/{$total} Feeds erreichbar.",
        'last_success_ts' => $lastSuccessTs,
    ];
}

/**
 * Live-Check der aktiven Feeds für web/status.php: je Feed ein HEAD-Request
 * (Suite-Policy §5 — externe HTTP-Checks mit kurzem Timeout, HTTP >= 400 =
 * Fehler; die Status-Checks selbst sind in status.php 60 s gecacht, es läuft
 * also höchstens ein Durchlauf pro Minute).
 *
 * HEAD statt GET, weil für „erreichbar?" der Body irrelevant ist (derStandard
 * liefert ~200 KB) — alle konfigurierten Feeds antworten auf HEAD mit 200
 * (2026-07-26 gegen alle vier geprüft). Ein Feed, der HEAD verweigert, würde
 * korrekt als Fehler auffallen, statt still als ok durchzugehen.
 *
 * §21: jeder ausgefallene Feed wird MIT URL und Grund protokolliert
 * (rss_log_error → Admin-Log, dort per RSS_TTL entprellt), nicht bloß gezählt.
 * Der Detailtext der Ampel bleibt URL-frei (siehe rss_status_from_probes).
 *
 * @param callable|null $prober Test-Seam: fn(string $url): array (Form wie
 *        Chrome\Status::httpCheck). Produktion lässt ihn weg.
 */
function rss_status_check(?callable $prober = null): array {
    global $pdo;
    $urls = $pdo->query('SELECT DISTINCT url FROM s_feeds WHERE enabled = 1')
        ->fetchAll(PDO::FETCH_COLUMN);

    $prober ??= static fn(string $url): array => \Erikr\Chrome\Status::httpCheck(
        $url,
        RSS_FETCH_TIMEOUT,
        [CURLOPT_NOBODY => true, CURLOPT_USERAGENT => RSS_USER_AGENT]
    );

    $probes = [];
    foreach ($urls as $url) {
        $url          = (string) $url;
        $probe        = $prober($url);
        $probes[$url] = $probe;
        if (($probe['state'] ?? '') !== 'ok') {
            rss_log_error($url, 'Statuscheck: nicht erreichbar — ' . ($probe['detail'] ?? 'unbekannter Fehler'));
        }
    }

    return rss_status_from_probes($probes, rss_cache_newest_mtime($urls));
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
