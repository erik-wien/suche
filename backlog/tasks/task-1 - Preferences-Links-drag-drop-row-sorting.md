---
id: TASK-1
title: 'Preferences Links: drag & drop row sorting'
status: Done
assignee: []
created_date: '2026-04-18 19:24'
updated_date: '2026-04-18 20:20'
labels:
  - ui
  - preferences
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Links table in `web/preferences.php` currently uses ▲/▼ buttons to reorder rows. Replace them with drag & drop handles. The backend `reorder` action in `web/api/buttons.php` already accepts a `POST order[]` array of IDs — no backend changes needed.

## Implementation plan

### 1. Add SortableJS locally
Download the minified build of [SortableJS](https://github.com/SortableJS/Sortable) (single file, no deps) to `web/js/sortable.min.js`. Load it in `preferences.php` before the buttons `<script>` block:
```html
<script src="<?= $base ?>/js/sortable.min.js" nonce="<?= $_cspNonce ?>"></script>
```

### 2. Add a drag-handle column to the table
In the `#buttonsTable` thead, replace the "Reihenfolge" column header with a blank/grip header. In each `<tr>`, replace the ▲/▼ `<td>` with:
```html
<td class="drag-handle" title="Verschieben">&#x2630;</td>
```

### 3. Initialise Sortable on the tbody
Inside the existing buttons IIFE, after the table is in the DOM:
```js
Sortable.create(tableBody, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: async () => {
        const ids = Array.from(tableBody.querySelectorAll('tr')).map(r => r.dataset.id);
        const res = await sucheFetch('api/buttons.php', { action: 'reorder', order: ids });
        if (!res.ok) alert('Fehler beim Speichern der Reihenfolge.');
    },
});
```

### 4. Style the handle
In `web/css/app.css`:
```css
.drag-handle {
    cursor: grab;
    color: var(--color-muted);
    user-select: none;
}
.drag-handle:active { cursor: grabbing; }
```

### 5. Remove the old move helpers
Delete the `move()` function, `.btn-move-up` / `.btn-move-down` event listeners, and the corresponding `<button>` elements from the PHP table markup. Remove any dead CSS if present.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Rows can be reordered by dragging the handle; order persists after page reload
- [ ] #2 ▲/▼ buttons are removed from the Links table
- [ ] #3 Drag works on both desktop (mouse) and mobile (touch) via SortableJS
- [ ] #4 SortableJS is served from web/js/, not a CDN
- [ ] #5 A failed reorder POST shows an error alert without reloading the page
- [ ] #6 The Feeds table and other UI are unaffected
<!-- AC:END -->
