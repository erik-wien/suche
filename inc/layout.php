<?php
/**
 * inc/layout.php — shared header + footer rendering for every suche page.
 *
 * render_header() emits <!DOCTYPE ...> through the opening of <main>.
 * render_footer() closes <main>, emits the .app-footer, and closes <body>/</html>.
 *
 * Expected globals (set by inc/initialize.php): $base, $_cspNonce, $con.
 */

function render_header(string $title, string $active = ''): void {
    global $base, $_cspNonce;

    $username = htmlspecialchars($_SESSION['username'] ?? '', ENT_QUOTES, 'UTF-8');
    $isAdmin  = (($_SESSION['rights'] ?? '') === 'Admin');
    $theme    = $_SESSION['theme'] ?? 'auto';
    $pageTitle = htmlspecialchars($title . ' — ' . APP_NAME, ENT_QUOTES, 'UTF-8');

    ?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= $pageTitle ?></title>
    <link rel="icon" type="image/x-icon" href="<?= $base ?>/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="<?= $base ?>/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="<?= $base ?>/favicon-32x32.png">
    <link rel="apple-touch-icon" href="<?= $base ?>/apple-touch-icon.png">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/theme.css">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/reset.css">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/layout.css">
    <link rel="stylesheet" href="<?= $base ?>/css/shared/components.css">
    <link rel="stylesheet" href="<?= $base ?>/css/app.css">
    <script nonce="<?= $_cspNonce ?>">
        document.documentElement.dataset.theme = <?= json_encode($theme) ?>;
    </script>
</head>
<body>
<header class="app-header">
    <div class="header-left">
        <a class="brand" href="<?= $base ?>/">
            <img src="<?= $base ?>/css/shared/icons/jardyx.svg" class="header-logo" width="28" height="28" alt="">
            <span class="header-appname">Suche</span>
        </a>
    </div>
    <div class="header-right">
        <div class="user-menu">
            <button class="user-btn" type="button">
                <span><?= $username ?></span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M2 4l4 4 4-4"/>
                </svg>
            </button>
            <div class="user-dropdown">
                <span class="dropdown-username"><?= $username ?></span>
                <div class="dropdown-divider"></div>
                <a href="<?= $base ?>/preferences.php" class="dropdown-link-btn">Einstellungen</a>
                <a href="<?= $base ?>/password.php" class="dropdown-link-btn">Passwort &amp; 2FA</a>
                <?php if ($isAdmin): ?>
                    <a href="<?= $base ?>/admin.php" class="dropdown-link-btn">Administration</a>
                <?php endif; ?>
                <a href="<?= $base ?>/help.php" class="dropdown-link-btn">Hilfe</a>
                <div class="dropdown-divider"></div>
                <div class="theme-row">
                    <button class="theme-btn<?= $theme === 'light' ? ' active' : '' ?>" data-theme="light" title="Hell">☀</button>
                    <button class="theme-btn<?= $theme === 'auto'  ? ' active' : '' ?>" data-theme="auto"  title="Auto">⬤</button>
                    <button class="theme-btn<?= $theme === 'dark'  ? ' active' : '' ?>" data-theme="dark"  title="Dunkel">🌙</button>
                </div>
                <div class="dropdown-divider"></div>
                <form method="post" action="<?= $base ?>/logout.php" style="margin:0">
                    <?= csrf_input() ?>
                    <button type="submit" class="dropdown-link-btn">Abmelden</button>
                </form>
            </div>
        </div>
    </div>
</header>
<main>
    <?php
}

function render_footer(): void {
    global $base, $_cspNonce;
    $year = date('Y');
    $build = APP_VERSION . ' ' . APP_ENV;
    ?>
</main>
<footer class="app-footer">
    <a href="<?= $base ?>/impressum.html">Impressum</a>
    <span>© 2016–<?= $year ?> Erik R. Huemer</span>
    <span class="text-muted"><?= htmlspecialchars($build, ENT_QUOTES, 'UTF-8') ?></span>
</footer>
<script src="<?= $base ?>/js/app.js" nonce="<?= $_cspNonce ?>"></script>
</body>
</html>
    <?php
}
