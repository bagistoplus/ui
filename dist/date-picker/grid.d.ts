import type * as datePicker from "@zag-js/date-picker";
import { ZagPart } from "../core/part";
import type { UIDatePickerTable } from "./table";
type Props = Record<string, unknown>;
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
declare abstract class GridPart extends ZagPart<datePicker.Api, UIDatePickerTable> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIDatePickerTable): void;
    protected unregister(owner: UIDatePickerTable): void;
}
/** Keeps one text node of its own in the target, so a template's own children stay. */
declare abstract class TextPart extends GridPart {
    #private;
    protected write(text: string): void;
}
export declare class UIDatePickerTableHead extends GridPart {
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props;
}
export declare class UIDatePickerTableBody extends GridPart {
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props;
}
export declare class UIDatePickerTableRow extends GridPart {
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props;
}
/**
 * One weekday, by `index` into `api.weekDays`, or the week number column
 * under `week`. Zag's header props carry no label, so the long name goes on
 * `aria-label` and the narrow one is the text.
 */
export declare class UIDatePickerTableHeader extends TextPart {
    #private;
    static readonly observedAttributes: string[];
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props | null;
    render(api: datePicker.Api): void;
}
/** One `<td>`: a date, a month, a year, or a week number. */
export declare class UIDatePickerTableCell extends TextPart {
    static readonly observedAttributes: string[];
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props | null;
    render(api: datePicker.Api): void;
}
/**
 * The element inside the cell that takes the click and the focus. The text is
 * the day number, or the label the table read off Zag's month or year grid.
 */
export declare class UIDatePickerTableCellTrigger extends TextPart {
    static readonly observedAttributes: string[];
    protected propsFor(api: datePicker.Api, owner: UIDatePickerTable): Props | null;
    render(api: datePicker.Api): void;
}
export {};
//# sourceMappingURL=grid.d.ts.map