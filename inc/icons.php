<?php
/**
 * inc/icons.php — model functions for web/icons/ management.
 *
 * Used by the admin icon_* API actions.
 */

define('ICONS_DIR',      __DIR__ . '/../web/icons');
define('ICONS_MAX_SIZE', 512 * 1024);   // 512 KB

const ICONS_ALLOWED_MIME = [
    'image/svg+xml',
    'image/png',
    'image/jpeg',
    'image/webp',
];

function icons_list(): array {
    $files = [];
    foreach (glob(ICONS_DIR . '/*.{jpg,jpeg,png,svg,webp}', GLOB_BRACE) as $f) {
        $files[] = basename($f);
    }
    usort($files, 'strcasecmp');
    return $files;
}

function icons_upload(array $file): string {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload fehlgeschlagen (Code ' . $file['error'] . ').');
    }
    if ($file['size'] > ICONS_MAX_SIZE) {
        throw new InvalidArgumentException('Datei zu groß (max 512 KB).');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($file['tmp_name']);
    if (!in_array($mime, ICONS_ALLOWED_MIME, true)) {
        throw new InvalidArgumentException('Dateityp nicht erlaubt. Erlaubt: SVG, PNG, JPG, WebP.');
    }

    // Basic SVG safety check
    if ($mime === 'image/svg+xml') {
        $content = file_get_contents($file['tmp_name']);
        if (!preg_match('/<svg[\s>]/i', $content)) {
            throw new InvalidArgumentException('Ungültige SVG-Datei.');
        }
        if (stripos($content, '<script') !== false) {
            throw new InvalidArgumentException('SVG enthält Script-Tags und wird abgelehnt.');
        }
    }

    $ext = match ($mime) {
        'image/svg+xml' => 'svg',
        'image/png'     => 'png',
        'image/jpeg'    => 'jpg',
        'image/webp'    => 'webp',
    };

    $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
    $safeName     = preg_replace('/[^a-zA-Z0-9 ._-]/', '', $originalName);
    $safeName     = trim($safeName, '. ');
    if ($safeName === '') {
        $safeName = 'icon_' . time();
    }

    $filename = $safeName . '.' . $ext;
    $dest     = ICONS_DIR . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new RuntimeException('Speichern fehlgeschlagen.');
    }
    return $filename;
}

function icons_rename(string $oldName, string $newName): string {
    if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9 ._-]*\.(svg|png|jpe?g|webp)$/i', $oldName)) {
        throw new InvalidArgumentException('Ungültiger Dateiname.');
    }
    $oldPath = ICONS_DIR . '/' . $oldName;
    if (!is_file($oldPath)) {
        throw new RuntimeException('Datei nicht gefunden.');
    }

    // Derive extension from the existing file
    $ext = strtolower(pathinfo($oldName, PATHINFO_EXTENSION));

    $safeName = preg_replace('/[^a-zA-Z0-9 ._-]/', '', pathinfo($newName, PATHINFO_FILENAME));
    $safeName = trim($safeName, '. ');
    if ($safeName === '') {
        throw new InvalidArgumentException('Neuer Name ungültig.');
    }

    $newFilename = $safeName . '.' . $ext;
    $newPath     = ICONS_DIR . '/' . $newFilename;

    if ($newFilename !== $oldName && is_file($newPath)) {
        throw new InvalidArgumentException('Eine Datei mit diesem Namen existiert bereits.');
    }

    if (!rename($oldPath, $newPath)) {
        throw new RuntimeException('Umbenennen fehlgeschlagen.');
    }
    return $newFilename;
}

function icons_delete(string $filename): void {
    if (!preg_match('/^[a-zA-Z0-9][a-zA-Z0-9 ._-]*\.(svg|png|jpe?g|webp)$/i', $filename)) {
        throw new InvalidArgumentException('Ungültiger Dateiname.');
    }
    $path = ICONS_DIR . '/' . $filename;
    if (!is_file($path)) {
        throw new RuntimeException('Datei nicht gefunden.');
    }
    if (!unlink($path)) {
        throw new RuntimeException('Löschen fehlgeschlagen.');
    }
}
