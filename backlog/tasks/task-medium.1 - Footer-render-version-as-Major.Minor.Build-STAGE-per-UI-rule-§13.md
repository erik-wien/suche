---
id: TASK-MEDIUM.1
title: 'Footer: render version as ''Major.Minor.Build STAGE'' per UI rule §13'
status: Done
assignee: []
created_date: '2026-04-19 05:47'
updated_date: '2026-04-19 06:07'
labels: []
dependencies: []
parent_task_id: TASK-MEDIUM
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cross-app audit (2026-04-19) found suche's `inc/_footer.php:15` ships:

    'version' => APP_VERSION . ' ' . APP_ENV

That produces e.g. `3.0 prod` instead of the §13-mandated `3.0.3 PROD`. Missing:
- `.BUILD` segment
- Uppercase STAGE
- DEV/PROD mapping from APP_ENV (anything ≠ live → DEV, live → PROD)

Reference impl: `zeiterfassung/inc/_footer.php:8–10` already does the compose correctly.

Fix in one place (_footer.php) — APP_VERSION and APP_BUILD are already defined in initialize.php.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Footer right column shows 'Major.Minor.Build STAGE' format (e.g. '3.0.3 PROD')
- [ ] #2 STAGE is uppercase and derives DEV vs PROD from APP_ENV
- [ ] #3 Impressum page footer renders the same format (mandatory per §13)
<!-- AC:END -->
