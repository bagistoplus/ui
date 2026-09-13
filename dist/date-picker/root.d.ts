import * as datePicker from "@zag-js/date-picker";
import type { DateValue } from "@zag-js/date-picker";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { DATE_PICKER_ROOT } from "./brands";
type Unavailable = (date: DateValue, locale: string) => boolean;
/**
 * A date picker's configuration is Zag's props, kebab-cased. Dates are ISO,
 * `YYYY-MM-DD`; lists of them are comma separated. A date that does not parse
 * is dropped with a warning, so the machine keeps its own default for it.
 *
 * `ids` are frozen when the machine is built, one frame after the root
 * connects, so an authored id is honored for parts in the initial markup and
 * not for one appended later.
 *
 * `open-on-focus` is the one behavior Zag does not have. Zag opens from the
 * trigger, and from a click on the input under `open-on-click`; the input part
 * adds focus arriving from outside the picker, so a shopper who tabs into the
 * field sees the days it takes instead of typing one it refuses.
 */
export declare class UIDatePicker extends ZagRootElement<datePicker.Props, datePicker.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [DATE_PICKER_ROOT](): true;
    /**
     * A rule of your own. Set, it replaces the one built from
     * `unavailable-dates` and `unavailable-weekdays`; set back to `null`, the
     * lists apply again.
     */
    get isDateUnavailable(): Unavailable | null;
    set isDateUnavailable(next: Unavailable | null | undefined);
    get openOnFocus(): boolean;
    protected get componentName(): string;
    protected get valueKeyedIds(): readonly string[];
    protected createMachine(props: () => datePicker.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): datePicker.Api;
    protected machineProps(): datePicker.Props;
}
export {};
//# sourceMappingURL=root.d.ts.map