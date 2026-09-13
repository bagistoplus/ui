import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { BEFORE_AFTER_ROOT } from "./brands";
import { type Api, type Props } from "./machine";
/**
 * A before/after's configuration is the machine's props, kebab-cased. `value`
 * is the controlled position and `default-value` the initial one, so the
 * machine owns the position unless the consumer writes `value`. The position
 * is read from `el.api.value` and moved through `api.setValue()`.
 */
export declare class UIBeforeAfter extends ZagRootElement<Props, Api> {
    #private;
    static readonly observedAttributes: string[];
    get [BEFORE_AFTER_ROOT](): true;
    protected get componentName(): string;
    protected createMachine(props: () => Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): Api;
    protected machineProps(): Props;
}
//# sourceMappingURL=root.d.ts.map