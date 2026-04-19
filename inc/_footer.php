<?php
/**
 * inc/_footer.php — anonymous-page footer wrapper.
 *
 * The five anon pages (login, forgotPassword, setpassword, executeReset,
 * totp_verify) include this directly because they don't go through
 * inc/layout.php's render_footer(). Delegates to chrome's Footer::render()
 * so all pages share one footer implementation (Rule §13).
 *
 * Caller sets $base before include.
 */
$_stage = in_array(strtolower(APP_ENV), ['local', 'localhost', 'dev', 'development', 'staging', 'akadbrain'], true) ? 'DEV' : 'PROD';
\Erikr\Chrome\Footer::render([
    'base'    => $base ?? '',
    'year'    => '2016–' . date('Y'),
    'version' => APP_VERSION . '.' . APP_BUILD . ' ' . $_stage,
]);
