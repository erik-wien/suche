<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';
require_once __DIR__ . '/../inc/search_engines.php';
require_once __DIR__ . '/../inc/buttons.php';
require_once __DIR__ . '/../inc/feeds.php';
require_once __DIR__ . '/../inc/rss.php';

auth_require();

$uid     = (int) ($_SESSION['id'] ?? 0);
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
<?php $feeds = feeds_for_user($uid); ?>
<section class="rss-section">
    <div class="tab-bar" role="tablist">
        <?php foreach ($feeds as $i => $f): ?>
            <button type="button"
                    class="tab-btn<?= $i === 0 ? ' active' : '' ?>"
                    role="tab"
                    data-tab="feed-<?= (int)$f['id'] ?>"
                    aria-controls="feed-<?= (int)$f['id'] ?>"
                    aria-selected="<?= $i === 0 ? 'true' : 'false' ?>">
                <?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?>
            </button>
        <?php endforeach; ?>
    </div>
    <?php foreach ($feeds as $i => $f): ?>
        <div class="tab-panel"
             id="feed-<?= (int)$f['id'] ?>"
             role="tabpanel"
             aria-labelledby="feed-<?= (int)$f['id'] ?>"
             <?= $i === 0 ? '' : 'hidden' ?>>
            <?php
            $xml = rss_fetch($f['url']);
            if ($xml) {
                echo rss_render($xml);
            } else {
                echo '<p class="text-muted">Feed nicht verfügbar: ' . htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') . '</p>';
            }
            ?>
        </div>
    <?php endforeach; ?>
</section>
<?php
render_footer();
