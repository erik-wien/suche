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
\Erikr\Chrome\Footer::render([
    'base'    => $base ?? '',
    'year'    => '2016–' . date('Y'),
    'version' => APP_VERSION . ' ' . APP_ENV,
]);
