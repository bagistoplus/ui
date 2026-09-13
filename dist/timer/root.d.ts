import * as timer from "@zag-js/timer";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { TIMER_ROOT } from "./brands";
/**
 * A timer's configuration is Zag's props, kebab-cased. Two things are settled
 * when the machine is built and no attribute changes them afterwards.
 * `auto-start` picks the initial state and nothing else, so toggling it later
 * does nothing, and `api.start()` is how a timer runs after the fact. And Zag
 * validates `start-ms`, `target-ms`, `interval` and `countdown` together at
 * build, so a combination it rejects is an error in the console, not a clamped
 * value. A changed `start-ms` does reach the running machine: Zag watches it
 * and restarts.
 */
export declare class UITimer extends ZagRootElement<timer.Props, timer.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [TIMER_ROOT](): true;
    protected get componentName(): string;
    protected createMachine(props: () => timer.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): timer.Api;
    protected machineProps(): timer.Props;
}
//# sourceMappingURL=root.d.ts.map