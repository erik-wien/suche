<?php
/**
 * web/api.php — suche JSON API router.
 *
 * Per design rules §15.1, all admin mutations go through
 * api.php?action=admin_<verb> as POST + CSRF and return JSON.
 *
 * Currently dispatches only admin_* actions; other suche API endpoints
 * live in web/api/*.php (buttons, feeds, …).
 */

require_once __DIR__ . '/../inc/initialize.php';

if (empty($_SESSION['loggedin'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

header('Content-Type: application/json');

$type = $_GET['action'] ?? $_GET['type'] ?? '';

if (
    $type === 'admin_user_create' ||
    $type === 'admin_user_edit'   ||
    $type === 'admin_user_reset'  ||
    $type === 'admin_user_delete' ||
    $type === 'admin_log_list'
) {
    if (($_SESSION['rights'] ?? '') !== 'Admin') {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Forbidden']);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'Ungültige Anfrage.']);
        exit;
    }

    $_cfg       = suche_load_config();
    $appBaseUrl = rtrim($_cfg['app']['base_url'] ?? '', '/');

    if ($type === 'admin_log_list') {
        require_once __DIR__ . '/../inc/admin_log.php';
        $perPage = 50;
        $page    = max(1, (int) ($_POST['page'] ?? 1));
        $filters = [
            'app'     => trim((string) ($_POST['app']     ?? '')),
            'context' => trim((string) ($_POST['context'] ?? '')),
            'user'    => trim((string) ($_POST['user']    ?? '')),
            'from'    => trim((string) ($_POST['from']    ?? '')),
            'to'      => trim((string) ($_POST['to']      ?? '')),
            'q'       => trim((string) ($_POST['q']       ?? '')),
            'fail'    => !empty($_POST['fail']) ? '1' : '',
        ];
        $data = admin_log_list($con, $page, $perPage, $filters);
        echo json_encode([
            'ok'       => true,
            'rows'     => $data['rows'],
            'total'    => $data['total'],
            'page'     => $page,
            'perPage'  => $perPage,
            'lastPage' => max(1, (int) ceil($data['total'] / $perPage)),
            'apps'     => admin_log_distinct_apps($con),
            'contexts' => admin_log_distinct_contexts($con),
        ]);
        exit;
    }

    if ($type === 'admin_user_create') {
        $username = trim((string) ($_POST['username'] ?? ''));
        $email    = trim((string) ($_POST['email']    ?? ''));
        $rights   = (string) ($_POST['rights'] ?? 'User');
        if ($username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['ok' => false, 'error' => 'Benutzername und gültige E-Mail erforderlich.']);
            exit;
        }
        try {
            admin_create_user($con, $username, $email, $rights, $appBaseUrl);
            appendLog($con, 'admin', "Created user {$username} ({$email})", 'suche');
            echo json_encode(['ok' => true]);
        } catch (\mysqli_sql_exception $e) {
            if ($e->getCode() === 1062) {
                echo json_encode(['ok' => false, 'error' => 'Benutzername oder E-Mail bereits vergeben.']);
            } else {
                appendLog($con, 'admin', "admin_user_create failed for {$username}: " . $e->getMessage(), 'suche');
                echo json_encode(['ok' => false, 'error' => 'Datenbankfehler: ' . $e->getMessage()]);
            }
        }
        exit;
    }

    if ($type === 'admin_user_edit') {
        $targetId  = (int) ($_POST['id'] ?? 0);
        $email     = trim((string) ($_POST['email'] ?? ''));
        $rights    = (string) ($_POST['rights'] ?? 'User');
        $disabled  = (int) !empty($_POST['disabled']);
        $debug     = (int) !empty($_POST['debug']);
        $totpReset = !empty($_POST['totp_reset']);
        if ($targetId <= 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['ok' => false, 'error' => 'Ungültige Eingabe.']);
            exit;
        }
        admin_edit_user($con, $targetId, $email, $rights, $disabled, $debug, $totpReset);
        appendLog($con, 'admin', "User #{$targetId} updated.", 'suche');
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($type === 'admin_user_reset') {
        $targetId = (int) ($_POST['id'] ?? 0);
        if ($targetId <= 0) {
            echo json_encode(['ok' => false, 'error' => 'Ungültige ID.']);
            exit;
        }
        $ok = admin_reset_password($con, $targetId, $appBaseUrl);
        appendLog($con, 'admin', "Password reset requested for user #{$targetId}.", 'suche');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => 'E-Mail konnte nicht gesendet werden.']);
        exit;
    }

    if ($type === 'admin_user_delete') {
        $targetId = (int) ($_POST['id'] ?? 0);
        $selfId   = (int) ($_SESSION['id'] ?? 0);
        if ($targetId <= 0) {
            echo json_encode(['ok' => false, 'error' => 'Ungültige ID.']);
            exit;
        }
        if ($targetId === $selfId) {
            echo json_encode(['ok' => false, 'error' => 'Sie können sich nicht selbst löschen.']);
            exit;
        }
        $ok = admin_delete_user($con, $targetId, $selfId);
        appendLog($con, 'admin', "User #{$targetId} deleted.", 'suche');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => 'Löschen fehlgeschlagen.']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action.']);
