<?php
/**
 * inc/config.php — suche config loader.
 * Reads config.yaml (written by mcp/generate.py) from the app root.
 * Result is statically cached; repeat calls are free.
 */

use Symfony\Component\Yaml\Yaml;

require_once __DIR__ . '/../vendor/autoload.php';

function suche_load_config(): array {
    static $cache = null;
    if ($cache !== null) return $cache;

    $yamlPath = dirname(__DIR__) . '/config.yaml';
    if (!is_readable($yamlPath)) {
        throw new RuntimeException(
            "suche config.yaml not found at $yamlPath — run "
            . "python3 ~/Git/mcp/generate.py --app suche --target local first"
        );
    }

    $cache = Yaml::parseFile($yamlPath);
    return $cache;
}
