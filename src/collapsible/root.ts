import * as collapsible from "@zag-js/collapsible";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { COLLAPSIBLE_ROOT } from "./brands";

/**
 * A collapsible's configuration is Zag's props, kebab-cased. `open` is the
 * controlled prop and `default-open` the initial one, so the machine owns the
 * state unless the consumer writes `open`. Under `open`, a click only fires
 * `open-change`, and the attribute is what opens and closes the panel.
 * `open="false"` holds it closed; removing the attribute closes it and hands
 * the state back to the machine.
 *
 * `collapsed-height` and `collapsed-width` turn it into a "read more": closed,
 * the content is clipped to that size rather than hidden.
 *
 * There is no `presence`. Zag's collapsible waits for the content's exit
 * animation itself, before it writes `hidden`.
 */
export class UICollapsible extends ZagRootElement<collapsible.Props, collapsible.Api> {
  static readonly observedAttributes = [
    "open",
    "default-open",
    "disabled",
    "collapsed-height",
    "collapsed-width",
    "dir",
  ];

  get [COLLAPSIBLE_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "collapsible";
  }

  protected createMachine(props: () => collapsible.Props): VanillaMachine<any> {
    return new VanillaMachine(collapsible.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): collapsible.Api {
    return collapsible.connect(machine.service, normalizeProps);
  }

  protected machineProps(): collapsible.Props {
    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() } as collapsible.Props["ids"],
      dir: readDirection(this),
      open: boolAttribute(this, "open"),
      defaultOpen: boolAttribute(this, "default-open"),
      disabled: boolAttribute(this, "disabled"),
      collapsedHeight: sizeAttribute(this, "collapsed-height"),
      collapsedWidth: sizeAttribute(this, "collapsed-width"),

      onOpenChange: (details) => this.emit("open-change", details),
      onExitComplete: () => this.emit("exit-complete", null),
    };
  }
}

/**
 * A length. A bare number is pixels, and anything else is handed to CSS as
 * written, so `120`, `120px` and `10rem` all work. Absent or blank gives
 * `undefined`, which is Zag's "no collapsed size".
 */
function sizeAttribute(el: Element, name: string): number | string | undefined {
  const number = numberAttribute(el, name);

  if (number !== undefined) {
    return number;
  }

  const value = el.getAttribute(name)?.trim();

  return value ? value : undefined;
}
