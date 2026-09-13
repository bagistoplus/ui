import * as tabs from "@zag-js/tabs";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { TABS_ROOT } from "./brands";
export declare class UITabs extends ZagRootElement<tabs.Props, tabs.Api> {
    static readonly observedAttributes: string[];
    get [TABS_ROOT](): true;
    protected get componentName(): string;
    protected get valueKeyedIds(): readonly string[];
    protected createMachine(props: () => tabs.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): tabs.Api;
    protected machineProps(): tabs.Props;
}
//# sourceMappingURL=root.d.ts.map