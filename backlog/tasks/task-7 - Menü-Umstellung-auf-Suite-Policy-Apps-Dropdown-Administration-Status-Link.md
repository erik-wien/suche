---
id: TASK-7
title: 'Menü-Umstellung auf Suite-Policy (Apps-Dropdown, Administration, Status-Link)'
status: Done
assignee: []
created_date: '2026-07-24 06:27'
updated_date: '2026-07-24 07:38'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Nach chrome TASK-5/6/7 (Design-Spec ~/Git/mcp/docs/superpowers/specs/2026-07-24-app-suite-menues-status-design.md): Header-Aufruf in inc/layout.php auf neue chrome-Version umstellen. suche hat kein appMenu — Cross-App-Links erscheinen dann als Apps-Dropdown statt flach; Administration wandert automatisch in die Menüzeile; statusHref setzen (Status-Task). Rest-Inkonsistenz pruefen: werda in SSO-Allowlist vs. AppsMenu-Registry.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Apps-Dropdown statt flacher Links
- [ ] #2 Administration in Menüzeile, nicht im Usermenü
- [ ] #3 Status-Eintrag im Usermenü
<!-- AC:END -->
