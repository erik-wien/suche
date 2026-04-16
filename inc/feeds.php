<?php
/**
 * inc/feeds.php — model for s_feeds. Same shape as buttons.php.
 */

function feeds_for_user(int $uid, bool $enabledOnly = true): array {
    global $pdo;
    $sql = 'SELECT id, title, url, sort, enabled
            FROM s_feeds WHERE user_id = :uid';
    if ($enabledOnly) {
        $sql .= ' AND enabled = 1';
    }
    $sql .= ' ORDER BY sort ASC, id ASC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':uid' => $uid]);
    return $stmt->fetchAll();
}

function feeds_validate(array $in): array {
    $title = trim((string)($in['title'] ?? ''));
    if ($title === '' || mb_strlen($title) > 64) {
        return [false, 'Titel ist erforderlich (max 64 Zeichen).', null];
    }
    $url = trim((string)($in['url'] ?? ''));
    $p = parse_url($url);
    if ($p === false || empty($p['scheme']) || empty($p['host'])
        || !in_array($p['scheme'], ['http', 'https'], true)) {
        return [false, 'Feed-URL muss mit http:// oder https:// beginnen.', null];
    }
    return [true, null, [
        'title'   => $title,
        'url'     => $url,
        'enabled' => !empty($in['enabled']) ? 1 : 0,
    ]];
}

function feeds_insert(int $uid, array $in): array {
    global $pdo;
    [$ok, $err, $row] = feeds_validate($in);
    if (!$ok) throw new InvalidArgumentException($err);

    $maxSort = (int) $pdo->query(
        'SELECT COALESCE(MAX(sort), 0) FROM s_feeds WHERE user_id = ' . $uid
    )->fetchColumn();

    $stmt = $pdo->prepare(
        'INSERT INTO s_feeds (user_id, title, url, enabled, sort)
         VALUES (:uid, :title, :url, :enabled, :sort)'
    );
    $stmt->execute([
        ':uid'     => $uid,
        ':title'   => $row['title'],
        ':url'     => $row['url'],
        ':enabled' => $row['enabled'],
        ':sort'    => $maxSort + 10,
    ]);
    return feeds_get($uid, (int) $pdo->lastInsertId());
}

function feeds_update(int $uid, int $id, array $in): array {
    global $pdo;
    [$ok, $err, $row] = feeds_validate($in);
    if (!$ok) throw new InvalidArgumentException($err);

    $stmt = $pdo->prepare(
        'UPDATE s_feeds SET title=:title, url=:url, enabled=:enabled
         WHERE id = :id AND user_id = :uid'
    );
    $stmt->execute([
        ':uid'     => $uid,
        ':id'      => $id,
        ':title'   => $row['title'],
        ':url'     => $row['url'],
        ':enabled' => $row['enabled'],
    ]);
    if ($stmt->rowCount() === 0) {
        throw new RuntimeException('Feed nicht gefunden.');
    }
    return feeds_get($uid, $id);
}

function feeds_delete(int $uid, int $id): void {
    global $pdo;
    $stmt = $pdo->prepare('DELETE FROM s_feeds WHERE id = :id AND user_id = :uid');
    $stmt->execute([':id' => $id, ':uid' => $uid]);
    if ($stmt->rowCount() === 0) {
        throw new RuntimeException('Feed nicht gefunden.');
    }
}

function feeds_get(int $uid, int $id): array {
    global $pdo;
    $stmt = $pdo->prepare(
        'SELECT id, title, url, sort, enabled
         FROM s_feeds WHERE id = :id AND user_id = :uid'
    );
    $stmt->execute([':id' => $id, ':uid' => $uid]);
    $row = $stmt->fetch();
    if (!$row) throw new RuntimeException('Feed nicht gefunden.');
    return $row;
}

function feeds_reorder(int $uid, array $order): array {
    global $pdo;
    $order = array_map('intval', $order);

    $stmt = $pdo->prepare('SELECT id FROM s_feeds WHERE user_id = :uid');
    $stmt->execute([':uid' => $uid]);
    $owned = array_map('intval', array_column($stmt->fetchAll(), 'id'));

    sort($owned);
    $check = $order;
    sort($check);
    if ($owned !== $check) {
        throw new InvalidArgumentException('Reihenfolge-Liste passt nicht.');
    }

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare('UPDATE s_feeds SET sort = :sort WHERE id = :id AND user_id = :uid');
        foreach ($order as $i => $id) {
            $update->execute([':sort' => ($i + 1) * 100, ':id' => $id, ':uid' => $uid]);
        }
        $pdo->commit();
    } catch (\Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    return feeds_for_user($uid, false);
}
