<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';
require_once __DIR__ . '/../inc/sso_finish.php';

if (!empty($_SESSION['loggedin'])) {
    // Bereits am zentralen Host angemeldet: liegt ein gültiger Rücksprung vor,
    // Ticket ausstellen und zurück zur App (App-zu-App-Navigation ohne
    // Remember-Cookie); sonst zur suche-Startseite.
    $r = (string) ($_GET['return'] ?? '');
    if ($r !== '' && auth_sso_return_allowed($r, AUTH_SSO_ALLOWED_HOSTS)) {
        $_SESSION['sso_return'] = $r;
    }
    sso_finish_login($con, (int) $_SESSION['id']);
}

$alerts     = $_SESSION['alerts'] ?? [];
unset($_SESSION['alerts']);

// Zentraler-SSO-Rücksprung: validieren und für den POST in der Session halten.
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $r = (string) ($_GET['return'] ?? '');
    if ($r !== '' && auth_sso_return_allowed($r, AUTH_SSO_ALLOWED_HOSTS)) {
        $_SESSION['sso_return'] = $r;
    } else {
        unset($_SESSION['sso_return']);
    }
}

$remembered = htmlspecialchars($_COOKIE['suche_username'] ?? '', ENT_QUOTES, 'UTF-8');
$theme      = $_COOKIE['theme'] ?? 'auto';
$theme      = in_array($theme, ['light', 'dark', 'auto'], true) ? $theme : 'auto';
$nonce      = htmlspecialchars($_cspNonce ?? '', ENT_QUOTES, 'UTF-8');
$v          = defined('APP_BUILD') ? ('?v=' . APP_BUILD) : '';
?>
<!DOCTYPE html>
<html lang="de" data-theme="<?= htmlspecialchars($theme, ENT_QUOTES, 'UTF-8') ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Anmelden &mdash; Eriks Cloud</title>
  <meta name="theme-color" content="#e2001a">
  <link rel="icon" type="image/svg+xml" href="<?= $base ?>/css/shared/icons/jardyx_offwhite.svg">
  <link rel="icon" type="image/x-icon" href="<?= $base ?>/favicon.ico">
  <link rel="stylesheet" href="<?= $base ?>/css/shared/theme.css<?= $v ?>">
  <link rel="stylesheet" href="<?= $base ?>/css/shared/reset.css<?= $v ?>">
  <link rel="stylesheet" href="<?= $base ?>/css/shared/layout.css<?= $v ?>">
  <link rel="stylesheet" href="<?= $base ?>/css/shared/components.css<?= $v ?>">
  <link rel="stylesheet" href="<?= $base ?>/css/app.css<?= $v ?>">
  <style nonce="<?= $nonce ?>">
    /* Central login: override suche's grey logo with brand red. */
    body.login-page .login-logo { --logo-color: var(--color-accent); }
  </style>
</head>
<body class="login-page">
<main class="login-main" id="main-content">
  <form class="login-card" method="post" action="authentication.php" autocomplete="on">
    <?= csrf_input() ?>
    <span class="login-logo" aria-hidden="true"></span>
    <h1>Eriks Cloud</h1>
    <?php foreach ($alerts as [$type, $msg]): ?>
      <p class="app-alert app-alert-<?= htmlspecialchars($type, ENT_QUOTES, 'UTF-8') ?>" role="alert"><?= $msg ?></p>
    <?php endforeach; ?>
    <label class="login-field">
      <span>Benutzername</span>
      <input type="text" name="login-username" autocomplete="username" required autofocus
             value="<?= $remembered ?>" data-clearable>
    </label>
    <label class="login-field">
      <span>Kennwort</span>
      <input type="password" name="login-password" autocomplete="current-password" required>
    </label>
    <label class="login-check">
      <input type="checkbox" name="rememberName" value="1"<?= $remembered !== '' ? ' checked' : '' ?>>
      <span>Benutzername merken</span>
    </label>
    <label class="login-check">
      <input type="checkbox" name="remember_me" value="1">
      <span>Angemeldet bleiben (<?= (int) (AUTH_REMEMBER_LIFETIME / 86400) ?>&nbsp;Tage)</span>
    </label>
    <p class="login-note">Meldet Sie auch auf den anderen Apps auf eriks.cloud an.</p>
    <button type="submit" class="btn-login">Anmelden</button>
    <p class="login-forgot"><a href="forgotPassword.php">Kennwort vergessen?</a></p>
  </form>
</main>
<script src="<?= $base ?>/css/shared/js/field-enhance.js<?= $v ?>" nonce="<?= $nonce ?>"></script>
</body>
</html>
