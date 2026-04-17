<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

render_header('Hilfe', 'help');
?>
<div class="page-reading">
    <h1>Hilfe</h1>

    <h2>Was ist Suche</h2>
    <p>
        Deine persönliche Startseite mit sechs Suchmaschinen, einer Leisten-Sammlung deiner Lieblings-Links
        und einem RSS-Reader. Alles ist pro Benutzer konfigurierbar.
    </p>

    <h2>Tastaturkürzel</h2>
    <ul>
        <li><kbd>Alt</kbd>+<kbd>G</kbd> — Cursor ins Google-Feld</li>
        <li><kbd>Alt</kbd>+<kbd>W</kbd> — Cursor ins Wikipedia-Feld</li>
        <li><kbd>Alt</kbd>+<kbd>Z</kbd> — Cursor ins Geizhals-Feld</li>
        <li><kbd>Alt</kbd>+<kbd>A</kbd> — Cursor ins Amazon-Feld</li>
        <li><kbd>Alt</kbd>+<kbd>P</kbd> — Cursor ins Pons-Feld</li>
        <li><kbd>Alt</kbd>+<kbd>S</kbd> — Cursor ins Adobe Stock-Feld</li>
    </ul>
    <p class="text-muted small">
        Die genauen Modifier-Tasten hängen vom Browser ab (Firefox: <kbd>Alt</kbd>+<kbd>Shift</kbd>,
        Safari: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>).
    </p>

    <h2>Links verwalten</h2>
    <p>
        Über das Benutzermenü → <em>Einstellungen</em> → Reiter <em>Links</em> kannst du deine
        Link-Sammlung ändern. Jeder Link gehört nur dir — andere Benutzer sehen ihre eigene Liste.
    </p>

    <h2>Feeds verwalten</h2>
    <p>
        Unter <em>Einstellungen</em> → Reiter <em>Feeds</em> fügst du RSS- oder Atom-URLs hinzu.
        Der Server cached jeden Feed 10 Minuten auf der Festplatte; ein neuer Feed ist beim nächsten
        Reload sichtbar.
    </p>

    <h2>Versionsinfos</h2>
    <p>
        <?= htmlspecialchars(APP_NAME . ' ' . APP_VERSION . ' (' . APP_BUILD . ', ' . APP_ENV . ')', ENT_QUOTES, 'UTF-8') ?>
    </p>
</div>
<?php
render_footer();
