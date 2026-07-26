<?php
/**
 * web/status.php — Suite-Policy §5 status page (TASK-8, chrome Erikr\Chrome\Status).
 *
 * Checks: Auth-DB ($con ping), App-DB ($pdo ping), RSS-Feeds (live reachability
 * per feed, HEAD with short timeout — rss_status_check() in inc/rss.php),
 * Nginx-Log availability (adminOnly — nginxlog_status_check() in inc/nginx_log.php).
 *
 * Access:
 *  - HTML page: always session-gated via auth_require() — every logged-in
 *    user sees the traffic light (Ampel); `detail`/adminOnly checks are
 *    admin-only (handled inside Status::render()).
 *  - ?format=json: session (any logged-in user) OR a valid `status_token`.
 *    A token request has no session by definition (it's meant for
 *    machine-to-machine dashboard aggregation, Design-Spec 2026-07-24
 *    "Dashboard-Bewertung"), so it MUST be checked before auth_require() —
 *    calling auth_require() unconditionally first (as the chrome Status
 *    docblock's minimal example does) would redirect a token-only caller
 *    away before the token could ever be honoured.
 *  - `status_token` is not currently configured (no key exists yet in
 *    config.yaml/config.example.yaml). To enable token access later, add
 *    `status_token: <random secret>` to config.yaml — no code change needed
 *    here, only the guard below flips on once the key is non-empty.
 */

require __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';
require_once __DIR__ . '/../inc/rss.php';
require_once __DIR__ . '/../inc/nginx_log.php';

use Erikr\Chrome\Status;

$_statusToken = (string) (suche_load_config()['status_token'] ?? '');
$_isTokenAuth = $_statusToken !== '' && isset($_GET['status_token'])
    && hash_equals($_statusToken, (string) $_GET['status_token']);
$_isJsonFormat = ($_GET['format'] ?? '') === 'json';

if (!($_isJsonFormat && $_isTokenAuth)) {
    auth_require();
}

$checks = [
    [
        'name'  => 'Auth-Datenbank',
        'check' => fn() => Status::dbCheck(fn() => $con->ping(), 'Verbindung ok.'),
    ],
    [
        'name'  => 'App-Datenbank',
        'check' => fn() => Status::dbCheck(fn() => $pdo->query('SELECT 1') !== false, 'Verbindung ok.'),
    ],
    [
        'name'  => 'RSS-Feeds',
        'check' => 'rss_status_check',
    ],
    [
        'name'      => 'Nginx-Log',
        'adminOnly' => true,
        'check'     => 'nginxlog_status_check',
    ],
];

$results = Status::run($checks, [
    'cacheFile' => __DIR__ . '/../data/status_cache.json',
    'cacheTtl'  => 60,
]);

if ($_isJsonFormat) {
    if (empty($_SESSION['loggedin']) && !$_isTokenAuth) {
        http_response_code(403);
        exit;
    }
    header('Content-Type: application/json');
    echo Status::json($results, ['app' => 'suche']);
    exit;
}

$isAdmin = (($_SESSION['rights'] ?? '') === 'Admin');

render_header('Status', 'status');
?>
<div class="container-md" style="padding-block:1.5rem">
    <h1>Status</h1>
    <?php Status::render($results, $isAdmin, ['cspNonce' => $_cspNonce, 'cacheTtl' => 60]); ?>
</div>
<?php
render_footer();
