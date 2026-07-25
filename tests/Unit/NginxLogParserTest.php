<?php
declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/nginx_log.php';

final class NginxLogParserTest extends TestCase
{
    public function testParseAccessValidLine(): void
    {
        $line = '127.0.0.1 - - [01/Jul/2026:16:48:00 +0200] "GET /foo?x=1 HTTP/1.1" 200 1234 '
              . '"https://example.com/" "Mozilla/5.0"';
        $row = nginxlog_parse_access($line);

        self::assertNotNull($row);
        self::assertSame('127.0.0.1', $row['ip']);
        self::assertSame('GET', $row['method']);
        self::assertSame('/foo?x=1', $row['path']);
        self::assertSame('HTTP/1.1', $row['protocol']);
        self::assertSame(200, $row['status']);
        self::assertSame('1234', $row['bytes']);
        self::assertSame('https://example.com/', $row['referer']);
        self::assertSame('Mozilla/5.0', $row['ua']);
        self::assertSame('2026-07-01 16:48:00', $row['time']);
        self::assertIsInt($row['ts']);
        self::assertSame($line, $row['raw']);
    }

    public function testParseAccessMalformedReturnsNull(): void
    {
        self::assertNull(nginxlog_parse_access('not a valid nginx line at all'));
    }

    public function testParseErrorValidLine(): void
    {
        $line = '2026/07/01 16:49:12 [error] 1234#0: *5 open() "/var/www/x" failed '
              . '(2: No such file or directory), client: 1.2.3.4, server: suche.eriks.cloud, '
              . 'request: "GET /x HTTP/1.1"';
        $row = nginxlog_parse_error($line);

        self::assertNotNull($row);
        self::assertSame('error', $row['level']);
        self::assertSame(1234, $row['pid']);
        self::assertStringContainsString('open() "/var/www/x" failed', $row['message']);
        self::assertSame('2026-07-01 16:49:12', $row['time']);
        self::assertIsInt($row['ts']);
    }

    public function testParseErrorMalformedReturnsNull(): void
    {
        self::assertNull(nginxlog_parse_error('totally not an error line'));
    }

    public function testFilterByExactStatus(): void
    {
        $rows = [
            ['ts' => 1000, 'status' => 200, 'raw' => 'a'],
            ['ts' => 1000, 'status' => 404, 'raw' => 'b'],
        ];
        $result = nginxlog_filter_rows($rows, ['status' => '404']);
        self::assertCount(1, $result);
        self::assertSame(404, $result[0]['status']);
    }

    public function testFilterByStatusClass(): void
    {
        $rows = [
            ['ts' => 1000, 'status' => 200, 'raw' => 'a'],
            ['ts' => 1000, 'status' => 404, 'raw' => 'b'],
            ['ts' => 1000, 'status' => 500, 'raw' => 'c'],
        ];
        $result = nginxlog_filter_rows($rows, ['status' => '4xx']);
        self::assertCount(1, $result);
        self::assertSame(404, $result[0]['status']);
    }

    public function testFilterByFreeTextIsCaseInsensitive(): void
    {
        $rows = [
            ['ts' => 1000, 'raw' => 'GET /Foo/Bar HTTP/1.1'],
            ['ts' => 1000, 'raw' => 'GET /other HTTP/1.1'],
        ];
        $result = nginxlog_filter_rows($rows, ['q' => 'foo/bar']);
        self::assertCount(1, $result);
    }

    public function testFilterByDateRange(): void
    {
        $rows = [
            ['ts' => strtotime('2026-06-01 12:00:00'), 'raw' => 'old'],
            ['ts' => strtotime('2026-07-01 12:00:00'), 'raw' => 'new'],
        ];
        $result = nginxlog_filter_rows($rows, ['from' => '2026-06-15', 'to' => '2026-07-15']);
        self::assertCount(1, $result);
        self::assertSame('new', $result[0]['raw']);
    }

    public function testFiltersCombine(): void
    {
        $rows = [
            ['ts' => strtotime('2026-07-01 12:00:00'), 'status' => 404, 'raw' => 'GET /missing'],
            ['ts' => strtotime('2026-07-01 12:00:00'), 'status' => 200, 'raw' => 'GET /missing'],
            ['ts' => strtotime('2026-05-01 12:00:00'), 'status' => 404, 'raw' => 'GET /missing'],
        ];
        $result = nginxlog_filter_rows($rows, [
            'status' => '4xx',
            'q'      => 'missing',
            'from'   => '2026-06-01',
            'to'     => '2026-07-31',
        ]);
        self::assertCount(1, $result);
    }

    public function testReadTailReturnsNullForUnreadableFile(): void
    {
        self::assertNull(nginxlog_read_tail('/nonexistent/path/to/suche.access.log', 4096));
    }

    public function testReadTailNotTruncatedWhenFileFitsWindow(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'nginxlog');
        file_put_contents($path, "line1\nline2\nline3\n");

        $result = nginxlog_read_tail($path, 4096);
        unlink($path);

        self::assertNotNull($result);
        self::assertFalse($result['truncated']);
        self::assertSame(['line1', 'line2', 'line3'], $result['lines']);
    }

    public function testReadTailTruncatedWhenWindowSmallerThanFile(): void
    {
        $path  = tempnam(sys_get_temp_dir(), 'nginxlog');
        $lines = [];
        for ($i = 0; $i < 100; $i++) {
            $lines[] = str_pad((string) $i, 4, '0', STR_PAD_LEFT) . str_repeat('x', 20);
        }
        file_put_contents($path, implode("\n", $lines) . "\n");

        $result = nginxlog_read_tail($path, 200);
        unlink($path);

        self::assertNotNull($result);
        self::assertTrue($result['truncated']);
        self::assertNotEmpty($result['lines']);
        self::assertSame(end($lines), end($result['lines']));
    }

    public function testEnabledForLocalAndAkadbrain(): void
    {
        self::assertTrue(nginxlog_enabled('local'));
        self::assertTrue(nginxlog_enabled('akadbrain'));
    }

    public function testDisabledForWorld4you(): void
    {
        self::assertFalse(nginxlog_enabled('world4you'));
    }

    public function testPathsReturnsDefaultsForKnownHost(): void
    {
        // akadbrain ist macOS + Homebrew-nginx → /opt/homebrew/var/log/nginx.
        // (Vorher stand hier das Linux-uebliche /var/log/nginx, das es dort gar
        // nicht gibt — der Viewer meldete dauerhaft „Log nicht lesbar".)
        $paths = nginxlog_paths('akadbrain', []);
        self::assertSame('/opt/homebrew/var/log/nginx/suche.access.log', $paths['access']);
        self::assertSame('/opt/homebrew/var/log/nginx/suche.error.log', $paths['error']);
    }

    public function testPathsEmptyForUnknownHost(): void
    {
        self::assertSame([], nginxlog_paths('world4you', []));
    }

    public function testPathsOverrideAppliesPartially(): void
    {
        $paths = nginxlog_paths('local', ['access' => '/custom/access.log']);
        self::assertSame('/custom/access.log', $paths['access']);
        self::assertNotEmpty($paths['error']);
    }
}
