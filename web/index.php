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
    <div class="app-tabs" role="tablist">
        <?php foreach ($feeds as $i => $f): ?>
            <button type="button"
                    class="app-tab<?= $i === 0 ? ' active' : '' ?>"
                    role="tab"
                    data-tab="feed-<?= (int)$f['id'] ?>"
                    aria-controls="feed-<?= (int)$f['id'] ?>"
                    aria-selected="<?= $i === 0 ? 'true' : 'false' ?>">
                <?php if (!empty($f['img_url'])): ?>
                    <img src="<?= htmlspecialchars($base . '/' . $f['img_url'], ENT_QUOTES, 'UTF-8') ?>"
                         alt="" aria-hidden="true"
                         style="width:1em;height:1em;object-fit:contain;vertical-align:-0.1em;margin-right:.3em">
                <?php endif; ?>
                <?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?>
            </button>
        <?php endforeach; ?>
    </div>
    <?php foreach ($feeds as $i => $f): ?>
        <?php if ($i === 0): ?>
            <div class="app-tab-panel"
                 id="feed-<?= (int)$f['id'] ?>"
                 role="tabpanel"
                 aria-labelledby="feed-<?= (int)$f['id'] ?>">
                <?php
                // Only the initially visible tab is fetched synchronously (§20) —
                // inactive tabs render a placeholder below and lazy-load their
                // content on first activation via api/feeds.php?action=render.
                $xml = rss_fetch($f['url']);
                if ($xml) {
                    echo rss_render($xml);
                } else {
                    echo '<p class="text-muted">Feed nicht verfügbar: ' . htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') . '</p>';
                }
                ?>
            </div>
        <?php else: ?>
            <div class="app-tab-panel"
                 id="feed-<?= (int)$f['id'] ?>"
                 role="tabpanel"
                 aria-labelledby="feed-<?= (int)$f['id'] ?>"
                 data-feed-id="<?= (int)$f['id'] ?>"
                 data-lazy="1"
                 hidden>
                <p class="text-muted">Lade Feed „<?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?>“ …</p>
            </div>
        <?php endif; ?>
    <?php endforeach; ?>
</section>
<script nonce="<?= $_cspNonce ?>">
(function () {
    'use strict';

    // ── Lazy-load inactive feed tabs (§20) ────────────────────────────────────
    // The initial tab is rendered server-side above; every other tab shows a
    // placeholder and fetches its content on first activation via the small
    // read-only GET action added to api/feeds.php (auth + user-scoped
    // ownership check happen server-side, same as the page itself).

    // Same token, same meta tag as window.sucheFetch (web/js/app.js) — that
    // helper appends it as a POST field, this is a GET so it travels as the
    // X-CSRF-TOKEN header instead (csrf_verify() accepts either).
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    function escapeHtml(s) {
        const d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }

    async function loadFeed(panel) {
        if (!panel || panel.dataset.lazy !== '1') return;
        panel.dataset.lazy = '0'; // mark as (being) loaded so a second click can't double-fetch
        const id = panel.dataset.feedId;
        try {
            const data = await window.apiCall('api/feeds.php?action=render&id=' + encodeURIComponent(id), {
                method: 'GET',
                headers: { 'X-CSRF-TOKEN': csrfToken },
            });
            if (data && data.ok) {
                panel.innerHTML = data.html;
            } else {
                panel.innerHTML = '<p class="text-muted" role="alert">' + escapeHtml((data && data.error) || 'Feed nicht verfügbar.') + '</p>';
            }
        } catch (e) {
            panel.innerHTML = '<p class="text-muted" role="alert">' + escapeHtml((e && e.message) || 'Netzwerkfehler.') + '</p>';
        }
    }

    document.querySelectorAll('.rss-section .app-tabs .app-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            loadFeed(document.getElementById(btn.dataset.tab));
        });
    });

    // Deep-link support (e.g. a bookmarked #feed-7): app.js activates the tab
    // from location.hash on load; wait for DOMContentLoaded so window.apiCall
    // (loaded by the deferred app.js module) is guaranteed to exist by then.
    document.addEventListener('DOMContentLoaded', () => {
        if (location.hash.length > 1) {
            loadFeed(document.getElementById(location.hash.slice(1)));
        }
    });
})();
</script>
<?php
render_footer();
