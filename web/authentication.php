<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/sso_finish.php';

$attemptUser = substr((string)($_POST['login-username'] ?? ''), 0, 64);
$logUser     = $attemptUser !== '' ? $attemptUser : '(empty)';

// Validierter Rücksprung aus dem Login-Formular (Hidden-Field `return`):
// bei einem Fehl-Rücksprung an login.php anhängen, sonst geht er verloren,
// falls die Session ihn aus irgendeinem Grund nicht mehr trägt.
$loginRedirect = sso_login_redirect((string) ($_POST['return'] ?? ''));

if (empty($_POST['login-username']) || empty($_POST['login-password'])) {
    appendLog($con, 'auth_fail', 'Missing credentials (user="' . $logUser . '")', 'suche');
    addAlert('danger', 'Bitte sowohl Benutzername als auch Kennwort ausfüllen.');
    header('Location: ' . $loginRedirect); exit;
}

if (!csrf_verify()) {
    appendLog($con, 'auth_fail', 'CSRF failed on login (user="' . $logUser . '")', 'suche');
    addAlert('danger', 'Ungültige Anfrage.');
    header('Location: ' . $loginRedirect); exit;
}

$remember = !empty($_POST['remember_me']);
$result   = auth_login($con, $_POST['login-username'], $_POST['login-password'], $remember);

// Rücksprung aus dem POST übernehmen, BEVOR die TOTP-Weiche greift und bevor
// sso_finish_login() ihn aus der Session liest. Das Hidden-Field trägt ihn
// ohnehin mit (login.php:82) — verlassen wir uns allein auf
// $_SESSION['sso_return'], landet der Nutzer nach einem Session-Verlust
// zwischen dem GET auf login.php und diesem POST still auf der
// suche-Startseite statt in seiner App. Dieselbe Session-Kontinuität, deren
// Bruch bootstrap.php:99 schon für den CSRF-Token dokumentiert.
//
// MUSS vor dem totp_required-Zweig stehen: der springt auf totp_verify.php,
// und dort ist der POST-Wert weg — für 2FA-Nutzer bestünde die Lücke sonst
// unverändert weiter. sso_validate_return() hält den Open-Redirect-Schutz
// aufrecht, es wird also kein ungeprüfter Wert übernommen.
$postReturn = sso_validate_return((string) ($_POST['return'] ?? ''));
if ($postReturn !== '') {
    $_SESSION['sso_return'] = $postReturn;
}

if (!empty($result['ok']) && !empty($result['totp_required'])) {
    // Persist rememberName cookie intent for the post-TOTP redirect.
    if (!empty($_POST['rememberName'])) {
        setcookie('suche_username', $_POST['login-username'], [
            'expires'  => time() + 10 * 24 * 60 * 60,
            'path'     => '/',
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Lax',
        ]);
    } else {
        setcookie('suche_username', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Lax',
        ]);
    }
    header('Location: totp_verify.php'); exit;
}

if ($result['ok']) {
    if (!empty($_POST['rememberName'])) {
        setcookie('suche_username', $_POST['login-username'], [
            'expires'  => time() + 10 * 24 * 60 * 60,
            'path'     => '/',
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Lax',
        ]);
    } else {
        setcookie('suche_username', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'secure'   => true,
            'samesite' => 'Lax',
        ]);
    }
    sso_finish_login($con, (int) $_SESSION['id']);
} else {
    addAlert('danger', $result['error']);
    header('Location: ' . $loginRedirect); exit;
}
