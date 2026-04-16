<?php
/**
 * web/setpassword.php — Invite-token completion flow.
 *
 * GET:  validates token, shows "set password" form.
 * POST: validates input, calls invite_complete(), redirects to login.
 */
require_once __DIR__ . '/../inc/initialize.php';

$token  = trim($_GET['token'] ?? $_POST['token'] ?? '');
$error  = '';
$userId = null;

if ($token !== '') {
    $userId = invite_verify_token($con, $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $userId !== null) {
    if (!csrf_verify()) {
        $error = 'Ungültige Anfrage.';
    } else {
        $pw1 = $_POST['password1'] ?? '';
        $pw2 = $_POST['password2'] ?? '';

        if (strlen($pw1) < 8) {
            $error = 'Das Kennwort muss mindestens 8 Zeichen lang sein.';
        } elseif ($pw1 !== $pw2) {
            $error = 'Die Kennwörter stimmen nicht überein.';
        } else {
            invite_complete($con, $userId, $pw1);
            appendLog($con, 'invite', "Invite accepted for user #{$userId}", 'suche');
            addAlert('success', 'Kennwort wurde gesetzt. Sie können sich jetzt anmelden.');
            header('Location: login.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Suche · Passwort einrichten</title>
    <?php $_b = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'); ?>
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/theme.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/reset.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/layout.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/components.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/app.css">
    <link rel="icon" type="image/x-icon" href="<?= $_b ?>/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="<?= $_b ?>/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="<?= $_b ?>/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="<?= $_b ?>/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="<?= $_b ?>/web-app-manifest-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="<?= $_b ?>/web-app-manifest-512x512.png">
</head>
<body>
<header class="app-header">
    <div class="header-left">
        <span class="brand">
            <img src="<?= $_b ?>/css/shared/icons/jardyx.svg" class="header-logo" width="28" height="28" alt="">
            <span class="header-appname">Suche</span>
        </span>
    </div>
    <div class="header-right"></div>
</header>
<div class="login-wrap">
    <div class="login-card">
        <h2>Passwort einrichten</h2>

        <?php if ($userId === null): ?>
            <div class="alert alert-danger">Dieser Einladungslink ist ungültig oder abgelaufen.</div>
            <div class="login-links"><a href="login.php">Zur Anmeldung</a></div>
        <?php else: ?>
            <?php if ($error): ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
            <?php endif; ?>
            <form method="post" action="setpassword.php?token=<?= urlencode($token) ?>">
                <?= csrf_input() ?>
                <div class="form-group">
                    <label for="password1">Kennwort</label>
                    <input type="password" id="password1" name="password1"
                           class="form-control" autocomplete="new-password"
                           minlength="8" required autofocus>
                </div>
                <div class="form-group">
                    <label for="password2">Kennwort wiederholen</label>
                    <input type="password" id="password2" name="password2"
                           class="form-control" autocomplete="new-password"
                           minlength="8" required>
                </div>
                <button type="submit" class="btn-login">Kennwort speichern</button>
            </form>
        <?php endif; ?>
    </div>
</div>
<?php $base = $_b; require __DIR__ . '/../inc/_footer.php'; ?>
</body>
</html>
