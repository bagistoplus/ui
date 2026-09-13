import type * as menu from "@zag-js/menu";
import { ZagPart } from "../core/part";
import { MENU_ITEM, MENU_ITEM_GROUP } from "./brands";
import type { UIMenu } from "./root";
type Props = Record<string, unknown>;
export type UIMenuPart = ZagPart<menu.Api, UIMenu>;
/**
 * Most parts register with the root. The nearest one: inside a submenu that is
 * the submenu, which is what makes a submenu's trigger and content its own.
 */
declare abstract class MenuPart extends ZagPart<menu.Api, UIMenu> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIMenu): void;
    protected unregister(owner: UIMenu): void;
}
/** The text and the indicator hang off the item, whose value they render. */
declare abstract class ItemPart extends ZagPart<menu.Api, UIMenuItem> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIMenuItem): void;
    protected unregister(owner: UIMenuItem): void;
}
/** The label hangs off its group. */
declare abstract class GroupPart extends ZagPart<menu.Api, UIMenuItemGroup> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIMenuItemGroup): void;
    protected unregister(owner: UIMenuItemGroup): void;
}
/**
 * The trigger of a menu, and the trigger item of a submenu: one element.
 *
 * Zag already keys the part on `isSubmenu` inside `getTriggerProps`. What a
 * submenu's trigger needs on top is the parent's item props, and Zag merges
 * those in `getTriggerItemProps(childApi)`, which is a parent api call. The
 * owner knows its parent, so the decision is made here rather than by a second
 * element whose only difference would be its name.
 */
export declare class UIMenuTrigger extends MenuPart {
    #private;
    static readonly observedAttributes: string[];
    /** Only while this trigger has no `value`; Zag derives a valued trigger's id from it. */
    protected get idKey(): string | undefined;
    get value(): string | null;
    set value(next: string | null);
    protected propsFor(api: menu.Api, owner: UIMenu): Props;
    /** Unreachable as a container, for the reason every trigger gives. */
    render(api: menu.Api): void;
}
/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export declare class UIMenuIndicator extends MenuPart {
    protected propsFor(api: menu.Api): Props;
}
export declare class UIMenuPositioner extends MenuPart {
    protected get idKey(): string;
    protected propsFor(api: menu.Api): Props;
}
/**
 * Presence on by default, like the popover's: one content per menu, so the
 * switch belongs on the element it governs and the cost is one machine.
 */
export declare class UIMenuContent extends MenuPart {
    #private;
    static readonly observedAttributes: string[];
    protected get idKey(): string;
    get presenceEnabled(): boolean;
    protected propsFor(api: menu.Api): Props;
    render(api: menu.Api): void;
    protected release(): void;
}
/** Must be inside the positioner, where floating-ui finds `data-part="arrow"`. */
export declare class UIMenuArrow extends MenuPart {
    protected get idKey(): string;
    protected propsFor(api: menu.Api): Props;
}
export declare class UIMenuArrowTip extends MenuPart {
    protected propsFor(api: menu.Api): Props;
}
export declare class UIMenuSeparator extends MenuPart {
    protected propsFor(api: menu.Api): Props;
}
/**
 * A menu item, and with `delegate` the link it wraps: Zag's menu has no link
 * part, so `<ui-menu-item value delegate><a href>` is how an item navigates.
 */
export declare class UIMenuItem extends MenuPart {
    static readonly observedAttributes: string[];
    get [MENU_ITEM](): true;
    get value(): string | null;
    set value(next: string | null);
    get disabled(): boolean;
    set disabled(next: boolean);
    protected propsFor(api: menu.Api): Props | null;
}
export declare class UIMenuItemText extends ItemPart {
    protected propsFor(api: menu.Api, item: UIMenuItem): Props | null;
}
export declare class UIMenuItemIndicator extends ItemPart {
    protected propsFor(api: menu.Api, item: UIMenuItem): Props | null;
}
/** `value` names the group; Zag builds the element ids for it and its label from that. */
export declare class UIMenuItemGroup extends MenuPart {
    static readonly observedAttributes: string[];
    get [MENU_ITEM_GROUP](): true;
    get value(): string | null;
    set value(next: string | null);
    protected propsFor(api: menu.Api): Props | null;
}
export declare class UIMenuItemGroupLabel extends GroupPart {
    protected propsFor(api: menu.Api, group: UIMenuItemGroup): Props | null;
}
export {};
//# sourceMappingURL=parts.d.ts.map