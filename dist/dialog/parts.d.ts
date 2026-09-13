import type * as dialog from "@zag-js/dialog";
import { ZagPart } from "../core/part";
import type { TopLayerPart, UIDialog } from "./root";
type Props = Record<string, unknown>;
export type UIDialogPart = ZagPart<dialog.Api, UIDialog>;
/**
 * Every dialog part registers with the root, and every one answers the root's
 * top layer questions, most of them with "not me".
 */
declare abstract class DialogPart extends ZagPart<dialog.Api, UIDialog> implements TopLayerPart {
    get layer(): number | undefined;
    get present(): boolean;
    get element(): HTMLElement | null;
    protected get ownerBrand(): symbol;
    protected register(owner: UIDialog): void;
    protected unregister(owner: UIDialog): void;
}
/**
 * A part Zag hides with `hidden`, held through its exit animation.
 *
 * On by default, for the reason the popover content gives: there is exactly
 * one of each, so the switch belongs on the element it governs and the cost is
 * one machine. Dialog has two such parts, the backdrop and the content, and
 * they animate independently, so each carries its own switch.
 */
declare abstract class PresentDialogPart extends DialogPart {
    #private;
    static readonly observedAttributes: string[];
    protected abstract propsFor(api: dialog.Api, owner: UIDialog): Props;
    get presenceEnabled(): boolean;
    /**
     * With presence off there is no machine to ask, and the answer is simply
     * whether the dialog is open.
     */
    get present(): boolean;
    render(api: dialog.Api): void;
    protected release(): void;
}
export declare class UIDialogTrigger extends DialogPart {
    #private;
    static readonly observedAttributes: string[];
    /**
     * Only while this trigger has no `value`. Zag derives a valued trigger's id
     * from that value, so several of them cannot share one flat name.
     */
    protected get idKey(): string | undefined;
    /**
     * Reflected, because a property assignment must reach the attribute. See
     * `UIPopoverTrigger.value` for the framework behaviour that makes this
     * necessary; it is the same here.
     */
    get value(): string | null;
    set value(next: string | null);
    protected propsFor(api: dialog.Api): Props;
    /**
     * Zag's trigger props carry `type="button"`, `aria-expanded` and a click
     * handler, and no `tabindex`. A container trigger is unreachable: nothing
     * focuses it and nothing turns Enter or Space into a click except a real
     * `<button>`.
     */
    render(api: dialog.Api): void;
}
/**
 * Optional. The dim layer behind a modal, and the surface an outside click lands
 * on. It carries `hidden` and `data-state` from Zag, so it animates exactly as
 * the content does.
 */
export declare class UIDialogBackdrop extends PresentDialogPart {
    /** First into the top layer, so the positioner paints over it. */
    get layer(): number;
    protected get idKey(): string;
    protected propsFor(api: dialog.Api, owner: UIDialog): Props;
}
/**
 * Required, and not the same element as the content.
 *
 * This is the element that enters the top layer, never the content: a top layer
 * element takes the viewport as its containing block, so promoting the content
 * would pull it out of whatever layout the positioner gives it. Zag writes only
 * `pointer-events` here, no `hidden`, which is why the root rather than this
 * element decides when it leaves.
 */
export declare class UIDialogPositioner extends DialogPart {
    get layer(): number;
    protected get idKey(): string;
    protected propsFor(api: dialog.Api, owner: UIDialog): Props;
}
/**
 * The panel. `role`, `aria-modal` and the focus trap all land here.
 *
 * An `aria-label` you author on this element survives. Zag emits the key only
 * when its own `aria-label` prop is set, and the applier never removes an
 * attribute it did not write, so there is no attribute for it on the root.
 */
export declare class UIDialogContent extends PresentDialogPart {
    protected get idKey(): string;
    protected propsFor(api: dialog.Api): Props;
}
/**
 * Naming the dialog. Zag only points `aria-labelledby` at this element once it
 * has seen it in the document, which it checks one frame after opening, so it
 * has to be present in the initial markup rather than added later.
 */
export declare class UIDialogTitle extends DialogPart {
    protected get idKey(): string;
    protected propsFor(api: dialog.Api): Props;
}
/** Describing it. Same one-frame rule as the title. */
export declare class UIDialogDescription extends DialogPart {
    protected get idKey(): string;
    protected propsFor(api: dialog.Api): Props;
}
export declare class UIDialogCloseTrigger extends DialogPart {
    #private;
    protected get idKey(): string;
    protected propsFor(api: dialog.Api): Props;
    /** Unreachable as a container, for the reason given on the trigger. */
    render(api: dialog.Api): void;
}
export {};
//# sourceMappingURL=parts.d.ts.map