<?php
/**
 * inc/_admin_log_tab.php — Log tab body (AJAX shell).
 * Required from admin.php. The filter dropdowns, table rows and pagination are
 * all populated by the log-tab JS on first activation (see admin.php script).
 *
 * Rule §15.1: the log tab is AJAX-only. No server-side pre-render of rows.
 */
?>
<div class="card">
    <div class="card-header card-header-split">
        <span>Log (<span id="logTotal">…</span> Einträge)</span>
    </div>
    <div class="card-body">

        <form id="logFilterForm" class="log-filter-form"
              style="display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:1rem; align-items:end">
            <div class="form-group">
                <label for="log_app">App</label>
                <select id="log_app" name="app" class="form-control">
                    <option value="">Alle</option>
                </select>
            </div>
            <div class="form-group">
                <label for="log_context">Kontext</label>
                <select id="log_context" name="context" class="form-control">
                    <option value="">Alle</option>
                </select>
            </div>
            <div class="form-group">
                <label for="log_user">Benutzer</label>
                <input type="text" id="log_user" name="user" class="form-control" placeholder="username">
            </div>
            <div class="form-group">
                <label for="log_from">Von</label>
                <input type="text" id="log_from" name="from" class="form-control" placeholder="YYYY-MM-DD">
            </div>
            <div class="form-group">
                <label for="log_to">Bis</label>
                <input type="text" id="log_to" name="to" class="form-control" placeholder="YYYY-MM-DD">
            </div>
            <div class="form-group" style="flex:1; min-width:14rem">
                <label for="log_q">Suche in Aktivität</label>
                <input type="text" id="log_q" name="q" class="form-control" placeholder="Text">
            </div>
            <div class="form-check" style="align-self:center">
                <input type="checkbox" id="log_fail" name="fail" value="1">
                <label for="log_fail">nur Fehler</label>
            </div>
            <div class="form-group" style="display:flex; gap:.5rem">
                <button type="submit" class="btn btn-primary">Filter</button>
                <button type="reset" class="btn" id="logReset">Zurücksetzen</button>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table table-sm table-hover log-table">
                <thead>
                    <tr>
                        <th>Zeit</th>
                        <th>App</th>
                        <th>Kontext</th>
                        <th>Benutzer</th>
                        <th>IP</th>
                        <th>Aktivität</th>
                    </tr>
                </thead>
                <tbody id="logTbody">
                    <tr><td colspan="6" class="text-muted">Lade…</td></tr>
                </tbody>
            </table>
        </div>

        <nav class="pagination" id="logPagination"></nav>

    </div>
</div>
