---
id: TASK-MEDIUM.3
title: Host-aware nginx-log viewer in admin console
status: To Do
assignee: []
created_date: '2026-07-01 14:59'
updated_date: '2026-07-01 14:59'
labels: []
dependencies: []
parent_task_id: TASK-MEDIUM
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a paginated, filterable Nginx-Log tab to web/admin.php (access + error), admin-only. Host-gated off config target: enabled on local + akadbrain, invisible on world4you (tab absent + API 404). Spec: docs/superpowers/specs/2026-07-01-nginx-log-viewer-design.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Nginx-Log tab visible to admins on local/akadbrain; absent on world4you and nginxlog_list returns 404
- [ ] #2 Non-admins never see the tab; API rejects them 403; CSRF enforced on the endpoint
- [ ] #3 Access + error logs render newest-first with working pagination (tail-window reader)
- [ ] #4 Status (exact + 2xx/4xx/5xx class), free-text, and date-range filters work and combine
- [ ] #5 Missing/unreadable log yields a clean 'nicht lesbar' message, no fatal error
- [ ] #6 Parser + filter + enablement unit tests pass (phpunit); output escaped; inline script carries CSP nonce
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. inc/nginx_log.php (new): NGINX_LOG_HOSTS map (local+akadbrain paths), nginxlog_enabled(), nginxlog_paths() (config nginx_log: override wins), nginxlog_parse_access()/parse_error() regex parsers, nginxlog_query() with fseek tail-window reader (window_bytes default 4MB), newest-first, truncated flag, filters (type/date-range/status exact+class/free-text), graceful 'nicht lesbar' on missing file.
2. tests/Unit/NginxLogParserTest.php (new): TDD first — access+error parser field extraction + null on malformed; status exact/class, free-text ci, date-range filter logic; truncated flag; nginxlog_enabled() local/akadbrain true, world4you false. Run phpunit red->green.
3. web/api.php: add nginxlog_list action (mirror icon_* block) — 404 if !nginxlog_enabled(), 403 non-admin, POST+csrf_verify(); params type/page/from/to/status/q; return nginxlog_query() JSON.
4. web/admin.php: conditionally emit 'Nginx-Log' tab button + panel only when nginxlog_enabled(); Access|Error toggle, filter form, table, pagination (mirror audit-log tab markup); JS block cloned from admin_log_list (lazy-load on #adm-nginxlog, apiPost('nginxlog_list'), renderRows/renderPagination, toggle re-queries page1 + swaps columns); htmlspecialchars everywhere; CSP nonce on script.
5. config.example.yaml: document commented nginx_log: section (access/error/window_bytes).
6. Verify: phpunit green; manual — tab hidden on world4you target, shows 'nicht lesbar' locally until nginx exists.
<!-- SECTION:PLAN:END -->
