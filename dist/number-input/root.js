import * as numberInput from "@zag-js/number-input";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, numberAttribute, readDirection, readLocale } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { NUMBER_INPUT_ROOT } from "./brands";
const INPUT_MODES = ["text", "tel", "numeric", "decimal"];
/**
 * A number input's configuration is Zag's props, kebab-cased. `value` is the
 * controlled prop and `default-value` the initial one, so the machine owns the
 * value unless the consumer writes `value`. The value itself is not a
 * property here: it is read from `el.api`, and written through `api.setValue`.
 *
 * `formatOptions` is written as `minimum-fraction-digits`,
 * `maximum-fraction-digits` and `use-grouping`, the `Intl` names without an
 * object prefix. The object is built only when one of them is set, because Zag
 * stops writing `pattern` on the input the moment it has format options.
 */
export class UINumberInput extends ZagRootElement {
    static { this.observedAttributes = [
        "value",
        "default-value",
        "min",
        "max",
        "step",
        "large-step",
        "small-step",
        "name",
        "form",
        "disabled",
        "readonly",
        "required",
        "invalid",
        "pattern",
        "input-mode",
        "allow-mouse-wheel",
        "allow-overflow",
        "clamp-value-on-blur",
        "focus-input-on-change",
        "spin-on-press",
        "locale",
        "dir",
        "translations-increment-label",
        "translations-decrement-label",
        "minimum-fraction-digits",
        "maximum-fraction-digits",
        "use-grouping",
    ]; }
    get [NUMBER_INPUT_ROOT]() {
        return true;
    }
    get componentName() {
        return "number-input";
    }
    createMachine(props) {
        return new VanillaMachine(numberInput.machine, props);
    }
    connect(machine) {
        return numberInput.connect(machine.service, normalizeProps);
    }
    machineProps() {
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            locale: this.getAttribute("locale") ?? readLocale(this),
            value: this.getAttribute("value") ?? undefined,
            defaultValue: this.getAttribute("default-value") ?? undefined,
            min: numberAttribute(this, "min"),
            max: numberAttribute(this, "max"),
            step: numberAttribute(this, "step"),
            largeStep: numberAttribute(this, "large-step"),
            smallStep: numberAttribute(this, "small-step"),
            name: this.getAttribute("name") ?? undefined,
            form: this.getAttribute("form") ?? undefined,
            pattern: this.getAttribute("pattern") ?? undefined,
            inputMode: this.#inputMode(),
            disabled: boolAttribute(this, "disabled"),
            readOnly: boolAttribute(this, "readonly"),
            required: boolAttribute(this, "required"),
            invalid: boolAttribute(this, "invalid"),
            allowMouseWheel: boolAttribute(this, "allow-mouse-wheel"),
            allowOverflow: boolAttribute(this, "allow-overflow"),
            clampValueOnBlur: boolAttribute(this, "clamp-value-on-blur"),
            focusInputOnChange: boolAttribute(this, "focus-input-on-change"),
            spinOnPress: boolAttribute(this, "spin-on-press"),
            translations: this.#translations(),
            formatOptions: this.#formatOptions(),
            onValueChange: (details) => this.emit("value-change", details),
            onValueCommit: (details) => this.emit("value-commit", details),
            onValueInvalid: (details) => this.emit("value-invalid", details),
            onFocusChange: (details) => this.emit("focus-change", details),
        };
    }
    #inputMode() {
        const value = this.getAttribute("input-mode");
        return INPUT_MODES.find((mode) => mode === value);
    }
    #translations() {
        const incrementLabel = this.getAttribute("translations-increment-label") ?? undefined;
        const decrementLabel = this.getAttribute("translations-decrement-label") ?? undefined;
        if (incrementLabel === undefined && decrementLabel === undefined) {
            return undefined;
        }
        return { incrementLabel, decrementLabel };
    }
    #formatOptions() {
        const minimumFractionDigits = numberAttribute(this, "minimum-fraction-digits");
        const maximumFractionDigits = numberAttribute(this, "maximum-fraction-digits");
        const useGrouping = boolAttribute(this, "use-grouping");
        if (minimumFractionDigits === undefined && maximumFractionDigits === undefined && useGrouping === undefined) {
            return undefined;
        }
        return { minimumFractionDigits, maximumFractionDigits, useGrouping };
    }
}
//# sourceMappingURL=root.js.map