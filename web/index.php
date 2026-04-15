<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

$uid      = (int) ($_SESSION['uid'] ?? 0);
$username = $_SESSION['username'] ?? '';

render_header('Start', 'home');
?>
<div class="container" style="padding:1.5rem">
    <h1>Hallo <?= htmlspecialchars($username, ENT_QUOTES, 'UTF-8') ?>!</h1>
    <p class="text-muted">Du bist eingeloggt mit uid=<?= $uid ?>. Die Suchfunktionen kommen gleich — siehe docs/superpowers/plans.</p>
</div>
<?php
render_footer();
