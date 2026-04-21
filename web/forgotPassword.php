<?php
require_once __DIR__ . '/../inc/initialize.php';

$error   = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $error = 'Ungültige Anfrage.';
    } elseif (trim($_POST['email'] ?? '') === '') {
        $error = 'Bitte E-Mail-Adresse eingeben.';
    } else {
        $ip  = getUserIpAddr();
        $key = 'reset:' . $ip;

        if (rate_limit_check($key, 3, 900)) {
            $error = 'Zu viele Versuche. Bitte warten Sie 15 Minuten.';
        } else {
            rate_limit_record($key);

            $email = trim($_POST['email']);
            $stmt  = $con->prepare(
                "SELECT id, username FROM auth_accounts WHERE email = ? AND disabled = '0'"
            );
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if ($row) {
                $token = auth_reset_token_issue($con, (int) $row['id'])['token'];

                $resetUrl = APP_BASE_URL . '/executeReset.php?token=' . urlencode($token);
                if (mail_send_password_reset($email, $row['username'], $resetUrl)) {
                    appendLog($con, 'pwd_reset', 'Reset mail sent: ' . $row['username']);
                } else {
                    appendLog($con, 'pwd_reset', 'Reset mail failed: ' . $row['username']);
                }
            }

            // Always show the same message to avoid user enumeration.
            $success = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Suche · Kennwort vergessen</title>
    <?php $_b = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'); ?>
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/theme.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/reset.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/layout.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/shared/components.css">
    <link rel="stylesheet" href="<?= $_b ?>/css/app.css">
    <meta name="theme-color" content="<?= htmlspecialchars(APP_COLOR, ENT_QUOTES) ?>">
    <link rel="icon" type="image/svg+xml" href="<?= $_b ?>/jardyx-favicon.svg">
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
        <h2>Kennwort vergessen</h2>

        <?php if ($error): ?>
            <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
        <?php endif; ?>

        <?php if ($success): ?>
            <div class="alert alert-success">
                Sofern die angegebene E-Mail-Adresse registriert ist, haben Sie einen Link zum Zurücksetzen erhalten.
            </div>
            <div class="login-links"><a href="login.php">Zurück zur Anmeldung</a></div>
        <?php else: ?>
            <form method="post" action="forgotPassword.php">
                <?= csrf_input() ?>
                <div class="form-group">
                    <label for="email">E-Mail-Adresse</label>
                    <input type="email" id="email" name="email" class="form-control"
                           autocomplete="email" required autofocus
                           value="<?= htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
                </div>
                <button type="submit" class="btn-login">Link anfordern</button>
            </form>
            <div class="login-links"><a href="login.php">Abbrechen</a></div>
        <?php endif; ?>
    </div>
</div>
<?php $base = $_b; require __DIR__ . '/../inc/_footer.php'; ?>
</body>
</html>
