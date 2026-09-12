import type * as navigationMenu from "@zag-js/navigation-menu";

import { boolAttribute, findBranded } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { NAVIGATION_MENU_CONTENT, NAVIGATION_MENU_ITEM, NAVIGATION_MENU_ROOT } from "./brands";
import type { UINavigationMenu } from "./root";

type Props = Record<string, unknown>;

export type UINavigationMenuPart = ZagPart<navigationMenu.Api, UINavigationMenu>;

/**
 * Parts that hang off the root. The list, the item, and everything that may
 * live outside an item: in viewport mode a content sits under the viewport,
 * not under the item that opens it, and a link can be inside any content.
 */
abstract class RootPart extends ZagPart<navigationMenu.Api, UINavigationMenu> {
  protected get ownerBrand(): symbol {
    return NAVIGATION_MENU_ROOT;
  }

  protected register(owner: UINavigationMenu): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UINavigationMenu): void {
    owner.unregisterChild(this);
  }
}

/** Parts that only make sense inside an item, and read its value. */
abstract class ItemPart extends ZagPart<navigationMenu.Api, UINavigationMenuItem> {
  protected get ownerBrand(): symbol {
    return NAVIGATION_MENU_ITEM;
  }

  protected register(owner: UINavigationMenuItem): void {
    owner.registerPart(this);
  }

  protected unregister(owner: UINavigationMenuItem): void {
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
 * The value written on the element, or the enclosing item's, or the enclosing
 * content's. A content inside its item needs no value; neither does a link
 * inside either.
 */
function valueOf(el: HTMLElement): string | undefined {
  return (
    el.getAttribute("value") ??
    findBranded<UINavigationMenuItem>(el, NAVIGATION_MENU_ITEM)?.value ??
    findBranded<UINavigationMenuContent>(el, NAVIGATION_MENU_CONTENT)?.value ??
    undefined
  );
}

export class UINavigationMenuList extends RootPart {
  protected override get idKey(): string {
    return "list";
  }

  protected propsFor(api: navigationMenu.Api): Props {
    return api.getListProps() as Props;
  }
}

/**
 * The collection layer: one value, and the trigger, proxies and indicator
 * that render it. A content is not among them, because in viewport mode it
 * lives elsewhere; it names the item by `value` instead.
 */
export class UINavigationMenuItem extends RootPart {
  static readonly observedAttributes = ["value", "disabled"];

  get [NAVIGATION_MENU_ITEM](): true {
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

  protected override get idKey(): string | undefined {
    return this.value ? "item" : undefined;
  }

  protected override get idValue(): string | undefined {
    return this.value ?? undefined;
  }

  protected propsFor(api: navigationMenu.Api): Props | null {
    const value = this.value;

    return value ? (api.getItemProps({ value, disabled: this.disabled }) as Props) : null;
  }
}

export class UINavigationMenuTrigger extends ItemPart {
  #warned = false;

  /** Named by the item's value: Zag's `ids.trigger` is a function of it. */
  protected override get idKey(): string | undefined {
    return this.owner?.value ? "trigger" : undefined;
  }

  protected override get idValue(): string | undefined {
    return this.owner?.value ?? undefined;
  }

  protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getTriggerProps({ value, disabled: item.disabled }) as Props) : null;
  }

  /** Unreachable as a container, for the reason every trigger gives. */
  override render(api: navigationMenu.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one it is not focusable and the keyboard cannot open the panel.`,
      );
    }

    super.render(api);
  }
}

/**
 * A visually hidden focus stop after the trigger, for viewport mode: Tab from
 * the trigger lands here and Zag moves focus into the content, wherever the
 * viewport put it in the DOM.
 */
export class UINavigationMenuTriggerProxy extends ItemPart {
  protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getTriggerProxyProps({ value, disabled: item.disabled }) as Props) : null;
  }
}

/** Points `aria-owns` at the content, so the tree reads it as the item's. */
export class UINavigationMenuViewportProxy extends ItemPart {
  protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getViewportProxyProps({ value, disabled: item.disabled }) as Props) : null;
  }
}

export class UINavigationMenuItemIndicator extends ItemPart {
  protected propsFor(api: navigationMenu.Api, item: UINavigationMenuItem): Props | null {
    const value = item.value;

    return value ? (api.getItemIndicatorProps({ value, disabled: item.disabled }) as Props) : null;
  }
}

/**
 * A link, inside a content or as the whole item. Always `delegate`, wrapping
 * the `<a>`: Zag focuses links directly for the arrow keys, and `aria-current`
 * belongs on the anchor.
 */
export class UINavigationMenuLink extends RootPart {
  static readonly observedAttributes = ["value", "current", "close-on-click"];

  #warned = false;

  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    reflectValue(this, next);
  }

  protected propsFor(api: navigationMenu.Api): Props | null {
    const value = valueOf(this);

    if (!value) {
      return null;
    }

    return api.getLinkProps({
      value,
      current: boolAttribute(this, "current"),
      closeOnClick: boolAttribute(this, "close-on-click"),
    }) as Props;
  }

  override render(api: navigationMenu.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and an <a> child. ` +
          `Without one the arrow keys cannot focus it.`,
      );
    }

    super.render(api);
  }
}

/**
 * Presence is opt in here, unlike the viewport's: there is one content per
 * item, so one switch on each panel that animates beats N machines nobody
 * asked for. Keyed on `api.value === value`, not on Zag's own `hidden`, which
 * in viewport mode also covers the previous value: presence is what holds the
 * previous panel through its exit, and its `exitcomplete` is what Zag listens
 * for to let go of `previousValue`.
 */
export class UINavigationMenuContent extends RootPart {
  static readonly observedAttributes = ["value", "presence"];

  #presence: PresenceController | undefined;

  get [NAVIGATION_MENU_CONTENT](): true {
    return true;
  }

  /** The written value, or the enclosing item's. */
  get value(): string | null {
    return valueOf(this) ?? null;
  }

  set value(next: string | null) {
    reflectValue(this, next);
  }

  protected override get idKey(): string | undefined {
    return valueOf(this) ? "content" : undefined;
  }

  protected override get idValue(): string | undefined {
    return valueOf(this);
  }

  override get presenceEnabled(): boolean {
    return boolAttribute(this, "presence") ?? false;
  }

  protected propsFor(api: navigationMenu.Api): Props | null {
    const value = valueOf(this);

    return value ? (api.getContentProps({ value }) as Props) : null;
  }

  override render(api: navigationMenu.Api): void {
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

    if (!props || !node) {
      return;
    }

    this.#presence ??= new PresenceController(() => owner.scheduleRender());

    this.delegation.apply(this.#presence.decorate(node, props, api.value === valueOf(this)), this.scopeFor(owner));
  }

  protected override release(): void {
    this.#presence?.stop();
    this.#presence = undefined;
    super.release();
  }
}

/**
 * Not `align`. That is a legacy presentational attribute, and the browser maps
 * `align="center"` on any HTML element to `text-align: center`, custom
 * elements included. The panel's text went centred with it.
 */
export class UINavigationMenuViewportPositioner extends RootPart {
  static readonly observedAttributes = ["viewport-align"];

  protected propsFor(api: navigationMenu.Api): Props {
    return api.getViewportPositionerProps({ align: readAlign(this) }) as Props;
  }
}

/**
 * The one shared surface of viewport mode. Presence on by default, as for
 * every part there is exactly one of.
 */
export class UINavigationMenuViewport extends RootPart {
  static readonly observedAttributes = ["viewport-align", "presence"];

  #presence: PresenceController | undefined;

  protected override get idKey(): string {
    return "viewport";
  }

  override get presenceEnabled(): boolean {
    return boolAttribute(this, "presence") ?? true;
  }

  protected propsFor(api: navigationMenu.Api): Props {
    return api.getViewportProps({ align: readAlign(this) }) as Props;
  }

  override render(api: navigationMenu.Api): void {
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

/** Zag measures the active trigger and writes `--trigger-*` on the root for this. */
export class UINavigationMenuIndicator extends RootPart {
  protected propsFor(api: navigationMenu.Api): Props {
    return api.getIndicatorProps() as Props;
  }
}

export class UINavigationMenuArrow extends RootPart {
  protected propsFor(api: navigationMenu.Api): Props {
    return api.getArrowProps() as Props;
  }
}

function readAlign(el: Element): "start" | "center" | "end" | undefined {
  const align = el.getAttribute("viewport-align");

  return align === "start" || align === "center" || align === "end" ? align : undefined;
}
