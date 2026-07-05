<?php
/**
 * inc/sso_finish.php — Abschluss eines erfolgreichen Logins am zentralen Host.
 *
 * Liegt ein validierter Rücksprung ($_SESSION['sso_return']) vor, wird ein
 * Einmal-Ticket ausgestellt und dorthin zurückgeleitet; sonst zur suche-Home.
 */

declare(strict_types=1);

function sso_finish_login(mysqli $con, int $userId): void
{
    $return = $_SESSION['sso_return'] ?? '';
    unset($_SESSION['sso_return']);

    if ($return !== '' && auth_sso_return_allowed($return, AUTH_SSO_ALLOWED_HOSTS)) {
        $token = auth_sso_issue($con, $userId, $return);
        $sep   = (strpos($return, '?') !== false) ? '&' : '?';
        header('Location: ' . $return . $sep . 'sso=' . urlencode($token));
        exit;
    }
    header('Location: ./');
    exit;
}
