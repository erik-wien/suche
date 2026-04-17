<?php
/**
 * inc/buttons.php — model + render helpers for s_buttons.
 *
 * Every function that touches the DB takes int $uid as first arg and adds
 * WHERE user_id = :uid to every query. A user cannot read or modify another
 * user's rows. Relies on the global $pdo from inc/initialize.php.
 */

const BUTTON_VARIANTS = [
    'btn-default', 'btn-primary', 'btn-success', 'btn-warning',
    'btn-danger',  'btn-secondary', 'btn-dark',   'btn-light',
];

function buttons_for_user(int $uid): array {
    global $pdo;
    $stmt = $pdo->prepare(
        'SELECT id, caption, url, target, variant, img_url, sort
         FROM s_buttons
         WHERE user_id = :uid
         ORDER BY sort ASC, id ASC'
    );
    $stmt->execute([':uid' => $uid]);
    return $stmt->fetchAll();
}

function buttons_validate(array $in): array {
    $caption = trim((string)($in['caption'] ?? ''));
    if ($caption === '') {
        return [false, 'Caption darf nicht leer sein.', null];
    }
    if (mb_strlen($caption) > 64) {
        return [false, 'Caption ist zu lang (max 64 Zeichen).', null];
    }

    $url = trim((string)($in['url'] ?? ''));
    $parts = parse_url($url);
    if ($parts === false || empty($parts['scheme']) || empty($parts['host'])
        || !in_array($parts['scheme'], ['http', 'https'], true)) {
        return [false, 'URL muss mit http:// oder https:// beginnen.', null];
    }

    $variant = (string)($in['variant'] ?? 'btn-default');
    if (!in_array($variant, BUTTON_VARIANTS, true)) {
        return [false, 'Unbekannter Variant.', null];
    }

    $target = ($in['target'] ?? '_blank') === '_self' ? '_self' : '_blank';

    $imgUrl = trim((string)($in['img_url'] ?? ''));
    if ($imgUrl !== '') {
        // Accept a local icon path (icons/filename.ext) or an external http/https URL
        $isLocalIcon = preg_match(
            '/^icons\/[a-zA-Z0-9][a-zA-Z0-9 ._-]*\.(svg|png|jpe?g|webp)$/i',
            $imgUrl
        );
        if (!$isLocalIcon) {
            $p = parse_url($imgUrl);
            if ($p === false || empty($p['scheme']) || empty($p['host'])
                || !in_array($p['scheme'], ['http', 'https'], true)) {
                return [false, 'Bild-Pfad ungültig.', null];
            }
        }
    }

    return [true, null, [
        'caption' => $caption,
        'url'     => $url,
        'target'  => $target,
        'variant' => $variant,
        'img_url' => $imgUrl !== '' ? $imgUrl : null,
    ]];
}

function buttons_insert(int $uid, array $in): array {
    global $pdo;
    [$ok, $err, $row] = buttons_validate($in);
    if (!$ok) throw new InvalidArgumentException($err);

    $maxSort = (int) $pdo->query(
        'SELECT COALESCE(MAX(sort), 0) FROM s_buttons WHERE user_id = ' . $uid
    )->fetchColumn();

    $stmt = $pdo->prepare(
        'INSERT INTO s_buttons (user_id, caption, url, target, variant, img_url, sort)
         VALUES (:uid, :caption, :url, :target, :variant, :img_url, :sort)'
    );
    $stmt->execute([
        ':uid'     => $uid,
        ':caption' => $row['caption'],
        ':url'     => $row['url'],
        ':target'  => $row['target'],
        ':variant' => $row['variant'],
        ':img_url' => $row['img_url'],
        ':sort'    => $maxSort + 10,
    ]);
    $id = (int) $pdo->lastInsertId();
    return buttons_get($uid, $id);
}

function buttons_update(int $uid, int $id, array $in): array {
    global $pdo;
    [$ok, $err, $row] = buttons_validate($in);
    if (!$ok) throw new InvalidArgumentException($err);

    $stmt = $pdo->prepare(
        'UPDATE s_buttons SET caption=:caption, url=:url, target=:target,
            variant=:variant, img_url=:img_url
         WHERE id = :id AND user_id = :uid'
    );
    $stmt->execute([
        ':uid'     => $uid,
        ':id'      => $id,
        ':caption' => $row['caption'],
        ':url'     => $row['url'],
        ':target'  => $row['target'],
        ':variant' => $row['variant'],
        ':img_url' => $row['img_url'],
    ]);
    if ($stmt->rowCount() === 0) {
        throw new RuntimeException('Button nicht gefunden.');
    }
    return buttons_get($uid, $id);
}

function buttons_delete(int $uid, int $id): void {
    global $pdo;
    $stmt = $pdo->prepare('DELETE FROM s_buttons WHERE id = :id AND user_id = :uid');
    $stmt->execute([':id' => $id, ':uid' => $uid]);
    if ($stmt->rowCount() === 0) {
        throw new RuntimeException('Button nicht gefunden.');
    }
}

function buttons_get(int $uid, int $id): array {
    global $pdo;
    $stmt = $pdo->prepare(
        'SELECT id, caption, url, target, variant, img_url, sort
         FROM s_buttons WHERE id = :id AND user_id = :uid'
    );
    $stmt->execute([':id' => $id, ':uid' => $uid]);
    $row = $stmt->fetch();
    if (!$row) throw new RuntimeException('Button nicht gefunden.');
    return $row;
}

function buttons_reorder(int $uid, array $order): array {
    global $pdo;
    $order = array_map('intval', $order);

    $stmt = $pdo->prepare('SELECT id FROM s_buttons WHERE user_id = :uid');
    $stmt->execute([':uid' => $uid]);
    $owned = array_map('intval', array_column($stmt->fetchAll(), 'id'));

    sort($owned);
    $check = $order;
    sort($check);
    if ($owned !== $check) {
        throw new InvalidArgumentException('Reihenfolge-Liste stimmt nicht mit den vorhandenen Buttons überein.');
    }

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare('UPDATE s_buttons SET sort = :sort WHERE id = :id AND user_id = :uid');
        foreach ($order as $i => $id) {
            $update->execute([':sort' => ($i + 1) * 100, ':id' => $id, ':uid' => $uid]);
        }
        $pdo->commit();
    } catch (\Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    return buttons_for_user($uid);
}

function render_button(array $b): void {
    global $base;
    $variant  = htmlspecialchars($b['variant'], ENT_QUOTES, 'UTF-8');
    $url      = htmlspecialchars($b['url'],     ENT_QUOTES, 'UTF-8');
    $target   = htmlspecialchars($b['target'],  ENT_QUOTES, 'UTF-8');
    $caption  = htmlspecialchars($b['caption'], ENT_QUOTES, 'UTF-8');
    $imgRaw   = $b['img_url'] ?? '';
    $img      = $imgRaw      ? htmlspecialchars($imgRaw, ENT_QUOTES, 'UTF-8') : null;
    // Prefix local icon paths with the app base URL
    $imgSrc   = $img
        ? (str_starts_with($imgRaw, 'icons/') ? htmlspecialchars($base, ENT_QUOTES, 'UTF-8') . '/' . $img : $img)
        : null;
    ?>
    <a class="btn <?= $variant ?>" href="<?= $url ?>" target="<?= $target ?>" rel="noopener noreferrer">
        <?php if ($imgSrc): ?>
            <img src="<?= $imgSrc ?>" alt="" style="height:1rem;flex:0 0 auto">
        <?php endif; ?>
        <span class="btn-label"><?= $caption ?></span>
    </a>
    <?php
}
