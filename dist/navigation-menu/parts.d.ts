import type * as navigationMenu from "@zag-js/navigation-menu";
import { ZagPart } from "../core/part";
import { NAVIGATION_MENU_CONTENT, NAVIGATION_MENU_ITEM } from "./brands";
import type { UINavigationMenu } from "./root";
type Props = Record<string, unknown>;
export type UINavigationMenuPart = ZagPart<navigationMenu.Api, UINavigationMenu>;
/**
 * Parts that hang off the root. The list, the item, and everything that may
 * live outside an item: in viewport mode a content sits under the viewport,
 * not under the item that opens it, and a link can be inside any content.
 */
declare abstract class RootPart extends ZagPart<navigationMenu.Api, UINavigationMenu> {
    protected get ownerBrand(): symbol;
    protected register(owner: UINavigationMenu): void;
    protected unregister(owner: UINavigationMenu): void;
}
/** Parts that only make sense inside an item, and read its value. */
declare abstract class ItemPart extends ZagPart<navigationMenu.Api, UINavigationMenuItem> {
    protected get ownerBrand(): symbol;
    protected register(owner: UINavigationMenuItem): void;
    protected unregister(owner: UINavigationMenuItem): void;
}
export declare class UINavigationMenuList extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: navigationMenu.Api): Props;
}
/**
 * The collection layer: one value, and the trigger, proxies and indicator
 * that render it. A content is not among them, because in viewport mode it
 * lives elsewhere; it names the item by `value` instead.
 */
export declare class UINavigationMenuItem extends RootPart {
    static readonly observedAttributes: string[];
    get [NAVIGATION_MENU_ITEM](): true;
    get value(): string | null;
    set value(next: string | null);
    get disabled(): boolean;
    set disabled(next: boolean);
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: navigationMenu.Api): Props | null;
}
export declare class UINavigationMenuTrigger extends ItemPart {
    #private;
    /** Named by the item's value: Zag's `ids.trigger` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null;
    /** Unreachable as a container, for the reason every trigger gives. */
    render(api: navigationMenu.Api): void;
}
/**
 * A visually hidden focus stop after the trigger, for viewport mode: Tab from
 * the trigger lands here and Zag moves focus into the content, wherever the
 * viewport put it in the DOM.
 */
export declare class UINavigationMenuTriggerProxy extends ItemPart {
    protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null;
}
/** Points `aria-owns` at the content, so the tree reads it as the item's. */
export declare class UINavigationMenuViewportProxy extends ItemPart {
    protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null;
}
export declare class UINavigationMenuItemIndicator extends ItemPart {
    protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null;
}
/**
 * A link, inside a content or as the whole item. Always `delegate`, wrapping
 * the `<a>`: Zag focuses links directly for the arrow keys, and `aria-current`
 * belongs on the anchor.
 */
export declare class UINavigationMenuLink extends RootPart {
    #private;
    static readonly observedAttributes: string[];
    get value(): string | null;
    set value(next: string | null);
    protected propsFor(api: navigationMenu.Api): Props | null;
    render(api: navigationMenu.Api): void;
}
/**
 * Presence is opt in here, unlike the viewport's: there is one content per
 * item, so one switch on each panel that animates beats N machines nobody
 * asked for. Keyed on `api.value === value`, not on Zag's own `hidden`, which
 * in viewport mode also covers the previous value: presence is what holds the
 * previous panel through its exit, and its `exitcomplete` is what Zag listens
 * for to let go of `previousValue`.
 */
export declare class UINavigationMenuContent extends RootPart {
    #private;
    static readonly observedAttributes: string[];
    get [NAVIGATION_MENU_CONTENT](): true;
    /** The written value, or the enclosing item's. */
    get value(): string | null;
    set value(next: string | null);
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    get presenceEnabled(): boolean;
    protected propsFor(api: navigationMenu.Api): Props | null;
    render(api: navigationMenu.Api): void;
    protected release(): void;
}
/**
 * Not `align`. That is a legacy presentational attribute, and the browser maps
 * `align="center"` on any HTML element to `text-align: center`, custom
 * elements included. The panel's text went centred with it.
 */
export declare class UINavigationMenuViewportPositioner extends RootPart {
    static readonly observedAttributes: string[];
    protected propsFor(api: navigationMenu.Api): Props;
}
/**
 * The one shared surface of viewport mode. Presence on by default, as for
 * every part there is exactly one of.
 */
export declare class UINavigationMenuViewport extends RootPart {
    #private;
    static readonly observedAttributes: string[];
    protected get idKey(): string;
    get presenceEnabled(): boolean;
    protected propsFor(api: navigationMenu.Api): Props;
    render(api: navigationMenu.Api): void;
    protected release(): void;
}
/** Zag measures the active trigger and writes `--trigger-*` on the root for this. */
export declare class UINavigationMenuIndicator extends RootPart {
    protected propsFor(api: navigationMenu.Api): Props;
}
export declare class UINavigationMenuArrow extends RootPart {
    protected propsFor(api: navigationMenu.Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map