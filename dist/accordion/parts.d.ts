import type * as accordion from "@zag-js/accordion";
import { ZagPart } from "../core/part";
import type { UIAccordionItem } from "./item";
type Props = Record<string, unknown>;
export type UIAccordionPart = ZagPart<accordion.Api, UIAccordionItem>;
/** The accordion's parts all hang off the item, not off the root. */
declare abstract class ItemPart extends ZagPart<accordion.Api, UIAccordionItem> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIAccordionItem): void;
    protected unregister(owner: UIAccordionItem): void;
}
export declare class UIAccordionItemTrigger extends ItemPart {
    #private;
    /** Named by the item's value: Zag's `ids.itemTrigger` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null;
    /**
     * The one part that has no usable container form. Zag's trigger props say
     * `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus
     * rings and disabled pointer blocking come from the browser, and only a real
     * `<button>` provides them. There is no `tabindex` either, so a container
     * trigger is not even reachable.
     */
    render(api: accordion.Api): void;
}
export declare class UIAccordionItemIndicator extends ItemPart {
    protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null;
}
export declare class UIAccordionItemContent extends ItemPart {
    #private;
    /** Named by the item's value, like the trigger. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null;
    render(api: accordion.Api): void;
    protected release(): void;
}
export {};
//# sourceMappingURL=parts.d.ts.map