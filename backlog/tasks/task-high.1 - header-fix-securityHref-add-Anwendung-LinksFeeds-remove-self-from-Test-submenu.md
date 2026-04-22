---
id: TASK-HIGH.1
title: >-
  header: fix securityHref; add Anwendung (Links+Feeds); remove self from Test
  submenu
status: Done
assignee: []
created_date: '2026-04-21 16:26'
updated_date: '2026-04-22 04:46'
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
- [x] #3 Anwendung → preferences.php (Links+Feeds) wired via appPrefsHref
- [x] #4 profileHref => 'preferences.php#profilbild' wired in Header::render()
- [x] #5 emailHref => 'preferences.php#email' wired in Header::render()
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
### 1. Audit current preferences.php

Read `web/preferences.php`. Known: already has a tab-bar with Darstellung, Links, Feeds panels. No Profilbild or E-Mail tabs yet. Action handlers for `upload_avatar` and `change_email` are likely already there (Energie and zeiterfassung confirmed the pattern) — verify.

### 2. Add Profilbild tab to preferences.php

Add a new `tab-btn` and `tab-panel` for Profilbild (`id="profilbild"`). Content: avatar upload form (same as zeiterfassung — see `web/preferences.php` there). The `upload_avatar` POST handler may already exist in suche's preferences.php — if not, add it calling `\Erikr\Chrome\AvatarUpload::handle()`.

### 3. Add E-Mail tab to preferences.php

Add `tab-btn` + `tab-panel` for E-Mail (`id="email"`). Content: email change form with password confirmation (same pattern as other apps). `change_email` POST handler: `auth_email_confirmation_issue` + `mail_send_email_change_confirmation`. Redirect to `preferences.php#email` on success.

### 4. Wire hrefs in inc/layout.php

Add to `Header::render()` call:
```php
'profileHref'   => $base . '/preferences.php#profilbild',
'emailHref'     => $base . '/preferences.php#email',
'appPrefsHref'  => $base . '/preferences.php',
'appPrefsLabel' => 'Anwendung',
```
ACs 1+2 are already done (securityHref wired, self removed from Test submenu).

### 5. Hash-based tab activation

Verify the existing tab JS handles `location.hash` to land on the right panel when arriving from the user dropdown (e.g. `preferences.php#profilbild`). If the current tab init only reads `location.hash` at DOM-ready, it already works.

### 6. Smoke-test

User dropdown → Profilbild → #profilbild tab. E-Mail → #email tab. Anwendung → preferences.php (Darstellung/Links/Feeds remain). Avatar upload and email change work end-to-end.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Profilbild and E-Mail tabs to preferences.php with upload_avatar and change_email POST handlers. Wired profileHref, emailHref, appPrefsHref/appPrefsLabel in inc/layout.php. Created confirm_email.php for email confirmation flow. All 11 tests pass.
<!-- SECTION:FINAL_SUMMARY:END -->
