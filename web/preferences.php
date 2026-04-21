<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

$uid      = (int) ($_SESSION['id'] ?? 0);
$username = $_SESSION['username'] ?? '';

// ── Enumerate local icons for the Bild dropdown ──────────────────────────────
$iconFiles = [];
foreach (glob(__DIR__ . '/icons/*.{jpg,jpeg,png,svg}', GLOB_BRACE) as $f) {
    $iconFiles[] = basename($f);
}
usort($iconFiles, 'strcasecmp');

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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'revoke_all_devices') {
    if (!csrf_verify()) {
        http_response_code(403);
        exit('CSRF token mismatch');
    }
    if (auth_remember_revoke_all($con)) {
        addAlert('success', 'Alle Sitzungen wurden beendet.');
    } else {
        addAlert('danger', 'Konnte Sitzungen nicht beenden.');
    }
    header('Location: preferences.php#pref-sicherheit'); exit;
}

$theme = $_SESSION['theme'] ?? 'auto';

render_header('Einstellungen', 'preferences');
?>
<div class="container" style="padding:1.5rem">
    <h1>Einstellungen</h1>

    <?php foreach ($_SESSION['alerts'] ?? [] as [$type, $msg]): ?>
        <div class="alert alert-<?= htmlspecialchars($type, ENT_QUOTES, 'UTF-8') ?>"
             role="alert"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endforeach; unset($_SESSION['alerts']); ?>

    <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn active" role="tab"
                data-tab="pref-display" aria-controls="pref-display" aria-selected="true">Darstellung</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-links" aria-controls="pref-links" aria-selected="false">Links</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-feeds" aria-controls="pref-feeds" aria-selected="false">Feeds</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-sicherheit" aria-controls="pref-sicherheit" aria-selected="false">Sicherheit</button>
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
                <button type="button" class="btn btn-outline-success btn-sm" data-modal-open="buttonModal" id="btnAddButton">Neuer Link</button>
            </div>
            <div class="card-body">
                <table class="table table-sm table-hover" id="buttonsTable">
                    <thead>
                        <tr>
                            <th style="width:1rem" aria-hidden="true"></th>
                            <th style="width:1%">Vorschau</th>
                            <th>URL</th>
                            <th style="width:1%;white-space:nowrap">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        require_once __DIR__ . '/../inc/buttons.php';
                        $buttons = buttons_for_user($uid);
                        foreach ($buttons as $b):
                        ?>
                            <tr data-id="<?= (int)$b['id'] ?>">
                                <td class="drag-handle" title="Verschieben" aria-hidden="true">&#x2630;</td>
                                <td class="btn-preview-cell"><?php render_button($b); ?></td>
                                <td class="text-muted small"><?= htmlspecialchars($b['url'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td style="white-space:nowrap">
                                    <button class="btn btn-sm btn-edit-button" type="button"
                                            title="Bearbeiten"
                                            data-id="<?= (int)$b['id'] ?>"
                                            data-caption="<?= htmlspecialchars($b['caption'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-url="<?= htmlspecialchars($b['url'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-variant="<?= htmlspecialchars($b['variant'], ENT_QUOTES, 'UTF-8') ?>"
data-img-url="<?= htmlspecialchars($b['img_url'] ?? '', ENT_QUOTES, 'UTF-8') ?>"><span class="ui-icon ui-icon-edit" aria-hidden="true"></span></button>
                                    <button class="btn btn-sm btn-copy-button" type="button"
                                            title="Kopieren"
                                            data-caption="<?= htmlspecialchars($b['caption'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-url="<?= htmlspecialchars($b['url'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-variant="<?= htmlspecialchars($b['variant'], ENT_QUOTES, 'UTF-8') ?>"
data-img-url="<?= htmlspecialchars($b['img_url'] ?? '', ENT_QUOTES, 'UTF-8') ?>">⧉</button>
                                    <button class="btn btn-sm btn-danger btn-delete-button" type="button"
                                            title="Löschen"
                                            data-id="<?= (int)$b['id'] ?>"><span class="ui-icon ui-icon-delete" aria-hidden="true"></span></button>
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
                <button type="button" class="btn btn-outline-success btn-sm" id="btnAddFeed">Neuer Feed</button>
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
                                            title="Bearbeiten"
                                            data-id="<?= (int)$f['id'] ?>"
                                            data-title="<?= htmlspecialchars($f['title'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-url="<?= htmlspecialchars($f['url'], ENT_QUOTES, 'UTF-8') ?>"
                                            data-img-url="<?= htmlspecialchars($f['img_url'] ?? '', ENT_QUOTES, 'UTF-8') ?>"
                                            data-enabled="<?= (int)$f['enabled'] ?>"><span class="ui-icon ui-icon-edit" aria-hidden="true"></span></button>
                                    <button class="btn btn-sm btn-danger btn-delete-feed" type="button"
                                            title="Löschen"
                                            data-id="<?= (int)$f['id'] ?>"><span class="ui-icon ui-icon-delete" aria-hidden="true"></span></button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="tab-panel" id="pref-sicherheit" role="tabpanel" hidden>
        <div class="card mt-3">
            <div class="card-header">Aktive Sitzungen</div>
            <div class="card-body">
                <p>Meldet Sie auf allen Geräten und allen Apps auf eriks.cloud ab.</p>
                <p class="text-muted small">Aktive Sitzungen auf anderen Apps bleiben bis zu 4 Tage bestehen;
                    um sie sofort zu beenden, ändern Sie Ihr Kennwort.</p>
                <form method="post" action="preferences.php"
                      onsubmit="return confirm('Wirklich von allen Geräten abmelden?')">
                    <?= csrf_input() ?>
                    <input type="hidden" name="action" value="revoke_all_devices">
                    <button type="submit" class="btn btn-outline-danger">Von allen Geräten abmelden</button>
                </form>
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
                    <div id="bf-preview-wrap" style="display:flex;align-items:center;justify-content:center;min-height:3.5rem;margin-bottom:1rem;padding:.75rem;background:var(--color-surface-alt);border:1px solid var(--color-border);border-radius:var(--radius)">
                        <div id="bf-preview"></div>
                    </div>
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
                            <option value="btn-success">Success (grün)</option>
                            <option value="btn-warning">Warning (gelb)</option>
                            <option value="btn-danger">Danger (rot)</option>
                            <option value="btn-secondary">Secondary</option>
                            <option value="btn-dark">Dunkel</option>
                            <option value="btn-light">Hell</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="bf-img-trigger">Bild (optional, überschreibt Icon)</label>
                        <div class="icon-picker">
                            <button type="button" class="icon-picker-trigger" id="bf-img-trigger"
                                    aria-haspopup="listbox" aria-expanded="false">
                                <span class="icon-picker-preview" id="bf-img-preview"></span>
                                <span class="icon-picker-name" id="bf-img-name">— kein Bild —</span>
                                <span class="icon-picker-chevron" aria-hidden="true">▾</span>
                            </button>
                            <div class="icon-picker-list" role="listbox" id="bf-img-list" hidden>
                                <div class="icon-picker-opt" role="option" data-value="" aria-selected="true">
                                    <span class="icon-picker-thumb-gap"></span>
                                    — kein Bild —
                                </div>
                                <?php foreach ($iconFiles as $iconFile):
                                    $pickerVal = 'icons/' . $iconFile;
                                    $pickerSrc = $base . '/' . $pickerVal;
                                ?>
                                <div class="icon-picker-opt" role="option"
                                     data-value="<?= htmlspecialchars($pickerVal, ENT_QUOTES, 'UTF-8') ?>"
                                     aria-selected="false">
                                    <img class="icon-picker-thumb"
                                         src="<?= htmlspecialchars($pickerSrc, ENT_QUOTES, 'UTF-8') ?>"
                                         alt=""
                                         style="width:1.2em;height:1.2em;object-fit:contain;flex-shrink:0">
                                    <?= htmlspecialchars($iconFile, ENT_QUOTES, 'UTF-8') ?>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <input type="hidden" name="img_url" id="bf-img">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn" data-modal-close>Abbrechen</button>
                    <button type="submit" class="btn btn-outline-success">Speichern</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="<?= $base ?>/js/sortable.min.js"></script>
<script nonce="<?= $_cspNonce ?>">
(function () {
    const modal      = document.getElementById('buttonModal');
    const form       = document.getElementById('buttonForm');
    const title      = document.getElementById('buttonModalTitle');
    const tableBody  = document.querySelector('#buttonsTable tbody');

    Sortable.create(tableBody, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: async () => {
            const ids = Array.from(tableBody.querySelectorAll('tr')).map(r => r.dataset.id);
            const res = await sucheFetch('api/buttons.php', { action: 'reorder', order: ids });
            if (!res.ok) alert('Fehler beim Speichern der Reihenfolge.');
        },
    });

    // ── Icon picker ───────────────────────────────────────────────────────────
    const pickerTrigger = document.getElementById('bf-img-trigger');
    const pickerList    = document.getElementById('bf-img-list');
    const pickerInput   = document.getElementById('bf-img');
    const pickerName    = document.getElementById('bf-img-name');
    const pickerPreview = document.getElementById('bf-img-preview');

    function setIconPicker(value) {
        pickerInput.value = value;
        let selOpt = null;
        pickerList.querySelectorAll('.icon-picker-opt').forEach((o) => {
            const selected = o.dataset.value === value;
            o.setAttribute('aria-selected', selected ? 'true' : 'false');
            if (selected) selOpt = o;
        });
        pickerPreview.replaceChildren();
        if (selOpt && value) {
            pickerName.textContent = value.replace(/^icons\//, '');
            const srcImg = selOpt.querySelector('img');
            if (srcImg) {
                const img = document.createElement('img');
                img.src = srcImg.src;   // resolved URL from server-rendered DOM element
                img.alt = '';
                img.style.cssText = 'width:1.2em;height:1.2em;object-fit:contain;display:block';
                pickerPreview.appendChild(img);
            }
        } else {
            pickerName.textContent = '— kein Bild —';
        }
        updatePreview();
    }

    // ── Button preview ────────────────────────────────────────────────────────
    const previewEl = document.getElementById('bf-preview');

    function updatePreview() {
        const caption = document.getElementById('bf-caption').value || '…';
        const variant = document.getElementById('bf-variant').value || 'btn-default';
        const imgVal  = pickerInput.value;

        const btn = document.createElement('a');
        btn.className = 'btn ' + variant;
        btn.href = '#';
        btn.setAttribute('aria-hidden', 'true');
        btn.style.cssText = 'pointer-events:none;width:12rem;height:2.5rem;display:inline-flex;align-items:center;justify-content:center;gap:.35rem;padding-inline:.75rem;overflow:hidden';

        if (imgVal) {
            const selOpt = Array.from(pickerList.querySelectorAll('.icon-picker-opt'))
                .find((o) => o.dataset.value === imgVal);
            const srcImg = selOpt && selOpt.querySelector('img');
            if (srcImg) {
                const img = document.createElement('img');
                img.src = srcImg.src;
                img.alt = '';
                img.style.cssText = 'width:1.2em;height:1.2em;object-fit:contain;flex-shrink:0';
                btn.appendChild(img);
            }
        }

        const span = document.createElement('span');
        span.className = 'btn-label';
        span.style.cssText = 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;min-width:0';
        span.textContent = caption;
        btn.appendChild(span);

        previewEl.replaceChildren(btn);
    }

    document.getElementById('bf-caption').addEventListener('input', updatePreview);
    document.getElementById('bf-variant').addEventListener('change', updatePreview);
    // ─────────────────────────────────────────────────────────────────────────

    pickerTrigger.addEventListener('click', () => {
        const open = !pickerList.hidden;
        pickerList.hidden = open;
        pickerTrigger.setAttribute('aria-expanded', String(!open));
    });

    pickerList.querySelectorAll('.icon-picker-opt').forEach((opt) =>
        opt.addEventListener('click', () => {
            setIconPicker(opt.dataset.value);
            pickerList.hidden = true;
            pickerTrigger.setAttribute('aria-expanded', 'false');
            pickerTrigger.focus();
        })
    );

    document.addEventListener('click', (e) => {
        if (!pickerTrigger.closest('.icon-picker').contains(e.target)) {
            pickerList.hidden = true;
            pickerTrigger.setAttribute('aria-expanded', 'false');
        }
    });
    // ─────────────────────────────────────────────────────────────────────────

    function openModal()  { modal.classList.add('open'); }
    function closeModal() {
        modal.classList.remove('open');
        form.reset();
        document.getElementById('bf-id').value = '';
        setIconPicker('');
    }

    document.getElementById('btnAddButton').addEventListener('click', () => {
        title.textContent = 'Neuer Link';
        openModal();
    });
    modal.querySelectorAll('[data-modal-close]').forEach((el) =>
        el.addEventListener('click', closeModal)
    );
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    function fillForm(data) {
        document.getElementById('bf-caption').value = data.caption || '';
        document.getElementById('bf-url').value     = data.url     || '';
        document.getElementById('bf-variant').value = data.variant || 'btn-default';
        setIconPicker(data.imgUrl || '');
    }

    document.querySelectorAll('.btn-edit-button').forEach((btn) =>
        btn.addEventListener('click', () => {
            title.textContent = 'Link bearbeiten';
            document.getElementById('bf-id').value = btn.dataset.id;
            fillForm(btn.dataset);
            openModal();
        })
    );

    document.querySelectorAll('.btn-copy-button').forEach((btn) =>
        btn.addEventListener('click', () => {
            title.textContent = 'Link kopieren';
            document.getElementById('bf-id').value = '';   // empty → create on submit
            fillForm(btn.dataset);
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
                        <label for="ff-img-trigger">Icon (optional, vor dem Titel)</label>
                        <div class="icon-picker">
                            <button type="button" class="icon-picker-trigger" id="ff-img-trigger"
                                    aria-haspopup="listbox" aria-expanded="false">
                                <span class="icon-picker-preview" id="ff-img-preview"></span>
                                <span class="icon-picker-name" id="ff-img-name">— kein Icon —</span>
                                <span class="icon-picker-chevron" aria-hidden="true">▾</span>
                            </button>
                            <div class="icon-picker-list" role="listbox" id="ff-img-list" hidden>
                                <div class="icon-picker-opt" role="option" data-value="" aria-selected="true">
                                    <span class="icon-picker-thumb-gap"></span>
                                    — kein Icon —
                                </div>
                                <?php foreach ($iconFiles as $iconFile):
                                    $pickerVal = 'icons/' . $iconFile;
                                    $pickerSrc = $base . '/' . $pickerVal;
                                ?>
                                <div class="icon-picker-opt" role="option"
                                     data-value="<?= htmlspecialchars($pickerVal, ENT_QUOTES, 'UTF-8') ?>"
                                     aria-selected="false">
                                    <img class="icon-picker-thumb"
                                         src="<?= htmlspecialchars($pickerSrc, ENT_QUOTES, 'UTF-8') ?>"
                                         alt=""
                                         style="width:1.2em;height:1.2em;object-fit:contain;flex-shrink:0">
                                    <?= htmlspecialchars($iconFile, ENT_QUOTES, 'UTF-8') ?>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <input type="hidden" name="img_url" id="ff-img">
                        </div>
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
                    <button type="submit" class="btn btn-outline-success">Speichern</button>
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

    // ── Feed icon picker ──────────────────────────────────────────────────────
    const ffPickerTrigger = document.getElementById('ff-img-trigger');
    const ffPickerList    = document.getElementById('ff-img-list');
    const ffPickerInput   = document.getElementById('ff-img');
    const ffPickerPreview = document.getElementById('ff-img-preview');
    const ffPickerName    = document.getElementById('ff-img-name');

    function setFeedIconPicker(value) {
        ffPickerInput.value = value;
        ffPickerList.querySelectorAll('.icon-picker-opt').forEach((o) => {
            o.setAttribute('aria-selected', o.dataset.value === value ? 'true' : 'false');
        });
        ffPickerPreview.replaceChildren();
        if (value) {
            const selOpt = Array.from(ffPickerList.querySelectorAll('.icon-picker-opt'))
                .find((o) => o.dataset.value === value);
            const srcImg = selOpt && selOpt.querySelector('img');
            if (srcImg) {
                const img = document.createElement('img');
                img.src = srcImg.src;
                img.alt = '';
                img.style.cssText = 'width:1.2em;height:1.2em;object-fit:contain;flex-shrink:0';
                ffPickerPreview.appendChild(img);
            }
            ffPickerName.textContent = value.replace(/^icons\//, '');
        } else {
            ffPickerName.textContent = '— kein Icon —';
        }
        ffPickerTrigger.setAttribute('aria-expanded', 'false');
        ffPickerList.hidden = true;
    }

    ffPickerTrigger.addEventListener('click', () => {
        const open = !ffPickerList.hidden;
        ffPickerList.hidden = open;
        ffPickerTrigger.setAttribute('aria-expanded', String(!open));
    });

    ffPickerList.querySelectorAll('.icon-picker-opt').forEach((opt) => {
        opt.addEventListener('click', () => setFeedIconPicker(opt.dataset.value));
    });

    document.addEventListener('click', (e) => {
        if (!ffPickerTrigger.contains(e.target) && !ffPickerList.contains(e.target)) {
            ffPickerList.hidden = true;
            ffPickerTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    // ── Modal open/close ──────────────────────────────────────────────────────
    function openModal()  { modal.classList.add('open'); }
    function closeModal() {
        modal.classList.remove('open');
        form.reset();
        document.getElementById('ff-id').value = '';
        setFeedIconPicker('');
    }

    document.getElementById('btnAddFeed').addEventListener('click', () => {
        title.textContent = 'Neuer Feed';
        setFeedIconPicker('');
        openModal();
    });
    modal.querySelectorAll('[data-modal-close]').forEach((el) =>
        el.addEventListener('click', closeModal)
    );
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.querySelectorAll('.btn-edit-feed').forEach((btn) =>
        btn.addEventListener('click', () => {
            title.textContent = 'Feed bearbeiten';
            document.getElementById('ff-id').value        = btn.dataset.id;
            document.getElementById('ff-title').value     = btn.dataset.title;
            document.getElementById('ff-url').value       = btn.dataset.url;
            document.getElementById('ff-enabled').checked = btn.dataset.enabled === '1';
            setFeedIconPicker(btn.dataset.imgUrl || '');
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
            img_url: ffPickerInput.value,
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
