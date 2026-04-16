(function () {
    'use strict';

    // ── CSRF token — rendered into a <meta> tag by render_header ──────────────
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    // ── User dropdown ─────────────────────────────────────────────────────────
    document.querySelectorAll('.user-menu').forEach((menu) => {
        const btn = menu.querySelector('.user-btn');
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.user-menu.open').forEach((m) => m.classList.remove('open'));
    });

    // ── Theme switcher — persists to /preferences.php via POST ────────────────
    document.querySelectorAll('.theme-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = btn.dataset.theme;
            document.documentElement.dataset.theme = theme;
            document.querySelectorAll('.theme-btn').forEach((b) =>
                b.classList.toggle('active', b.dataset.theme === theme)
            );
            const fd = new FormData();
            fd.append('action', 'change_theme');
            fd.append('theme', theme);
            fd.append('csrf_token', csrfToken);
            fetch('preferences.php', { method: 'POST', body: fd }).catch(() => {});
        });
    });

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
