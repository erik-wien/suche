<?php
declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/rss.php';
require_once __DIR__ . '/../../inc/nginx_log.php';

/**
 * Covers the pure/parameterized halves of the web/status.php (TASK-8) check
 * callables — rss_status_from_urls() and nginxlog_status_check() both accept
 * their inputs explicitly so they're testable without a DB or config.yaml
 * (see doc comments at their definitions for the state heuristics).
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

    public function testRssStatusOkWithNoFeedsConfigured(): void
    {
        $result = rss_status_from_urls([]);
        self::assertSame('ok', $result['state']);
    }

    public function testRssStatusOkWhenAllFeedsFresh(): void
    {
        $url = 'https://status-check-test.invalid/fresh-' . uniqid() . '.xml';
        $this->seedRssCache($url, time());

        $result = rss_status_from_urls([$url]);
        self::assertSame('ok', $result['state']);
        self::assertIsInt($result['last_success_ts']);
    }

    public function testRssStatusWarnWhenSomeFeedsStale(): void
    {
        $fresh = 'https://status-check-test.invalid/fresh-' . uniqid() . '.xml';
        $stale = 'https://status-check-test.invalid/stale-' . uniqid() . '.xml';
        $this->seedRssCache($fresh, time());
        $this->seedRssCache($stale, time() - RSS_TTL - 60);

        $result = rss_status_from_urls([$fresh, $stale]);
        self::assertSame('warn', $result['state']);
    }

    public function testRssStatusFailWhenNoFeedHasEverBeenCached(): void
    {
        $url = 'https://status-check-test.invalid/never-' . uniqid() . '.xml';
        // No seedRssCache() call — rss_cache_path() points at a file that was never written.
        $result = rss_status_from_urls([$url]);
        self::assertSame('fail', $result['state']);
        self::assertNull($result['last_success_ts']);
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
