<?php
declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/search_engines.php';

final class SearchEnginesTest extends TestCase
{
    public function testLoadReturnsNonEmptyList(): void
    {
        $engines = search_engines_load();
        self::assertNotEmpty($engines);
    }

    public function testEveryEngineHasRequiredKeys(): void
    {
        foreach (search_engines_load() as $i => $engine) {
            foreach (['id', 'label', 'action', 'input_name'] as $key) {
                self::assertArrayHasKey($key, $engine, "engine #$i missing '$key'");
                self::assertNotEmpty($engine[$key], "engine #$i has empty '$key'");
            }
        }
    }

    public function testRenderEscapesMaliciousLabel(): void
    {
        $engine = [
            'id'         => 'x',
            'label'      => '<script>alert(1)</script>',
            'action'     => 'https://example.com/q',
            'input_name' => 'q',
        ];

        ob_start();
        render_search_form($engine);
        $html = (string) ob_get_clean();

        self::assertStringNotContainsString('<script>alert(1)</script>', $html);
        self::assertStringContainsString('&lt;script&gt;alert(1)&lt;/script&gt;', $html);
    }
}
