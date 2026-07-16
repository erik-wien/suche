---
id: TASK-6
title: RSS-Fetch-Fehler loggen (appendLog) — toter Feed muss im Log sichtbar sein
status: Done
assignee: []
created_date: '2026-07-16 06:56'
updated_date: '2026-07-16 11:16'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

Datei:Zeile: `inc/rss.php:34-71` (kein `appendLog`/`error_log` im gesamten File), sichtbar in
`web/index.php:56-58`

Schlägt der Refresh eines Feeds fehl (Timeout, 4xx/5xx, kaputtes XML) und existiert kein/ein
abgelaufener Cache, gibt `rss_fetch()` `null` zurück und `index.php` zeigt nur „Feed nicht
verfügbar: <Titel>" — ohne jede Protokollierung. Anders als der Rest der App (Login, TOTP,
Passwort-Reset, E-Mail-Änderung nutzen durchgängig `appendLog`), fehlt hier ein Log-Eintrag
komplett.

## Auswirkung

Ein dauerhaft toter oder umkonfigurierter Feed fällt niemandem auf, außer der Endnutzer meldet
sich — kein Log-Trail zur Diagnose (welcher Feed, seit wann, welcher Fehler).

## Empfehlung

Bei fehlgeschlagenem Fresh-Fetch (Zeile 55-63) und beim endgültigen `null`-Return (Zeile 70)
einen `appendLog`/`error_log`-Eintrag mit Feed-URL und Fehlergrund schreiben.

## Acceptance Criteria

- [x] `rss_fetch()` schreibt bei fehlgeschlagenem Fresh-Fetch (Timeout, HTTP-Fehler, Parse-Fehler)
      einen `appendLog`-Eintrag mit Feed-URL und konkretem Fehlergrund.
- [x] `rss_fetch()` schreibt beim finalen `null`-Return (kein gültiger Cache mehr verfügbar)
      ebenfalls einen `appendLog`-Eintrag.
- [x] Log-Einträge sind über die bestehende Admin-Log-Ansicht sichtbar/auffindbar.

## Referenz

`/Users/erikr/TUEV/audit-robustheit-20260716/audit-suche.md` (MITTEL-Befund).
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Neue rss_log_error(url, reason) in inc/rss.php: appendLog($con,'rss',...) wenn $con (global) eine mysqli-Instanz ist, sonst error_log()-Fallback mit '[suche/rss]'-Prefix (rss_fetch() hat kein $con im Funktionsscope; global $con greift, weil alle Aufrufer (index.php, api/feeds.php) $con top-level aus initialize.php gesetzt haben). Aufrufstellen: fehlgeschlagener Fresh-Fetch (3 Fälle: file_get_contents=false / leerer Body / Parse-Fehler) und finaler null-Return ohne Cache. Kein Retry-Loop vorhanden -> kein Spam-Risiko durch Mehrfachlogging pro Aufruf. appendLog schreibt in auth_log (context='rss'), dieselbe Tabelle die admin.php's Log-Tab anzeigt -> in der Admin-Log-Ansicht sichtbar.
<!-- SECTION:NOTES:END -->
