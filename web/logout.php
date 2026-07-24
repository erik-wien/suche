<?php
require_once __DIR__ . '/../inc/initialize.php';

// Zentraler Logout-Endpunkt (Single-Logout). App-logout.php leiten hierher per
// GET um; dieser Host beendet die zentrale Session. Design-Regel §12: der Kill
// selbst läuft über POST+CSRF — der GET-Einstieg rendert einen Auto-POST-Bounce.

// Gültigen Rücksprung ermitteln (GET beim Bounce, POST beim Kill).
$__r      = (string) ($_POST['return'] ?? $_GET['return'] ?? '');
$__return = ($__r !== '' && auth_sso_return_allowed($__r, AUTH_SSO_ALLOWED_HOSTS)) ? $__r : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrf_verify()) {
    auth_logout($con);                       // zentrale Session beenden
    session_start();                         // frische Session nur für den Flash
    addAlert('info', 'Sie wurden abgemeldet.');
    if ($__return !== '') {
        header('Location: ' . $base . '/login.php?return=' . urlencode($__return));
    } else {
        header('Location: ' . $base . '/');
    }
    exit;
}

// GET oder POST ohne gültiges CSRF → Auto-POST-Bounce (mint eigenes CSRF-Token).
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');
$__nonce = htmlspecialchars($_cspNonce ?? '', ENT_QUOTES, 'UTF-8');
$__ret   = htmlspecialchars($__return, ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Abmelden &hellip;</title>
</head>
<body>
  <form id="logoutForm" method="post" action="logout.php">
    <?= csrf_input() ?>
    <input type="hidden" name="return" value="<?= $__ret ?>">
    <noscript><button type="submit">Abmelden</button></noscript>
  </form>
  <script nonce="<?= $__nonce ?>">document.getElementById('logoutForm').submit();</script>
</body>
</html>
