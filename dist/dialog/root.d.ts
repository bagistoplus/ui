import * as dialog from "@zag-js/dialog";
import { VanillaMachine } from "@zag-js/vanilla";
import { type Renderable, ZagRootElement } from "../core/root";
import { DIALOG_ROOT } from "./brands";
/**
 * What the root asks of a part when it decides who is in the top layer.
 *
 * The root never learns the anatomy. A part says whether it is promoted and at
 * which rank, whether it still has to be shown, and which element carries the
 * `popover` attribute. That is enough to order the backdrop under the positioner
 * and to keep both up until the last exit animation has ended.
 */
export interface TopLayerPart {
    /**
     * Paint order within the top layer, lower first, or `undefined` for a part
     * that is never promoted. Entry order is paint order there and `z-index` does
     * not apply between top layer elements, so the backdrop has to enter before
     * the positioner every time, whatever order the consumer wrote them in.
     */
    readonly layer: number | undefined;
    /** Whether this part still has to be shown, an exit animation included. */
    readonly present: boolean;
    /** The element Zag's props landed on, which with `delegate` is the child. */
    readonly element: HTMLElement | null;
}
export declare class UIDialog extends ZagRootElement<dialog.Props, dialog.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [DIALOG_ROOT](): true;
    /**
     * Whether the backdrop and the positioner are promoted into the top layer.
     *
     * False on a browser without `showPopover`, whatever the attribute says. The
     * dialog then stacks by `z-index` like any other fixed element, which is the
     * shape every consumer had before the attribute existed.
     */
    get topLayer(): boolean;
    /**
     * Safe at any time, unlike `el.api.setOpen`, which is undefined until the
     * first frame after upgrade.
     *
     * A call made before the machine exists is not queued. `#create()` runs
     * lazily inside the first render, so the intent is simply read as
     * `defaultOpen` when the machine is built, and the dialog starts in that
     * state. After that the call goes straight to Zag, which ignores a state it
     * is already in.
     */
    show(): void;
    hide(): void;
    registerChild(child: Renderable<dialog.Api>): void;
    unregisterChild(child: Renderable<dialog.Api>): void;
    protected get componentName(): string;
    protected createMachine(props: () => dialog.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): dialog.Api;
    /**
     * Every value may be `undefined`, and that is deliberate. `VanillaMachine`
     * runs Zag's `compact` over these props before the machine sees them, so an
     * absent attribute becomes an absent key and Zag's own default survives.
     * That matters more here than on most machines: `trapFocus`, `preventScroll`
     * and `closeOnInteractOutside` all default to whatever `modal` is, and an
     * explicit `undefined` would spread over that derivation.
     *
     * `ids` comes from the parts. Dialog's anatomy has no root part, so Zag
     * writes no id here and an authored one survives untouched; the parts report
     * the ids their consumer wrote so Zag generates those names instead of its
     * own. See `ZagRootElement.registerId`.
     */
    protected machineProps(): dialog.Props;
    /**
     * The top layer is entered and left here, never from a part.
     *
     * The positioner is the element that has to be promoted, since a top layer
     * element takes the viewport as its containing block and promoting the
     * content would strip it out of the positioner's layout. But Zag gives the
     * positioner no `hidden`, only `pointer-events`, so the positioner alone
     * cannot know when it is still needed: that is the content's presence state,
     * and it exists only once the content has rendered. Hence this runs after
     * every child, and asks them.
     *
     * One condition governs both elements, so the dim layer and the panel leave
     * together after the longer of the two exit animations rather than one
     * vanishing while the other is still fading.
     */
    protected afterRender(api: dialog.Api): void;
}
//# sourceMappingURL=root.d.ts.map