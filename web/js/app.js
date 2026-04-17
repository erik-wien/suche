(function () {
    'use strict';

    // ── CSRF token — rendered into a <meta> tag by render_header ──────────────
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    // ── Tab switching — .tab-bar + .tab-btn + .tab-panel, hash-synced ─────────
    function activateTab(name, scope) {
        const root = scope || document;
        root.querySelectorAll('.tab-btn').forEach((b) => {
            const isActive = b.dataset.tab === name;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        root.querySelectorAll('.tab-panel').forEach((p) => {
            p.hidden = p.id !== name;
        });
    }

    document.querySelectorAll('.tab-bar').forEach((bar) => {
        bar.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.tab;
                activateTab(name);
                if (location.hash !== '#' + name) {
                    history.replaceState(null, '', '#' + name);
                }
            });
        });
    });

    // Restore tab from location.hash on load
    if (location.hash.length > 1) {
        const target = location.hash.slice(1);
        if (document.getElementById(target)) {
            activateTab(target);
        }
    }

    // ── fetch helper for API POSTs ────────────────────────────────────────────
    window.sucheFetch = async function (url, params) {
        const fd = new FormData();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (Array.isArray(v)) {
                v.forEach((item) => fd.append(k + '[]', item));
            } else {
                fd.append(k, v);
            }
        });
        fd.append('csrf_token', csrfToken);
        const res = await fetch(url, { method: 'POST', body: fd });
        if (!res.ok) {
            return { ok: false, error: 'HTTP ' + res.status };
        }
        return res.json();
    };

    // ── Expose activateTab for inline handlers ───────────────────────────────
    window.sucheActivateTab = activateTab;
})();
