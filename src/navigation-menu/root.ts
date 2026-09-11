import * as navigationMenu from "@zag-js/navigation-menu";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { NAVIGATION_MENU_ROOT } from "./brands";

/**
 * Two shapes, one element.
 *
 * With a `ui-navigation-menu-viewport` in the tree, Zag sizes and positions
 * that one surface under the active trigger and writes `--viewport-x`,
 * `--viewport-width` and `--viewport-height` for it; every content is expected
 * inside it. Without one, each content stays where the consumer wrote it,
 * inside its item, and Zag positions nothing. Zag decides which by looking for
 * the viewport once, when the machine starts.
 */
export class UINavigationMenu extends ZagRootElement<navigationMenu.Props, navigationMenu.Api> {
  static readonly observedAttributes = [
    "default-value",
    "open-delay",
    "close-delay",
    "orientation",
    "disable-click-trigger",
    "disable-hover-trigger",
    "disable-pointer-leave-close",
    "translations-root-label",
    "dir",
  ];

  get [NAVIGATION_MENU_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "navigation-menu";
  }

  /** Zag names these three by value: `ids.trigger` is `(value) => string`. */
  protected override get valueKeyedIds(): readonly string[] {
    return ["item", "trigger", "content"];
  }

  protected createMachine(props: () => navigationMenu.Props): VanillaMachine<any> {
    return new VanillaMachine(navigationMenu.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): navigationMenu.Api {
    return navigationMenu.connect(machine.service, normalizeProps);
  }

  /**
   * No `value` attribute for controlled state and no `show()`: the surface is
   * `el.api.setValue`, and nothing drives this component from reactive state.
   */
  protected machineProps(): navigationMenu.Props {
    const rootLabel = this.getAttribute("translations-root-label");

    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() } as navigationMenu.Props["ids"],
      dir: readDirection(this),

      defaultValue: this.getAttribute("default-value") ?? undefined,
      openDelay: numberAttribute(this, "open-delay"),
      closeDelay: numberAttribute(this, "close-delay"),
      orientation: this.getAttribute("orientation") === "vertical" ? "vertical" : undefined,
      disableClickTrigger: boolAttribute(this, "disable-click-trigger"),
      disableHoverTrigger: boolAttribute(this, "disable-hover-trigger"),
      disablePointerLeaveClose: boolAttribute(this, "disable-pointer-leave-close"),
      translations: rootLabel ? { rootLabel } : undefined,

      onValueChange: (details) => this.emit("value-change", details),
    };
  }
}
