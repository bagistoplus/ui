import { boolAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { MENU_ITEM, MENU_ITEM_GROUP, MENU_ROOT } from "./brands";
/**
 * Most parts register with the root. The nearest one: inside a submenu that is
 * the submenu, which is what makes a submenu's trigger and content its own.
 */
class MenuPart extends ZagPart {
    get ownerBrand() {
        return MENU_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/** The text and the indicator hang off the item, whose value they render. */
class ItemPart extends ZagPart {
    get ownerBrand() {
        return MENU_ITEM;
    }
    register(owner) {
        owner.registerPart(this);
    }
    unregister(owner) {
        owner.unregisterPart(this);
    }
}
/** The label hangs off its group. */
class GroupPart extends ZagPart {
    get ownerBrand() {
        return MENU_ITEM_GROUP;
    }
    register(owner) {
        owner.registerPart(this);
    }
    unregister(owner) {
        owner.unregisterPart(this);
    }
}
/**
 * Reflected `value`, for the reason the popover trigger gives: a framework
 * that renders these elements tests `key in el` before choosing between a
 * property write and `setAttribute`, and a getter-only property swallows it.
 */
function reflectValue(el, next) {
    if (next == null) {
        el.removeAttribute("value");
        return;
    }
    el.setAttribute("value", next);
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
export class UIMenuTrigger extends MenuPart {
    static { this.observedAttributes = ["value"]; }
    #warned = false;
    /** Only while this trigger has no `value`; Zag derives a valued trigger's id from it. */
    get idKey() {
        return this.value == null ? "trigger" : undefined;
    }
    get value() {
        return this.getAttribute("value");
    }
    set value(next) {
        reflectValue(this, next);
    }
    propsFor(api, owner) {
        const parentApi = owner.parentMenu?.api;
        if (parentApi) {
            return parentApi.getTriggerItemProps(api);
        }
        const value = this.value;
        return (value == null ? api.getTriggerProps() : api.getTriggerProps({ value }));
    }
    /** Unreachable as a container, for the reason every trigger gives. */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot open the menu.`);
        }
        super.render(api);
    }
}
/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export class UIMenuIndicator extends MenuPart {
    propsFor(api) {
        return api.getIndicatorProps();
    }
}
export class UIMenuPositioner extends MenuPart {
    get idKey() {
        return "positioner";
    }
    propsFor(api) {
        return api.getPositionerProps();
    }
}
/**
 * Presence on by default, like the popover's: one content per menu, so the
 * switch belongs on the element it governs and the cost is one machine.
 */
export class UIMenuContent extends MenuPart {
    static { this.observedAttributes = ["presence"]; }
    #presence;
    get idKey() {
        return "content";
    }
    get presenceEnabled() {
        return boolAttribute(this, "presence") ?? true;
    }
    propsFor(api) {
        return api.getContentProps();
    }
    render(api) {
        const owner = this.owner;
        if (!owner) {
            return;
        }
        if (!this.presenceEnabled) {
            this.#presence?.stop();
            this.#presence = undefined;
            super.render(api);
            return;
        }
        const props = this.propsFor(api);
        const node = this.delegation.target();
        if (!node) {
            return;
        }
        this.#presence ??= new PresenceController(() => owner.scheduleRender());
        this.delegation.apply(this.#presence.decorate(node, props, api.open), this.scopeFor(owner));
    }
    release() {
        this.#presence?.stop();
        this.#presence = undefined;
        super.release();
    }
}
/** Must be inside the positioner, where floating-ui finds `data-part="arrow"`. */
export class UIMenuArrow extends MenuPart {
    get idKey() {
        return "arrow";
    }
    propsFor(api) {
        return api.getArrowProps();
    }
}
export class UIMenuArrowTip extends MenuPart {
    propsFor(api) {
        return api.getArrowTipProps();
    }
}
export class UIMenuSeparator extends MenuPart {
    propsFor(api) {
        return api.getSeparatorProps();
    }
}
/**
 * A menu item, and with `delegate` the link it wraps: Zag's menu has no link
 * part, so `<ui-menu-item value delegate><a href>` is how an item navigates.
 */
export class UIMenuItem extends MenuPart {
    static { this.observedAttributes = ["value", "disabled", "value-text", "close-on-select"]; }
    get [MENU_ITEM]() {
        return true;
    }
    get value() {
        return this.getAttribute("value");
    }
    set value(next) {
        reflectValue(this, next);
    }
    get disabled() {
        return this.hasAttribute("disabled");
    }
    set disabled(next) {
        this.toggleAttribute("disabled", Boolean(next));
    }
    propsFor(api) {
        const value = this.value;
        if (!value) {
            return null;
        }
        return api.getItemProps({
            value,
            disabled: this.disabled,
            valueText: this.getAttribute("value-text") ?? undefined,
            closeOnSelect: boolAttribute(this, "close-on-select"),
        });
    }
}
export class UIMenuItemText extends ItemPart {
    propsFor(api, item) {
        const value = item.value;
        return value ? api.getItemTextProps({ value, disabled: item.disabled }) : null;
    }
}
export class UIMenuItemIndicator extends ItemPart {
    propsFor(api, item) {
        const value = item.value;
        return value ? api.getItemIndicatorProps({ value, disabled: item.disabled }) : null;
    }
}
/** `value` names the group; Zag builds the element ids for it and its label from that. */
export class UIMenuItemGroup extends MenuPart {
    static { this.observedAttributes = ["value"]; }
    get [MENU_ITEM_GROUP]() {
        return true;
    }
    get value() {
        return this.getAttribute("value");
    }
    set value(next) {
        reflectValue(this, next);
    }
    propsFor(api) {
        const value = this.value;
        return value ? api.getItemGroupProps({ id: value }) : null;
    }
}
export class UIMenuItemGroupLabel extends GroupPart {
    propsFor(api, group) {
        const value = group.value;
        return value ? api.getItemGroupLabelProps({ htmlFor: value }) : null;
    }
}
//# sourceMappingURL=parts.js.map