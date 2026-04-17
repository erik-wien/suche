<?php
/**
 * web/api.php — suche JSON API router.
 *
 * Per design rules §15.1, all admin mutations go through
 * api.php?action=admin_<verb> as POST + CSRF and return JSON.
 *
 * admin_* actions are routed to erikr/chrome's Admin\Dispatch (canonical
 * §15.1 implementation). Other suche API endpoints live in web/api/*.php
 * (buttons, feeds, …) and are dispatched from there.
 */

require_once __DIR__ . '/../inc/initialize.php';

use Erikr\Chrome\Admin\Dispatch;

if (empty($_SESSION['loggedin'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Unauthorized']);
    exit;
}

$type = $_GET['action'] ?? $_GET['type'] ?? '';

if (str_starts_with($type, 'admin_')) {
    Dispatch::handle($con, $type, [
        'baseUrl' => APP_BASE_URL,
        'selfId'  => (int) ($_SESSION['id'] ?? 0),
    ]);
    exit;
}

header('Content-Type: application/json');

if (str_starts_with($type, 'icon_')) {
    // Admin-only icon management
    $rights = (array) ($_SESSION['rights'] ?? []);
    if (!in_array('Admin', $rights, true)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Nur für Admins.']);
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_verify()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'CSRF-Fehler.']);
        exit;
    }
    require_once __DIR__ . '/../inc/icons.php';
    try {
        switch ($type) {
            case 'icon_list':
                echo json_encode(['ok' => true, 'files' => icons_list()]);
                break;
            case 'icon_upload':
                if (empty($_FILES['icon'])) {
                    throw new RuntimeException('Keine Datei übermittelt.');
                }
                $name = icons_upload($_FILES['icon']);
                appendLog($con, 'admin', 'icon uploaded: ' . $name);
                echo json_encode(['ok' => true, 'file' => $name]);
                break;
            case 'icon_rename':
                $oldName = trim((string) ($_POST['file'] ?? ''));
                $newName = trim((string) ($_POST['name'] ?? ''));
                $result  = icons_rename($oldName, $newName);
                appendLog($con, 'admin', 'icon renamed: ' . $oldName . ' → ' . $result);
                echo json_encode(['ok' => true, 'file' => $result]);
                break;
            case 'icon_delete':
                $filename = trim((string) ($_POST['file'] ?? ''));
                icons_delete($filename);
                appendLog($con, 'admin', 'icon deleted: ' . $filename);
                echo json_encode(['ok' => true]);
                break;
            default:
                http_response_code(400);
                echo json_encode(['ok' => false, 'error' => 'Unbekannte Aktion.']);
        }
    } catch (InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    } catch (\Throwable $e) {
        http_response_code(500);
        error_log('api/icons: ' . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Serverfehler']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'error' => 'Unknown action.']);
