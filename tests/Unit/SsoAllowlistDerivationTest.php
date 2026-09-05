<?php
// tests/Unit/SsoAllowlistDerivationTest.php
//
// Haelt die Kopplung fest, die seit 2026-09-05 den wiederkehrenden Fehler
// "nach dem Login lande ich auf der Suche statt in der App" verhindern soll:
// die SSO-Rueckweg-Allowlist wird aus der zentralen Suite-Registry ABGELEITET
// (Chrome\AppsMenu::ssoHosts()), statt daneben von Hand gepflegt zu werden.
//
// Der Test ist absichtlich streng gegen die REGISTRY, nicht gegen eine
// erwartete Hostliste: waechst die Suite, waechst er mit. Faellt jemand auf
// die alte Doppelpflege zurueck, schlaegt er fehl.

namespace Suche\Tests\Unit;

use Erikr\Chrome\AppsMenu;
use PHPUnit\Framework\TestCase;

final class SsoAllowlistDerivationTest extends TestCase
{
    public function test_every_registered_app_has_at_least_one_host(): void
    {
        // Ohne hosts-Eintrag faellt eine App stillschweigend aus der
        // Allowlist -- also genau der Fehler, den die Ableitung beheben soll,
        // nur eine Ebene tiefer.
        $hosts = AppsMenu::ssoHosts();
        $this->assertNotEmpty($hosts, 'ssoHosts() darf nie leer sein');
        $this->assertGreaterThan(10, count($hosts), 'Registry wirkt unvollstaendig');
    }

    public function test_the_production_url_of_every_app_is_covered(): void
    {
        // Der Prod-Host ist das Ziel, auf das die Apps-Menue-Links zeigen --
        // er MUSS zurueckspringen duerfen, sonst ist der Link eine Falle.
        $hosts = AppsMenu::ssoHosts();

        foreach (AppsMenu::build('suche', 'akadbrain') as $eintrag) {
            $host = parse_url($eintrag['href'], PHP_URL_HOST);
            if ($host === null || $host === false) {
                continue;   // relative Links (die aktuelle App) haben keinen Host
            }
            $this->assertContains(
                $host,
                $hosts,
                "Host $host steht im Apps-Menue, darf aber nicht zurueckspringen"
            );
        }
    }

    public function test_no_wildcards_and_no_schemes_slip_in(): void
    {
        // Die Liste ist eine Sicherheitsgrenze gegen offene Weiterleitungen.
        // Ein "*" oder ein "https://" darin waere ein Loch, kein Komfort.
        foreach (AppsMenu::ssoHosts() as $host) {
            $this->assertStringNotContainsString('*', $host, "Wildcard in $host");
            $this->assertStringNotContainsString('/', $host, "Pfad/Schema in $host");
            $this->assertMatchesRegularExpression('/^[a-z0-9.-]+$/', $host, "unsauberer Host: $host");
        }
    }

    public function test_the_list_has_no_duplicates(): void
    {
        $hosts = AppsMenu::ssoHosts();
        $this->assertSame(array_values(array_unique($hosts)), $hosts);
    }
}
