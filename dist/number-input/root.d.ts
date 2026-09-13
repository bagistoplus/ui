import * as numberInput from "@zag-js/number-input";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { NUMBER_INPUT_ROOT } from "./brands";
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
export declare class UINumberInput extends ZagRootElement<numberInput.Props, numberInput.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [NUMBER_INPUT_ROOT](): true;
    protected get componentName(): string;
    protected createMachine(props: () => numberInput.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): numberInput.Api;
    protected machineProps(): numberInput.Props;
}
//# sourceMappingURL=root.d.ts.map