<?php
require_once __DIR__ . '/../../inc/initialize.php';
require_once __DIR__ . '/../../inc/feeds.php';

header('Content-Type: application/json');

auth_require();

$uid = (int) ($_SESSION['id'] ?? 0);

// ── GET: render (read-only, CSRF-checked like every other action below;
// ownership is still enforced via feeds_get()'s user_id-scoped lookup) ──────
// Used by web/index.php to lazy-load inactive feed tabs (§20) instead of
// fetching every feed synchronously during page render.
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($_GET['action'] ?? '') === 'render') {
    if (!csrf_verify()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'CSRF token mismatch']);
        appendLog($con, 'csrf', 'feeds API csrf mismatch', 'suche');
        exit;
    }

    require_once __DIR__ . '/../../inc/rss.php';

    $id = (int) ($_GET['id'] ?? 0);
    try {
        $feed = feeds_get($uid, $id);
    } catch (\RuntimeException $e) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
        exit;
    }

    $xml = rss_fetch($feed['url']);
    if ($xml) {
        echo json_encode(['ok' => true, 'html' => rss_render($xml)]);
    } else {
        echo json_encode(['ok' => false, 'error' => 'Feed nicht verfügbar: ' . $feed['title']]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

if (!csrf_verify()) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'CSRF token mismatch']);
    appendLog($con, 'csrf', 'feeds API csrf mismatch', 'suche');
    exit;
}

$action = $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'list':
            echo json_encode(['ok' => true, 'rows' => feeds_for_user($uid, false)]);
            break;

        case 'create':
            $row = feeds_insert($uid, $_POST);
            appendLog($con, 'feed', 'created id=' . $row['id'], 'suche');
            echo json_encode(['ok' => true, 'row' => $row]);
            break;

        case 'update':
            $id  = (int) ($_POST['id'] ?? 0);
            $row = feeds_update($uid, $id, $_POST);
            appendLog($con, 'feed', 'updated id=' . $id, 'suche');
            echo json_encode(['ok' => true, 'row' => $row]);
            break;

        case 'delete':
            $id = (int) ($_POST['id'] ?? 0);
            feeds_delete($uid, $id);
            appendLog($con, 'feed', 'deleted id=' . $id, 'suche');
            echo json_encode(['ok' => true]);
            break;

        case 'reorder':
            $order = $_POST['order'] ?? [];
            if (!is_array($order)) $order = [];
            $rows = feeds_reorder($uid, $order);
            appendLog($con, 'feed', 'reordered (' . count($rows) . ' rows)', 'suche');
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
    error_log('api/feeds: ' . $e->getMessage());
    echo json_encode(['ok' => false, 'error' => 'Serverfehler']);
}
