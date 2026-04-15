<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';
require_once __DIR__ . '/../inc/search_engines.php';
require_once __DIR__ . '/../inc/buttons.php';

auth_require();

$uid     = (int) ($_SESSION['uid'] ?? 0);
$engines = search_engines_load();

render_header('Start', 'home');
?>
<div class="search-forms">
    <?php foreach ($engines as $engine): ?>
        <?php render_search_form($engine); ?>
    <?php endforeach; ?>
</div>
<?php $buttons = buttons_for_user($uid); ?>
<div class="button-grid">
    <?php foreach ($buttons as $b): ?>
        <?php render_button($b); ?>
    <?php endforeach; ?>
</div>
<?php
render_footer();
