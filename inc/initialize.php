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

define('APP_NAME',          $_cfg['app']['name']          ?? 'Suche');
define('APP_SUPPORT_EMAIL', $_cfg['app']['support_email'] ?? 'contact@eriks.cloud');
define('APP_VERSION',       '3.0');
// APP_BUILD war eine handgepflegte Zahl (6) — und wurde damit bei jeder
// Änderung an css_library vergessen. Jede Asset-URL in suche hängt an ?v=,
// also blieben Nutzer nach einer Library-Änderung auf dem alten Stand, bis der
// Browser von selbst revalidierte (max-age=14400, also bis zu 4 h).
// Jetzt aus den Dateizeiten abgeleitet, wie in biblio (css_library TASK-12).
define('APP_BUILD',         \Erikr\Chrome\AssetVersion::fromMtimes([
    __DIR__ . '/../web/js',
    __DIR__ . '/../web/css',
]));
define('APP_ENV',           $_cfg['app']['env']           ?? 'dev');
define('APP_CODE',          $_cfg['APP_CODE']             ?? 'suche');

define('APP_BASE_URL',      rtrim($_cfg['app']['base_url'] ?? '', '/'));
define('APP_COLOR',         $_cfg['app']['color']          ?? '#e2001a');

define('RATE_LIMIT_FILE', __DIR__ . '/../data/ratelimit.json');

/**
 * All three new tables live in auth alongside the auth tables,
 * so auth calls need no prefix (same as Energie).
 */
define('AUTH_DB_PREFIX', '');

// Mail-Konfiguration: erikr/auth sucht diesen Pfad ZUERST, danach die
// Systempfade (/opt/homebrew/etc, /etc/jardyx). Auf world4you ist keiner
// der beiden anlegbar und open_basedir sperrt alles ausserhalb des
// Web-Verzeichnisses aus — die Datei liegt dort deshalb neben der
// config.yaml im App-Wurzelverzeichnis, das nicht ausgeliefert wird
// (nachgewiesen 2026-07-28: HTTP 404). Fehlt die Datei, gelten die
// Systempfade wie bisher. auth TASK-6.
define('AUTH_MAIL_CONFIG_PATH', dirname(__DIR__) . '/mail.ini');


// Privilegierte Loeschverbindung (Spec 2026-07-25 §3.1a). Verpflichtend:
// admin_delete_user() faellt NICHT auf $con zurueck.
$_adminDb = $_cfg['auth_admin_db'] ?? [];
define('AUTH_ADMIN_DB_HOST', $_adminDb['host']     ?? 'localhost');
define('AUTH_ADMIN_DB_NAME', $_adminDb['name']     ?? '');
define('AUTH_ADMIN_DB_USER', $_adminDb['user']     ?? '');
define('AUTH_ADMIN_DB_PASS', $_adminDb['password'] ?? '');
define('AUTH_ADMIN_DB_SOCKET', $_adminDb['socket'] ?? null);
unset($_adminDb);

// Erlaubte Rücksprung-Hosts für den zentralen SSO-Login (Open-Redirect-Schutz).
// Prod-Hosts gelten immer; .test-Hosts nur lokal (APP_ENV === 'local') — sie
// sind öffentlich zwar ohnehin nicht auflösbar, gehören aber sauber nicht in
// die Prod-Allowlist.
const AUTH_SSO_ALLOWED_HOSTS_PROD = [
    // *.eriks.cloud
    // 'eriks.cloud' und 'suche.eriks.cloud' sind laut nginx auf akadbrain
    // DERSELBE vhost wie www.eriks.cloud ("server_name eriks.cloud
    // www.eriks.cloud suche.eriks.cloud", verifiziert 2026-09-03) -- also
    // dieselbe App. Ohne sie fiel ein Ruecksprung auf einen dieser beiden
    // Namen still weg und der Nutzer landete auf der Startseite;
    // mcp/config.yaml setzt suches akadbrain-base_url sogar auf
    // suche.eriks.cloud.
    'eriks.cloud', 'www.eriks.cloud', 'suche.eriks.cloud',
    'chat.eriks.cloud', 'wlmonitor.eriks.cloud',
    'energie.eriks.cloud', 'werda.eriks.cloud', 'biblio.eriks.cloud',
    'lastfm.eriks.cloud', 'mailprint.eriks.cloud',
    // *.jardyx.com — bestätigtes echtes SSO-Return-Ziel (Audit S2,
    // 2026-07-12): appsMenu-Prodlinks der Apps zeigen auf diese Hosts.
    // biblio.jardyx.com bewusst enthalten (für den künftigen biblio-jardyx-Deploy).
    'www.jardyx.com', 'chat.jardyx.com', 'wlmonitor.jardyx.com',
    'energie.jardyx.com', 'zeit.jardyx.com', 'biblio.jardyx.com',
    'lastfm.jardyx.com',
];

// Lokal (*.test) — für den faithful-Test auf Hamish.
const AUTH_SSO_ALLOWED_HOSTS_TEST = [
    'suche.test', 'energie.test', 'chat.test', 'wlmonitor.test', 'zeit.test', 'werda.test',
    'lastfm.test', 'biblio.test', 'mailprint.test',
];

define('AUTH_SSO_ALLOWED_HOSTS', array_merge(
    AUTH_SSO_ALLOWED_HOSTS_PROD,
    APP_ENV === 'local' ? AUTH_SSO_ALLOWED_HOSTS_TEST : []
));

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

auth_bootstrap([
    'img-src'     => "'self' data: https:",   // RSS feed thumbnails come from external domains
    'form-action' => "'self' https:",         // search forms submit to external HTTPS engines
], $con);
