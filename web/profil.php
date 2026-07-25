<?php
/**
 * web/profil.php — Profil-Seite (TASK-Profil, Erikr\Chrome\Profile).
 *
 * Ersetzt die alten "Profilbild"/"E-Mail"-Tabs auf preferences.php (die jetzt
 * nur noch Feeds/Links behält). Avatar-Upload + E-Mail-Änderung folgen dem
 * Kontrakt aus Erikr\Chrome\Profile's Docblock — Referenz war bislang
 * preferences.php (Muster 1:1 übernommen, nur Redirect-Ziele angepasst).
 */

require __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

$uid      = (int) ($_SESSION['id'] ?? 0);
$username = $_SESSION['username'] ?? '';

// ── Konto deaktivieren — fetch-basiert, JSON-Antwort (Kontrakt: Chrome\Profile) ─
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'deactivate_account') {
    header('Content-Type: application/json');
    if (!csrf_verify()) {
        appendLog($con, 'account', 'Deaktivierung: CSRF-Token ungueltig.');
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'csrf',
            'message' => 'Ungueltige Anfrage (CSRF-Token abgelaufen). Bitte Seite neu laden.']);
        exit;
    }
    $res = auth_deactivate_own_account($con, $uid, (string) ($_POST['password'] ?? ''));
    if ($res['ok']) {
        echo json_encode(['ok' => true]);
        $_SESSION = [];
        session_destroy();
        exit;
    }
    $msg = match ($res['error']) {
        'wrong_password'          => 'Das Kennwort ist falsch.',
        'admin_cannot_deactivate' => 'Administratorkonten koennen nicht selbst deaktiviert werden.',
        'already_disabled'        => 'Das Konto ist bereits deaktiviert.',
        default                   => 'Deaktivierung fehlgeschlagen. Details im Log.',
    };
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $res['error'], 'message' => $msg]);
    exit;
}

// ── Avatar-Upload — fetch-basiert, JSON-Antwort (Kontrakt: Chrome\Profile) ────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'upload_avatar') {
    header('Content-Type: application/json');
    if (!csrf_verify()) {
        appendLog($con, 'prefs', 'Avatar upload: CSRF-Token ungültig.');
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage (CSRF-Token abgelaufen). Bitte Seite neu laden.']);
        exit;
    }
    $res = \Erikr\Chrome\AvatarUpload::handle($con, $uid, $_FILES['avatar'] ?? null);
    if ($res['ok']) {
        appendLog($con, 'prefs', 'Avatar updated (' . $res['size'] . ' bytes).');
        echo json_encode(['ok' => true]);
        exit;
    }
    $avatarError = match ($res['error']) {
        'upload_failed'                  => 'Upload fehlgeschlagen.',
        'too_large'                      => 'Maximal 5 MB.',
        'not_image'                      => 'Nur Bilder (JPEG, PNG, GIF, WebP).',
        'too_small'                      => 'Mindestens 64×64 Pixel.',
        'decode_failed', 'encode_failed' => 'Bild konnte nicht verarbeitet werden.',
        default                          => 'Fehler beim Hochladen.',
    };
    appendLog($con, 'prefs', 'Avatar upload failed: ' . $res['error']);
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $avatarError]);
    exit;
}

// ── Avatar entfernen — fetch-basiert, JSON-Antwort (Kontrakt: Chrome\Profile) ─
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'clear_avatar') {
    header('Content-Type: application/json');
    if (!csrf_verify()) {
        appendLog($con, 'prefs', 'Avatar clear: CSRF-Token ungültig.');
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage (CSRF-Token abgelaufen). Bitte Seite neu laden.']);
        exit;
    }
    \Erikr\Chrome\AvatarUpload::clear($con, $uid);
    appendLog($con, 'prefs', 'Avatar removed.');
    echo json_encode(['ok' => true]);
    exit;
}

// ── API-Token anlegen — fetch-basiert, JSON-Antwort (Kontrakt: Chrome\ApiTokens) ─
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'token_create') {
    header('Content-Type: application/json');
    if (!csrf_verify()) {
        appendLog($con, 'prefs', 'API token create: CSRF-Token ungültig.');
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage (CSRF-Token abgelaufen). Bitte Seite neu laden.']);
        exit;
    }
    $label = trim((string) ($_POST['label'] ?? ''));
    $token = auth_api_token_issue($con, $uid, $label, 'web', null);
    $item  = auth_api_tokens_list($con, $uid)[0] ?? null;
    appendLog($con, 'prefs', 'API token created (label: ' . ($label !== '' ? $label : '(ohne Bezeichnung)') . ').');
    echo json_encode(['ok' => true, 'token' => $token, 'item' => $item]);
    exit;
}

// ── API-Token widerrufen — fetch-basiert, JSON-Antwort (Kontrakt: Chrome\ApiTokens) ─
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'token_revoke') {
    header('Content-Type: application/json');
    if (!csrf_verify()) {
        appendLog($con, 'prefs', 'API token revoke: CSRF-Token ungültig.');
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage (CSRF-Token abgelaufen). Bitte Seite neu laden.']);
        exit;
    }
    $tokenId = (int) ($_POST['id'] ?? 0);
    $deleted = auth_api_token_revoke($con, $uid, $tokenId);
    if (!$deleted) {
        appendLog($con, 'prefs', 'API token revoke failed (id ' . $tokenId . ').');
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Token nicht gefunden oder bereits widerrufen.']);
        exit;
    }
    appendLog($con, 'prefs', 'API token revoked (id ' . $tokenId . ').');
    echo json_encode(['ok' => true]);
    exit;
}

// ── E-Mail-Änderung — normaler Browser-POST (Reload) ──────────────────────────
$emailError = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'change_email') {
    if (!csrf_verify()) {
        appendLog($con, 'prefs', 'Email change: CSRF-Token ungültig.');
        http_response_code(403);
        exit('CSRF token mismatch');
    }
    $newEmail  = trim($_POST['email'] ?? '');
    $emailPass = $_POST['email_password'] ?? '';
    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        $emailError = 'Ungültige E-Mail-Adresse.';
    } elseif ($emailPass === '') {
        $emailError = 'Bitte Kennwort zur Bestätigung eingeben.';
    } else {
        $stmt2 = $con->prepare('SELECT password FROM auth_accounts WHERE id = ?');
        $stmt2->bind_param('i', $uid);
        $stmt2->execute();
        $pwRow = $stmt2->get_result()->fetch_assoc();
        $stmt2->close();
        if (!$pwRow || !password_verify($emailPass, $pwRow['password'])) {
            $emailError = 'Das Kennwort ist falsch.';
        } else {
            $chk = $con->prepare('SELECT id FROM auth_accounts WHERE email = ? AND id != ?');
            $chk->bind_param('si', $newEmail, $uid);
            $chk->execute();
            $chk->store_result();
            $taken = $chk->num_rows > 0;
            $chk->close();
            if ($taken) {
                $emailError = 'Diese E-Mail-Adresse ist bereits vergeben.';
            } else {
                $code = auth_email_confirmation_issue($con, $uid, $newEmail)['token'];
                $confirmUrl = APP_BASE_URL . '/confirm_email.php?code=' . urlencode($code);
                if (mail_send_email_change_confirmation($newEmail, $username, $confirmUrl)) {
                    appendLog($con, 'prefs', 'Email change requested');
                    addAlert('info', 'Bestätigungslink wurde an die neue E-Mail-Adresse gesendet.');
                    header('Location: profil.php'); exit;
                }
                appendLog($con, 'prefs', 'Email send failed');
                $emailError = 'Die Bestätigungs-E-Mail konnte nicht gesendet werden.';
            }
        }
    }
}

$emailStmt = $con->prepare('SELECT email FROM auth_accounts WHERE id = ?');
$emailStmt->bind_param('i', $uid);
$emailStmt->execute();
$currentEmail = $emailStmt->get_result()->fetch_assoc()['email'] ?? '';
$emailStmt->close();

render_header('Profil', 'profil');
?>
<div class="container" style="padding:1.5rem">
    <?php foreach ($_SESSION['alerts'] ?? [] as [$type, $msg]): ?>
        <div class="app-alert app-alert-<?= htmlspecialchars($type, ENT_QUOTES, 'UTF-8') ?>"
             role="alert"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endforeach; unset($_SESSION['alerts']); ?>

    <?php
    \Erikr\Chrome\Profile::render([
        'avatarSrc'          => $base . '/avatar.php',
        'username'           => (string) $username,
        'email'              => (string) $currentEmail,
        'avatarChangeAction' => 'profil.php',
        'avatarClearAction'  => 'profil.php',
        'emailEditAction'    => 'profil.php',
        'emailError'         => $emailError,
        'passwordHref'       => $base . '/security.php',
        'tokens'             => auth_api_tokens_list($con, $uid),
        'tokenAction'        => 'profil.php',
        'deactivateAction'   => 'profil.php',
        'isAdmin'            => (($_SESSION['rights'] ?? '') === 'Admin'),
        'csrfToken'          => csrf_token(),
        'cspNonce'           => $_cspNonce,
        'base'               => $base,
        'appSections'        => [
            ['label' => 'Feeds', 'href' => $base . '/preferences.php#pref-feeds'],
            ['label' => 'Links', 'href' => $base . '/preferences.php#pref-links'],
        ],
    ]);
    ?>
</div>
<?php
render_footer();
