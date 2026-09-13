import * as popover from "@zag-js/popover";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { POPOVER_ROOT } from "./brands";
export declare class UIPopover extends ZagRootElement<popover.Props, popover.Api> {
    static readonly observedAttributes: string[];
    get [POPOVER_ROOT](): true;
    protected get componentName(): string;
    protected createMachine(props: () => popover.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): popover.Api;
    /**
     * `ids` comes from the parts, not from this element.
     *
     * Popover's anatomy has no root part, so Zag writes no id here and an authored
     * one survives untouched. The parts are a different matter: Zag names every
     * element it binds, and a DOM differ that keys on `id` then sees a keyed live
     * node against an unkeyed incoming one and replaces it rather than patching it.
     * So a part reports the id its consumer wrote and Zag generates that name
     * instead. See `ZagRootElement.registerId`.
     *
     * Every value may be `undefined`, and that is deliberate rather than sloppy.
     * `VanillaMachine` runs Zag's `compact` over these props recursively before the
     * machine sees them, so an absent attribute becomes an absent key and Zag's own
     * default survives. Passing an explicit `undefined` would spread straight over
     * that default instead, which for `gutter` would silently mean zero.
     */
    protected machineProps(): popover.Props;
}
//# sourceMappingURL=root.d.ts.map