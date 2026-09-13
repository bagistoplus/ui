import { UINumberInputControl, UINumberInputDecrementTrigger, UINumberInputIncrementTrigger, UINumberInputInput, UINumberInputLabel, UINumberInputScrubber, UINumberInputValueText } from "./parts";
import { UINumberInput } from "./root";
export { UINumberInput, UINumberInputControl, UINumberInputDecrementTrigger, UINumberInputIncrementTrigger, UINumberInputInput, UINumberInputLabel, UINumberInputScrubber, UINumberInputValueText, };
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
//# sourceMappingURL=index.d.ts.map