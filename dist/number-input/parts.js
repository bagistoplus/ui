import { ZagPart } from "../core/part";
import { NUMBER_INPUT_ROOT } from "./brands";
/**
 * Every number input part registers with the root. There is no collection
 * layer: the control groups the input and its triggers visually, and nothing
 * in Zag's props depends on it.
 */
class NumberInputPart extends ZagPart {
    get ownerBrand() {
        return NUMBER_INPUT_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * input, and only a real label makes a click on it focus the input.
 */
export class UINumberInputLabel extends NumberInputPart {
    get idKey() {
        return "label";
    }
    propsFor(api) {
        return api.getLabelProps();
    }
}
export class UINumberInputControl extends NumberInputPart {
    propsFor(api) {
        return api.getControlProps();
    }
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag reads the value the user typed
 * from the element, writes the formatted one back into it, and names it for
 * the form through `name` and `form`. A custom element can be none of that.
 */
export class UINumberInputInput extends NumberInputPart {
    get idKey() {
        return "input";
    }
    propsFor(api) {
        return api.getInputProps();
    }
}
/**
 * Always `delegate`, wrapping a `<button>`. Zag disables the trigger at its
 * bound, and only a real button blocks the pointer while disabled.
 */
export class UINumberInputIncrementTrigger extends NumberInputPart {
    get idKey() {
        return "incrementTrigger";
    }
    propsFor(api) {
        return api.getIncrementTriggerProps();
    }
}
/** Always `delegate`, wrapping a `<button>`, for the reason the increment trigger gives. */
export class UINumberInputDecrementTrigger extends NumberInputPart {
    get idKey() {
        return "decrementTrigger";
    }
    propsFor(api) {
        return api.getDecrementTriggerProps();
    }
}
export class UINumberInputValueText extends NumberInputPart {
    propsFor(api) {
        return api.getValueTextProps();
    }
}
export class UINumberInputScrubber extends NumberInputPart {
    get idKey() {
        return "scrubber";
    }
    propsFor(api) {
        return api.getScrubberProps();
    }
}
//# sourceMappingURL=parts.js.map