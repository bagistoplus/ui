import type * as datePicker from "@zag-js/date-picker";
import { ZagPart } from "../core/part";
import { DATE_PICKER_VIEW } from "./brands";
import type { UIDatePicker } from "./root";
type Props = Record<string, unknown>;
/**
 * One of the three calendars: `day`, `month` or `year`. Zag hides every view
 * but the current one, so all three sit in the content at once.
 *
 * Not a collection layer. The parts inside register with the root like any
 * other and read their `view` from here through `viewOf`, so a part written
 * outside any view is the day view with no special case.
 */
export declare class UIDatePickerView extends ZagPart<datePicker.Api, UIDatePicker> {
    static readonly observedAttributes: string[];
    get [DATE_PICKER_VIEW](): true;
    /**
     * Reflected, for the reason the accordion item gives for `value`: a
     * framework that renders these elements tests `key in el` before choosing
     * between a property write and `setAttribute`, and a getter-only property
     * swallows the write.
     */
    get view(): string | null;
    set view(next: string | null);
    protected get ownerBrand(): symbol;
    protected register(owner: UIDatePicker): void;
    protected unregister(owner: UIDatePicker): void;
    protected propsFor(api: datePicker.Api): Props | null;
}
/** The view a part belongs to: the nearest `ui-date-picker-view`, or the day view. */
export declare function viewOf(part: Element): datePicker.DateView;
export {};
//# sourceMappingURL=view.d.ts.map