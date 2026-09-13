import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { IMAGE_ZOOM_ROOT } from "./brands";
import { type Api, type Props } from "./machine";
/**
 * An image zoom's configuration is the machine's props, kebab-cased. The value
 * is the scale: `value` is the controlled scale and `default-value` the
 * initial one, so the machine owns the scale unless the consumer writes
 * `value`. `1` is the floor and is not an attribute. The scale is read from
 * `el.api.value` and moved through `api.setValue()`, `api.increment()`,
 * `api.decrement()` and `api.reset()`.
 *
 * The swipe event exists for a wrapper that shows a list: while the image
 * fits, a horizontal drag is reported instead of panning, so the wrapper can
 * change the item.
 */
export declare class UIImageZoom extends ZagRootElement<Props, Api> {
    #private;
    static readonly observedAttributes: string[];
    get [IMAGE_ZOOM_ROOT](): true;
    protected get componentName(): string;
    protected createMachine(props: () => Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): Api;
    protected machineProps(): Props;
}
//# sourceMappingURL=root.d.ts.map