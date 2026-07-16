---
id: TASK-5
title: >-
  sucheFetch auf geteilte apiCall()-Hülle umstellen — Servermeldungen nicht mehr
  wegwerfen
status: To Do
assignee: []
created_date: '2026-07-16 06:56'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Problem

Datei:Zeile: `web/js/app.js:51-56` (`sucheFetch`)

```js
const res = await fetch(url, { method: 'POST', body: fd });
if (!res.ok) {
    return { ok: false, error: 'HTTP ' + res.status };
}
return res.json();
```

Die API-Endpoints (`web/api/feeds.php`, `web/api/buttons.php`, `web/api.php` icon_*-Aktionen)
liefern bei Validierungsfehlern bewusst **konkrete** Meldungen mit Statuscode 400 (z. B.
`inc/feeds.php:28` „Feed-URL muss mit http:// oder https:// beginnen.", `inc/feeds.php:22`
„Titel ist erforderlich (max 64 Zeichen).", `inc/icons.php:38` „Dateityp nicht erlaubt. Erlaubt:
SVG, PNG, JPG, WebP."). Weil `sucheFetch` bei `!res.ok` sofort zurückkehrt, **ohne den JSON-Body
zu lesen**, geht diese ganze Arbeit verloren — der Aufrufer bekommt nur `error: 'HTTP 400'`.

Zusätzlich (NIEDRIG-Befund, gleiche Baustelle): Kein try/catch um die `sucheFetch`-Aufrufe selbst
— `sucheFetch` hat kein try/catch um den `fetch()`-Aufruf; bei echtem Netzwerkausfall
(offline/DNS) wirft `fetch` eine Exception, die keiner der Aufrufer fängt
(`web/preferences.php:400,553,564,738,746,758,783`, `web/admin.php:316,400` — alles
`await sucheFetch(...)` ohne try/catch) → unhandled promise rejection, nur in der Browser-Konsole
sichtbar. Der direkte `fetch()`-Aufruf für den Icon-Upload (`web/admin.php:798-808`) macht es
dagegen richtig: try/catch mit `showAlert('Netzwerkfehler.', ...)`.

## Auswirkung

In `web/preferences.php:557,566` und `web/admin.php:401` wird `res.error || 'unbekannt'`
angezeigt — der Nutzer sieht z. B. „Fehler: HTTP 400" statt „Feed-URL muss mit http:// oder
https:// beginnen." und kann seinen Eingabefehler nicht erkennen/beheben. Bei
Verbindungsabbruch während Speichern/Löschen/Umsortieren von Buttons/Feeds bleibt die UI ohne
jede Rückmeldung stehen (kein Alert, kein Reload) — der Nutzer weiß nicht, ob die Aktion
durchgeführt wurde.

## Empfehlung

`sucheFetch` auf die geteilte `apiCall()`-Hülle aus `css_library/js/api-call.js` umstellen (siehe
`/Users/erikr/TUEV/audit-robustheit-20260716/spec-apicall.md`): bei `!res.ok` trotzdem
`res.json()` versuchen und das `error`/`detail`-Feld durchreichen; Netzwerkfehler sauber als
`ApiError(kind:'network')` abbilden statt unhandled rejection. Alle Callsites
(`preferences.php`, `admin.php`) auf try/catch bzw. die neue Fehlerklasse umstellen, damit
konkrete Meldungen ankommen und Netzwerkfehler nicht mehr unbehandelt durchschlagen.

## Acceptance Criteria

- [ ] `sucheFetch` nutzt intern `apiCall()`/`apiForm()` aus `css_library/js/api-call.js` (oder
      liefert äquivalentes Verhalten: Body bei `!res.ok` wird gelesen, `error`/`detail` wird
      durchgereicht).
- [ ] Alle bestehenden `sucheFetch`-Callsites (`web/preferences.php`, `web/admin.php`) zeigen bei
      einem 400er-Validierungsfehler die konkrete Servermeldung statt „HTTP 400".
- [ ] Alle `sucheFetch`-Callsites fangen Netzwerkfehler ab und zeigen eine konkrete
      Fehlermeldung (`showAlert`/`alertDialog`) — kein unhandled rejection mehr in der
      Browser-Konsole.
- [ ] Manuelle Verifikation: künstlich getrennte Verbindung / erzwungener 400er zeigt sichtbaren,
      konkreten Alert statt stiller UI.

## Referenz

`/Users/erikr/TUEV/audit-robustheit-20260716/audit-suche.md` (HOCH-Befund 2 + NIEDRIG-Befund),
`/Users/erikr/TUEV/audit-robustheit-20260716/spec-apicall.md`.
<!-- SECTION:DESCRIPTION:END -->
