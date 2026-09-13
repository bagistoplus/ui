import * as accordion from "@zag-js/accordion";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { ACCORDION_ROOT } from "./brands";
export declare class UIAccordion extends ZagRootElement<accordion.Props, accordion.Api> {
    static readonly observedAttributes: string[];
    get [ACCORDION_ROOT](): true;
    protected get componentName(): string;
    protected get valueKeyedIds(): readonly string[];
    protected createMachine(props: () => accordion.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): accordion.Api;
    protected machineProps(): accordion.Props;
}
//# sourceMappingURL=root.d.ts.map