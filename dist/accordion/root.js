import * as accordion from "@zag-js/accordion";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, listAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { ACCORDION_ROOT } from "./brands";
export class UIAccordion extends ZagRootElement {
    static { this.observedAttributes = [
        "multiple",
        "collapsible",
        "orientation",
        "disabled",
        "default-value",
        "presence",
        "dir",
    ]; }
    get [ACCORDION_ROOT]() {
        return true;
    }
    get componentName() {
        return "accordion";
    }
    get valueKeyedIds() {
        return ["item", "itemTrigger", "itemContent"];
    }
    createMachine(props) {
        return new VanillaMachine(accordion.machine, props);
    }
    connect(machine) {
        return accordion.connect(machine.service, normalizeProps);
    }
    machineProps() {
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            multiple: boolAttribute(this, "multiple"),
            collapsible: boolAttribute(this, "collapsible"),
            disabled: boolAttribute(this, "disabled"),
            orientation: this.getAttribute("orientation") === "horizontal" ? "horizontal" : "vertical",
            defaultValue: listAttribute(this.getAttribute("default-value")),
            onValueChange: (details) => this.emit("value-change", details),
            onFocusChange: (details) => this.emit("focus-change", details),
        };
    }
}
//# sourceMappingURL=root.js.map