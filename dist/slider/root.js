import * as slider from "@zag-js/slider";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, listAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { SLIDER_ROOT } from "./brands";
const ORIENTATIONS = ["horizontal", "vertical"];
const ORIGINS = ["start", "center", "end"];
const ALIGNMENTS = ["contain", "center"];
const COLLISIONS = ["none", "push", "swap"];
/**
 * A slider's configuration is Zag's props, kebab-cased. The value is a list,
 * one number per thumb, written as a comma list: `value` is the controlled
 * list and `default-value` the initial one, so the machine owns the value
 * unless the consumer writes `value`. It is read from `el.api.value` and
 * moved through `api.setValue()` and `api.setThumbValue()`.
 *
 * The thumbs are numbered by their document order among the root's thumbs,
 * unless one writes `index`. Zag's `aria-label` and `aria-labelledby` arrays
 * are not attributes here: a thumb keeps the one the consumer wrote on it.
 */
export class UISlider extends ZagRootElement {
    static { this.observedAttributes = [
        "value",
        "default-value",
        "min",
        "max",
        "step",
        "large-step",
        "min-steps-between-thumbs",
        "orientation",
        "origin",
        "thumb-alignment",
        "thumb-collision-behavior",
        "thumb-width",
        "thumb-height",
        "name",
        "form",
        "disabled",
        "readonly",
        "invalid",
        "dir",
    ]; }
    #thumbs = new Set();
    // Built lazily, once per render, and dropped whenever the thumbs change.
    #order;
    #valueText = null;
    get [SLIDER_ROOT]() {
        return true;
    }
    /**
     * The text a thumb reads out for its value, `aria-valuetext`. A function,
     * so a property rather than an attribute; set back to `null`, the thumb
     * reads the bare number again.
     */
    get getAriaValueText() {
        return this.#valueText;
    }
    set getAriaValueText(next) {
        this.#valueText = next ?? null;
        this.pushProps();
    }
    get componentName() {
        return "slider";
    }
    get valueKeyedIds() {
        return ["thumb", "hiddenInput", "marker"];
    }
    createMachine(props) {
        return new VanillaMachine(slider.machine, props);
    }
    connect(machine) {
        return slider.connect(machine.service, normalizeProps);
    }
    machineProps() {
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            value: numberList(this.getAttribute("value")),
            defaultValue: numberList(this.getAttribute("default-value")),
            min: numberAttribute(this, "min"),
            max: numberAttribute(this, "max"),
            step: numberAttribute(this, "step"),
            largeStep: numberAttribute(this, "large-step"),
            minStepsBetweenThumbs: numberAttribute(this, "min-steps-between-thumbs"),
            orientation: oneOf(ORIENTATIONS, this.getAttribute("orientation")),
            origin: oneOf(ORIGINS, this.getAttribute("origin")),
            thumbAlignment: oneOf(ALIGNMENTS, this.getAttribute("thumb-alignment")),
            thumbCollisionBehavior: oneOf(COLLISIONS, this.getAttribute("thumb-collision-behavior")),
            thumbSize: this.#thumbSize(),
            name: this.getAttribute("name") ?? undefined,
            form: this.getAttribute("form") ?? undefined,
            disabled: boolAttribute(this, "disabled"),
            readOnly: boolAttribute(this, "readonly"),
            invalid: boolAttribute(this, "invalid"),
            getAriaValueText: this.#valueText ?? undefined,
            onValueChange: (details) => this.emit("value-change", details),
            onValueChangeEnd: (details) => this.emit("value-change-end", details),
            onFocusChange: (details) => this.emit("focus-change", details),
        };
    }
    registerThumb(thumb) {
        this.#thumbs.add(thumb);
        this.#order = undefined;
        this.registerChild(thumb);
    }
    unregisterThumb(thumb) {
        this.#thumbs.delete(thumb);
        this.#order = undefined;
        this.unregisterChild(thumb);
        this.scheduleRender();
    }
    /** A thumb wrote or dropped `index`, so the others may shift. */
    thumbsChanged() {
        this.#order = undefined;
        this.scheduleRender();
    }
    /** The index Zag is told for this thumb: the written one, or its place among the others. */
    indexOf(thumb) {
        if (thumb.index !== null) {
            return thumb.index;
        }
        this.#order ??= order(sorted([...this.#thumbs]));
        return this.#order.get(thumb);
    }
    /** Built only when both are set, which is what tells Zag not to measure. */
    #thumbSize() {
        const width = numberAttribute(this, "thumb-width");
        const height = numberAttribute(this, "thumb-height");
        if (width === undefined || height === undefined) {
            return undefined;
        }
        return { width, height };
    }
}
function numberList(value) {
    const numbers = listAttribute(value)?.map(Number).filter(Number.isFinite);
    return numbers && numbers.length > 0 ? numbers : undefined;
}
function oneOf(options, value) {
    return options.find((option) => option === value);
}
/** Numbers the thumbs without an explicit `index`, in the order given. */
function order(thumbs) {
    const map = new Map();
    let next = 0;
    for (const thumb of thumbs) {
        if (thumb.index === null) {
            map.set(thumb, next++);
        }
    }
    return map;
}
/** Document order, without a tag name in sight. */
function sorted(elements) {
    return elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
//# sourceMappingURL=root.js.map