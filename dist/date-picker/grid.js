import { boolAttribute, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { DATE_PICKER_TABLE } from "./brands";
import { parseDate } from "./dates";
/**
 * The parts inside the grid. The table creates them and nobody writes them:
 * the HTML parser moves a custom element written inside a `<table>` out of it
 * before any script runs, and drops a `<tr>` a custom element wraps inside a
 * `<template>`. Built through the DOM they sit in the table fine, and under
 * `delegate` they cost no box of their own.
 *
 * Otherwise ordinary parts: each registers with the table, reads its own
 * attributes and asks Zag for its own props.
 */
class GridPart extends ZagPart {
    get ownerBrand() {
        return DATE_PICKER_TABLE;
    }
    register(owner) {
        owner.registerPart(this);
    }
    unregister(owner) {
        owner.unregisterPart(this);
    }
}
/** Keeps one text node of its own in the target, so a template's own children stay. */
class TextPart extends GridPart {
    #text;
    write(text) {
        const target = this.delegation.target();
        if (!target) {
            return;
        }
        if (!this.#text || this.#text.parentNode !== target) {
            this.#text = document.createTextNode("");
            target.append(this.#text);
        }
        if (this.#text.data !== text) {
            this.#text.data = text;
        }
    }
}
export class UIDatePickerTableHead extends GridPart {
    propsFor(api, owner) {
        return api.getTableHeadProps({ view: owner.view });
    }
}
export class UIDatePickerTableBody extends GridPart {
    propsFor(api, owner) {
        return api.getTableBodyProps({ view: owner.view });
    }
}
export class UIDatePickerTableRow extends GridPart {
    propsFor(api, owner) {
        return api.getTableRowProps({ view: owner.view });
    }
}
/**
 * One weekday, by `index` into `api.weekDays`, or the week number column
 * under `week`. Zag's header props carry no label, so the long name goes on
 * `aria-label` and the narrow one is the text.
 */
export class UIDatePickerTableHeader extends TextPart {
    static { this.observedAttributes = ["index", "week"]; }
    propsFor(api, owner) {
        const view = owner.view;
        if (this.hasAttribute("week")) {
            return api.getWeekNumberHeaderCellProps({ view });
        }
        const weekDay = this.#weekDay(api);
        return weekDay ? { ...api.getTableHeaderProps({ view }), "aria-label": weekDay.long } : null;
    }
    render(api) {
        super.render(api);
        const weekDay = this.hasAttribute("week") ? undefined : this.#weekDay(api);
        if (weekDay) {
            this.write(weekDay.narrow);
        }
    }
    #weekDay(api) {
        return api.weekDays[numberAttribute(this, "index") ?? -1];
    }
}
/** What the cell getters take, from the attributes the table wrote. */
function cellArgs(part, api, owner) {
    const weekIndex = numberAttribute(part, "week-index");
    if (weekIndex !== undefined) {
        const week = api.weeks[weekIndex];
        return week ? { view: "week", weekIndex, week } : null;
    }
    const view = owner.view;
    if (view === "day") {
        const value = parseDate(part.getAttribute("value"));
        return value ? { view, value } : null;
    }
    const value = numberAttribute(part, "value");
    if (value === undefined) {
        return null;
    }
    return { view, props: { value, columns: owner.columns, disabled: boolAttribute(part, "disabled") } };
}
/** One `<td>`: a date, a month, a year, or a week number. */
export class UIDatePickerTableCell extends TextPart {
    static { this.observedAttributes = ["value", "disabled", "week-index"]; }
    propsFor(api, owner) {
        const args = cellArgs(this, api, owner);
        if (!args) {
            return null;
        }
        switch (args.view) {
            case "day":
                return api.getDayTableCellProps({ value: args.value });
            case "month":
                return api.getMonthTableCellProps(args.props);
            case "year":
                return api.getYearTableCellProps(args.props);
            case "week":
                return api.getWeekNumberCellProps({ weekIndex: args.weekIndex, week: args.week });
        }
    }
    render(api) {
        super.render(api);
        const owner = this.owner;
        const args = owner ? cellArgs(this, api, owner) : null;
        if (args?.view === "week") {
            this.write(String(api.getWeekNumber(args.week)));
        }
    }
}
/**
 * The element inside the cell that takes the click and the focus. The text is
 * the day number, or the label the table read off Zag's month or year grid.
 */
export class UIDatePickerTableCellTrigger extends TextPart {
    static { this.observedAttributes = ["value", "label", "disabled"]; }
    propsFor(api, owner) {
        const args = cellArgs(this, api, owner);
        if (!args) {
            return null;
        }
        switch (args.view) {
            case "day":
                return api.getDayTableCellTriggerProps({ value: args.value });
            case "month":
                return api.getMonthTableCellTriggerProps(args.props);
            case "year":
                return api.getYearTableCellTriggerProps(args.props);
            case "week":
                return null;
        }
    }
    render(api) {
        super.render(api);
        const owner = this.owner;
        const args = owner ? cellArgs(this, api, owner) : null;
        if (!args) {
            return;
        }
        if (args.view === "day") {
            this.write(String(args.value.day));
            return;
        }
        if (args.view !== "week") {
            this.write(this.getAttribute("label") ?? String(args.props.value));
        }
    }
}
//# sourceMappingURL=grid.js.map