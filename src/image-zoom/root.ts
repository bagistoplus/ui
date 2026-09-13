import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { IMAGE_ZOOM_ROOT } from "./brands";
import { connect, machine, type Api, type IntlTranslations, type Props } from "./machine";

/**
 * An image zoom's configuration is the machine's props, kebab-cased. The value
 * is the scale: `value` is the controlled scale and `default-value` the
 * initial one, so the machine owns the scale unless the consumer writes
 * `value`. `1` is the floor and is not an attribute. The scale is read from
 * `el.api.value` and moved through `api.setValue()`, `api.increment()`,
 * `api.decrement()` and `api.reset()`.
 *
 * The swipe event exists for a wrapper that shows a list: while the image
 * fits, a horizontal drag is reported instead of panning, so the wrapper can
 * change the item.
 */
export class UIImageZoom extends ZagRootElement<Props, Api> {
  static readonly observedAttributes = [
    "value",
    "default-value",
    "max",
    "step",
    "double-tap-scale",
    "swipe-threshold",
    "disabled",
    "dir",
    "translations-increment-trigger",
    "translations-decrement-trigger",
    "translations-reset-trigger",
  ];

  get [IMAGE_ZOOM_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "image-zoom";
  }

  protected createMachine(props: () => Props): VanillaMachine<any> {
    return new VanillaMachine(machine, props);
  }

  protected connect(machine: VanillaMachine<any>): Api {
    return connect(machine.service, normalizeProps);
  }

  protected machineProps(): Props {
    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. The machine would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() },
      dir: readDirection(this),
      value: numberAttribute(this, "value"),
      defaultValue: numberAttribute(this, "default-value"),
      max: numberAttribute(this, "max"),
      step: numberAttribute(this, "step"),
      doubleTapScale: numberAttribute(this, "double-tap-scale"),
      swipeThreshold: numberAttribute(this, "swipe-threshold"),
      disabled: boolAttribute(this, "disabled"),
      translations: this.#translations(),

      onValueChange: (details) => this.emit("value-change", details),
      onSwipe: (details) => this.emit("swipe", details),
    };
  }

  #translations(): IntlTranslations | undefined {
    const incrementTrigger = this.getAttribute("translations-increment-trigger") ?? undefined;
    const decrementTrigger = this.getAttribute("translations-decrement-trigger") ?? undefined;
    const resetTrigger = this.getAttribute("translations-reset-trigger") ?? undefined;

    if (incrementTrigger === undefined && decrementTrigger === undefined && resetTrigger === undefined) {
      return undefined;
    }

    return { incrementTrigger, decrementTrigger, resetTrigger };
  }
}
