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

// ── E-Mail-Änderung — normaler Browser-POST (Reload) ──────────────────────────
$emailError = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'change_email') {
    if (!csrf_verify()) {
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
    <h1>Profil</h1>

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
        'emailEditAction'    => 'profil.php',
        'emailError'         => $emailError,
        'passwordHref'       => $base . '/security.php',
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
