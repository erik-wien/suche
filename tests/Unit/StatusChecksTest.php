<?php
declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/rss.php';
require_once __DIR__ . '/../../inc/nginx_log.php';

/**
 * Covers the pure/parameterized halves of the web/status.php (TASK-8) check
 * callables — rss_status_from_probes() and nginxlog_status_check() both accept
 * their inputs explicitly so they're testable without a DB, config.yaml or
 * network (see doc comments at their definitions for the state heuristics).
 */
final class StatusChecksTest extends TestCase
{
    /** @var list<string> */
    private array $cleanupPaths = [];

    protected function tearDown(): void
    {
        foreach ($this->cleanupPaths as $path) {
            if (is_file($path)) {
                @unlink($path);
            }
        }
        $this->cleanupPaths = [];
    }

    private function seedRssCache(string $url, int $mtime): void
    {
        $path = rss_cache_path($url);
        file_put_contents($path, '<rss></rss>');
        touch($path, $mtime);
        $this->cleanupPaths[] = $path;
    }

    /** Probe-Ergebnis in der Form von Status::httpCheck(). */
    private function probe(bool $ok, string $detail = ''): array
    {
        return ['state' => $ok ? 'ok' : 'fail', 'detail' => $detail];
    }

    public function testRssStatusOkWithNoFeedsConfigured(): void
    {
        $result = rss_status_from_probes([]);
        self::assertSame('ok', $result['state']);
    }

    public function testRssStatusOkWhenAllFeedsReachable(): void
    {
        $result = rss_status_from_probes([
            'https://a.invalid/rss' => $this->probe(true, 'HTTP 200'),
            'https://b.invalid/rss' => $this->probe(true, 'HTTP 200'),
        ], 1750000000);

        self::assertSame('ok', $result['state']);
        self::assertSame('2/2 Feeds erreichbar.', $result['detail']);
        self::assertSame(1750000000, $result['last_success_ts']);
    }

    public function testRssStatusWarnWhenSomeFeedsUnreachable(): void
    {
        $result = rss_status_from_probes([
            'https://a.invalid/rss' => $this->probe(true, 'HTTP 200'),
            'https://b.invalid/rss' => $this->probe(false, 'HTTP 503'),
        ]);

        self::assertSame('warn', $result['state']);
        self::assertSame('1/2 Feeds erreichbar.', $result['detail']);
    }

    public function testRssStatusFailWhenNoFeedReachable(): void
    {
        $result = rss_status_from_probes([
            'https://a.invalid/rss' => $this->probe(false, 'Could not resolve host'),
        ]);

        self::assertSame('fail', $result['state']);
    }

    /**
     * Suite-Policy §5: der RSS-Check ist NICHT adminOnly, also sehen alle
     * eingeloggten User seinen Detailtext — und die Feed-URLs gehören einzelnen
     * Usern (s_feeds ist user-scoped, der Check aggregiert über alle). Es darf
     * daher keine URL/kein Hostname im Detail landen; die konkreten Ausfälle
     * gehen per rss_log_error() ins Admin-Log (§21).
     */
    public function testRssStatusDetailLeaksNoFeedUrls(): void
    {
        $result = rss_status_from_probes([
            'https://geheim.example.org/privater-feed.xml' => $this->probe(false, 'HTTP 404'),
        ]);

        self::assertStringNotContainsString('geheim.example.org', $result['detail']);
        self::assertStringNotContainsString('privater-feed', $result['detail']);
    }

    public function testRssStatusStaleCacheAloneIsNotAFailure(): void
    {
        // Regression (2026-07-26): der alte Check verlangte fuer "ok" einen
        // Cache < RSS_TTL bei ALLEN Feeds, obwohl web/index.php nur den aktiven
        // Tab synchron holt (§20-Lazy-Load) — die Ampel stand dauerhaft auf
        // rot/gelb, obwohl alle Feeds HTTP 200 lieferten. Erreichbarkeit zaehlt,
        // nicht Cache-Alter.
        $stale = 'https://status-check-test.invalid/stale-' . uniqid() . '.xml';
        $this->seedRssCache($stale, time() - RSS_TTL - 86400);

        $result = rss_status_from_probes([$stale => $this->probe(true, 'HTTP 200')]);
        self::assertSame('ok', $result['state']);
    }

    public function testNginxLogStatusOkWhenHostNotEnabled(): void
    {
        $result = nginxlog_status_check('world4you', []);
        self::assertSame('ok', $result['state']);
    }

    public function testNginxLogStatusOkWhenBothLogsReadable(): void
    {
        $access = tempnam(sys_get_temp_dir(), 'nginxlog_access');
        $error  = tempnam(sys_get_temp_dir(), 'nginxlog_error');
        $this->cleanupPaths[] = $access;
        $this->cleanupPaths[] = $error;

        $result = nginxlog_status_check('local', ['access' => $access, 'error' => $error]);
        self::assertSame('ok', $result['state']);
    }

    public function testNginxLogStatusWarnWhenOneLogUnreadable(): void
    {
        $access = tempnam(sys_get_temp_dir(), 'nginxlog_access');
        $this->cleanupPaths[] = $access;

        $result = nginxlog_status_check('local', [
            'access' => $access,
            'error'  => '/nonexistent/path/error.log',
        ]);
        self::assertSame('warn', $result['state']);
    }

    public function testNginxLogStatusFailWhenNeitherLogReadable(): void
    {
        $result = nginxlog_status_check('local', [
            'access' => '/nonexistent/path/access.log',
            'error'  => '/nonexistent/path/error.log',
        ]);
        self::assertSame('fail', $result['state']);
    }
}
