import type * as tabs from "@zag-js/tabs";
import { ZagPart } from "../core/part";
import type { UITabs } from "./root";
type Props = Record<string, unknown>;
export type UITabsPart = ZagPart<tabs.Api, UITabs>;
/**
 * Every tabs part registers with the root.
 *
 * Unlike the accordion there is nothing in between: a trigger lives inside the
 * list and its panel is a sibling of the list, so the two are in different
 * subtrees and each carries its own `value`.
 */
declare abstract class TabsPart extends ZagPart<tabs.Api, UITabs> {
    protected get ownerBrand(): symbol;
    protected register(owner: UITabs): void;
    protected unregister(owner: UITabs): void;
}
/**
 * Not optional, and not decoration. Zag puts the arrow, Home and End handling
 * on the list, guarded by a `contains` check, so a trigger only responds to the
 * keyboard while it is a descendant of this element. Both trigger and content
 * also carry `data-ownedby` pointing at this element's id.
 */
export declare class UITabsList extends TabsPart {
    protected get idKey(): string;
    protected propsFor(api: tabs.Api): Props;
}
export declare class UITabsTrigger extends TabsPart {
    #private;
    static readonly observedAttributes: string[];
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
    /** Named by value: Zag's `ids.trigger` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: tabs.Api): Props | null;
    /**
     * Zag hands this part a roving `tabindex`, so a plain container is reachable
     * with the arrow keys. What it has no handler for at all is activation:
     * `getTriggerProps` returns `onClick`, `onFocus` and `onBlur` and no key
     * handler, so nothing turns Enter or Space into a click except a real
     * `<button>`. A container trigger can be focused and never used.
     */
    render(api: tabs.Api): void;
}
export declare class UITabsContent extends TabsPart {
    static readonly observedAttributes: string[];
    /** Reflected, for the reason given on the trigger. */
    get value(): string | null;
    set value(next: string | null);
    /** Named by value, like the trigger. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: tabs.Api): Props | null;
}
/**
 * A single element for the whole component, not one per tab. Zag measures the
 * selected trigger and writes the rect out as custom properties, so the CSS
 * that draws it is entirely yours: this part supplies `--left`, `--top`,
 * `--width` and `--height`, plus `position: absolute`.
 */
export declare class UITabsIndicator extends TabsPart {
    protected get idKey(): string;
    protected propsFor(api: tabs.Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map