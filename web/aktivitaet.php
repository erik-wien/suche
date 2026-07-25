<?php
/**
 * web/aktivitaet.php — "Log" (TASK-Profil, Erikr\Chrome\Activity).
 *
 * Server-rendert die eigenen auth_log-Einträge des angemeldeten Users. Die
 * userId kommt AUSSCHLIESSLICH aus der Session — Activity::render() liest sie
 * nie aus $_GET/$_POST (siehe Docblock in erikr/chrome).
 */

require __DIR__ . '/../inc/initialize.php';
require_once __DIR__ . '/../inc/layout.php';

auth_require();

render_header('Log', 'aktivitaet');
?>
<div class="container-md" style="padding-block:1.5rem">
    <h1>Log</h1>
    <?php
    \Erikr\Chrome\Activity::render([
        'con'    => $con,
        'userId' => (int) ($_SESSION['id'] ?? 0),
    ]);
    ?>
</div>
<?php
render_footer();
