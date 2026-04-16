<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';
require_once __DIR__ . '/../inc/search_engines.php';

auth_require();
admin_require();

$selfId = (int) ($_SESSION['id'] ?? 0);

// --- Users tab data -------------------------------------------------------
// The users tab is server-rendered on initial load; the log tab is AJAX-only
// (Rule §15.1 — filters and pagination go through api.php?action=admin_log_list).

$perPage  = 25;
$page     = max(1, (int) ($_GET['page'] ?? 1));
$filter   = trim((string) ($_GET['filter'] ?? ''));
$listing  = admin_list_users($con, $page, $perPage, $filter);
$users    = $listing['users'];
$total    = $listing['total'];
$lastPage = max(1, (int) ceil($total / $perPage));

$csrfToken = csrf_token();

/** Pagination URL for the users tab — preserves filter, keeps #adm-users hash. */
function user_page_url(int $p, string $filter): string {
    $qs = ['page' => $p];
    if ($filter !== '') {
        $qs['filter'] = $filter;
    }
    return 'admin.php?' . http_build_query($qs) . '#adm-users';
}

render_header('Administration', 'admin');
?>
<div class="container" style="padding:1.5rem">
    <h1>Administration</h1>

    <div id="adminAlerts"></div>

    <div class="tab-bar" role="tablist" aria-label="Administration">
        <button type="button" class="tab-btn active" role="tab"
                id="tab-adm-engines" aria-controls="adm-engines" aria-selected="true"
                data-tab="adm-engines">Suchmaschinen</button>
        <button type="button" class="tab-btn" role="tab"
                id="tab-adm-users" aria-controls="adm-users" aria-selected="false"
                data-tab="adm-users">Benutzer</button>
        <button type="button" class="tab-btn" role="tab"
                id="tab-adm-log" aria-controls="adm-log" aria-selected="false"
                data-tab="adm-log">Log</button>
    </div>

    <div class="tab-panel" id="adm-engines" role="tabpanel" aria-labelledby="tab-adm-engines">
        <div class="card mt-3">
            <div class="card-body">
                <h3>Suchmaschinen (global)</h3>
                <p class="text-muted">
                    Diese Liste wird aus <code>inc/search_engines.yaml</code> geladen.
                    Zum Ändern diese Datei direkt bearbeiten und neu deployen.
                </p>
                <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Label</th>
                            <th>Action</th>
                            <th>Methode</th>
                            <th>Feld</th>
                            <th>Accesskey</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach (search_engines_load() as $e): ?>
                            <tr>
                                <td><code><?= htmlspecialchars($e['id'], ENT_QUOTES, 'UTF-8') ?></code></td>
                                <td><?= htmlspecialchars($e['label'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td class="small text-muted"><?= htmlspecialchars($e['action'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($e['method'] ?? 'get', ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($e['input_name'], ENT_QUOTES, 'UTF-8') ?></td>
                                <td><?= htmlspecialchars($e['accesskey'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    </div>

    <div class="tab-panel" id="adm-users" role="tabpanel" aria-labelledby="tab-adm-users" hidden>
        <?php require __DIR__ . '/../inc/_admin_users_tab.php'; ?>
    </div>

    <div class="tab-panel" id="adm-log" role="tabpanel" aria-labelledby="tab-adm-log" hidden>
        <?php require __DIR__ . '/../inc/_admin_log_tab.php'; ?>
    </div>
</div>

<?php require __DIR__ . '/../inc/_admin_user_modals.php'; ?>

<script nonce="<?= htmlspecialchars($_cspNonce, ENT_QUOTES, 'UTF-8') ?>">
(function () {
    'use strict';

    // ── Tiny inline helpers (modal open/close + alert) ──────────────────────
    // Fetch + tab switching come from window.sucheFetch / sucheActivateTab
    // (provided by /js/app.js, loaded by render_footer).

    function showAlert(msg, type, targetEl) {
        const box = targetEl || document.getElementById('adminAlerts');
        if (!box) return;
        const div = document.createElement('div');
        div.className = 'alert alert-' + (type || 'info');
        div.textContent = msg;
        box.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    /** If `form` is inside a modal, return that modal's inline alert slot. */
    function modalAlertBox(form) {
        return form?.closest('.modal')?.querySelector('.modal-alerts') || null;
    }

    function openModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.add('open', 'show');
        m.setAttribute('aria-hidden', 'false');
    }

    function closeModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.remove('open', 'show');
        m.setAttribute('aria-hidden', 'true');
    }

    // Wire modal open/close/backdrop/Escape
    document.querySelectorAll('[data-modal-open]').forEach((btn) => {
        btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
    });
    document.querySelectorAll('[data-modal-close]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const m = btn.closest('.modal');
            if (m) closeModal(m.id);
        });
    });
    document.querySelectorAll('.modal').forEach((m) => {
        m.addEventListener('click', (e) => { if (e.target === m) closeModal(m.id); });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal.open, .modal.show').forEach((m) => closeModal(m.id));
    });

    async function apiPost(action, params) {
        return window.sucheFetch('api.php?action=' + encodeURIComponent(action), params || {});
    }

    // ── Users tab: row actions ──────────────────────────────────────────────
    document.querySelectorAll('.btn-edit').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.getElementById('editId').value             = btn.dataset.id;
            document.getElementById('editUsername').textContent = btn.dataset.username;
            document.getElementById('editEmail').value          = btn.dataset.email;
            document.getElementById('editRights').value         = btn.dataset.rights;
            document.getElementById('editDisabled').checked     = btn.dataset.disabled === '1';
            document.getElementById('editDebug').checked        = btn.dataset.debug === '1';
            document.getElementById('editTotpReset').checked    = false;
        });
    });

    async function submitViaFetch(form, action, okMsg, onOk) {
        const fd = new FormData(form);
        fd.delete('csrf_token');
        const params = Object.fromEntries(fd);
        const errBox = modalAlertBox(form);
        try {
            const res = await apiPost(action, params);
            if (res && res.ok) {
                showAlert(okMsg, 'success');
                if (onOk) onOk(fd);
                setTimeout(() => location.reload(), 700);
            } else {
                showAlert((res && res.error) || 'Unbekannter Fehler.', 'danger', errBox);
            }
        } catch (err) {
            console.error(action, err);
            showAlert('Netzwerkfehler: ' + (err && err.message || err), 'danger', errBox);
        }
    }

    const editForm = document.getElementById('editForm');
    editForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        submitViaFetch(e.target, 'admin_user_edit', 'Gespeichert.', () => closeModal('editModal'));
    });

    const createForm = document.getElementById('createForm');
    createForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        submitViaFetch(e.target, 'admin_user_create',
            'Einladung versandt an ' + email + '.',
            () => { closeModal('createModal'); e.target.reset(); });
    });

    document.querySelectorAll('.btn-reset').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!confirm('Einladungs-E-Mail erneut senden?')) return;
            const res = await apiPost('admin_user_reset', { id: btn.dataset.id });
            showAlert(res.ok ? 'E-Mail versandt.' : (res.error || 'Fehler.'), res.ok ? 'success' : 'danger');
        });
    });

    document.querySelectorAll('.btn-delete').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!confirm('Benutzer «' + btn.dataset.username + '» wirklich löschen?')) return;
            const res = await apiPost('admin_user_delete', { id: btn.dataset.id });
            if (res.ok) {
                showAlert('Gelöscht.', 'success');
                setTimeout(() => location.reload(), 700);
            } else {
                showAlert(res.error || 'Löschen fehlgeschlagen.', 'danger');
            }
        });
    });

    // ── Log tab: AJAX load, filter, paginate ───────────────────────────────
    const logForm      = document.getElementById('logFilterForm');
    const logTbody     = document.getElementById('logTbody');
    const logPaginate  = document.getElementById('logPagination');
    const logTotalEl   = document.getElementById('logTotal');
    const logAppSel    = document.getElementById('log_app');
    const logCtxSel    = document.getElementById('log_context');
    const logFromInput = document.getElementById('log_from');
    const logToInput   = document.getElementById('log_to');
    const logResetBtn  = document.getElementById('logReset');

    let filtersInitialised = false;
    let loaded             = false;

    const today   = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ymd     = (d) => d.toISOString().slice(0, 10);

    if (logFromInput) logFromInput.value = ymd(weekAgo);
    if (logToInput)   logToInput.value   = ymd(today);

    function addOption(sel, value) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        sel.appendChild(opt);
    }

    function populateFilters(apps, contexts) {
        if (filtersInitialised) return;
        filtersInitialised = true;
        // Default the App filter to 'suche' if present (Rule §15.7 convention).
        (apps || []).forEach((a) => addOption(logAppSel, a));
        if ((apps || []).indexOf('suche') !== -1) {
            logAppSel.value = 'suche';
        }
        (contexts || []).forEach((c) => addOption(logCtxSel, c));
    }

    function currentFilters() {
        return {
            app:     logAppSel.value,
            context: logCtxSel.value,
            user:    document.getElementById('log_user').value.trim(),
            from:    logFromInput.value.trim(),
            to:      logToInput.value.trim(),
            q:       document.getElementById('log_q').value.trim(),
            fail:    document.getElementById('log_fail').checked ? '1' : '',
        };
    }

    function setPlaceholderRow(text) {
        logTbody.replaceChildren();
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'text-muted';
        td.textContent = text;
        tr.appendChild(td);
        logTbody.appendChild(tr);
    }

    function renderRows(rows) {
        logTbody.replaceChildren();
        if (!rows.length) {
            setPlaceholderRow('Keine Einträge gefunden.');
            return;
        }
        for (const r of rows) {
            const tr = document.createElement('tr');

            const tdTime = document.createElement('td');
            tdTime.className = 'log-time';
            tdTime.textContent = r.logTime ?? '';
            tr.appendChild(tdTime);

            const tdOrigin = document.createElement('td');
            tdOrigin.textContent = r.origin ?? '';
            tr.appendChild(tdOrigin);

            const tdCtx = document.createElement('td');
            tdCtx.textContent = r.context ?? '';
            tr.appendChild(tdCtx);

            const tdUser = document.createElement('td');
            if (r.username !== null && r.username !== undefined) {
                tdUser.textContent = r.username;
            } else {
                const sp = document.createElement('span');
                sp.className = 'text-muted';
                sp.textContent = '—';
                tdUser.appendChild(sp);
            }
            tr.appendChild(tdUser);

            const tdIp = document.createElement('td');
            if (r.ip !== null && r.ip !== undefined) {
                tdIp.textContent = r.ip;
            } else {
                const sp = document.createElement('span');
                sp.className = 'text-muted';
                sp.textContent = '—';
                tdIp.appendChild(sp);
            }
            tr.appendChild(tdIp);

            const tdAct = document.createElement('td');
            tdAct.className = 'log-activity';
            tdAct.textContent = r.activity ?? '';
            tr.appendChild(tdAct);

            logTbody.appendChild(tr);
        }
    }

    function renderPagination(page, lastPage, onClick) {
        logPaginate.replaceChildren();
        if (lastPage <= 1) return;
        for (let p = 1; p <= lastPage; p++) {
            const a = document.createElement('a');
            a.className = 'page-link' + (p === page ? ' active' : '');
            a.href = '#adm-log';
            a.textContent = String(p);
            a.addEventListener('click', (e) => { e.preventDefault(); onClick(p); });
            logPaginate.appendChild(a);
        }
    }

    async function loadPage(page) {
        setPlaceholderRow('Lade…');
        const res = await apiPost('admin_log_list', { page, ...currentFilters() });
        if (!res.ok) {
            setPlaceholderRow('Fehler beim Laden.');
            showAlert(res.error || 'Log konnte nicht geladen werden.', 'danger');
            return;
        }
        populateFilters(res.apps, res.contexts);
        logTotalEl.textContent = String(res.total);
        renderRows(res.rows || []);
        renderPagination(res.page, res.lastPage, loadPage);
    }

    logForm?.addEventListener('submit', (e) => { e.preventDefault(); loadPage(1); });

    logResetBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        logAppSel.value = '';
        logCtxSel.value = '';
        document.getElementById('log_user').value   = '';
        document.getElementById('log_q').value      = '';
        document.getElementById('log_fail').checked = false;
        logFromInput.value = ymd(weekAgo);
        logToInput.value   = ymd(today);
        loadPage(1);
    });

    function maybeLoad() {
        if (loaded) return;
        if (location.hash === '#adm-log') {
            loaded = true;
            loadPage(1);
        }
    }
    document.querySelectorAll('.tab-btn[data-tab="adm-log"]').forEach((btn) =>
        btn.addEventListener('click', () => { if (!loaded) { loaded = true; loadPage(1); } })
    );
    window.addEventListener('hashchange', maybeLoad);
    maybeLoad();
})();
</script>
<?php
render_footer();
