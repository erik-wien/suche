<?php
/**
 * inc/_admin_users_tab.php — Benutzerverwaltung tab body.
 * Required from admin.php. Expects:
 *   $users, $total, $page, $lastPage, $filter, $perPage, $selfId
 */
?>
<div class="card">
    <div class="card-header card-header-split">
        <span>Benutzerverwaltung</span>
        <button type="button" class="btn btn-outline-success btn-sm" data-modal-open="createModal">
            + Benutzer anlegen
        </button>
    </div>
    <div class="card-body">

        <form method="get" action="admin.php" class="user-filter-form"
              style="display:flex; gap:.5rem; margin-bottom:1rem">
            <input type="text" name="filter" class="form-control"
                   placeholder="Benutzername suchen"
                   value="<?= htmlspecialchars($filter, ENT_QUOTES, 'UTF-8') ?>">
            <button type="submit" class="btn">Suchen</button>
            <?php if ($filter !== ''): ?>
                <a href="admin.php#adm-users" class="btn">Zurücksetzen</a>
            <?php endif; ?>
        </form>

        <div class="table-responsive">
        <table class="table table-sm table-hover">
            <thead>
                <tr>
                    <th>Benutzername</th>
                    <th>E-Mail</th>
                    <th>Rechte</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            <?php foreach ($users as $u): ?>
                <tr>
                    <td><?= htmlspecialchars($u['username'], ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars($u['email'],    ENT_QUOTES, 'UTF-8') ?></td>
                    <td><?= htmlspecialchars($u['rights'],   ENT_QUOTES, 'UTF-8') ?></td>
                    <td>
                        <?= $u['disabled']
                            ? '<span class="badge badge-danger">deaktiviert</span>'
                            : '<span class="badge badge-success">aktiv</span>' ?>
                        <?php if ($u['debug']): ?><span class="badge">debug</span><?php endif; ?>
                    </td>
                    <td style="white-space:nowrap">
                        <button type="button" class="btn btn-outline-secondary btn-sm btn-edit"
                                data-modal-open="editModal"
                                data-id="<?= $u['id'] ?>"
                                data-username="<?= htmlspecialchars($u['username'], ENT_QUOTES, 'UTF-8') ?>"
                                data-email="<?= htmlspecialchars($u['email'],    ENT_QUOTES, 'UTF-8') ?>"
                                data-rights="<?= htmlspecialchars($u['rights'],   ENT_QUOTES, 'UTF-8') ?>"
                                data-disabled="<?= $u['disabled'] ?>"
                                data-debug="<?= $u['debug'] ?>">
                            Bearbeiten
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-reset"
                                data-id="<?= $u['id'] ?>">
                            Passwort-Reset
                        </button>
                        <?php if ($u['id'] !== $selfId): ?>
                            <button type="button" class="btn btn-sm btn-danger btn-delete"
                                    data-id="<?= $u['id'] ?>"
                                    data-username="<?= htmlspecialchars($u['username'], ENT_QUOTES, 'UTF-8') ?>">
                                Löschen
                            </button>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endforeach; ?>
            <?php if (empty($users)): ?>
                <tr><td colspan="5" class="text-muted">Keine Benutzer gefunden.</td></tr>
            <?php endif; ?>
            </tbody>
        </table>
        </div>

        <?php if ($lastPage > 1): ?>
            <nav class="pagination">
                <?php for ($p = 1; $p <= $lastPage; $p++): ?>
                    <a class="page-link<?= $p === $page ? ' active' : '' ?>"
                       href="<?= htmlspecialchars(user_page_url($p, $filter), ENT_QUOTES, 'UTF-8') ?>"><?= $p ?></a>
                <?php endfor; ?>
            </nav>
        <?php endif; ?>

    </div>
</div>
