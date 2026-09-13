import type * as numberInput from "@zag-js/number-input";
import { ZagPart } from "../core/part";
import type { UINumberInput } from "./root";
type Props = Record<string, unknown>;
export type UINumberInputPart = ZagPart<numberInput.Api, UINumberInput>;
/**
 * Every number input part registers with the root. There is no collection
 * layer: the control groups the input and its triggers visually, and nothing
 * in Zag's props depends on it.
 */
declare abstract class NumberInputPart extends ZagPart<numberInput.Api, UINumberInput> {
    protected get ownerBrand(): symbol;
    protected register(owner: UINumberInput): void;
    protected unregister(owner: UINumberInput): void;
}
/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * input, and only a real label makes a click on it focus the input.
 */
export declare class UINumberInputLabel extends NumberInputPart {
    protected get idKey(): string;
    protected propsFor(api: numberInput.Api): Props;
}
export declare class UINumberInputControl extends NumberInputPart {
    protected propsFor(api: numberInput.Api): Props;
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag reads the value the user typed
 * from the element, writes the formatted one back into it, and names it for
 * the form through `name` and `form`. A custom element can be none of that.
 */
export declare class UINumberInputInput extends NumberInputPart {
    protected get idKey(): string;
    protected propsFor(api: numberInput.Api): Props;
}
/**
 * Always `delegate`, wrapping a `<button>`. Zag disables the trigger at its
 * bound, and only a real button blocks the pointer while disabled.
 */
export declare class UINumberInputIncrementTrigger extends NumberInputPart {
    protected get idKey(): string;
    protected propsFor(api: numberInput.Api): Props;
}
/** Always `delegate`, wrapping a `<button>`, for the reason the increment trigger gives. */
export declare class UINumberInputDecrementTrigger extends NumberInputPart {
    protected get idKey(): string;
    protected propsFor(api: numberInput.Api): Props;
}
export declare class UINumberInputValueText extends NumberInputPart {
    protected propsFor(api: numberInput.Api): Props;
}
export declare class UINumberInputScrubber extends NumberInputPart {
    protected get idKey(): string;
    protected propsFor(api: numberInput.Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map