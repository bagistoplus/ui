import type * as numberInput from "@zag-js/number-input";

import { ZagPart } from "../core/part";
import { NUMBER_INPUT_ROOT } from "./brands";
import type { UINumberInput } from "./root";

type Props = Record<string, unknown>;

export type UINumberInputPart = ZagPart<numberInput.Api, UINumberInput>;

/**
 * Every number input part registers with the root. There is no collection
 * layer: the control groups the input and its triggers visually, and nothing
 * in Zag's props depends on it.
 */
abstract class NumberInputPart extends ZagPart<numberInput.Api, UINumberInput> {
  protected get ownerBrand(): symbol {
    return NUMBER_INPUT_ROOT;
  }

  protected register(owner: UINumberInput): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UINumberInput): void {
    owner.unregisterChild(this);
  }
}

/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * input, and only a real label makes a click on it focus the input.
 */
export class UINumberInputLabel extends NumberInputPart {
  protected override get idKey(): string {
    return "label";
  }

  protected propsFor(api: numberInput.Api): Props {
    return api.getLabelProps() as Props;
  }
}

export class UINumberInputControl extends NumberInputPart {
  protected propsFor(api: numberInput.Api): Props {
    return api.getControlProps() as Props;
  }
}

/**
 * Always `delegate`, wrapping an `<input>`. Zag reads the value the user typed
 * from the element, writes the formatted one back into it, and names it for
 * the form through `name` and `form`. A custom element can be none of that.
 */
export class UINumberInputInput extends NumberInputPart {
  protected override get idKey(): string {
    return "input";
  }

  protected propsFor(api: numberInput.Api): Props {
    return api.getInputProps() as Props;
  }
}

/**
 * Always `delegate`, wrapping a `<button>`. Zag disables the trigger at its
 * bound, and only a real button blocks the pointer while disabled.
 */
export class UINumberInputIncrementTrigger extends NumberInputPart {
  protected override get idKey(): string {
    return "incrementTrigger";
  }

  protected propsFor(api: numberInput.Api): Props {
    return api.getIncrementTriggerProps() as Props;
  }
}

/** Always `delegate`, wrapping a `<button>`, for the reason the increment trigger gives. */
export class UINumberInputDecrementTrigger extends NumberInputPart {
  protected override get idKey(): string {
    return "decrementTrigger";
  }

  protected propsFor(api: numberInput.Api): Props {
    return api.getDecrementTriggerProps() as Props;
  }
}

export class UINumberInputValueText extends NumberInputPart {
  protected propsFor(api: numberInput.Api): Props {
    return api.getValueTextProps() as Props;
  }
}

export class UINumberInputScrubber extends NumberInputPart {
  protected override get idKey(): string {
    return "scrubber";
  }

  protected propsFor(api: numberInput.Api): Props {
    return api.getScrubberProps() as Props;
  }
}
