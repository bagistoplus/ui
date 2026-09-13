import type * as timer from "@zag-js/timer";
import { ZagPart } from "../core/part";
import { TIMER_ITEM } from "./brands";
import type { UITimer } from "./root";
type Props = Record<string, unknown>;
/**
 * The collection layer: one time part, and the parts that render it.
 *
 * An ordinary part that owns parts, as the accordion item is. Zag's item
 * getters all take the type, and the value and the label under an item read
 * it from here rather than repeating it.
 */
export declare class UITimerItem extends ZagPart<timer.Api, UITimer> {
    static readonly observedAttributes: string[];
    get [TIMER_ITEM](): true;
    /**
     * Reflected, for the reason the accordion item gives for `value`: a
     * framework that renders these elements tests `key in el` before choosing
     * between a property write and `setAttribute`, and a getter-only property
     * swallows the write.
     */
    get type(): string | null;
    set type(next: string | null);
    /** Zag's time part, or `undefined` while `type` is missing or unknown. */
    get timePart(): timer.TimePart | undefined;
    protected get ownerBrand(): symbol;
    protected register(owner: UITimer): void;
    protected unregister(owner: UITimer): void;
    protected propsFor(api: timer.Api): Props | null;
}
export {};
//# sourceMappingURL=item.d.ts.map