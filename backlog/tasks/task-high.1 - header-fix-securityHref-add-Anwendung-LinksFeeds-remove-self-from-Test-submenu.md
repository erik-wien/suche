---
id: TASK-HIGH.1
title: >-
  header: fix securityHref; add Anwendung (Links+Feeds); remove self from Test
  submenu
status: To Do
assignee: []
created_date: '2026-04-21 16:26'
updated_date: '2026-04-21 16:52'
labels: []
dependencies: []
parent_task_id: TASK-HIGH
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit 2026-04-21 — issues in inc/layout.php Header::render() call:

1. CRITICAL: securityHref not passed → Chrome uses default 'password.php'; suche has no password.php. App handles password/2FA inside preferences.php#sicherheit tab. Fix: either create standalone security.php or pass prefsHref and document the tab approach.
2. SELF-REFERENCE: Test submenu children include 'Suche' linking to itself — remove it
3. ANWENDUNG MISSING: Links and Feeds settings (preferences.php tabs) are app-specific and belong in the Anwendung slot — wire appPrefsHref → preferences.php once Chrome TASK-HIGH.1 ships

Note: Apps links (wlmonitor, energie, chat, last.fm) already present in appMenu ✓
Note: Test submenu already exists and is adminOnly ✓
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 securityHref resolves to correct page (standalone security.php or documented tab approach)
- [x] #2 Suche not listed in its own Test submenu
- [ ] #3 Anwendung → preferences.php (Links+Feeds) wired once Chrome supports appPrefsHref
<!-- AC:END -->
