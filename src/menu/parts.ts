import type * as menu from "@zag-js/menu";

import { boolAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { MENU_ITEM, MENU_ITEM_GROUP, MENU_ROOT } from "./brands";
import type { UIMenu } from "./root";

type Props = Record<string, unknown>;

export type UIMenuPart = ZagPart<menu.Api, UIMenu>;

/**
 * Most parts register with the root. The nearest one: inside a submenu that is
 * the submenu, which is what makes a submenu's trigger and content its own.
 */
abstract class MenuPart extends ZagPart<menu.Api, UIMenu> {
  protected get ownerBrand(): symbol {
    return MENU_ROOT;
  }

  protected register(owner: UIMenu): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIMenu): void {
    owner.unregisterChild(this);
  }
}

/** The text and the indicator hang off the item, whose value they render. */
abstract class ItemPart extends ZagPart<menu.Api, UIMenuItem> {
  protected get ownerBrand(): symbol {
    return MENU_ITEM;
  }

  protected register(owner: UIMenuItem): void {
    owner.registerPart(this);
  }

  protected unregister(owner: UIMenuItem): void {
    owner.unregisterPart(this);
  }
}

/** The label hangs off its group. */
abstract class GroupPart extends ZagPart<menu.Api, UIMenuItemGroup> {
  protected get ownerBrand(): symbol {
    return MENU_ITEM_GROUP;
  }

  protected register(owner: UIMenuItemGroup): void {
    owner.registerPart(this);
  }

  protected unregister(owner: UIMenuItemGroup): void {
    owner.unregisterPart(this);
  }
}

/**
 * Reflected `value`, for the reason the popover trigger gives: a framework
 * that renders these elements tests `key in el` before choosing between a
 * property write and `setAttribute`, and a getter-only property swallows it.
 */
function reflectValue(el: HTMLElement, next: string | null): void {
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
  static readonly observedAttributes = ["value"];

  #warned = false;

  /** Only while this trigger has no `value`; Zag derives a valued trigger's id from it. */
  protected override get idKey(): string | undefined {
    return this.value == null ? "trigger" : undefined;
  }

  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    reflectValue(this, next);
  }

  protected propsFor(api: menu.Api, owner: UIMenu): Props {
    const parentApi = owner.parentMenu?.api;

    if (parentApi) {
      return parentApi.getTriggerItemProps(api) as Props;
    }

    const value = this.value;

    return (value == null ? api.getTriggerProps() : api.getTriggerProps({ value })) as Props;
  }

  /** Unreachable as a container, for the reason every trigger gives. */
  override render(api: menu.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one it is not focusable and the keyboard cannot open the menu.`,
      );
    }

    super.render(api);
  }
}

/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export class UIMenuIndicator extends MenuPart {
  protected propsFor(api: menu.Api): Props {
    return api.getIndicatorProps() as Props;
  }
}

export class UIMenuPositioner extends MenuPart {
  protected override get idKey(): string {
    return "positioner";
  }

  protected propsFor(api: menu.Api): Props {
    return api.getPositionerProps() as Props;
  }
}

/**
 * Presence on by default, like the popover's: one content per menu, so the
 * switch belongs on the element it governs and the cost is one machine.
 */
export class UIMenuContent extends MenuPart {
  static readonly observedAttributes = ["presence"];

  #presence: PresenceController | undefined;

  protected override get idKey(): string {
    return "content";
  }

  override get presenceEnabled(): boolean {
    return boolAttribute(this, "presence") ?? true;
  }

  protected propsFor(api: menu.Api): Props {
    return api.getContentProps() as Props;
  }

  override render(api: menu.Api): void {
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

  protected override release(): void {
    this.#presence?.stop();
    this.#presence = undefined;
    super.release();
  }
}

/** Must be inside the positioner, where floating-ui finds `data-part="arrow"`. */
export class UIMenuArrow extends MenuPart {
  protected override get idKey(): string {
    return "arrow";
  }

  protected propsFor(api: menu.Api): Props {
    return api.getArrowProps() as Props;
  }
}

export class UIMenuArrowTip extends MenuPart {
  protected propsFor(api: menu.Api): Props {
    return api.getArrowTipProps() as Props;
  }
}

export class UIMenuSeparator extends MenuPart {
  protected propsFor(api: menu.Api): Props {
    return api.getSeparatorProps() as Props;
  }
}

/**
 * A menu item, and with `delegate` the link it wraps: Zag's menu has no link
 * part, so `<ui-menu-item value delegate><a href>` is how an item navigates.
 */
export class UIMenuItem extends MenuPart {
  static readonly observedAttributes = ["value", "disabled", "value-text", "close-on-select"];

  get [MENU_ITEM](): true {
    return true;
  }

  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    reflectValue(this, next);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(next: boolean) {
    this.toggleAttribute("disabled", Boolean(next));
  }

  protected propsFor(api: menu.Api): Props | null {
    const value = this.value;

    if (!value) {
      return null;
    }

    return api.getItemProps({
      value,
      disabled: this.disabled,
      valueText: this.getAttribute("value-text") ?? undefined,
      closeOnSelect: boolAttribute(this, "close-on-select"),
    }) as Props;
  }
}

export class UIMenuItemText extends ItemPart {
  protected propsFor(api: menu.Api, item: UIMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getItemTextProps({ value, disabled: item.disabled }) as Props) : null;
  }
}

export class UIMenuItemIndicator extends ItemPart {
  protected propsFor(api: menu.Api, item: UIMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getItemIndicatorProps({ value, disabled: item.disabled }) as Props) : null;
  }
}

/** `value` names the group; Zag builds the element ids for it and its label from that. */
export class UIMenuItemGroup extends MenuPart {
  static readonly observedAttributes = ["value"];

  get [MENU_ITEM_GROUP](): true {
    return true;
  }

  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    reflectValue(this, next);
  }

  protected propsFor(api: menu.Api): Props | null {
    const value = this.value;

    return value ? (api.getItemGroupProps({ id: value }) as Props) : null;
  }
}

export class UIMenuItemGroupLabel extends GroupPart {
  protected propsFor(api: menu.Api, group: UIMenuItemGroup): Props | null {
    const value = group.value;

    return value ? (api.getItemGroupLabelProps({ htmlFor: value }) as Props) : null;
  }
}
