<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

$uid      = (int) ($_SESSION['uid'] ?? 0);
$username = $_SESSION['username'] ?? '';

// ── Handle theme persistence POST ────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'change_theme') {
    if (!csrf_verify()) {
        http_response_code(403);
        exit('CSRF token mismatch');
    }
    $theme = $_POST['theme'] ?? 'auto';
    if (!in_array($theme, ['light', 'dark', 'auto'], true)) {
        http_response_code(400);
        exit('invalid theme');
    }
    $_SESSION['theme'] = $theme;
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'theme' => $theme]);
    exit;
}

$theme = $_SESSION['theme'] ?? 'auto';

render_header('Einstellungen', 'preferences');
?>
<div class="container" style="padding:1.5rem">
    <h1>Einstellungen</h1>

    <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn active" role="tab"
                data-tab="pref-display" aria-controls="pref-display" aria-selected="true">Darstellung</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-links" aria-controls="pref-links" aria-selected="false">Links</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-feeds" aria-controls="pref-feeds" aria-selected="false">Feeds</button>
    </div>

    <div class="tab-panel" id="pref-display" role="tabpanel">
        <div class="card mt-3">
            <div class="card-body">
                <h3>Theme</h3>
                <p class="text-muted">
                    Wähle das Farbschema. <em>Auto</em> folgt deiner Systemeinstellung.
                </p>
                <div class="theme-row" style="justify-content:flex-start">
                    <button class="theme-btn<?= $theme === 'light' ? ' active' : '' ?>" data-theme="light">☀ Hell</button>
                    <button class="theme-btn<?= $theme === 'auto'  ? ' active' : '' ?>" data-theme="auto">⬤ Auto</button>
                    <button class="theme-btn<?= $theme === 'dark'  ? ' active' : '' ?>" data-theme="dark">🌙 Dunkel</button>
                </div>
            </div>
        </div>
    </div>

    <div class="tab-panel" id="pref-links" role="tabpanel" hidden>
        <div class="card mt-3">
            <div class="card-header card-header-split">
                <h3>Links</h3>
                <button type="button" class="btn btn-primary btn-sm" data-modal-open="buttonModal" id="btnAddButton">Neuer Link</button>
            </div>
            <div class="card-body">
                <table class="table table-sm table-hover" id="buttonsTable">
                    <thead>
                        <tr>
                            <th>Caption</th>
                            <th>URL</th>
                            <th>Variant</th>
                            <th style="width:8rem">Reihenfolge</th>
                            <th style="width:8rem">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        require_once __DIR__ . '/../inc/buttons.php';
                        $buttons = buttons_for_user($uid);
                        foreach ($buttons as $b):
                        ?>
                            <tr data-id="<?= (int)$b['id'] ?>">
                                <td><?= htmlspecialchars($b['caption'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-muted small"><?= htmlspecialchars($b['url'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td><code><?= htmlspecialchars($b['variant'], ENT_QUOTES, 'UTF-8') ?></code></td>
                                <td>
                                    <button class="btn btn-sm btn-move-up" type="button" title="Nach oben">▲</button>
                                    <button class="btn btn-sm btn-move-down" type="button" title="Nach unten">▼</button>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-edit-button" type="button"
                                            data-id="<?= (int)$b['id'] ?>"
                                            data-caption="<?= htmlspecialchars($b['caption'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-url="<?= htmlspecialchars($b['url'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-variant="<?= htmlspecialchars($b['variant'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-icon="<?= htmlspecialchars($b['icon'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
                                            data-img-url="<?= htmlspecialchars($b['img_url'] ?? '', ENT_QUOTES, 'UTF-8') ?>">Bearbeiten</button>
                                    <button class="btn btn-sm btn-danger btn-delete-button" type="button"
                                            data-id="<?= (int)$b['id'] ?>">Löschen</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="tab-panel" id="pref-feeds" role="tabpanel" hidden>
        <div class="card mt-3">
            <div class="card-header card-header-split">
                <h3>Feeds</h3>
                <button type="button" class="btn btn-primary btn-sm" id="btnAddFeed">Neuer Feed</button>
            </div>
            <div class="card-body">
                <table class="table table-sm table-hover" id="feedsTable">
                    <thead>
                        <tr>
                            <th>Titel</th>
                            <th>URL</th>
                            <th style="width:6rem">Aktiv</th>
                            <th style="width:8rem">Reihenfolge</th>
                            <th style="width:8rem">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        require_once __DIR__ . '/../inc/feeds.php';
                        $feedsRows = feeds_for_user($uid, false);
                        foreach ($feedsRows as $f):
                        ?>
                            <tr data-id="<?= (int)$f['id'] ?>">
                                <td><?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="text-muted small"><?= htmlspecialchars($f['url'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= $f['enabled'] ? '✅' : '—' ?></td>
                                <td>
                                    <button class="btn btn-sm btn-move-up-feed" type="button">▲</button>
                                    <button class="btn btn-sm btn-move-down-feed" type="button">▼</button>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-edit-feed" type="button"
                                            data-id="<?= (int)$f['id'] ?>"
                                            data-title="<?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-url="<?= htmlspecialchars($f['url'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-enabled="<?= (int)$f['enabled'] ?>">Bearbeiten</button>
                                    <button class="btn btn-sm btn-danger btn-delete-feed" type="button"
                                            data-id="<?= (int)$f['id'] ?>">Löschen</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
<div class="modal" id="buttonModal" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="buttonModalTitle">Neuer Link</h4>
                <button type="button" class="close" data-modal-close>&times;</button>
            </div>
            <form id="buttonForm">
                <input type="hidden" name="id" id="bf-id" value="">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="bf-caption">Caption</label>
                        <input type="text" class="form-control" id="bf-caption" name="caption" required maxlength="64">
                    </div>
                    <div class="form-group">
                        <label for="bf-url">URL</label>
                        <input type="url" class="form-control" id="bf-url" name="url" required>
                    </div>
                    <div class="form-group">
                        <label for="bf-variant">Farbe</label>
                        <select class="form-select" id="bf-variant" name="variant">
                            <option value="btn-default">Standard</option>
                            <option value="btn-primary">Primary (blau)</option>
                            <option value="btn-success">Success (grün)</option>
                            <option value="btn-warning">Warning (gelb)</option>
                            <option value="btn-danger">Danger (rot)</option>
                            <option value="btn-secondary">Secondary</option>
                            <option value="btn-dark">Dunkel</option>
                            <option value="btn-light">Hell</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="bf-icon">Icon-Klasse (optional)</label>
                        <input type="text" class="form-control" id="bf-icon" name="icon" placeholder="fa fa-link">
                    </div>
                    <div class="form-group">
                        <label for="bf-img-url">Bild-URL (optional, überschreibt Icon)</label>
                        <input type="url" class="form-control" id="bf-img-url" name="img_url">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" data-modal-close>Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script nonce="<?= $_cspNonce ?>">
(function () {
    const modal      = document.getElementById('buttonModal');
    const form       = document.getElementById('buttonForm');
    const title      = document.getElementById('buttonModalTitle');
    const tableBody  = document.querySelector('#buttonsTable tbody');

    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); form.reset(); document.getElementById('bf-id').value = ''; }

    document.getElementById('btnAddButton').addEventListener('click', () => {
        title.textContent = 'Neuer Link';
        openModal();
    });
    modal.querySelectorAll('[data-modal-close]').forEach((el) =>
        el.addEventListener('click', closeModal)
    );
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.querySelectorAll('.btn-edit-button').forEach((btn) =>
        btn.addEventListener('click', () => {
            title.textContent = 'Link bearbeiten';
            document.getElementById('bf-id').value       = btn.dataset.id;
            document.getElementById('bf-caption').value  = btn.dataset.caption;
            document.getElementById('bf-url').value      = btn.dataset.url;
            document.getElementById('bf-variant').value  = btn.dataset.variant;
            document.getElementById('bf-icon').value     = btn.dataset.icon;
            document.getElementById('bf-img-url').value  = btn.dataset.imgUrl;
            openModal();
        })
    );

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('bf-id').value;
        const params = {
            action:  id ? 'update' : 'create',
            caption: form.caption.value,
            url:     form.url.value,
            variant: form.variant.value,
            icon:    form.icon.value,
            img_url: form.img_url.value,
        };
        if (id) params.id = id;
        const res = await sucheFetch('api/buttons.php', params);
        if (res.ok) {
            location.reload();
        } else {
            alert('Fehler: ' + (res.error || 'unbekannt'));
        }
    });

    document.querySelectorAll('.btn-delete-button').forEach((btn) =>
        btn.addEventListener('click', async () => {
            if (!confirm('Diesen Link löschen?')) return;
            const res = await sucheFetch('api/buttons.php', { action: 'delete', id: btn.dataset.id });
            if (res.ok) location.reload();
            else alert('Fehler: ' + (res.error || 'unbekannt'));
        })
    );

    async function move(row, direction) {
        const ids = Array.from(tableBody.querySelectorAll('tr')).map((r) => r.dataset.id);
        const idx = ids.indexOf(row.dataset.id);
        const swap = idx + direction;
        if (swap < 0 || swap >= ids.length) return;
        [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
        const res = await sucheFetch('api/buttons.php', { action: 'reorder', order: ids });
        if (res.ok) location.reload();
        else alert('Fehler: ' + (res.error || 'unbekannt'));
    }
    document.querySelectorAll('.btn-move-up').forEach((b) =>
        b.addEventListener('click', () => move(b.closest('tr'), -1))
    );
    document.querySelectorAll('.btn-move-down').forEach((b) =>
        b.addEventListener('click', () => move(b.closest('tr'), +1))
    );
})();
</script>

<div class="modal" id="feedModal" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="feedModalTitle">Neuer Feed</h4>
                <button type="button" class="close" data-modal-close>&times;</button>
            </div>
            <form id="feedForm">
                <input type="hidden" name="id" id="ff-id" value="">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="ff-title">Titel</label>
                        <input type="text" class="form-control" id="ff-title" name="title" required maxlength="64">
                    </div>
                    <div class="form-group">
                        <label for="ff-url">RSS-URL</label>
                        <input type="url" class="form-control" id="ff-url" name="url" required>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="ff-enabled" name="enabled" value="1" checked>
                        <label class="form-check-label" for="ff-enabled">Aktiv</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" data-modal-close>Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script nonce="<?= $_cspNonce ?>">
(function () {
    const modal = document.getElementById('feedModal');
    const form  = document.getElementById('feedForm');
    const title = document.getElementById('feedModalTitle');
    const tbody = document.querySelector('#feedsTable tbody');

    function openModal()  { modal.classList.add('open'); }
    function closeModal() { modal.classList.remove('open'); form.reset(); document.getElementById('ff-id').value = ''; }

    document.getElementById('btnAddFeed').addEventListener('click', () => {
        title.textContent = 'Neuer Feed';
        openModal();
    });
    modal.querySelectorAll('[data-modal-close]').forEach((el) =>
        el.addEventListener('click', closeModal)
    );
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.querySelectorAll('.btn-edit-feed').forEach((btn) =>
        btn.addEventListener('click', () => {
            title.textContent = 'Feed bearbeiten';
            document.getElementById('ff-id').value      = btn.dataset.id;
            document.getElementById('ff-title').value   = btn.dataset.title;
            document.getElementById('ff-url').value     = btn.dataset.url;
            document.getElementById('ff-enabled').checked = btn.dataset.enabled === '1';
            openModal();
        })
    );

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('ff-id').value;
        const params = {
            action:  id ? 'update' : 'create',
            title:   form.title.value,
            url:     form.url.value,
            enabled: form.enabled.checked ? 1 : 0,
        };
        if (id) params.id = id;
        const res = await sucheFetch('api/feeds.php', params);
        if (res.ok) location.reload();
        else alert('Fehler: ' + (res.error || 'unbekannt'));
    });

    document.querySelectorAll('.btn-delete-feed').forEach((btn) =>
        btn.addEventListener('click', async () => {
            if (!confirm('Diesen Feed löschen?')) return;
            const res = await sucheFetch('api/feeds.php', { action: 'delete', id: btn.dataset.id });
            if (res.ok) location.reload();
            else alert('Fehler: ' + (res.error || 'unbekannt'));
        })
    );

    async function moveFeed(row, direction) {
        const ids = Array.from(tbody.querySelectorAll('tr')).map((r) => r.dataset.id);
        const idx = ids.indexOf(row.dataset.id);
        const swap = idx + direction;
        if (swap < 0 || swap >= ids.length) return;
        [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
        const res = await sucheFetch('api/feeds.php', { action: 'reorder', order: ids });
        if (res.ok) location.reload();
        else alert('Fehler: ' + (res.error || 'unbekannt'));
    }
    document.querySelectorAll('.btn-move-up-feed').forEach((b) =>
        b.addEventListener('click', () => moveFeed(b.closest('tr'), -1))
    );
    document.querySelectorAll('.btn-move-down-feed').forEach((b) =>
        b.addEventListener('click', () => moveFeed(b.closest('tr'), +1))
    );
})();
</script>
<?php
render_footer();
