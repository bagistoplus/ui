import type * as datePicker from "@zag-js/date-picker";
import { ZagPart } from "../core/part";
import type { UIDatePicker } from "./root";
type Props = Record<string, unknown>;
export type UIDatePickerPart = ZagPart<datePicker.Api, UIDatePicker>;
/** Every authored part registers with the root, the view-scoped ones included. */
declare abstract class RootPart extends ZagPart<datePicker.Api, UIDatePicker> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIDatePicker): void;
    protected unregister(owner: UIDatePicker): void;
}
/**
 * A part that only works as a real form element under `delegate`: a button
 * for Enter, Space, the focus ring and disabled pointer blocking, an input
 * for typing and submitting, a select for its options. Warned once.
 */
declare abstract class DelegatedPart extends RootPart {
    #private;
    protected abstract get child(): string;
    protected abstract get consequence(): string;
    render(api: datePicker.Api): void;
}
declare abstract class ButtonPart extends DelegatedPart {
    protected get child(): string;
}
export declare class UIDatePickerLabel extends RootPart {
    static readonly observedAttributes: string[];
    /** Which input this label names, in range mode. */
    get index(): number;
    protected get idKey(): string;
    protected get idValue(): string;
    protected propsFor(api: datePicker.Api): Props;
}
export declare class UIDatePickerControl extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: datePicker.Api): Props;
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag reads what was typed from the
 * element, writes the formatted date back into it and names it for the form.
 *
 * Under `open-on-focus`, focus arriving from outside the picker opens it.
 * Closing the calendar puts focus back on this field, which would otherwise
 * reopen what the shopper just answered, so focus arriving from inside the
 * picker opens nothing. A click reopens it after that, because the field
 * already holds the focus by then and fires no second focus event.
 */
export declare class UIDatePickerInput extends DelegatedPart {
    static readonly observedAttributes: string[];
    get index(): number;
    protected get child(): string;
    protected get consequence(): string;
    protected get idKey(): string;
    protected get idValue(): string;
    protected propsFor(api: datePicker.Api, owner: UIDatePicker): Props;
}
export declare class UIDatePickerTrigger extends ButtonPart {
    protected get consequence(): string;
    protected get idKey(): string;
    protected propsFor(api: datePicker.Api): Props;
}
/** Zag hides it while nothing is selected. */
export declare class UIDatePickerClearTrigger extends ButtonPart {
    protected get consequence(): string;
    protected get idKey(): string;
    protected propsFor(api: datePicker.Api): Props;
}
/**
 * floating-ui owns part of this element's inline style, as it does for the
 * popover's positioner: do not write `transform`, `top` or `left` on it.
 */
export declare class UIDatePickerPositioner extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: datePicker.Api): Props;
}
/** Presence on by default, for the reason the popover content gives. */
export declare class UIDatePickerContent extends RootPart {
    #private;
    static readonly observedAttributes: string[];
    protected get idKey(): string;
    get presenceEnabled(): boolean;
    protected propsFor(api: datePicker.Api): Props;
    render(api: datePicker.Api): void;
    protected release(): void;
}
/**
 * Always `delegate`, wrapping a `<select>` the component fills. Zag's props
 * carry `defaultValue`, which a `<select>` does not have as a property, so the
 * visible month or year is written as `value` here after the options.
 */
declare abstract class SelectPart extends DelegatedPart {
    protected get child(): string;
    protected get consequence(): string;
    protected abstract cells(api: datePicker.Api): datePicker.Cell[];
    protected abstract current(api: datePicker.Api): number;
    render(api: datePicker.Api): void;
}
export declare class UIDatePickerMonthSelect extends SelectPart {
    protected get idKey(): string;
    protected cells(api: datePicker.Api): datePicker.Cell[];
    protected current(api: datePicker.Api): number;
    protected propsFor(api: datePicker.Api): Props;
}
export declare class UIDatePickerYearSelect extends SelectPart {
    protected get idKey(): string;
    protected cells(api: datePicker.Api): datePicker.Cell[];
    protected current(api: datePicker.Api): number;
    protected propsFor(api: datePicker.Api): Props;
}
/**
 * `value` is one of Zag's preset names, `last7Days` or `thisMonth`, or two
 * ISO dates as a comma list. Anything that reads as a date is taken as one.
 */
export declare class UIDatePickerPresetTrigger extends ButtonPart {
    static readonly observedAttributes: string[];
    get value(): string | null;
    set value(next: string | null);
    protected get consequence(): string;
    protected propsFor(api: datePicker.Api): Props | null;
}
export declare class UIDatePickerViewControl extends RootPart {
    protected propsFor(api: datePicker.Api): Props;
}
/** Switches to the next larger view; Zag disables it at `max-view`. */
export declare class UIDatePickerViewTrigger extends ButtonPart {
    protected get consequence(): string;
    protected get idKey(): string;
    protected get idValue(): string;
    protected propsFor(api: datePicker.Api): Props;
}
export declare class UIDatePickerPrevTrigger extends ButtonPart {
    protected get consequence(): string;
    protected get idKey(): string;
    protected get idValue(): string;
    protected propsFor(api: datePicker.Api): Props;
}
export declare class UIDatePickerNextTrigger extends ButtonPart {
    protected get consequence(): string;
    protected get idKey(): string;
    protected get idValue(): string;
    protected propsFor(api: datePicker.Api): Props;
}
/**
 * Zag's props for this part are data attributes. The text is
 * `api.visibleRangeText`, the month in the day view, the year in the month
 * view, the decade in the year view, and a part whose whole meaning is a
 * string writes it. Zag's `formatted` reads `start - end` in range mode even
 * when one month is visible, so the two are collapsed when they are equal.
 */
export declare class UIDatePickerRangeText extends RootPart {
    protected propsFor(api: datePicker.Api): Props;
    render(api: datePicker.Api): void;
}
export {};
//# sourceMappingURL=parts.d.ts.map