<?php
/**
 * inc/layout.php — page shell for every suche page.
 *
 * render_header() emits <!DOCTYPE>…</head> and the .app-header (via chrome lib).
 * render_footer() emits the .app-footer (via chrome lib) and closes <body>/</html>.
 *
 * Header / footer markup itself lives in erikr/chrome (Header::render,
 * Footer::render) — the canonical §12 / §13 implementation. This file owns
 * only the bits that vary per app: <head>, stylesheet load order, and the
 * trailing app.js include.
 *
 * Expected globals (set by inc/initialize.php): $base, $_cspNonce, $con.
 */

use Erikr\Chrome\Header;
use Erikr\Chrome\Footer;

function sibling_url(string $local, string $akadbrain, string $world4you = ''): string {
    return match (APP_ENV) {
        'local'     => $local,
        'akadbrain' => $akadbrain,
        default     => $world4you !== '' ? $world4you : $akadbrain,
    };
}

function render_header(string $title, string $active = ''): void {
    global $base, $_cspNonce;

    $pageTitle = htmlspecialchars($title . ' — ' . APP_NAME, ENT_QUOTES, 'UTF-8');

    ?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $pageTitle ?></title>
    <meta name="theme-color" content="<?= htmlspecialchars(APP_COLOR, ENT_QUOTES) ?>">
    <link rel="icon" type="image/svg+xml" href="<?= $base ?>/jardyx-favicon.svg">
    <link rel="icon" type="image/x-icon" href="<?= $base ?>/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="<?= $base ?>/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="<?= $base ?>/favicon-32x32.png">
    <link rel="apple-touch-icon" href="<?= $base ?>/apple-touch-icon.png">
    <meta name="csrf-token" content="<?= htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/theme.css?v=<?= APP_BUILD ?>">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/reset.css?v=<?= APP_BUILD ?>">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/layout.css?v=<?= APP_BUILD ?>">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/components.css?v=<?= APP_BUILD ?>">
    <link rel="stylesheet" href="<?= $base ?>/css/app.css?v=<?= APP_BUILD ?>">
</head>
<body>
<?php
    Header::render([
        'appName'        => APP_NAME,
        'base'           => $base,
        'cspNonce'       => $_cspNonce,
        'csrfToken'      => csrf_token(),
        'pageType'       => $active,
        'brandLogoSrc'   => $base . '/jardyx-logo.svg',
        'themeEndpoint'  => $base . '/preferences.php',
        'appMenu'        => [
            ['href' => sibling_url('http://wlmonitor.test', 'https://wlmonitor.eriks.cloud', 'https://wlmonitor.jardyx.com'), 'label' => 'WL Monitor'],
            ['href' => sibling_url('http://energie.test',   'https://energie.eriks.cloud',   'https://energie.jardyx.com'),   'label' => 'Energie'],
            ['href' => sibling_url('http://chat.test',      'https://chat.eriks.cloud',       'https://chat.jardyx.com'),      'label' => 'Chat'],
            ['href' => 'https://lastfm.jardyx.com', 'label' => 'Last.fm'],
            [
                'label'    => 'Test',
                'adminOnly' => true,
                'children' => [
                    ['href' => sibling_url('http://suche.test',     'https://suche.eriks.cloud',     'https://www.jardyx.com'),           'label' => 'Suche'],
                    ['href' => sibling_url('http://wlmonitor.test', 'https://wlmonitor.eriks.cloud', 'https://wlmonitor.jardyx.com'),     'label' => 'WL Monitor'],
                    ['href' => sibling_url('http://energie.test',   'https://energie.eriks.cloud',   'https://energie.jardyx.com'),       'label' => 'Energie'],
                    ['href' => sibling_url('http://chat.test',      'https://chat.eriks.cloud',       'https://chat.jardyx.com'),          'label' => 'Chat'],
                    ['href' => 'http://lastfm.test',                                                                                      'label' => 'Last.fm'],
                    ['href' => sibling_url('http://zeit.test',      'https://werda.eriks.cloud'),                                         'label' => 'Zeiterfassung'],
                ],
            ],
        ],
    ]);
?>
<main id="main-content" tabindex="-1">
    <?php
}

function render_footer(): void {
    global $base, $_cspNonce;
    ?>
</main>
<?php
    $stage = in_array(strtolower(APP_ENV), ['local', 'localhost', 'dev', 'development', 'staging', 'akadbrain'], true) ? 'DEV' : 'PROD';
    Footer::render([
        'base'    => $base,
        'year'    => '2016–' . date('Y'),
        'version' => APP_VERSION . '.' . APP_BUILD . ' ' . $stage,
    ]);
?>
<script src="<?= $base ?>/js/app.js?v=<?= APP_BUILD ?>" nonce="<?= $_cspNonce ?>"></script>
</body>
</html>
    <?php
}
