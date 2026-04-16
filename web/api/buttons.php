<?php
require_once __DIR__ . '/../../inc/initialize.php';
require_once __DIR__ . '/../../inc/buttons.php';

header('Content-Type: application/json');

auth_require();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

if (!csrf_verify()) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'CSRF token mismatch']);
    appendLog($con, 'csrf', 'buttons API csrf mismatch', 'suche');
    exit;
}

$uid    = (int) ($_SESSION['id'] ?? 0);
$action = $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            echo json_encode(['ok' => true, 'rows' => buttons_for_user($uid)]);
            break;

        case 'create':
            $row = buttons_insert($uid, $_POST);
            appendLog($con, 'button', 'created id=' . $row['id'], 'suche');
            echo json_encode(['ok' => true, 'row' => $row]);
            break;

        case 'update':
            $id  = (int) ($_POST['id'] ?? 0);
            $row = buttons_update($uid, $id, $_POST);
            appendLog($con, 'button', 'updated id=' . $id, 'suche');
            echo json_encode(['ok' => true, 'row' => $row]);
            break;

        case 'delete':
            $id = (int) ($_POST['id'] ?? 0);
            buttons_delete($uid, $id);
            appendLog($con, 'button', 'deleted id=' . $id, 'suche');
            echo json_encode(['ok' => true]);
            break;

        case 'reorder':
            $order = $_POST['order'] ?? [];
            if (!is_array($order)) $order = [];
            $rows = buttons_reorder($uid, $order);
            appendLog($con, 'button', 'reordered (' . count($rows) . ' rows)', 'suche');
            echo json_encode(['ok' => true, 'rows' => $rows]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'unknown action']);
    }
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
} catch (\Throwable $e) {
    http_response_code(500);
    error_log('api/buttons: ' . $e->getMessage());
    echo json_encode(['ok' => false, 'error' => 'Serverfehler']);
}
