import * as accordion from "@zag-js/accordion";
import { VanillaMachine, normalizeProps } from "@zag-js/vanilla";

import { listAttribute, readDirection } from "../core/dom.js";
import { ZagRootElement } from "../core/root.js";
import { ACCORDION_ROOT } from "./brands.js";

export class UIAccordion extends ZagRootElement<accordion.Props, accordion.Api> {
  static readonly observedAttributes = [
    "multiple",
    "collapsible",
    "orientation",
    "disabled",
    "default-value",
    "presence",
    "dir",
  ];

  get [ACCORDION_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "accordion";
  }

  protected createMachine(props: () => accordion.Props): VanillaMachine<any> {
    return new VanillaMachine(accordion.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): accordion.Api {
    return accordion.connect(machine.service, normalizeProps);
  }

  protected machineProps(): accordion.Props {
    return {
      id: this.scopeKey,
      // Keep the id the consumer wrote. Zag would otherwise rename the element.
      ids: this.authoredId() ? { root: this.authoredId()! } : undefined,
      dir: readDirection(this),
      multiple: this.hasAttribute("multiple"),
      collapsible: this.hasAttribute("collapsible"),
      disabled: this.hasAttribute("disabled"),
      orientation: this.getAttribute("orientation") === "horizontal" ? "horizontal" : "vertical",
      defaultValue: listAttribute(this.getAttribute("default-value")),
      onValueChange: (details) => this.emit("value-change", details),
      onFocusChange: (details) => this.emit("focus-change", details),
    };
  }
}
