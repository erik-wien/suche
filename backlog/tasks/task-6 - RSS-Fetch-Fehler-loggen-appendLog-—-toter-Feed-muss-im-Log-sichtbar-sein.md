---
id: TASK-6
title: RSS-Fetch-Fehler loggen (appendLog) — toter Feed muss im Log sichtbar sein
status: To Do
assignee: []
created_date: '2026-07-16 06:56'
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

- [ ] `rss_fetch()` schreibt bei fehlgeschlagenem Fresh-Fetch (Timeout, HTTP-Fehler, Parse-Fehler)
      einen `appendLog`-Eintrag mit Feed-URL und konkretem Fehlergrund.
- [ ] `rss_fetch()` schreibt beim finalen `null`-Return (kein gültiger Cache mehr verfügbar)
      ebenfalls einen `appendLog`-Eintrag.
- [ ] Log-Einträge sind über die bestehende Admin-Log-Ansicht sichtbar/auffindbar.

## Referenz

`/Users/erikr/TUEV/audit-robustheit-20260716/audit-suche.md` (MITTEL-Befund).
<!-- SECTION:DESCRIPTION:END -->
