<?php
require_once __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

$uid      = (int) ($_SESSION['uid'] ?? 0);
$username = $_SESSION['username'] ?? '';

// ── Handle theme persistence POST ────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'change_theme') {
    if (!csrf_verify()) {
        http_response_code(403);
        exit('CSRF token mismatch');
    }
    $theme = $_POST['theme'] ?? 'auto';
    if (!in_array($theme, ['light', 'dark', 'auto'], true)) {
        http_response_code(400);
        exit('invalid theme');
    }
    $_SESSION['theme'] = $theme;
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'theme' => $theme]);
    exit;
}

$theme = $_SESSION['theme'] ?? 'auto';

render_header('Einstellungen', 'preferences');
?>
<div class="container" style="padding:1.5rem">
    <h1>Einstellungen</h1>

    <div class="tab-bar" role="tablist">
        <button type="button" class="tab-btn active" role="tab"
                data-tab="pref-display" aria-controls="pref-display" aria-selected="true">Darstellung</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-links" aria-controls="pref-links" aria-selected="false">Links</button>
        <button type="button" class="tab-btn" role="tab"
                data-tab="pref-feeds" aria-controls="pref-feeds" aria-selected="false">Feeds</button>
    </div>

    <div class="tab-panel" id="pref-display" role="tabpanel">
        <div class="card mt-3">
            <div class="card-body">
                <h3>Theme</h3>
                <p class="text-muted">
                    Wähle das Farbschema. <em>Auto</em> folgt deiner Systemeinstellung.
                </p>
                <div class="theme-row" style="justify-content:flex-start">
                    <button class="theme-btn<?= $theme === 'light' ? ' active' : '' ?>" data-theme="light">☀ Hell</button>
                    <button class="theme-btn<?= $theme === 'auto'  ? ' active' : '' ?>" data-theme="auto">⬤ Auto</button>
                    <button class="theme-btn<?= $theme === 'dark'  ? ' active' : '' ?>" data-theme="dark">🌙 Dunkel</button>
                </div>
            </div>
        </div>
    </div>

    <div class="tab-panel" id="pref-links" role="tabpanel" hidden>
        <p class="text-muted">Kommt in Task 11 (Links-Verwaltung).</p>
    </div>

    <div class="tab-panel" id="pref-feeds" role="tabpanel" hidden>
        <p class="text-muted">Kommt in Task 12 (Feed-Verwaltung).</p>
    </div>
</div>
<?php
render_footer();
