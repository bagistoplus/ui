import type * as popover from "@zag-js/popover";
import { ZagPart } from "../core/part";
import type { UIPopover } from "./root";
type Props = Record<string, unknown>;
export type UIPopoverPart = ZagPart<popover.Api, UIPopover>;
/**
 * Every popover part registers with the root.
 *
 * There is nothing in between and nothing that could be. The content sits inside
 * the positioner, but the positioner owns none of its state: both are addressed
 * by their own generated id and both read straight off the one machine.
 */
declare abstract class PopoverPart extends ZagPart<popover.Api, UIPopover> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIPopover): void;
    protected unregister(owner: UIPopover): void;
}
/**
 * Optional, and absent by default.
 *
 * With no anchor in the document Zag positions against the active trigger, which
 * is its own default. Write one when the popover should line up with something
 * larger than the button that opens it, such as a whole table row.
 */
export declare class UIPopoverAnchor extends PopoverPart {
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
}
export declare class UIPopoverTrigger extends PopoverPart {
    #private;
    static readonly observedAttributes: string[];
    /**
     * Only while this trigger has no `value`. Zag derives a valued trigger's id
     * from that value, so several of them cannot share one flat name.
     */
    protected get idKey(): string | undefined;
    /**
     * Reflected, because a property assignment must reach the attribute.
     *
     * Any framework that renders these elements decides between `setAttribute` and
     * a property assignment by testing `key in el`, so declaring a getter is what
     * makes `value` a property in the first place. Without a setter the write lands
     * on a getter-only property and is lost, leaving the element with no value at
     * all: Vue's client-side render does exactly this, so the markup works from
     * server HTML and silently does nothing after a route change.
     *
     * `value` is optional here, unlike on a tabs trigger. It only matters when one
     * popover has several triggers and switches between them.
     */
    get value(): string | null;
    set value(next: string | null);
    protected propsFor(api: popover.Api): Props;
    /**
     * Zag's trigger props carry `type="button"`, `aria-expanded` and click
     * handlers, and no `tabindex` at all. So a container trigger is not merely
     * awkward, it is unreachable: nothing focuses it and nothing turns Enter or
     * Space into a click except a real `<button>`.
     */
    render(api: popover.Api): void;
}
/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export declare class UIPopoverIndicator extends PopoverPart {
    protected propsFor(api: popover.Api): Props;
}
/**
 * Not optional, and not the same element as the content.
 *
 * floating-ui positions this element and owns part of its inline style: Zag's
 * props supply a `transform` that reads `var(--x)` and `var(--y)`, and
 * `@zag-js/popper` writes those two values directly once it has measured. So the
 * content cannot share the element, and anything that rewrites this element's
 * `style` wholesale loses the coordinates until `api.reposition()` runs.
 */
export declare class UIPopoverPositioner extends PopoverPart {
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
}
export declare class UIPopoverContent extends PopoverPart {
    #private;
    static readonly observedAttributes: string[];
    protected get idKey(): string;
    /**
     * On by default, unlike the accordion's, where it is opt in on the root.
     *
     * The difference is arity, not taste. An accordion has one panel per item, so
     * one switch on the root beats N switches, and paying for N presence machines
     * that nobody asked for is a real cost. A popover has exactly one content, so
     * the switch belongs on the element it governs and the cost is one machine.
     *
     * Leaving it on is close to free for consumers who animate nothing:
     * `@zag-js/presence` keys on `animation-name`, so with none declared it lets
     * `hidden` land on the same frame.
     */
    get presenceEnabled(): boolean;
    protected propsFor(api: popover.Api): Props;
    render(api: popover.Api): void;
    protected release(): void;
}
/**
 * Naming the popover. Zag only points `aria-labelledby` at this element once it
 * has seen it in the document, which it checks one frame after the machine
 * starts, so it has to be present in the initial markup rather than added later.
 */
export declare class UIPopoverTitle extends PopoverPart {
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
}
/** Describing it. Same one-frame rule as the title. */
export declare class UIPopoverDescription extends PopoverPart {
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
}
export declare class UIPopoverCloseTrigger extends PopoverPart {
    #private;
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
    /** Unreachable as a container, for the reason given on the trigger. */
    render(api: popover.Api): void;
}
/**
 * The arrow is a positioned box and the tip is what you see inside it.
 *
 * It must be a descendant of the positioner carrying `data-part="arrow"`, because
 * that is how floating-ui finds it, and floating-ui then writes `top`, `right`,
 * `bottom` and `left` onto it directly. Size and colour come from
 * `--arrow-size` and `--arrow-background`.
 */
export declare class UIPopoverArrow extends PopoverPart {
    protected get idKey(): string;
    protected propsFor(api: popover.Api): Props;
}
export declare class UIPopoverArrowTip extends PopoverPart {
    protected propsFor(api: popover.Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map