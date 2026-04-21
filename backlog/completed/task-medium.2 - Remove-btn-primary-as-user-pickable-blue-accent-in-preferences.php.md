---
id: TASK-MEDIUM.2
title: Remove btn-primary as user-pickable 'blue' accent in preferences.php
status: Done
assignee: []
created_date: '2026-04-21 05:44'
updated_date: '2026-04-21 11:45'
labels: []
dependencies: []
parent_task_id: TASK-MEDIUM
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit 2026-04-20 ui-rules §9 contradiction: preferences.php:231 has <option value="btn-primary">Primary (blau)</option>. Per §9, .btn-primary is bound to --palette-grey-dark (neutral grey), NOT blue. The option label is wrong and offering btn-primary as a user-pickable accent leaks the tier system into cosmetic choices. Either remove the option, or rename to '(neutral grey)' and keep — discuss with design owner.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Option label no longer says 'blau'
- [x] #2 Either option removed or relabeled to match palette semantics
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Tiny ui-rules §9 fix in `web/preferences.php`.

Background: `.btn-primary` is bound to `--palette-grey-dark` (neutral grey), NOT blue. Offering it as a user-pickable "blue" accent is misleading and leaks the tier system into cosmetic choices.

**Preferred fix — remove the option entirely:**
1. `web/preferences.php:231` — delete the `<option value="btn-primary">Primary (blau)</option>` line.
2. Verify the `<select>` still has the other palette options from §9 (red, blue, green, yellow, orange, purple, turquoise, grey-light, grey-dark, neutral). If the intent was "offer a blue accent", ensure `.btn-color-blue` or `.btn-outline-color-blue` is present instead.
3. Migration: check `s_buttons.variant` column in the DB — any existing rows with `variant='btn-primary'` need updating. Either run a one-off UPDATE to `btn-color-blue` or `btn-outline-color-red` (user-visible change — ask before picking default) or leave them and let users re-pick on next edit.

**Alternative — relabel:**
1. Change the label to `Primary (neutral)` so users know it's grey, not blue. Do NOT do this if we want to encourage users off the grey default.

**Recommendation:** remove the option + migrate existing rows. §9 explicitly forbids using `btn-primary` for brand identity or user accents.

**Verification:**
- Select in prefs no longer shows "Primary (blau)".
- Existing buttons that used `btn-primary` variant still render (fall back to default) or are migrated.
- Grep `s_buttons` for stale values post-migration.
<!-- SECTION:PLAN:END -->
