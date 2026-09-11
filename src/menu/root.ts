import * as menu from "@zag-js/menu";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, findBranded, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { POSITIONING_ATTRIBUTES, readPositioning } from "../core/positioning";
import { ZagRootElement } from "../core/root";
import { MENU_ROOT } from "./brands";

/**
 * A menu, or a submenu: the same element does both.
 *
 * Zag has one machine for both levels, and a submenu is a machine that was told
 * its parent with `setParent`. Here the DOM says which is which. A `ui-menu`
 * whose nearest `ui-menu` ancestor exists is a submenu, and it links itself to
 * that ancestor once both machines have started.
 */
export class UIMenu extends ZagRootElement<menu.Props, menu.Api> {
  static readonly observedAttributes = [
    "default-open",
    "close-on-select",
    "loop-focus",
    "typeahead",
    "composite",
    "default-highlighted-value",
    "default-trigger-value",
    "dir",
    ...POSITIONING_ATTRIBUTES,
  ];

  // `undefined` means nothing asked. Consumed by the first render.
  #pendingOpen: boolean | undefined;

  #parent: UIMenu | null = null;

  get [MENU_ROOT](): true {
    return true;
  }

  /** The menu this one is a submenu of: the nearest `ui-menu` ancestor, or null. */
  get parentMenu(): UIMenu | null {
    return this.#parent;
  }

  /**
   * Safe at any time, unlike `el.api.setOpen`, which is undefined until the
   * first frame after upgrade. A call made before the machine exists is read
   * as `defaultOpen` when the machine is built; after that it goes straight to
   * Zag, which ignores a state it is already in.
   */
  show(): void {
    this.#setOpen(true);
  }

  hide(): void {
    this.#setOpen(false);
  }

  override connectedCallback(): void {
    this.#parent = findBranded<UIMenu>(this, MENU_ROOT);
    super.connectedCallback();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    queueMicrotask(() => {
      if (this.isConnected) {
        return;
      }

      this.#parent?.unregisterChild(this);
      this.#parent = null;
    });
  }

  /**
   * For the parent's render pass, never called by anything else.
   *
   * A submenu is one of its parent's renderables, so the parent's highlight
   * reaches the trigger item on the parent's own tick. The argument is the
   * parent's api and is ignored: this menu renders with its own.
   */
  render(_api: menu.Api): void {
    this.flush();
  }

  protected get componentName(): string {
    return "menu";
  }

  protected createMachine(props: () => menu.Props): VanillaMachine<any> {
    return new VanillaMachine(menu.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): menu.Api {
    return menu.connect(machine.service, normalizeProps);
  }

  /**
   * `ids` comes from the parts: menu's anatomy has no root part, so Zag writes
   * no id here and an authored one survives untouched. Every value may be
   * `undefined`, for the reason the popover root gives: Zag's `compact` drops
   * the key and Zag's own default survives.
   *
   * `aria-label` is not read from an attribute. Zag omits the key when the
   * prop is unset and never removes what it did not write, so the consumer
   * authors `aria-label` on the content directly.
   */
  protected machineProps(): menu.Props {
    return {
      id: this.scopeKey,
      ids: this.authoredIds() as menu.Props["ids"],
      dir: readDirection(this),
      positioning: readPositioning(this),

      defaultOpen: this.#pendingOpen ?? boolAttribute(this, "default-open"),
      closeOnSelect: boolAttribute(this, "close-on-select"),
      loopFocus: boolAttribute(this, "loop-focus"),
      typeahead: boolAttribute(this, "typeahead"),
      composite: boolAttribute(this, "composite"),
      defaultHighlightedValue: this.getAttribute("default-highlighted-value") ?? undefined,
      defaultTriggerValue: this.getAttribute("default-trigger-value") ?? undefined,

      onOpenChange: (details) => this.emit("open-change", details),
      onSelect: (details) => this.emit("select", details),
      onHighlightChange: (details) => this.emit("highlight-change", details),
      onTriggerValueChange: (details) => this.emit("trigger-value-change", details),
    };
  }

  protected override afterRender(): void {
    this.#pendingOpen = undefined;
  }

  /**
   * The parent has always started first. It connected first, during parsing,
   * so its first frame ran before this one, and its machine started at the end
   * of that render. Both `set*` calls are sends, which is why this waits for
   * `afterStart` rather than `afterRender`.
   */
  protected override afterStart(api: menu.Api): void {
    const parent = this.#parent;
    const service = this.service;

    if (!parent?.api || !parent.service || !service) {
      return;
    }

    api.setParent(parent.service);
    parent.api.setChild(service);
    parent.registerChild(this);
  }

  #setOpen(open: boolean): void {
    const api = this.api;

    if (api) {
      api.setOpen(open);
      return;
    }

    this.#pendingOpen = open;
    this.scheduleRender();
  }
}
