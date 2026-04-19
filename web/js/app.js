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

    // ── Mobile drill-down panels ──────────────────────────────────────────────
    function ddReset(dropdown) {
        dropdown.querySelectorAll('.dd-sub').forEach((p) => p.classList.remove('dd-open'));
        const main = dropdown.querySelector('.dd-main');
        if (main) main.classList.remove('dd-collapsed');
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.dd-trigger');
        if (trigger) {
            const dd = trigger.closest('.user-dropdown');
            if (!dd) return;
            const sub = document.getElementById(trigger.dataset.target);
            if (!sub) return;
            dd.querySelector('.dd-main').classList.add('dd-collapsed');
            sub.classList.add('dd-open');
            return;
        }
        const back = e.target.closest('.dd-back');
        if (back) {
            const dd = back.closest('.user-dropdown');
            if (dd) ddReset(dd);
        }
    });

    // Reset drill-down when the user-menu closes
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            const dd = document.getElementById('user-dropdown');
            if (dd) ddReset(dd);
        }
    });

    // ── Header nav dropdowns ──────────────────────────────────────────────────
    function closeAllDropdowns() {
        document.querySelectorAll('.header-dropdown.open').forEach((d) => {
            d.classList.remove('open');
            d.querySelector('.header-dropdown-trigger')?.setAttribute('aria-expanded', 'false');
        });
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.header-dropdown-trigger');
        if (trigger) {
            const dropdown = trigger.closest('.header-dropdown');
            const opening  = !dropdown.classList.contains('open');
            closeAllDropdowns();
            if (opening) {
                dropdown.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
            return;
        }
        if (!e.target.closest('.header-dropdown')) closeAllDropdowns();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });
})();
