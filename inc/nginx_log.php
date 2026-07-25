<?php
/**
 * inc/nginx_log.php — host-aware nginx access/error log reader for the admin console.
 *
 * Enabled only on hosts listed in NGINX_LOG_HOSTS (keyed by config.yaml's `target`).
 * world4you is intentionally absent — the feature is invisible there.
 */

require_once __DIR__ . '/config.php';

const NGINX_LOG_HOSTS = [
    'akadbrain' => [ // macOS + Homebrew-nginx → Präfix /opt/homebrew/var/log/nginx,
                     // NICHT das Linux-übliche /var/log/nginx (existiert dort nicht).
                     // Per-site-Logs schreibt sites-available/eriks.cloud.conf
                     // (access_log/error_log), daher suche-only statt global.
        'access' => '/opt/homebrew/var/log/nginx/suche.access.log',
        'error'  => '/opt/homebrew/var/log/nginx/suche.error.log',
    ],
    'local' => [ // Hamish — Homebrew nginx; suche.test.conf has no per-site access_log/error_log,
                 // so this is nginx.conf's global log, shared across all *.test vhosts.
        'access' => '/opt/homebrew/var/log/nginx/access.log',
        'error'  => '/opt/homebrew/var/log/nginx/error.log',
    ],
];

const NGINX_LOG_DEFAULT_WINDOW_BYTES = 4 * 1024 * 1024;

function nginxlog_enabled(?string $target = null): bool {
    $target ??= (string) (suche_load_config()['target'] ?? '');
    return array_key_exists($target, NGINX_LOG_HOSTS);
}

/**
 * @param array<string,string>|null $overrideConfig Injected override for testing;
 *        production callers omit it and get config.yaml's `nginx_log:` section.
 * @return array{access?:string,error?:string} Empty if the host isn't enabled.
 */
function nginxlog_paths(?string $target = null, ?array $overrideConfig = null): array {
    $target ??= (string) (suche_load_config()['target'] ?? '');
    if (!array_key_exists($target, NGINX_LOG_HOSTS)) {
        return [];
    }
    $defaults = NGINX_LOG_HOSTS[$target];
    $override = $overrideConfig ?? (array) (suche_load_config()['nginx_log'] ?? []);
    return [
        'access' => (string) ($override['access'] ?? $defaults['access']),
        'error'  => (string) ($override['error']  ?? $defaults['error']),
    ];
}

/**
 * Status::check callable for web/status.php (TASK-8, adminOnly). Reuses
 * nginxlog_enabled()/nginxlog_paths() — a host absent from NGINX_LOG_HOSTS
 * (world4you) is "ok" ("invisible" by design, same contract as the admin
 * tab, not a failure). $target/$overrideConfig let unit tests bypass
 * suche_load_config()/config.yaml, mirroring nginxlog_paths()'s own params.
 */
function nginxlog_status_check(?string $target = null, ?array $overrideConfig = null): array {
    if (!nginxlog_enabled($target)) {
        return ['state' => 'ok', 'detail' => 'Auf diesem Host nicht aktiviert (z. B. world4you).'];
    }
    $paths    = nginxlog_paths($target, $overrideConfig);
    $accessOk = isset($paths['access']) && is_readable($paths['access']);
    $errorOk  = isset($paths['error'])  && is_readable($paths['error']);

    if ($accessOk && $errorOk) {
        return ['state' => 'ok', 'detail' => 'access.log und error.log lesbar.'];
    }
    if ($accessOk || $errorOk) {
        $missing = $accessOk ? ($paths['error'] ?? '?') : ($paths['access'] ?? '?');
        return ['state' => 'warn', 'detail' => 'Nicht lesbar: ' . $missing];
    }
    return [
        'state'  => 'fail',
        'detail' => 'Weder access.log noch error.log lesbar (' . ($paths['access'] ?? '?')
            . ', ' . ($paths['error'] ?? '?') . ').',
    ];
}

function nginxlog_window_bytes(): int {
    $config = suche_load_config();
    return (int) ($config['nginx_log']['window_bytes'] ?? NGINX_LOG_DEFAULT_WINDOW_BYTES);
}

function nginxlog_parse_access(string $line): ?array {
    $pattern = '/^(?<ip>\S+) \S+ (?<user>\S+) \[(?<time>[^\]]+)\] "(?<request>[^"]*)" '
             . '(?<status>\d{3}) (?<bytes>\S+) "(?<referer>[^"]*)" "(?<ua>[^"]*)"/';
    if (!preg_match($pattern, $line, $m)) {
        return null;
    }
    $dt = DateTime::createFromFormat('d/M/Y:H:i:s O', $m['time']);
    if ($dt === false) {
        return null;
    }
    $requestParts = null;
    preg_match('/^(\S+)\s+(\S+)\s+(\S+)$/', $m['request'], $requestParts);

    return [
        'ts'       => $dt->getTimestamp(),
        'time'     => $dt->format('Y-m-d H:i:s'),
        'ip'       => $m['ip'],
        'method'   => $requestParts[1] ?? '',
        'path'     => $requestParts[2] ?? $m['request'],
        'protocol' => $requestParts[3] ?? '',
        'status'   => (int) $m['status'],
        'bytes'    => $m['bytes'],
        'referer'  => $m['referer'],
        'ua'       => $m['ua'],
        'raw'      => $line,
    ];
}

function nginxlog_parse_error(string $line): ?array {
    $pattern = '/^(?<time>\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}) \[(?<level>\w+)\] '
             . '(?<pid>\d+)#\d+: (?:\*\d+ )?(?<message>.*)$/';
    if (!preg_match($pattern, $line, $m)) {
        return null;
    }
    $dt = DateTime::createFromFormat('Y/m/d H:i:s', $m['time']);
    if ($dt === false) {
        return null;
    }

    return [
        'ts'      => $dt->getTimestamp(),
        'time'    => $dt->format('Y-m-d H:i:s'),
        'level'   => $m['level'],
        'pid'     => (int) $m['pid'],
        'message' => $m['message'],
        'raw'     => $line,
    ];
}

/**
 * Read the last $windowBytes of $path. Returns null if unreadable.
 * Discards a possibly-truncated first line when the window cut into the file.
 *
 * @return array{lines: list<string>, truncated: bool}|null
 */
function nginxlog_read_tail(string $path, int $windowBytes): ?array {
    if (!is_readable($path)) {
        return null;
    }
    $size   = (int) filesize($path);
    $handle = fopen($path, 'rb');
    if ($handle === false) {
        return null;
    }

    $truncated = $size > $windowBytes;
    if ($truncated) {
        fseek($handle, $size - $windowBytes);
    }
    $data = stream_get_contents($handle);
    fclose($handle);

    $lines = explode("\n", $data);
    if ($truncated) {
        array_shift($lines); // drop the line the seek landed inside of
    }
    if ($lines !== [] && end($lines) === '') {
        array_pop($lines); // drop trailing empty line from the final "\n"
    }

    return ['lines' => $lines, 'truncated' => $truncated];
}

/**
 * @param list<array<string,mixed>> $rows
 * @param array{status?:string,q?:string,from?:string,to?:string} $filters
 * @return list<array<string,mixed>>
 */
function nginxlog_filter_rows(array $rows, array $filters): array {
    $status = trim((string) ($filters['status'] ?? ''));
    $q      = mb_strtolower(trim((string) ($filters['q'] ?? '')));
    $fromTs = ($filters['from'] ?? '') !== '' ? strtotime($filters['from'] . ' 00:00:00') : null;
    $toTs   = ($filters['to']   ?? '') !== '' ? strtotime($filters['to']   . ' 23:59:59') : null;

    return array_values(array_filter($rows, function (array $row) use ($status, $q, $fromTs, $toTs): bool {
        if (($fromTs !== null || $toTs !== null)) {
            if (!isset($row['ts'])) {
                return false;
            }
            if ($fromTs !== null && $row['ts'] < $fromTs) {
                return false;
            }
            if ($toTs !== null && $row['ts'] > $toTs) {
                return false;
            }
        }
        if ($status !== '' && isset($row['status'])) {
            if (preg_match('/^([1-5])xx$/i', $status, $m)) {
                if ((int) floor($row['status'] / 100) !== (int) $m[1]) {
                    return false;
                }
            } elseif ((string) $row['status'] !== $status) {
                return false;
            }
        }
        if ($q !== '' && !str_contains(mb_strtolower((string) ($row['raw'] ?? '')), $q)) {
            return false;
        }
        return true;
    }));
}

/**
 * @param array{status?:string,q?:string,from?:string,to?:string} $filters
 * @return array{ok:bool,rows?:list<array<string,mixed>>,total?:int,page?:int,
 *               per_page?:int,lastPage?:int,truncated?:bool,error?:string}
 */
function nginxlog_query(string $type, array $filters, int $page, int $perPage): array {
    if (!nginxlog_enabled()) {
        return ['ok' => false, 'error' => 'Nginx-Log ist auf diesem Host nicht verfügbar.'];
    }
    $paths = nginxlog_paths();
    if (!isset($paths[$type])) {
        return ['ok' => false, 'error' => 'Unbekannter Log-Typ.'];
    }

    $tail = nginxlog_read_tail($paths[$type], nginxlog_window_bytes());
    if ($tail === null) {
        return [
            'ok'        => true,
            'rows'      => [],
            'total'     => 0,
            'page'      => 1,
            'per_page'  => $perPage,
            'lastPage'  => 1,
            'truncated' => false,
            'error'     => 'Log nicht lesbar: ' . $paths[$type],
        ];
    }

    $parse = $type === 'access' ? 'nginxlog_parse_access' : 'nginxlog_parse_error';
    $rows  = [];
    foreach ($tail['lines'] as $line) {
        if ($line === '') {
            continue;
        }
        $parsed = $parse($line);
        if ($parsed !== null) {
            $rows[] = $parsed;
        }
    }
    $rows = array_reverse($rows); // newest first

    $filtered = nginxlog_filter_rows($rows, $filters);
    $total    = count($filtered);
    $perPage  = max(1, min(500, $perPage));
    $lastPage = max(1, (int) ceil($total / $perPage));
    $page     = min(max(1, $page), $lastPage);
    $pageRows = array_slice($filtered, ($page - 1) * $perPage, $perPage);

    return [
        'ok'        => true,
        'rows'      => $pageRows,
        'total'     => $total,
        'page'      => $page,
        'per_page'  => $perPage,
        'lastPage'  => $lastPage,
        'truncated' => $tail['truncated'],
    ];
}
