import type * as accordion from "@zag-js/accordion";
import { ZagPart } from "../core/part";
import { ACCORDION_ITEM } from "./brands";
import type { UIAccordion } from "./root";
type Props = Record<string, unknown>;
/**
 * The collection layer: one value, and the parts that render it.
 *
 * It is an ordinary part that happens to own parts. Its own owner is the root,
 * and `data-part="item"` is as much a part as `data-part="item-trigger"` is.
 */
export declare class UIAccordionItem extends ZagPart<accordion.Api, UIAccordion> {
    static readonly observedAttributes: string[];
    get [ACCORDION_ITEM](): true;
    get root(): UIAccordion | null;
    /**
     * Reflected, because a property assignment must reach the attribute.
     *
     * Any framework that renders these elements decides between `setAttribute`
     * and a property assignment by testing `key in el`, so declaring a getter is
     * what makes `value` a property in the first place. Without a setter the
     * write lands on a getter-only property and is lost, leaving the element with
     * no value at all: Vue's client-side render does exactly this, so the markup
     * works from server HTML and silently does nothing after a route change.
     */
    get value(): string | null;
    set value(next: string | null);
    get disabled(): boolean;
    set disabled(next: boolean);
    protected get ownerBrand(): symbol;
    protected register(owner: UIAccordion): void;
    protected unregister(owner: UIAccordion): void;
    /** Named by value: Zag's `ids.item` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: accordion.Api): Props | null;
}
export {};
//# sourceMappingURL=item.d.ts.map