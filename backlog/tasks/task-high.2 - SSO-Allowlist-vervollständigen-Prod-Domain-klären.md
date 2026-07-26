---
id: TASK-HIGH.2
title: SSO-Allowlist vervollständigen + Prod-Domain klären
status: Done
assignee: []
created_date: '2026-07-12 11:04'
updated_date: '2026-07-12 15:57'
labels:
  - audit-2026-07-12
  - security
  - sso
dependencies: []
parent_task_id: TASK-HIGH
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit 2026-07-12 (S1/S2, Bericht: /Users/erikr/Git/mcp/docs/2026-07-12-suite-konsistenz-audit.md). Die zentrale AUTH_SSO_ALLOWED_HOSTS in inc/initialize.php:35-43 listet lastfm.eriks.cloud NICHT im Prod-Block (nur .test) -> SSO-Ruecksprung nach Last.fm-Prod wird von auth_sso_return_allowed() abgewiesen. Zusaetzlich: Allowlist kennt nur *.eriks.cloud, alle Prod-appsMenu-Links zeigen aber auf *.jardyx.com -> Domain-Split. ENTSCHEIDUNG noetig: ist jardyx.com reiner Alias (nie Return-URL) oder echte Luecke?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 lastfm.eriks.cloud im Prod-Block ergaenzt (nach Verifikation des realen Prod-Hosts)
- [ ] #2 jardyx.com-Domain-Frage geklaert und Ergebnis im Code-Kommentar/Doku dokumentiert
<!-- AC:END -->
