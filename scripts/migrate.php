<?php
/**
 * scripts/migrate.php — idempotent SQL migration runner for suche.
 *
 * Reads db/migrations/*.sql in filename order, runs each file that isn't yet
 * recorded in s_db_migrations, then runs post-migration sanity checks.
 *
 * Connects as MariaDB root because it needs DDL privileges on jardyx_auth
 * tables that the app user (suche) does not hold. This script is a dev/admin
 * tool run from the shell, not a web request — it never runs as the app user.
 *
 * Usage: php scripts/migrate.php
 */

$root = dirname(__DIR__);
require_once $root . '/inc/config.php';

$cfg = suche_load_config();
$db  = $cfg['db'];

echo "Database : {$db['name']} @ " . ($db['socket'] ?? $db['host']) . " (as root)\n\n";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$con = new mysqli('localhost', 'root', '', $db['name'], 3306, '/tmp/mysql.sock');
$con->set_charset('utf8mb4');

// ── Ensure tracking table exists with the full schema. If a (id INT PK) stub
//    exists from the grant-db-users.sql bootstrap, rebuild it; there's nothing
//    to preserve — stubs have no tracking data. ──
$con->query("CREATE TABLE IF NOT EXISTS s_db_migrations (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    filename   VARCHAR(128) NOT NULL,
    applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$probe = $con->query("SHOW COLUMNS FROM s_db_migrations LIKE 'filename'");
if ($probe->num_rows === 0) {
    $con->query('DROP TABLE s_db_migrations');
    $con->query("CREATE TABLE s_db_migrations (
        id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
        filename   VARCHAR(128) NOT NULL,
        applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  info  rebuilt s_db_migrations (was a stub)\n";
}

// ── Load already-applied filenames ──
$applied = [];
$res = $con->query('SELECT filename FROM s_db_migrations');
while ($row = $res->fetch_assoc()) {
    $applied[$row['filename']] = true;
}

// ── Run pending migrations in filename order ──
$files = glob($root . '/db/migrations/*.sql');
sort($files);
$ran = 0;

foreach ($files as $file) {
    $name = basename($file);
    if (isset($applied[$name])) {
        echo "  skip   $name\n";
        continue;
    }

    $sql = file_get_contents($file);
    $con->multi_query($sql);
    do {
        if ($result = $con->store_result()) {
            $result->free();
        }
    } while ($con->more_results() && $con->next_result());

    if ($con->errno) {
        fwrite(STDERR, "  FAIL   $name: " . $con->error . "\n");
        exit(1);
    }

    $stmt = $con->prepare('INSERT INTO s_db_migrations (filename) VALUES (?)');
    $stmt->bind_param('s', $name);
    $stmt->execute();
    $stmt->close();

    echo "  apply  $name\n";
    $ran++;
}

echo "\n" . ($ran === 0 ? 'Nothing to migrate.' : "$ran migration(s) applied.") . "\n\n";

// ── Sanity checks ──
echo "Sanity checks:\n";

foreach (['s_db_migrations', 's_buttons', 's_feeds'] as $tbl) {
    $r = $con->query("SHOW TABLES LIKE '$tbl'");
    if ($r->num_rows === 0) {
        fwrite(STDERR, "  FAIL  table $tbl missing\n");
        exit(1);
    }
    echo "  ok    table $tbl exists\n";
}

$n1 = (int) $con->query("SELECT COUNT(*) AS n FROM s_buttons")->fetch_assoc()['n'];
echo "  info  s_buttons rows: $n1\n";

$n2 = (int) $con->query("SELECT COUNT(*) AS n FROM s_feeds")->fetch_assoc()['n'];
echo "  info  s_feeds rows:   $n2\n";

echo "\nDone.\n";
