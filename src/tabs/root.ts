import * as tabs from "@zag-js/tabs";
import { VanillaMachine, normalizeProps } from "@zag-js/vanilla";

import { readDirection } from "../core/dom";
import { ZagRootElement } from "../core/root";
import { TABS_ROOT } from "./brands";

export class UITabs extends ZagRootElement<tabs.Props, tabs.Api> {
  static readonly observedAttributes = [
    "default-value",
    "orientation",
    "activation-mode",
    "deselectable",
    "list-label",
    "dir",
  ];

  get [TABS_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "tabs";
  }

  protected createMachine(props: () => tabs.Props): VanillaMachine<any> {
    return new VanillaMachine(tabs.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): tabs.Api {
    return tabs.connect(machine.service, normalizeProps);
  }

  protected machineProps(): tabs.Props {
    const listLabel = this.getAttribute("list-label");

    return {
      id: this.scopeKey,
      // Keep the id the consumer wrote. Zag would otherwise rename the element.
      ids: this.authoredId() ? { root: this.authoredId()! } : undefined,
      dir: readDirection(this),
      defaultValue: this.getAttribute("default-value"),
      orientation: this.getAttribute("orientation") === "vertical" ? "vertical" : "horizontal",
      activationMode: this.getAttribute("activation-mode") === "manual" ? "manual" : "automatic",
      deselectable: this.hasAttribute("deselectable"),

      // The only way to name the tablist. Zag returns `aria-label` from
      // `getListProps` whether or not a translation exists, so an `aria-label`
      // written on the element is removed on the first render. `aria-labelledby`
      // is untouched, and is the better answer when a heading exists to point at.
      translations: listLabel ? { listLabel } : undefined,

      onValueChange: (details) => this.emit("value-change", details),
      onFocusChange: (details) => this.emit("focus-change", details),
    };
  }
}
