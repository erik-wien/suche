<?php

/* database connection */

if ($_SERVER['REMOTE_ADDR'] == '127.0.0.1') {
    define('DBUSER', 'root');
    define('DBPASS', '');
    define('DBHOST', 'localhost');
    define('DBNAME', 'test');
} else {
	define('DBUSER','sql5279249');
	define('DBPASS','wkq6c38');
	define('DBHOST','mysqlsvr50.world4you.com');
	define('DBNAME','5279249db16');

}
define('DB', 'mysql:host=' . DBHOST . ';dbname=' . DBNAME);
