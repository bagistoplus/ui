import * as popover from "@zag-js/popover";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, listAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { POPOVER_ROOT } from "./brands";

/**
 * Zag's `positioning` prop is an object, so it flattens one attribute per key.
 *
 * The list is the whole scalar surface minus floating-ui's plumbing. Left out:
 * `restoreStyles`, `applyStyles`, `sizeMiddleware` and `listeners`, none of which
 * is a design decision, and `applyStyles: false` in particular would stop `--x`
 * and `--y` ever being written, which is the one setting guaranteed to break
 * positioning outright. `offset` needs no attribute of its own: `gutter` is its
 * mainAxis fallback and `shift` its crossAxis one.
 *
 * `boundary` is left out for a different reason: it is not a choice we declined,
 * it is unreachable. The only string it accepts is `clipping-ancestors`, and
 * floating-ui already uses clipping ancestors when the option is omitted, so the
 * attribute could express nothing but the default.
 */
const POSITIONING = [
  "positioning-placement",
  "positioning-strategy",
  "positioning-gutter",
  "positioning-shift",
  "positioning-overflow-padding",
  "positioning-arrow-padding",
  "positioning-flip",
  "positioning-slide",
  "positioning-overlap",
  "positioning-same-width",
  "positioning-fit-viewport",
  "positioning-hide-when-detached",
];

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
    ...POSITIONING,
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
   * There is no `ids` here, unlike the accordion and tabs roots.
   *
   * Popover's anatomy has no root part, so Zag writes no id to this element and
   * an authored one survives untouched. Nothing has to be defended from being
   * renamed out from under a DOM differ.
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
      positioning: this.#positioning(),

      onOpenChange: (details) => this.emit("open-change", details),
      onTriggerValueChange: (details) => this.emit("trigger-value-change", details),
    };
  }

  #positioning(): popover.PositioningOptions {
    const strategy = this.getAttribute("positioning-strategy");

    return {
      placement: (this.getAttribute("positioning-placement") as popover.Placement | null) ?? undefined,
      strategy: strategy === "absolute" || strategy === "fixed" ? strategy : undefined,

      gutter: numberAttribute(this, "positioning-gutter"),
      shift: numberAttribute(this, "positioning-shift"),
      overflowPadding: numberAttribute(this, "positioning-overflow-padding"),
      arrowPadding: numberAttribute(this, "positioning-arrow-padding"),
      flip: this.#flip(),
      slide: boolAttribute(this, "positioning-slide"),
      overlap: boolAttribute(this, "positioning-overlap"),
      sameWidth: boolAttribute(this, "positioning-same-width"),
      fitViewport: boolAttribute(this, "positioning-fit-viewport"),
      hideWhenDetached: boolAttribute(this, "positioning-hide-when-detached"),
    };
  }

  /** The one positioning option Zag takes as either a boolean or a list. */
  #flip(): boolean | popover.Placement[] | undefined {
    const value = this.getAttribute("positioning-flip");

    if (value == null) {
      return undefined;
    }

    if (value === "" || value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return listAttribute(value) as popover.Placement[] | undefined;
  }
}
