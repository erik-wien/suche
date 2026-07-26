---
id: TASK-9
title: 'RSS-Status: Live-Erreichbarkeitscheck statt Cache-Frische'
status: To Do
assignee: []
created_date: '2026-07-26 11:18'
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Die Statusseite meldet RSS-Feeds dauerhaft rot/gelb, obwohl alle Feeds gesund sind (alle 4 liefern HTTP 200 in <0,1s, keine rss_log_error-Eintraege in 14 Tagen).

Ursache: zwei Design-Annahmen widersprechen sich.
- web/index.php:53-56 holt beim Seitenaufruf NUR den aktiven Feed-Tab (Lazy-Load, §20); die anderen Feeds refreshen erst beim Anklicken.
- inc/rss.php rss_status_from_urls() verlangt fuer 'ok' aber, dass ALLE Feeds einen Cache < RSS_TTL (600s) haben.

Folge: bestes Ergebnis nach einem Seitenaufruf 1/4 = gelb, nach 10 Min Leerlauf 0/4 = rot. Der Check misst 'hat jemand alle Tabs durchgeklickt', nicht 'sind die Feeds erreichbar'. Eine dauerhaft falsche Ampel entwertet die ganze Statusseite.

Fix: echter Live-Check je Feed-URL (HEAD, Timeout <=3s, HTTP >=400 = Fehler) gemaess Suite-Policy §5; Status-Checks sind ohnehin 60s gecacht. HEAD von allen 4 Feeds mit 200 bestaetigt (2026-07-26).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 rss_status_check() prueft Feeds live per HEAD mit Timeout <=3s statt Cache-mtime
- [ ] #2 HTTP >=400 und Netzwerkfehler unterschieden und im Detailtext benannt (§21: Items nennen, nicht nur zaehlen)
- [ ] #3 state: ok=alle erreichbar, warn=einige, fail=keine; leere Feed-Liste = ok
- [ ] #4 last_success_ts bleibt gesetzt (§5 Zeitstempel letzter Erfolg)
- [ ] #5 Reine Aggregationslogik ohne Netzwerk unit-getestet (Prober als injizierbarer Seam)
- [ ] #6 Verwaiste Cache-mtime-Heuristik rss_status_from_urls() samt Tests entfernt
- [ ] #7 phpunit gruen; Statusseite auf akadbrain zeigt RSS gruen
<!-- AC:END -->
