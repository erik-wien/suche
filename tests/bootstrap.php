<?php
/**
 * tests/bootstrap.php — PHPUnit bootstrap for erikr/suche unit tests.
 *
 * Loads the Composer autoloader and sets the constants that inc/ files expect
 * without actually running inc/initialize.php (which opens DB connections,
 * starts sessions, and emits headers — none of which belong in unit tests).
 *
 * Test classes that need DB-bound code should either mock PDO or skip
 * themselves when no MySQL is available — there is no live-DB fixture here.
 */

require_once __DIR__ . '/../vendor/autoload.php';

$_SERVER['REMOTE_ADDR']   ??= '127.0.0.1';
$_SERVER['SCRIPT_NAME']   ??= '/suche/test.php';
$_SERVER['REQUEST_METHOD'] ??= 'GET';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

defined('AUTH_DB_PREFIX')   || define('AUTH_DB_PREFIX', '');
defined('APP_NAME')         || define('APP_NAME', 'suche');
defined('APP_VERSION')      || define('APP_VERSION', '0.0.0-test');
defined('APP_ENV')          || define('APP_ENV', 'test');
defined('APP_BASE_URL')     || define('APP_BASE_URL', '/suche');
