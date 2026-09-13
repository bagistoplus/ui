import type * as datePicker from "@zag-js/date-picker";
import { ZagPart } from "../core/part";
import { DATE_PICKER_TABLE } from "./brands";
import type { UIDatePicker } from "./root";
type Props = Record<string, unknown>;
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
export declare class UIDatePickerTable extends ZagPart<datePicker.Api, UIDatePicker> {
    #private;
    static readonly observedAttributes: string[];
    get [DATE_PICKER_TABLE](): true;
    get view(): datePicker.DateView;
    /** Cells per row in the month and year views. Zag's day view has seven. */
    get columns(): number | undefined;
    /** `short` or `long` month names in the month view. */
    get format(): "short" | "long" | undefined;
    protected get ownerBrand(): symbol;
    protected register(owner: UIDatePicker): void;
    protected unregister(owner: UIDatePicker): void;
    /** The host carries nothing of Zag's: the table props go on the `<table>`. */
    protected propsFor(): Props;
    render(api: datePicker.Api): void;
    protected release(): void;
}
export {};
//# sourceMappingURL=table.d.ts.map