import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { BEFORE_AFTER_ROOT } from "./brands";
import { connect, machine } from "./machine";
const ORIENTATIONS = ["horizontal", "vertical"];
/**
 * A before/after's configuration is the machine's props, kebab-cased. `value`
 * is the controlled position and `default-value` the initial one, so the
 * machine owns the position unless the consumer writes `value`. The position
 * is read from `el.api.value` and moved through `api.setValue()`.
 */
export class UIBeforeAfter extends ZagRootElement {
    static { this.observedAttributes = [
        "value",
        "default-value",
        "orientation",
        "step",
        "disabled",
        "dir",
        "translations-handle",
        "translations-value-text",
    ]; }
    get [BEFORE_AFTER_ROOT]() {
        return true;
    }
    get componentName() {
        return "before-after";
    }
    createMachine(props) {
        return new VanillaMachine(machine, props);
    }
    connect(machine) {
        return connect(machine.service, normalizeProps);
    }
    machineProps() {
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. The machine would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            value: numberAttribute(this, "value"),
            defaultValue: numberAttribute(this, "default-value"),
            orientation: this.#orientation(),
            step: numberAttribute(this, "step"),
            disabled: boolAttribute(this, "disabled"),
            translations: this.#translations(),
            onValueChange: (details) => this.emit("value-change", details),
        };
    }
    #orientation() {
        const value = this.getAttribute("orientation");
        return ORIENTATIONS.find((orientation) => orientation === value);
    }
    #translations() {
        const handle = this.getAttribute("translations-handle") ?? undefined;
        const valueText = this.getAttribute("translations-value-text") ?? undefined;
        if (handle === undefined && valueText === undefined) {
            return undefined;
        }
        return { handle, valueText };
    }
}
//# sourceMappingURL=root.js.map