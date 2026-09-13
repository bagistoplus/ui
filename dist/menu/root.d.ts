import * as menu from "@zag-js/menu";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { MENU_ROOT } from "./brands";
/**
 * A menu, or a submenu: the same element does both.
 *
 * Zag has one machine for both levels, and a submenu is a machine that was told
 * its parent with `setParent`. Here the DOM says which is which. A `ui-menu`
 * whose nearest `ui-menu` ancestor exists is a submenu, and it links itself to
 * that ancestor once both machines have started.
 */
export declare class UIMenu extends ZagRootElement<menu.Props, menu.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [MENU_ROOT](): true;
    /** The menu this one is a submenu of: the nearest `ui-menu` ancestor, or null. */
    get parentMenu(): UIMenu | null;
    /**
     * Safe at any time, unlike `el.api.setOpen`, which is undefined until the
     * first frame after upgrade. A call made before the machine exists is read
     * as `defaultOpen` when the machine is built; after that it goes straight to
     * Zag, which ignores a state it is already in.
     */
    show(): void;
    hide(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * For the parent's render pass, never called by anything else.
     *
     * A submenu is one of its parent's renderables, so the parent's highlight
     * reaches the trigger item on the parent's own tick. The argument is the
     * parent's api and is ignored: this menu renders with its own.
     */
    render(_api: menu.Api): void;
    protected get componentName(): string;
    protected createMachine(props: () => menu.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): menu.Api;
    /**
     * `ids` comes from the parts: menu's anatomy has no root part, so Zag writes
     * no id here and an authored one survives untouched. Every value may be
     * `undefined`, for the reason the popover root gives: Zag's `compact` drops
     * the key and Zag's own default survives.
     *
     * `aria-label` is not read from an attribute. Zag omits the key when the
     * prop is unset and never removes what it did not write, so the consumer
     * authors `aria-label` on the content directly.
     */
    protected machineProps(): menu.Props;
    protected afterRender(): void;
    /**
     * The parent has always started first. It connected first, during parsing,
     * so its first frame ran before this one, and its machine started at the end
     * of that render. Both `set*` calls are sends, which is why this waits for
     * `afterStart` rather than `afterRender`.
     */
    protected afterStart(api: menu.Api): void;
}
//# sourceMappingURL=root.d.ts.map