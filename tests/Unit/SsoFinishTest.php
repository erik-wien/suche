<?php

declare(strict_types=1);

namespace ErikR\Suche\Tests\Unit;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../inc/sso_finish.php';

/**
 * Unit tests for the return-value validation and URL-building helpers in
 * inc/sso_finish.php (SSO Phase 1, Paket 1 + Paket 3b).
 */
final class SsoFinishTest extends TestCase
{
    public function setUp(): void
    {
        if (!defined('AUTH_SSO_ALLOWED_HOSTS')) {
            define('AUTH_SSO_ALLOWED_HOSTS', ['app.example.com']);
        }
    }

    // ── sso_validate_return() ──────────────────────────────────────────────

    public function testValidateReturnAcceptsAllowedHost(): void
    {
        self::assertSame(
            'https://app.example.com/x',
            sso_validate_return('https://app.example.com/x')
        );
    }

    public function testValidateReturnRejectsUnlistedHost(): void
    {
        self::assertSame('', sso_validate_return('https://evil.example.com/x'));
    }

    public function testValidateReturnRejectsGarbage(): void
    {
        self::assertSame('', sso_validate_return('javascript:alert(1)'));
        self::assertSame('', sso_validate_return(''));
    }

    // ── sso_login_redirect() ───────────────────────────────────────────────

    public function testLoginRedirectPlainWithoutReturn(): void
    {
        self::assertSame('login.php', sso_login_redirect(''));
    }

    public function testLoginRedirectAppendsValidatedReturn(): void
    {
        self::assertSame(
            'login.php?return=' . urlencode('https://app.example.com/x?y=1'),
            sso_login_redirect('https://app.example.com/x?y=1')
        );
    }

    public function testLoginRedirectDropsDisallowedReturn(): void
    {
        // No open redirect: an unlisted host must not survive into the URL.
        self::assertSame('login.php', sso_login_redirect('https://evil.example.com/x'));
    }

    // ── sso_append_ticket() — fragment-safe ticket URL building (Paket 3b) ──

    public function testAppendTicketAddsQueryWhenNone(): void
    {
        self::assertSame(
            'https://app.example.com/x?sso=TOKEN',
            sso_append_ticket('https://app.example.com/x', 'TOKEN')
        );
    }

    public function testAppendTicketExtendsExistingQuery(): void
    {
        self::assertSame(
            'https://app.example.com/x?y=1&sso=TOKEN',
            sso_append_ticket('https://app.example.com/x?y=1', 'TOKEN')
        );
    }

    public function testAppendTicketInsertsBeforeFragmentWithoutQuery(): void
    {
        self::assertSame(
            'https://app.example.com/x?sso=TOKEN#section',
            sso_append_ticket('https://app.example.com/x#section', 'TOKEN')
        );
    }

    public function testAppendTicketInsertsBeforeFragmentWithQuery(): void
    {
        self::assertSame(
            'https://app.example.com/x?y=1&sso=TOKEN#section',
            sso_append_ticket('https://app.example.com/x?y=1#section', 'TOKEN')
        );
    }

    public function testAppendTicketUrlencodesToken(): void
    {
        self::assertSame(
            'https://app.example.com/x?sso=a+b%2Fc',
            sso_append_ticket('https://app.example.com/x', 'a b/c')
        );
    }
}
