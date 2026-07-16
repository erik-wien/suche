---
id: TASK-4
title: >-
  Startseite: RSS-Feeds inaktiver Tabs lazy laden statt synchron im
  Seiten-Render (§20)
status: Done
assignee: []
created_date: '2026-07-16 06:56'
updated_date: '2026-07-16 11:16'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

Datei:Zeile: `web/index.php:46-61`, `inc/rss.php:34-71`

`index.php` rendert **alle** Feed-Tab-Panels serverseitig in einer Schleife und ruft für **jeden**
Feed `rss_fetch()` auf — auch für die zunächst unsichtbaren (`hidden`) Tabs. Bei kaltem/
abgelaufenem Cache (TTL 600s) wartet jeder Feed bis zu `RSS_FETCH_TIMEOUT` = 3s auf einen Server,
bevor der stale-Fallback greift. Bei mehreren gleichzeitig langsamen/toten Feeds (z. B. 4 Feeds ×
3s) hängt der komplette Seitenaufbau mehrere Sekunden — als ein einziger synchroner PHP-Request,
kein Client-Loop, kein Ladeindikator, kein Cancel. Verstößt gegen §20 der UI-Design-Regeln
(„Long-running batch operations: client loop, never one sync mega-request").

## Auswirkung

Browser zeigt für die gesamte Ladezeit nichts (kein Spinner, kein „Lade Feed X…"), die Startseite
wirkt eingefroren; bei einem hängenden Drittanbieter-Feed verzögert sich der Seitenaufbau für
**alle** Nutzer, nicht nur für den betroffenen Feed-Tab.

## Empfehlung

Feed-Inhalte inaktiver Tabs erst bei Tab-Aktivierung per Client-Fetch (AJAX-Endpoint) nachladen
statt beim initialen Seiten-Render; sichtbaren Erst-Tab ggf. weiter serverseitig vorrendern, aber
mit klarem Lade-Platzhalter für den Rest.

## Acceptance Criteria

- [x] Beim initialen Laden von `index.php` wird `rss_fetch()` nur noch für den sichtbaren
      Erst-Tab synchron aufgerufen.
- [x] Inaktive Tabs zeigen einen Lade-Platzhalter und laden ihren Feed-Inhalt erst bei
      Tab-Aktivierung per AJAX nach (neuer/erweiterter Endpoint).
- [x] Ein einzelner hängender/toter Feed verzögert den initialen Seitenaufbau nicht mehr um
      mehr als die Ladezeit des sichtbaren Tabs.
- [x] Bestehendes Stale-Cache-Fallback-Verhalten (`inc/rss.php`) bleibt für den nachgeladenen
      Feed erhalten.

## Referenz

`/Users/erikr/TUEV/audit-robustheit-20260716/audit-suche.md` (HOCH-Befund 1),
`/Users/erikr/TUEV/audit-robustheit-20260716/UEBERSICHT.md` (§20-Muster F).
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Erst-Tab weiter serverseitig via rss_fetch()/rss_render() (i===0). Alle anderen Panels: Platzhalter (data-lazy=1, data-feed-id) statt rss_fetch()-Aufruf. Neuer GET-Read-Endpoint web/api/feeds.php?action=render&id=<id> (kein CSRF, auth_require()+feeds_get() uid-scoped) liefert {ok,html} bzw. {ok:false,error}. Inline-Script in index.php lädt per Klick auf Tab-Button oder (per DOMContentLoaded, wegen deferred module timing) bei Hash-Deep-Link; Fehler landen mit role=alert im Panel. Stale-Cache-Fallback in rss.php unverändert, greift jetzt auch für den nachgeladenen Feed.
<!-- SECTION:NOTES:END -->
