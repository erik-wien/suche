---
id: TASK-3
title: 'Mobile hamburger: drill-down panels for Test apps and account items'
status: Done
assignee: []
created_date: '2026-04-19 04:37'
updated_date: '2026-04-19 04:58'
labels:
  - ui
  - mobile
  - header
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace the broken fixed-popup submenu with an iOS-style drill-down panel system inside the existing `.user-dropdown`. Clicking a trigger replaces the dropdown content with a sub-panel; a back button returns to the main view.

Also clean up leftover artefacts from the previous failed attempts (`.mobile-nav-submenu` fixed popup, `panel`-slide CSS, the fixed-submenu emitted after `</header>`).

## Final structure

### Main panel (mobile)
```
Apps                     ← section label
  WL Monitor             ← direct link
  Energie                ← direct link
  Chat                   ← direct link
  Test               ▶   ← admin-only trigger → Test sub-panel
────────────────────────
username                 ← non-clickable label
  Konto              ▶   ← trigger → Konto sub-panel (mobile only)
  Einstellungen          ← direct link (desktop only)
  Passwort & 2FA         ← direct link (desktop only)
  Administration         ← direct link (desktop only, admin only)
  Hilfe                  ← always direct link
────────────────────────
☀ ⬤ 🌙
────────────────────────
Abmelden
```

### Test sub-panel (admin, mobile)
```
◀ Test
  Suche
  WL Monitor
  Energie
  Chat
  Zeiterfassung
```

### Konto sub-panel (mobile)
```
◀ Konto
  Einstellungen
  Passwort & 2FA
  Administration   (admin only)
```

---

## Implementation plan

### Step 1 — Remove old artefacts

**`Header.php`:** Remove the block that emits `.mobile-nav-submenu` divs after `</header>`.

**`components.css`:** Remove `.mobile-nav-submenu` and `.dropdown-submenu-trigger` rules.

**`app.js`:** Remove the "Mobile nav fixed submenu" block.

### Step 2 — Restructure `Header.php` user dropdown

Wrap ALL current user-dropdown content in a `<div class="dd-main">`. Then append sub-panels as siblings inside `.user-dropdown`.

**`.dd-main` contents (in order):**
1. `.dropdown-nav-section` — unchanged flat nav links, but the admin dropdown `appMenu` item renders as `<button class="dd-trigger dd-chevron-btn" data-target="dd-sub-test">Test</button>` instead of the old trigger
2. `.dropdown-divider`
3. `dropdown-username` span
4. `.dropdown-divider`
5. Mobile-only `<button class="dd-trigger dd-chevron-btn dd-mobile" data-target="dd-sub-konto">Konto</button>`
6. Desktop-only `<a class="dd-desktop">Einstellungen</a>`, `<a class="dd-desktop">Passwort & 2FA</a>`, `<a class="dd-desktop">Administration</a>` (admin-gated)
7. Hilfe link (unchanged)
8. extras (unchanged)
9. `.dropdown-divider`
10. Theme row (unchanged)
11. `.dropdown-divider`
12. Logout form (unchanged)

**Sub-panels (siblings of `.dd-main` inside `.user-dropdown`):**

For each `appMenu` item with `children` visible to current user:
```html
<div class="dd-sub" id="dd-sub-test" hidden>
  <button class="dd-back dropdown-link-btn">◀ Test</button>
  <a href="..." class="dropdown-link-btn">Suche</a>
  …
</div>
```

For the Konto panel (always emitted when logged in):
```html
<div class="dd-sub" id="dd-sub-konto" hidden>
  <button class="dd-back dropdown-link-btn">◀ Konto</button>
  <a href="$prefsHref" class="dropdown-link-btn">Einstellungen</a>
  <a href="$securityHref" class="dropdown-link-btn">Passwort & 2FA</a>
  [if admin: <a href="$adminHref">Administration</a>]
</div>
```

### Step 3 — CSS in `components.css`

```css
/* Trigger button: label left, chevron right */
.dd-chevron-btn {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}
/* Back button: chevron left, label right */
.dd-back {
  display: flex !important;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}
/* Desktop: hide mobile-only triggers; sub-panels never needed */
@media (min-width: 768px) {
  .dd-mobile { display: none !important; }
  .dd-sub    { display: none !important; }
}
/* Mobile: hide desktop-only direct links */
@media (max-width: 767px) {
  .dd-desktop { display: none !important; }
}
```

### Step 4 — JS in `app.js`

Replace the fixed-submenu handler with a delegated drill-down handler:

```js
// Drill-down: trigger opens sub-panel, back closes it
document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.dd-trigger');
    if (trigger) {
        const dd = trigger.closest('.user-dropdown');
        if (!dd) return;
        dd.querySelector('.dd-main').hidden = true;
        const sub = document.getElementById(trigger.dataset.target);
        if (sub) sub.hidden = false;
        return;
    }
    const back = e.target.closest('.dd-back');
    if (back) {
        const dd = back.closest('.user-dropdown');
        if (!dd) return;
        dd.querySelectorAll('.dd-sub').forEach(p => p.hidden = true);
        dd.querySelector('.dd-main').hidden = false;
    }
});

// Reset drill-down state when dropdown closes (outside click)
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dd = document.getElementById('user-dropdown');
        if (!dd) return;
        dd.querySelectorAll('.dd-sub').forEach(p => p.hidden = true);
        const main = dd.querySelector('.dd-main');
        if (main) main.hidden = false;
    }
});
```
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Mobile: hamburger opens dropdown showing Apps section (WL Monitor/Energie/Chat) + Test ▶ (admin) + Konto ▶ + Hilfe + theme + Abmelden
- [ ] #2 Mobile: tapping Test ▶ replaces dropdown content with Test sub-panel; ◀ Test returns to main
- [ ] #3 Mobile: tapping Konto ▶ replaces dropdown content with Einstellungen/Passwort & 2FA/Administration; ◀ Konto returns to main
- [ ] #4 Desktop: Einstellungen/Passwort & 2FA/Administration show as direct links (no drill-down trigger visible)
- [ ] #5 Desktop: Test ▶ in header-nav still works as a horizontal dropdown (unchanged)
- [ ] #6 Re-opening the hamburger after closing always shows the main panel (state resets on close)
- [ ] #7 No leftover .mobile-nav-submenu elements in the DOM
<!-- AC:END -->
