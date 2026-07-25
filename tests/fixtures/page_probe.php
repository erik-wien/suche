<?php
declare(strict_types=1);

/**
 * tests/fixtures/page_probe.php
 *
 * Out-of-process helper to exercise real web/*.php pages that call exit()
 * (auth_require() redirects) — the real profil.php/aktivitaet.php pages are
 * otherwise never rendered by suche's test suite, which is exactly the gap
 * this fixture closes (see tests/Unit/PageProbeTest.php). Ported from
 * simplechat's tests/fixtures/page_probe.php (TASK-9 template) — both apps
 * share erikr/auth + erikr/chrome, so the session shape is the same; only
 * suche-specific keys (email is DB-fetched, not session-held) differ.
 *
 * Invoked as: php page_probe.php <page-relative-to-web> <scenario.json>
 * Scenario JSON keys: loggedin (bool), id, username, rights, method, post.
 *
 * A pre-started native PHP session lets us seed $_SESSION before
 * inc/initialize.php's auth_bootstrap() -> session_start() (a no-op on an
 * already-active session).
 *
 * STDOUT carries whatever the page echoes (HTML). The HTTP status code is
 * reported on STDERR as "STATUS:<code>\n" via a shutdown function, since it
 * cannot be observed after exit().
 */

$page         = $argv[1] ?? '';
$scenarioFile = $argv[2] ?? '';
$scenario     = json_decode((string) file_get_contents($scenarioFile), true) ?? [];

session_start();
if (!empty($scenario['loggedin'])) {
    $_SESSION['loggedin']   = true;
    $_SESSION['id']         = $scenario['id']       ?? 999999;
    $_SESSION['username']   = $scenario['username'] ?? 'probe-user';
    $_SESSION['rights']     = $scenario['rights']    ?? 'User';
    $_SESSION['disabled']   = 0;
    $_SESSION['has_avatar'] = false;
    $_SESSION['theme']      = 'auto';
    $_SESSION['csrf_token'] = 'probe-csrf-token';
} else {
    $_SESSION = [];
}

$_POST = $scenario['post'] ?? [];
$_SERVER['REQUEST_METHOD'] = $scenario['method'] ?? 'GET';
$_SERVER['SCRIPT_NAME']    = '/' . $page;
$_SERVER['PHP_SELF']       = '/' . $page;
// Deliberately NOT *.eriks.cloud / *.jardyx.com / *.test — those hosts make
// auth_require() redirect to the central SSO login instead of local
// login.php (see erikr/auth's auth_central_login_url()); ".invalid" (RFC
// 2606) keeps the probe on the deterministic local-redirect path.
$_SERVER['HTTP_HOST']      = 'suche.test.invalid';
// appendLog() -> getUserIpAddr() reads REMOTE_ADDR unconditionally (erikr/auth
// src/log.php) — unset under CLI, so any probed POST path that logs throws a
// TypeError without this.
$_SERVER['REMOTE_ADDR']    = '127.0.0.1';

register_shutdown_function(static function (): void {
    // http_response_code() returns false under the CLI SAPI when no code
    // was ever explicitly set (no real HTTP response exists to default to
    // 200) — unlike a real web SAPI, where an untouched script implicitly
    // serves 200. A page that renders normally (no header('Location')/
    // http_response_code() call, e.g. the logged-in profil.php/aktivitaet.php
    // path) hits exactly this case, so treat false as 200 to match what a
    // browser would actually see.
    $code = http_response_code();
    fwrite(STDERR, 'STATUS:' . ($code !== false ? $code : 200) . "\n");
});

require __DIR__ . '/../../web/' . $page;
