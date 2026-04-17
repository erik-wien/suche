<?php
require_once __DIR__ . '/../inc/initialize.php';
if (empty($_SESSION['loggedin'])) { http_response_code(403); exit; }

$stmt = $con->prepare(
    'SELECT img_blob FROM auth_accounts WHERE id = ? AND img_blob IS NOT NULL'
);
$stmt->bind_param('i', $_SESSION['id']);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    header('Content-Type: image/svg+xml');
    $init = strtoupper(substr($_SESSION['username'] ?? '?', 0, 1));
    echo '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">'
       . '<circle cx="16" cy="16" r="16" fill="#2d3748"/>'
       . '<text x="16" y="21" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#e2e8f0">' . htmlspecialchars($init) . '</text>'
       . '</svg>';
    exit;
}

$stmt->bind_result($blob);
$stmt->fetch();
$stmt->close();

header('Content-Type: image/jpeg');
header('Cache-Control: private, max-age=3600');
echo $blob;
