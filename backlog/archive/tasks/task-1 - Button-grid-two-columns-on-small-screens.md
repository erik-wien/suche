---
id: TASK-1
title: 'Button grid: two columns on small screens'
status: To Do
assignee: []
created_date: '2026-04-18 19:04'
labels:
  - ui
  - responsive
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On phones (~360–390px), the `.button-grid` only shows one button per row because each button has a fixed `width: 12rem` (192px). After `padding-inline: 1rem` on each side, the available column is ~328–358px — not enough for two 12rem buttons (need 392px with the 0.5rem gap). The user wants two buttons per row on small screens.

## Implementation plan

**File:** `web/css/app.css` — `.button-grid` block (lines 78–109).

Add a media query that, below ~480px, switches the grid to two equal columns and lets the grid engine control button width:

```css
@media (max-width: 480px) {
  .button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .button-grid .btn {
    width: auto;   /* grid column controls width; drop fixed 12rem */
    min-width: 0;
  }
}
```

- Breakpoint 480px: covers all common phone widths (360–430px) while leaving tablets and small laptops on the existing flex layout.
- `display: grid` replaces `flex` only inside the query, so the outer `flex-wrap: wrap; justify-content: center` behaviour is untouched at larger sizes.
- `width: auto; min-width: 0` lets the flex/grid sizing take over; the `.btn-label` ellipsis already handles overflow thanks to `min-width: 0` on the span.
- Height stays `2.5rem` (inherited, no override needed).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Two buttons appear side-by-side on a 360px-wide phone screen
- [ ] #2 Desktop layout (12rem fixed-width buttons, flex-wrap centred) is unchanged
- [ ] #3 Button height (2.5rem) is preserved at all breakpoints
- [ ] #4 Caption ellipsis (btn-label) still works correctly at the narrower width
<!-- AC:END -->
