import * as tabs from "@zag-js/tabs";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { TABS_ROOT } from "./brands";
export class UITabs extends ZagRootElement {
    static { this.observedAttributes = [
        "default-value",
        "orientation",
        "activation-mode",
        "deselectable",
        "translations-list-label",
        "loop-focus",
        "composite",
        "dir",
    ]; }
    get [TABS_ROOT]() {
        return true;
    }
    get componentName() {
        return "tabs";
    }
    get valueKeyedIds() {
        return ["trigger", "content"];
    }
    createMachine(props) {
        return new VanillaMachine(tabs.machine, props);
    }
    connect(machine) {
        return tabs.connect(machine.service, normalizeProps);
    }
    machineProps() {
        const listLabel = this.getAttribute("translations-list-label");
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            defaultValue: this.getAttribute("default-value"),
            orientation: this.getAttribute("orientation") === "vertical" ? "vertical" : "horizontal",
            activationMode: this.getAttribute("activation-mode") === "manual" ? "manual" : "automatic",
            deselectable: boolAttribute(this, "deselectable"),
            loopFocus: boolAttribute(this, "loop-focus"),
            composite: boolAttribute(this, "composite"),
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
//# sourceMappingURL=root.js.map