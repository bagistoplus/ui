import * as popover from "@zag-js/popover";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { POSITIONING_ATTRIBUTES, readPositioning } from "../core/positioning";
import { ZagRootElement } from "../core/root";
import { POPOVER_ROOT } from "./brands";

export class UIPopover extends ZagRootElement<popover.Props, popover.Api> {
  static readonly observedAttributes = [
    "default-open",
    "modal",
    "auto-focus",
    "restore-focus",
    "close-on-interact-outside",
    "close-on-escape",
    "default-trigger-value",
    "translations-close-trigger-label",
    "dir",
    ...POSITIONING_ATTRIBUTES,
  ];

  get [POPOVER_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "popover";
  }

  protected createMachine(props: () => popover.Props): VanillaMachine<any> {
    return new VanillaMachine(popover.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): popover.Api {
    return popover.connect(machine.service, normalizeProps);
  }

  /**
   * `ids` comes from the parts, not from this element.
   *
   * Popover's anatomy has no root part, so Zag writes no id here and an authored
   * one survives untouched. The parts are a different matter: Zag names every
   * element it binds, and a DOM differ that keys on `id` then sees a keyed live
   * node against an unkeyed incoming one and replaces it rather than patching it.
   * So a part reports the id its consumer wrote and Zag generates that name
   * instead. See `ZagRootElement.registerId`.
   *
   * Every value may be `undefined`, and that is deliberate rather than sloppy.
   * `VanillaMachine` runs Zag's `compact` over these props recursively before the
   * machine sees them, so an absent attribute becomes an absent key and Zag's own
   * default survives. Passing an explicit `undefined` would spread straight over
   * that default instead, which for `gutter` would silently mean zero.
   */
  protected machineProps(): popover.Props {
    const closeTriggerLabel = this.getAttribute("translations-close-trigger-label");

    return {
      id: this.scopeKey,
      ids: this.authoredIds() as popover.Props["ids"],
      dir: readDirection(this),

      // Zag portals nothing by itself. The prop only tells the machine whether
      // the framework moved the content, and its single effect is to install a
      // tab focus proxy that repairs an order the DOM no longer provides.
      //
      // Nothing here moves, and nothing can: a part finds its root by walking
      // `parentElement`, so a positioner outside the tree would silently stop
      // rendering. When clipping becomes the problem the answer is the top layer
      // (`popover="manual"` on the positioner plus a fixed strategy), which also
      // leaves the content where it is and preserves DOM tab order. So this
      // stays false either way, and there is no attribute for it.
      portalled: false,

      defaultOpen: boolAttribute(this, "default-open"),
      modal: boolAttribute(this, "modal"),
      autoFocus: boolAttribute(this, "auto-focus"),
      restoreFocus: boolAttribute(this, "restore-focus"),
      closeOnInteractOutside: boolAttribute(this, "close-on-interact-outside"),
      closeOnEscape: boolAttribute(this, "close-on-escape"),
      defaultTriggerValue: this.getAttribute("default-trigger-value") ?? undefined,
      translations: closeTriggerLabel ? { closeTriggerLabel } : undefined,
      positioning: readPositioning(this),

      onOpenChange: (details) => this.emit("open-change", details),
      onTriggerValueChange: (details) => this.emit("trigger-value-change", details),
    };
  }
}
