<?php
/**
 * inc/sso_finish.php — Abschluss eines erfolgreichen Logins am zentralen Host.
 *
 * Liegt ein validierter Rücksprung ($_SESSION['sso_return']) vor, wird ein
 * Einmal-Ticket ausgestellt und dorthin zurückgeleitet; sonst zur suche-Home.
 */

declare(strict_types=1);

/**
 * Validiert einen rohen `return`-Wert (aus $_GET, $_POST oder der Session)
 * gegen die SSO-Allowlist. Gibt ihn unverändert zurück, wenn erlaubt, sonst
 * ''. Zentrale Stelle, damit jeder Rücksprungwert im Login-Flow denselben
 * Open-Redirect-Schutz durchläuft.
 */
function sso_validate_return(string $raw): string
{
    return ($raw !== '' && auth_sso_return_allowed($raw, AUTH_SSO_ALLOWED_HOSTS))
        ? $raw
        : '';
}

/**
 * Baut die Login-Redirect-URL für Fehl-Rücksprünge (falsche Credentials,
 * CSRF, abgelaufene TOTP-Sitzung, …) — hängt einen validierten `return`-Wert
 * als Query-Parameter an, damit der Rücksprung auch dann nicht verloren geht,
 * wenn er nicht (mehr) über die Session mitläuft.
 */
function sso_login_redirect(string $rawReturn): string
{
    $return = sso_validate_return($rawReturn);
    return $return === '' ? 'login.php' : ('login.php?return=' . urlencode($return));
}

function sso_finish_login(mysqli $con, int $userId): void
{
    $return = sso_validate_return((string) ($_SESSION['sso_return'] ?? ''));
    unset($_SESSION['sso_return']);

    if ($return !== '') {
        $token = auth_sso_issue($con, $userId, $return);
        $sep   = (strpos($return, '?') !== false) ? '&' : '?';
        header('Location: ' . $return . $sep . 'sso=' . urlencode($token));
        exit;
    }
    header('Location: ./');
    exit;
}
