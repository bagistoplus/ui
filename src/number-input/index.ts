import { defineElement } from "../core/dom";
import {
  UINumberInputControl,
  UINumberInputDecrementTrigger,
  UINumberInputIncrementTrigger,
  UINumberInputInput,
  UINumberInputLabel,
  UINumberInputScrubber,
  UINumberInputValueText,
} from "./parts";
import { UINumberInput } from "./root";

defineElement("ui-number-input", UINumberInput);
defineElement("ui-number-input-label", UINumberInputLabel);
defineElement("ui-number-input-control", UINumberInputControl);
defineElement("ui-number-input-input", UINumberInputInput);
defineElement("ui-number-input-increment-trigger", UINumberInputIncrementTrigger);
defineElement("ui-number-input-decrement-trigger", UINumberInputDecrementTrigger);
defineElement("ui-number-input-value-text", UINumberInputValueText);
defineElement("ui-number-input-scrubber", UINumberInputScrubber);

export {
  UINumberInput,
  UINumberInputControl,
  UINumberInputDecrementTrigger,
  UINumberInputIncrementTrigger,
  UINumberInputInput,
  UINumberInputLabel,
  UINumberInputScrubber,
  UINumberInputValueText,
};

declare global {
  interface HTMLElementTagNameMap {
    "ui-number-input": UINumberInput;
    "ui-number-input-label": UINumberInputLabel;
    "ui-number-input-control": UINumberInputControl;
    "ui-number-input-input": UINumberInputInput;
    "ui-number-input-increment-trigger": UINumberInputIncrementTrigger;
    "ui-number-input-decrement-trigger": UINumberInputDecrementTrigger;
    "ui-number-input-value-text": UINumberInputValueText;
    "ui-number-input-scrubber": UINumberInputScrubber;
  }
}
