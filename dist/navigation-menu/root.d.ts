import * as navigationMenu from "@zag-js/navigation-menu";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { NAVIGATION_MENU_ROOT } from "./brands";
/**
 * Two shapes, one element.
 *
 * With a `ui-navigation-menu-viewport` in the tree, Zag sizes and positions
 * that one surface under the active trigger and writes `--viewport-x`,
 * `--viewport-width` and `--viewport-height` for it; every content is expected
 * inside it. Without one, each content stays where the consumer wrote it,
 * inside its item, and Zag positions nothing. Zag decides which by looking for
 * the viewport once, when the machine starts.
 */
export declare class UINavigationMenu extends ZagRootElement<navigationMenu.Props, navigationMenu.Api> {
    static readonly observedAttributes: string[];
    get [NAVIGATION_MENU_ROOT](): true;
    protected get componentName(): string;
    /** Zag names these three by value: `ids.trigger` is `(value) => string`. */
    protected get valueKeyedIds(): readonly string[];
    protected createMachine(props: () => navigationMenu.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): navigationMenu.Api;
    /**
     * No `value` attribute for controlled state and no `show()`: the surface is
     * `el.api.setValue`, and nothing drives this component from reactive state.
     */
    protected machineProps(): navigationMenu.Props;
}
//# sourceMappingURL=root.d.ts.map