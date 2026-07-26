---
id: TASK-8
title: Status-Seite web/status.php (Chrome\Status)
status: Done
assignee: []
created_date: '2026-07-24 06:27'
updated_date: '2026-07-24 07:38'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Suite-Policy §5, nach chrome TASK-8. Checks: Auth-DB, App-DB, RSS-Feeds (letzter erfolgreicher Fetch, aggregiert ueber s_feeds), Nginx-Log-Verfuegbarkeit (adminOnly). Ampel fuer alle eingeloggten User, Details admin-only, Cache ~60s, JSON-Format.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 status.php mit allen Checks, im Usermenü verlinkt
- [ ] #2 format=json ohne Interna
<!-- AC:END -->
