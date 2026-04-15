<?php
/**
 * inc/search_engines.php — loader + renderer for inc/search_engines.yaml.
 *
 * search_engines_load(): array<int, array>   — parsed + validated, static-cached
 * render_search_form(array $engine): void
 */

use Symfony\Component\Yaml\Yaml;

require_once __DIR__ . '/../vendor/autoload.php';

function search_engines_load(): array {
    static $cache = null;
    if ($cache !== null) return $cache;

    $path = __DIR__ . '/search_engines.yaml';
    if (!is_readable($path)) {
        throw new RuntimeException("search_engines.yaml missing at $path");
    }

    $parsed = Yaml::parseFile($path);
    if (!is_array($parsed) || !isset($parsed['engines']) || !is_array($parsed['engines'])) {
        throw new RuntimeException("search_engines.yaml malformed: expected top-level 'engines' list");
    }

    $required = ['id', 'label', 'action', 'input_name'];
    foreach ($parsed['engines'] as $i => $engine) {
        foreach ($required as $key) {
            if (empty($engine[$key])) {
                throw new RuntimeException("search_engines.yaml: engine #$i missing '$key'");
            }
        }
    }

    $cache = $parsed['engines'];
    return $cache;
}

function render_search_form(array $engine): void {
    $id          = htmlspecialchars($engine['id'],         ENT_QUOTES, 'UTF-8');
    $label       = htmlspecialchars($engine['label'],      ENT_QUOTES, 'UTF-8');
    $action      = htmlspecialchars($engine['action'],     ENT_QUOTES, 'UTF-8');
    $method      = strtolower($engine['method'] ?? 'get') === 'post' ? 'post' : 'get';
    $inputName   = htmlspecialchars($engine['input_name'], ENT_QUOTES, 'UTF-8');
    $placeholder = htmlspecialchars($engine['placeholder'] ?? 'Suchen …', ENT_QUOTES, 'UTF-8');
    $title       = htmlspecialchars($engine['title']       ?? $label,    ENT_QUOTES, 'UTF-8');
    $accesskey   = htmlspecialchars($engine['accesskey']   ?? '',        ENT_QUOTES, 'UTF-8');
    ?>
    <form class="search-form" action="<?= $action ?>" method="<?= $method ?>" target="_blank" id="form-<?= $id ?>">
        <span class="search-icon">
            <?php if (!empty($engine['icon'])): ?>
                <i class="<?= htmlspecialchars($engine['icon'], ENT_QUOTES, 'UTF-8') ?>" aria-hidden="true"></i>
            <?php elseif (!empty($engine['icon_text'])): ?>
                <span aria-hidden="true"><?= htmlspecialchars($engine['icon_text'], ENT_QUOTES, 'UTF-8') ?></span>
            <?php endif; ?>
        </span>
        <input type="search"
               name="<?= $inputName ?>"
               placeholder="<?= $placeholder ?>"
               title="<?= $title ?>"
               <?php if ($accesskey !== ''): ?>accesskey="<?= $accesskey ?>"<?php endif; ?>
               class="form-control"
               autocomplete="off">
        <?php if (!empty($engine['site_restrict']) && is_array($engine['site_restrict'])): ?>
            <?php $sr = $engine['site_restrict']; ?>
            <select name="<?= htmlspecialchars($sr['param'], ENT_QUOTES, 'UTF-8') ?>" class="form-select">
                <?php foreach ($sr['options'] as $opt): ?>
                    <option value="<?= htmlspecialchars($opt['value'], ENT_QUOTES, 'UTF-8') ?>">
                        <?= htmlspecialchars($opt['label'], ENT_QUOTES, 'UTF-8') ?>
                    </option>
                <?php endforeach; ?>
            </select>
        <?php endif; ?>
        <?php if (!empty($engine['hidden']) && is_array($engine['hidden'])): ?>
            <?php foreach ($engine['hidden'] as $hk => $hv): ?>
                <input type="hidden"
                       name="<?= htmlspecialchars((string)$hk, ENT_QUOTES, 'UTF-8') ?>"
                       value="<?= htmlspecialchars((string)$hv, ENT_QUOTES, 'UTF-8') ?>">
            <?php endforeach; ?>
        <?php endif; ?>
        <button type="submit" class="btn btn-primary"><?= $label ?></button>
    </form>
    <?php
}
