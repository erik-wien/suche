<?php
require_once __DIR__ . '/../inc/initialize.php';

// Design rule §12: logout MUST be POST + CSRF; never a plain <a> link.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('POST required.');
}

if (!csrf_verify()) {
    http_response_code(403);
    exit('CSRF token mismatch.');
}

auth_logout($con);
header('Location: ' . $base . '/');
exit;
