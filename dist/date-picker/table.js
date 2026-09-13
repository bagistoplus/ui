import { numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { applyProps, releaseProps } from "../core/props";
import { DATE_PICKER_ROOT, DATE_PICKER_TABLE } from "./brands";
import { UIDatePickerTableBody, UIDatePickerTableCell, UIDatePickerTableCellTrigger, UIDatePickerTableHead, UIDatePickerTableHeader, UIDatePickerTableRow, } from "./grid";
import { viewOf } from "./view";
const FORMATS = ["short", "long"];
/**
 * The grid, rendered from templates.
 *
 * A calendar is 35 or 42 cells that change on every month, so nobody authors
 * them. The element holds up to four `<template data-slot>`: `table`, `row`,
 * `header` and `cell`, each with one plain tag, and writes everything else:
 * the `<table>`, a head and a body, one row part per row, one header part per
 * weekday and one cell part per cell with its trigger inside. A missing
 * template gives a bare tag.
 *
 * The parts are reused across months: a cell that changes gets its new
 * `value`, and only a change in the number of rows adds or removes nodes.
 * A morph that strips the generated table leaves the templates, and the
 * observer below has the next render stamp it again.
 */
export class UIDatePickerTable extends ZagPart {
    static { this.observedAttributes = ["columns", "format"]; }
    #table;
    #head;
    #body;
    #header;
    #rows = [];
    #observer;
    get [DATE_PICKER_TABLE]() {
        return true;
    }
    get view() {
        return viewOf(this);
    }
    /** Cells per row in the month and year views. Zag's day view has seven. */
    get columns() {
        return numberAttribute(this, "columns");
    }
    /** `short` or `long` month names in the month view. */
    get format() {
        const value = this.getAttribute("format");
        return FORMATS.find((format) => format === value);
    }
    get ownerBrand() {
        return DATE_PICKER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
    /** The host carries nothing of Zag's: the table props go on the `<table>`. */
    propsFor() {
        return {};
    }
    render(api) {
        const owner = this.owner;
        if (!owner) {
            return;
        }
        const view = this.view;
        const table = this.#ensureTable();
        applyProps(table, api.getTableProps({ view, columns: this.columns }), this.scopeFor(owner));
        this.#sync(api, view);
        super.render(api);
    }
    release() {
        if (this.#table && this.scope) {
            releaseProps(this.#table, this.scope);
        }
        this.#observer?.disconnect();
        this.#observer = undefined;
        super.release();
    }
    #ensureTable() {
        const table = this.#table;
        if (table && table.parentElement === this) {
            if (!this.#intact()) {
                table.replaceChildren();
                this.#forget();
            }
            return table;
        }
        this.#forget();
        const cloned = this.#clone("table");
        const next = cloned instanceof HTMLTableElement ? cloned : document.createElement("table");
        this.append(next);
        this.#table = next;
        this.#observe();
        return next;
    }
    /** Whether every generated node is still where it was put. */
    #intact() {
        const table = this.#table;
        const thead = this.#head?.firstElementChild;
        const tbody = this.#body?.firstElementChild;
        if (this.#head && this.#head.parentElement !== table) {
            return false;
        }
        if (this.#body && this.#body.parentElement !== table) {
            return false;
        }
        if (this.#header && this.#header.part.parentElement !== thead) {
            return false;
        }
        return this.#rows.every((record) => record.part.parentElement === tbody);
    }
    #forget() {
        this.#head = undefined;
        this.#body = undefined;
        this.#header = undefined;
        this.#rows = [];
    }
    /**
     * Only a change the element did not make itself schedules a render: its own
     * stamping mutates too, and re-rendering on that would cost a frame per
     * month change.
     */
    #observe() {
        if (this.#observer) {
            return;
        }
        this.#observer = new MutationObserver(() => {
            if (this.#table?.parentElement !== this || !this.#intact()) {
                this.scheduleRender();
            }
        });
        this.#observer.observe(this, { childList: true, subtree: true });
    }
    /**
     * A deep clone of the template's tag, every `id` stripped, or `undefined`.
     *
     * The tag is read from the template's content fragment, where the HTML
     * parser puts it, or from the template element itself, where a framework
     * that builds the page through `createElement` puts it: Vue's client render
     * appends a template's children as ordinary children.
     */
    #clone(slot) {
        const template = this.querySelector(`:scope > template[data-slot="${slot}"]`);
        const source = template?.content.firstElementChild ?? template?.firstElementChild;
        if (!source) {
            return undefined;
        }
        const clone = source.cloneNode(true);
        clone.removeAttribute("id");
        for (const named of clone.querySelectorAll("[id]")) {
            named.removeAttribute("id");
        }
        return clone;
    }
    #grid(api, view) {
        if (view === "day") {
            const weekNumbers = api.showWeekNumbers;
            const header = api.weekDays.map((_, index) => ({ index }));
            const rows = api.weeks.map((week, weekIndex) => {
                const cells = week.map((date) => ({ value: date.toString() }));
                if (weekNumbers) {
                    cells.unshift({ weekIndex });
                }
                return cells;
            });
            if (weekNumbers) {
                header.unshift({ week: true });
            }
            return { header, rows };
        }
        const columns = this.columns ?? 4;
        const grid = view === "month" ? api.getMonthsGrid({ columns, format: this.format }) : api.getYearsGrid({ columns });
        return {
            rows: grid.map((row) => row.map((cell) => ({ value: String(cell.value), label: cell.label, disabled: cell.disabled }))),
        };
    }
    #sync(api, view) {
        const table = this.#table;
        const grid = this.#grid(api, view);
        if (grid.header) {
            if (!this.#head) {
                this.#head = wrap(new UIDatePickerTableHead(), document.createElement("thead"));
                table.prepend(this.#head);
            }
            const thead = this.#head.firstElementChild;
            this.#header ??= this.#stampRow(thead);
            this.#syncHeaders(this.#header, grid.header);
        }
        else if (this.#head) {
            this.#head.remove();
            this.#head = undefined;
            this.#header = undefined;
        }
        if (!this.#body) {
            this.#body = wrap(new UIDatePickerTableBody(), document.createElement("tbody"));
            table.append(this.#body);
        }
        const tbody = this.#body.firstElementChild;
        grid.rows.forEach((cells, index) => {
            const record = (this.#rows[index] ??= this.#stampRow(tbody));
            this.#syncCells(record, cells);
        });
        for (const record of this.#rows.splice(grid.rows.length)) {
            record.part.remove();
        }
    }
    #stampRow(parent) {
        const part = wrap(new UIDatePickerTableRow(), this.#clone("row") ?? document.createElement("tr"));
        parent.append(part);
        return { part, cells: [] };
    }
    #syncHeaders(record, specs) {
        const tr = record.part.firstElementChild;
        specs.forEach((spec, index) => {
            let part = record.cells[index];
            if (!part) {
                part = wrap(new UIDatePickerTableHeader(), this.#clone("header") ?? document.createElement("th"));
                record.cells[index] = part;
                tr.append(part);
            }
            setAttribute(part, "index", spec.index === undefined ? undefined : String(spec.index));
            setAttribute(part, "week", spec.week ? "" : undefined);
        });
        for (const part of record.cells.splice(specs.length)) {
            part.remove();
        }
    }
    #syncCells(record, specs) {
        const tr = record.part.firstElementChild;
        specs.forEach((spec, index) => {
            let cell = record.cells[index];
            const week = spec.weekIndex !== undefined;
            if (cell && week !== (cell.trigger === undefined)) {
                cell.part.remove();
                cell = undefined;
            }
            if (!cell) {
                cell = this.#stampCell(week);
                record.cells[index] = cell;
                tr.append(cell.part);
            }
            for (const target of [cell.part, cell.trigger]) {
                if (!target) {
                    continue;
                }
                setAttribute(target, "value", spec.value);
                setAttribute(target, "disabled", spec.disabled ? "" : undefined);
            }
            setAttribute(cell.part, "week-index", spec.weekIndex === undefined ? undefined : String(spec.weekIndex));
            if (cell.trigger) {
                setAttribute(cell.trigger, "label", spec.label);
            }
        });
        for (const cell of record.cells.splice(specs.length)) {
            cell.part.remove();
        }
    }
    /**
     * The cell template's `<td>` and, inside it, its first element child as the
     * trigger. A week number cell has no trigger and no children at all.
     */
    #stampCell(week) {
        const td = this.#clone("cell") ?? document.createElement("td");
        let trigger;
        if (week) {
            td.replaceChildren();
        }
        else {
            const inner = td.firstElementChild ?? td.appendChild(document.createElement("div"));
            trigger = new UIDatePickerTableCellTrigger();
            trigger.setAttribute("delegate", "");
            inner.replaceWith(trigger);
            trigger.append(inner);
        }
        return { part: wrap(new UIDatePickerTableCell(), td), trigger };
    }
}
/** A generated part around its tag, always `delegate`, so it costs no box. */
function wrap(part, child) {
    part.setAttribute("delegate", "");
    part.append(child);
    return part;
}
function setAttribute(el, name, value) {
    if (value === undefined) {
        if (el.hasAttribute(name)) {
            el.removeAttribute(name);
        }
        return;
    }
    if (el.getAttribute(name) !== value) {
        el.setAttribute(name, value);
    }
}
//# sourceMappingURL=table.js.map