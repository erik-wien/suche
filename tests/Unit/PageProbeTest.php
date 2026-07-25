<?php

declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use mysqli;
use PHPUnit\Framework\TestCase;

/**
 * Regression test for the profil.php / aktivitaet.php gap described in
 * TASK-9 elsewhere in the erikr/auth+erikr/chrome app family: no test in
 * this suite ever actually rendered these pages, so a DB user missing a
 * GRANT on auth_api_tokens (or any other fatal in the render path) would
 * pass CI and only surface in production.
 *
 * Drives the real pages out-of-process via tests/fixtures/page_probe.php
 * (auth_require()/exit() would otherwise kill an in-process PHPUnit run) —
 * see that file's docblock. Needs a live local MySQL (same DB the app uses,
 * config.yaml's auth_db) to insert one throwaway probe account + one real
 * API token row; both are removed in tearDownAfterClass().
 */
final class PageProbeTest extends TestCase
{
    private static ?mysqli $con = null;
    private static int $probeUserId = 0;
    private static string $probeUsername = 'phpunit-page-probe';
    private static string $probeTokenCleartext = '';
    private static string $sessionDir = '';

    public static function setUpBeforeClass(): void
    {
        require_once __DIR__ . '/../../inc/config.php';
        $cfg = suche_load_config();
        $auth = $cfg['auth_db'];

        self::$con = new mysqli(
            $auth['host'] ?? 'localhost',
            $auth['user'],
            $auth['password'],
            $auth['name'],
            3306,
            $auth['socket'] ?? null
        );
        if (self::$con->connect_error) {
            self::markTestSkipped('No local MySQL available: ' . self::$con->connect_error);
        }
        self::$con->set_charset('utf8mb4');

        // Throwaway probe account — auto-increment id, never a fixed/guessed
        // one, so it cannot collide with real seed data.
        $stmt = self::$con->prepare(
            'INSERT INTO auth_accounts (username, password, email, rights) VALUES (?, ?, ?, ?)'
        );
        $password = password_hash('phpunit-probe-not-a-real-password', PASSWORD_DEFAULT);
        $email    = 'phpunit-page-probe@example.invalid';
        $rights   = 'User';
        $stmt->bind_param('ssss', self::$probeUsername, $password, $email, $rights);
        $stmt->execute();
        $stmt->close();
        self::$probeUserId = (int) self::$con->insert_id;

        // One real API token row (not just DB rows in the abstract) so the
        // "no plaintext token leaks into the rendered markup" assertion has
        // an actual secret to look for.
        self::$probeTokenCleartext = bin2hex(random_bytes(32));
        $hash = hash('sha256', self::$probeTokenCleartext);
        $stmt = self::$con->prepare(
            'INSERT INTO auth_api_tokens (user_id, token_hash, label, source) VALUES (?, ?, ?, ?)'
        );
        $label  = 'phpunit-probe-token';
        $source = 'web';
        $stmt->bind_param('isss', self::$probeUserId, $hash, $label, $source);
        $stmt->execute();
        $stmt->close();

        // Dedicated session save path so the probe's native session_start()
        // writes leave no trace in the shared system temp dir.
        self::$sessionDir = sys_get_temp_dir() . '/suche-page-probe-' . bin2hex(random_bytes(8));
        mkdir(self::$sessionDir, 0700, true);
    }

    public static function tearDownAfterClass(): void
    {
        if (self::$con !== null && !self::$con->connect_error) {
            if (self::$probeUserId > 0) {
                // suche's own DB grant on auth_accounts is SELECT/INSERT/
                // UPDATE only (no DELETE — the app never deletes accounts),
                // so cleanup of this throwaway row needs a separate
                // connection with delete rights. Falls back to leaving the
                // row in place (loudly, via markTestIncomplete would be too
                // late here) only if no such connection is available.
                $auth = suche_load_config()['auth_db'];
                $root = @new mysqli(
                    $auth['host'] ?? 'localhost',
                    'root',
                    '',
                    $auth['name'],
                    3306,
                    $auth['socket'] ?? null
                );
                if (!$root->connect_error) {
                    // auth_api_tokens has ON DELETE CASCADE on user_id, so
                    // this also removes the probe token row.
                    $stmt = $root->prepare('DELETE FROM auth_accounts WHERE id = ?');
                    $stmt->bind_param('i', self::$probeUserId);
                    $stmt->execute();
                    $stmt->close();
                    $root->close();
                }
            }
            self::$con->close();
        }

        if (self::$sessionDir !== '' && is_dir(self::$sessionDir)) {
            foreach (glob(self::$sessionDir . '/*') ?: [] as $f) {
                @unlink($f);
            }
            @rmdir(self::$sessionDir);
        }
    }

    /** @return array{status: ?int, out: string} */
    private static function runPageProbe(string $page, array $scenario): array
    {
        $scenarioFile = tempnam(sys_get_temp_dir(), 'suche_page_');
        file_put_contents($scenarioFile, json_encode($scenario));

        // display_errors=stderr (PHP's dedicated CLI value): keeps the
        // duplicate-session_start() notice below (auth_bootstrap() calls
        // session_start() again — a no-op we can't avoid, only mute — on
        // top of this fixture's own pre-seeding call) off STDOUT, which
        // would otherwise (a) pollute the HTML we assert on and (b) trip
        // "headers already sent", silently defeating auth_require()'s
        // Location header and the STATUS: capture below.
        $cmd = escapeshellarg(PHP_BINARY)
             . ' -d display_errors=stderr'
             . ' -d session.save_path=' . escapeshellarg(self::$sessionDir)
             . ' ' . escapeshellarg(__DIR__ . '/../fixtures/page_probe.php')
             . ' ' . escapeshellarg($page)
             . ' ' . escapeshellarg($scenarioFile);

        $descriptors = [1 => ['pipe', 'w'], 2 => ['pipe', 'w']];
        $proc   = proc_open($cmd, $descriptors, $pipes);
        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($proc);
        @unlink($scenarioFile);

        $status = null;
        if (preg_match('/STATUS:(\d+)/', $stderr, $m)) {
            $status = (int) $m[1];
        }
        return ['status' => $status, 'out' => $stdout];
    }

    // ── profil.php ───────────────────────────────────────────────────────

    public function testProfilWithoutSessionRedirectsAndLeaksNoHtml(): void
    {
        $r = self::runPageProbe('profil.php', ['loggedin' => false]);
        self::assertSame(302, $r['status']);
        self::assertSame('', $r['out']);
    }

    public function testProfilWithSessionRendersExpectedMarkup(): void
    {
        $r = self::runPageProbe('profil.php', [
            'loggedin' => true,
            'id'       => self::$probeUserId,
            'username' => self::$probeUsername,
        ]);
        $out = $r['out'];

        self::assertSame(200, $r['status']);

        // Exactly one <h1>, reading "Profil".
        self::assertSame(1, preg_match_all('/<h1[ >]/', $out));
        self::assertMatchesRegularExpression('#<h1>Profil</h1>#', $out);

        // Avatar "Profilbild ändern" control.
        self::assertStringContainsString('id="profileAvatarFile"', $out);
        self::assertStringContainsString('Profilbild ändern', $out);

        // Username shown, no edit affordance next to it (deferred per Erik).
        self::assertMatchesRegularExpression(
            '#<dt>Benutzername</dt><dd>' . preg_quote(self::$probeUsername, '#') . '</dd>#',
            $out
        );

        // E-mail shown WITH an edit (pencil) affordance.
        self::assertStringContainsString('id="profileEmailEditToggle"', $out);

        // "Kennwort ändern".
        self::assertStringContainsString('Kennwort ändern', $out);

        // "Tokens verwalten (N)" trigger, N reflecting the one real token
        // seeded in setUpBeforeClass().
        self::assertMatchesRegularExpression('/Tokens verwalten \(1\)/', $out);

        // Token dialog present in the markup but initially hidden.
        self::assertMatchesRegularExpression(
            '#<div class="app-modal-backdrop" id="apiTokensModal"[^>]*\brole="dialog"[^>]*\baria-modal="true"[^>]*\bhidden\b[^>]*>#',
            $out
        );

        // No inline style="..." on any <button> element (project UI rule).
        preg_match_all('/<button\b[^>]*>/', $out, $buttons);
        foreach ($buttons[0] as $button) {
            self::assertStringNotContainsString('style="', $button, "Button carries inline style: $button");
        }

        // No plaintext token value leaked into the initial GET markup.
        self::assertStringNotContainsString(self::$probeTokenCleartext, $out);
    }

    // ── aktivitaet.php ───────────────────────────────────────────────────

    public function testAktivitaetWithoutSessionRedirectsAndLeaksNoHtml(): void
    {
        $r = self::runPageProbe('aktivitaet.php', ['loggedin' => false]);
        self::assertSame(302, $r['status']);
        self::assertSame('', $r['out']);
    }

    public function testAktivitaetWithSessionRendersExpectedMarkup(): void
    {
        $r = self::runPageProbe('aktivitaet.php', [
            'loggedin' => true,
            'id'       => self::$probeUserId,
            'username' => self::$probeUsername,
        ]);
        $out = $r['out'];

        self::assertSame(200, $r['status']);

        // Exactly one <h1>, reading "Log".
        self::assertSame(1, preg_match_all('/<h1[ >]/', $out));
        self::assertMatchesRegularExpression('#<h1>Log</h1>#', $out);

        // No inline style="..." on any <button> element.
        preg_match_all('/<button\b[^>]*>/', $out, $buttons);
        foreach ($buttons[0] as $button) {
            self::assertStringNotContainsString('style="', $button, "Button carries inline style: $button");
        }
    }
}
