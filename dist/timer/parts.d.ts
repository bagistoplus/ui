import type * as timer from "@zag-js/timer";
import { ZagPart } from "../core/part";
import type { UITimerItem } from "./item";
import type { UITimer } from "./root";
type Props = Record<string, unknown>;
/** The area, the control, the separator and the triggers hang off the root. */
declare abstract class TimerPart extends ZagPart<timer.Api, UITimer> {
    protected get ownerBrand(): symbol;
    protected register(owner: UITimer): void;
    protected unregister(owner: UITimer): void;
}
/** The value and the label hang off their item, which knows the type. */
declare abstract class ItemPart extends ZagPart<timer.Api, UITimerItem> {
    protected get ownerBrand(): symbol;
    protected register(owner: UITimerItem): void;
    protected unregister(owner: UITimerItem): void;
}
/** `role="timer"`, with the label Zag rebuilds on every tick. */
export declare class UITimerArea extends TimerPart {
    protected get idKey(): string;
    protected propsFor(api: timer.Api): Props;
}
export declare class UITimerControl extends TimerPart {
    protected propsFor(api: timer.Api): Props;
}
export declare class UITimerSeparator extends TimerPart {
    protected propsFor(api: timer.Api): Props;
}
/**
 * Always `delegate`, wrapping a `<button>`. Zag writes `type="button"`, hides
 * the trigger while its action makes no sense, and answers a click; Enter,
 * Space and the focus ring come from a real button. Zag throws on an action
 * it does not know, so an unknown one renders nothing instead.
 */
export declare class UITimerActionTrigger extends TimerPart {
    #private;
    static readonly observedAttributes: string[];
    get action(): string | null;
    set action(next: string | null);
    protected propsFor(api: timer.Api): Props | null;
    render(api: timer.Api): void;
}
/**
 * Zag's props for this part are data attributes. The text is
 * `api.formattedTime[type]`, and a part whose whole meaning is a string
 * writes it, into the element that takes the props.
 */
export declare class UITimerItemValue extends ItemPart {
    protected propsFor(api: timer.Api, item: UITimerItem): Props | null;
    render(api: timer.Api): void;
}
export declare class UITimerItemLabel extends ItemPart {
    protected propsFor(api: timer.Api, item: UITimerItem): Props | null;
}
export {};
//# sourceMappingURL=parts.d.ts.map