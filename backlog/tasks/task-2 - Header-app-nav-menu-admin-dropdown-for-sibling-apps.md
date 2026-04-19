---
id: TASK-2
title: 'Header: app nav menu + admin dropdown for sibling apps'
status: Done
assignee: []
created_date: '2026-04-18 20:24'
updated_date: '2026-04-19 06:08'
labels:
  - ui
  - header
  - navigation
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a navigation menu to the suche header with three direct links (WL Monitor, Energie, Chat) and an admin-only dropdown listing all sibling apps.

Current state: `Header::render()` in `~/Git/chrome/src/Header.php` supports `appMenu` items but only renders flat `<a>` tags — no dropdown support. The `appMenu` is passed as `[]` in suche's `inc/layout.php`, so the header has no nav today.

## URLs (environment-aware)

`APP_ENV` is already available via `inc/initialize.php`. URL mapping:

| App | local | akadbrain | world4you |
|---|---|---|---|
| WL Monitor | `http://wlmonitor.test` | `https://wlmonitor.eriks.cloud` | `https://wlmonitor.jardyx.com` |
| Energie | `http://energie.test` | `https://energie.eriks.cloud` | `https://energie.jardyx.com` |
| Chat | `http://chat.test` | `https://chat.eriks.cloud` | `https://chat.jardyx.com` |
| Zeiterfassung | `http://zeit.test` | `https://werda.eriks.cloud` | *(not deployed)* |
| Suche | `http://suche.test` | `https://suche.eriks.cloud` | `https://www.jardyx.com` |

---

## Implementation plan

### Step 1 — Extend `Header::render()` (chrome library)

File: `~/Git/chrome/src/Header.php`

Extend `appMenu` item handling to support a `children` key. When present, render a `.header-dropdown` widget instead of a plain `<a>`:

```php
foreach ($appMenu as $item) {
    if (isset($item['children'])) {
        // dropdown item
        if (!empty($item['adminOnly']) && !$isAdmin) continue;
        $label = $e((string)($item['label'] ?? ''));
        echo '<div class="header-dropdown">';
        echo '<button type="button" class="header-dropdown-trigger">' . $label . ' ▾</button>';
        echo '<div class="header-dropdown-panel">';
        foreach ($item['children'] as $child) {
            $href  = (string)($child['href']  ?? '#');
            $label = $e((string)($child['label'] ?? ''));
            echo '<a href="' . $e($href) . '">' . $label . '</a>';
        }
        echo '</div></div>';
    } else {
        // existing flat-link rendering (unchanged)
    }
}
```

### Step 2 — Add dropdown CSS (shared CSS library)

File: `~/Git/css_library/components.css` — append to the `.header-nav` section (or create one if none exists):

```css
/* Header nav dropdown */
.header-dropdown { position: relative; }
.header-dropdown-trigger {
  background: none; border: none; cursor: pointer;
  color: inherit; font: inherit; padding: 0.25rem 0.5rem;
  display: flex; align-items: center; gap: 0.25rem;
}
.header-dropdown-panel {
  display: none;
  position: absolute; top: calc(100% + 4px); right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  min-width: 12rem;
  z-index: 200;
}
.header-dropdown.open .header-dropdown-panel { display: block; }
.header-dropdown-panel a {
  display: block;
  padding: 0.4rem 0.75rem;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
}
.header-dropdown-panel a:hover { background: var(--color-surface-alt); }
```

Toggle `open` class on click via the existing `forms.js` or a 3-line inline script in suche's `app.js`.

### Step 3 — Build sibling URL helper (suche)

File: `inc/layout.php` — add a local helper above `render_header()`:

```php
function sibling_url(string $local, string $akadbrain, string $world4you = ''): string {
    return match (APP_ENV) {
        'local'     => $local,
        'akadbrain' => $akadbrain,
        default     => $world4you !== '' ? $world4you : $akadbrain,
    };
}
```

### Step 4 — Pass menu to `Header::render()` (suche)

File: `inc/layout.php` — inside `render_header()`:

```php
Header::render([
    // … existing keys …
    'appMenu' => [
        ['href' => sibling_url('http://wlmonitor.test', 'https://wlmonitor.eriks.cloud', 'https://wlmonitor.jardyx.com'), 'label' => 'WL Monitor'],
        ['href' => sibling_url('http://energie.test',   'https://energie.eriks.cloud',   'https://energie.jardyx.com'),   'label' => 'Energie'],
        ['href' => sibling_url('http://chat.test',      'https://chat.eriks.cloud',       'https://chat.jardyx.com'),      'label' => 'Chat'],
        [
            'label'     => 'Apps',
            'adminOnly' => true,
            'children'  => [
                ['href' => sibling_url('http://suche.test',       'https://suche.eriks.cloud',       'https://www.jardyx.com'),         'label' => 'Suche'],
                ['href' => sibling_url('http://wlmonitor.test',   'https://wlmonitor.eriks.cloud',   'https://wlmonitor.jardyx.com'),   'label' => 'WL Monitor'],
                ['href' => sibling_url('http://energie.test',     'https://energie.eriks.cloud',     'https://energie.jardyx.com'),     'label' => 'Energie'],
                ['href' => sibling_url('http://chat.test',        'https://chat.eriks.cloud',        'https://chat.jardyx.com'),        'label' => 'Chat'],
                ['href' => sibling_url('http://zeit.test',        'https://werda.eriks.cloud'),                                        'label' => 'Zeiterfassung'],
            ],
        ],
    ],
]);
```

### Step 5 — Dropdown toggle JS

In `web/js/app.js`, add a delegated click handler for `.header-dropdown-trigger` that toggles `.open` on its parent and closes other open dropdowns. Close on outside click too.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 WL Monitor, Energie and Chat links appear in the header nav for all logged-in users
- [ ] #2 Admin-only 'Apps' dropdown is visible only to users with Admin rights
- [ ] #3 Dropdown lists all five sibling apps with environment-correct URLs (local/akadbrain/world4you)
- [ ] #4 Dropdown opens on click and closes on outside click or second click
- [ ] #5 No regressions in the chrome library for other apps that pass appMenu flat links
<!-- AC:END -->
