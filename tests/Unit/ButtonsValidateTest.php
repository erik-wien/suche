<?php
declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/buttons.php';

final class ButtonsValidateTest extends TestCase
{
    public function testAcceptsMinimalValidInput(): void
    {
        [$ok, $err, $row] = buttons_validate([
            'caption' => 'Example',
            'url'     => 'https://example.com/',
        ]);

        self::assertTrue($ok);
        self::assertNull($err);
        self::assertSame('Example', $row['caption']);
        self::assertSame('https://example.com/', $row['url']);
        self::assertSame('_blank', $row['target']);
        self::assertSame('btn-default', $row['variant']);
        self::assertNull($row['img_url']);
    }

    public function testRejectsEmptyCaption(): void
    {
        [$ok, $err] = buttons_validate(['caption' => '   ', 'url' => 'https://example.com/']);
        self::assertFalse($ok);
        self::assertStringContainsString('Caption', $err);
    }

    public function testRejectsCaptionLongerThan64Chars(): void
    {
        [$ok, $err] = buttons_validate([
            'caption' => str_repeat('x', 65),
            'url'     => 'https://example.com/',
        ]);
        self::assertFalse($ok);
        self::assertStringContainsString('zu lang', $err);
    }

    public function testRejectsNonHttpUrl(): void
    {
        [$ok, $err] = buttons_validate([
            'caption' => 'Bad',
            'url'     => 'javascript:alert(1)',
        ]);
        self::assertFalse($ok);
        self::assertStringContainsString('http', $err);
    }

    public function testRejectsUnknownVariant(): void
    {
        [$ok, $err] = buttons_validate([
            'caption' => 'X',
            'url'     => 'https://example.com/',
            'variant' => 'btn-rainbow',
        ]);
        self::assertFalse($ok);
        self::assertStringContainsString('Variant', $err);
    }

    public function testRejectsInvalidImgUrl(): void
    {
        [$ok, $err] = buttons_validate([
            'caption' => 'X',
            'url'     => 'https://example.com/',
            'img_url' => 'javascript:alert(1)',
        ]);
        self::assertFalse($ok);
        self::assertStringContainsString('Bild', $err);
    }

    public function testAcceptsLocalIconPath(): void
    {
        [$ok, $err, $row] = buttons_validate([
            'caption' => 'X',
            'url'     => 'https://example.com/',
            'img_url' => 'icons/home.svg',
        ]);
        self::assertTrue($ok);
        self::assertNull($err);
        self::assertSame('icons/home.svg', $row['img_url']);
    }

    public function testCoercesTargetToSelfOrBlank(): void
    {
        [, , $row] = buttons_validate([
            'caption' => 'X', 'url' => 'https://example.com/', 'target' => '_top',
        ]);
        self::assertSame('_blank', $row['target']);

        [, , $row] = buttons_validate([
            'caption' => 'X', 'url' => 'https://example.com/', 'target' => '_self',
        ]);
        self::assertSame('_self', $row['target']);
    }
}
