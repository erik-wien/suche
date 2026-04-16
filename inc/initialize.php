<?php
/**
 * inc/initialize.php — bootstrap for every suche page.
 *
 * Loads config, opens the auth mysqli ($con) and app PDO ($pdo), calls
 * auth_bootstrap(), exposes APP_* constants + $base (URL prefix) to callers.
 *
 * Usage: require_once __DIR__ . '/../inc/initialize.php';
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/config.php';

$_cfg = suche_load_config();

define('APP_NAME',    'Suche');
define('APP_VERSION', '3.0.0');
define('APP_BUILD',   '2026-04-15');
define('APP_ENV',     $_cfg['app']['env'] ?? 'dev');
define('APP_SLUG',    'suche');

define('APP_BASE_URL',   rtrim($_cfg['app']['base_url']  ?? '', '/'));
define('SMTP_HOST',      $_cfg['smtp']['host']           ?? '');
define('SMTP_PORT',      (int) ($_cfg['smtp']['port']    ?? 587));
define('SMTP_USER',      $_cfg['smtp']['user']           ?? '');
define('SMTP_PASS',      $_cfg['smtp']['password']       ?? '');
define('SMTP_FROM',      $_cfg['smtp']['from']           ?? '');
define('SMTP_FROM_NAME', $_cfg['smtp']['from_name']      ?? 'Suche');

define('RATE_LIMIT_FILE', __DIR__ . '/../data/ratelimit.json');

/**
 * All three new tables live in jardyx_auth alongside the auth tables,
 * so auth calls need no prefix (same as Energie).
 */
define('AUTH_DB_PREFIX', '');

// URL prefix for this page. On DEV: '/suche.test'. On TEST/PROD: '' (bare vhost).
$base = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');

// ── Auth DB ($con — mysqli, used by erikr/auth + appendLog) ───────────────────

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$_auth = $_cfg['auth_db'];
$con = new mysqli(
    $_auth['host'] ?? 'localhost',
    $_auth['user'],
    $_auth['password'],
    $_auth['name'],
    3306,
    $_auth['socket'] ?? null
);
$con->set_charset('utf8mb4');

// ── App DB ($pdo — PDO, used by suche's own model functions) ──────────────────

$_db = $_cfg['db'];
try {
    $dsn = "mysql:host={$_db['host']};dbname={$_db['name']};charset=utf8mb4";
    if (!empty($_db['socket'])) {
        $dsn = "mysql:unix_socket={$_db['socket']};dbname={$_db['name']};charset=utf8mb4";
    }
    $pdo = new PDO(
        $dsn,
        $_db['user'],
        $_db['password'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            Pdo\Mysql::ATTR_FOUND_ROWS   => true,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    error_log('suche PDO connect failed: ' . $e->getMessage());
    exit('Database error — see server log.');
}

unset($_cfg, $_auth, $_db);

// ── erikr/auth bootstrap (session, CSP nonce in $_cspNonce, cookies) ──────────

auth_bootstrap();
