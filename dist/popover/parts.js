import { boolAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { POPOVER_ROOT } from "./brands";
/**
 * Every popover part registers with the root.
 *
 * There is nothing in between and nothing that could be. The content sits inside
 * the positioner, but the positioner owns none of its state: both are addressed
 * by their own generated id and both read straight off the one machine.
 */
class PopoverPart extends ZagPart {
    get ownerBrand() {
        return POPOVER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * Optional, and absent by default.
 *
 * With no anchor in the document Zag positions against the active trigger, which
 * is its own default. Write one when the popover should line up with something
 * larger than the button that opens it, such as a whole table row.
 */
export class UIPopoverAnchor extends PopoverPart {
    get idKey() {
        return "anchor";
    }
    propsFor(api) {
        return api.getAnchorProps();
    }
}
export class UIPopoverTrigger extends PopoverPart {
    static { this.observedAttributes = ["value"]; }
    #warned = false;
    /**
     * Only while this trigger has no `value`. Zag derives a valued trigger's id
     * from that value, so several of them cannot share one flat name.
     */
    get idKey() {
        return this.value == null ? "trigger" : undefined;
    }
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
    get value() {
        return this.getAttribute("value");
    }
    set value(next) {
        if (next == null) {
            this.removeAttribute("value");
            return;
        }
        this.setAttribute("value", next);
    }
    propsFor(api) {
        const value = this.value;
        return (value == null ? api.getTriggerProps() : api.getTriggerProps({ value }));
    }
    /**
     * Zag's trigger props carry `type="button"`, `aria-expanded` and click
     * handlers, and no `tabindex` at all. So a container trigger is not merely
     * awkward, it is unreachable: nothing focuses it and nothing turns Enter or
     * Space into a click except a real `<button>`.
     */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot open the popover.`);
        }
        super.render(api);
    }
}
/** A styling hook for whatever marks the open state, such as a rotating chevron. */
export class UIPopoverIndicator extends PopoverPart {
    propsFor(api) {
        return api.getIndicatorProps();
    }
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
export class UIPopoverPositioner extends PopoverPart {
    get idKey() {
        return "positioner";
    }
    propsFor(api) {
        return api.getPositionerProps();
    }
}
export class UIPopoverContent extends PopoverPart {
    static { this.observedAttributes = ["presence"]; }
    #presence;
    get idKey() {
        return "content";
    }
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
    get presenceEnabled() {
        return boolAttribute(this, "presence") ?? true;
    }
    propsFor(api) {
        return api.getContentProps();
    }
    render(api) {
        const owner = this.owner;
        if (!owner) {
            return;
        }
        if (!this.presenceEnabled) {
            this.#presence?.stop();
            this.#presence = undefined;
            super.render(api);
            return;
        }
        const props = this.propsFor(api);
        const node = this.delegation.target();
        if (!node) {
            return;
        }
        this.#presence ??= new PresenceController(() => owner.scheduleRender());
        this.delegation.apply(this.#presence.decorate(node, props, api.open), this.scopeFor(owner));
    }
    release() {
        this.#presence?.stop();
        this.#presence = undefined;
        super.release();
    }
}
/**
 * Naming the popover. Zag only points `aria-labelledby` at this element once it
 * has seen it in the document, which it checks one frame after the machine
 * starts, so it has to be present in the initial markup rather than added later.
 */
export class UIPopoverTitle extends PopoverPart {
    get idKey() {
        return "title";
    }
    propsFor(api) {
        return api.getTitleProps();
    }
}
/** Describing it. Same one-frame rule as the title. */
export class UIPopoverDescription extends PopoverPart {
    get idKey() {
        return "description";
    }
    propsFor(api) {
        return api.getDescriptionProps();
    }
}
export class UIPopoverCloseTrigger extends PopoverPart {
    #warned = false;
    get idKey() {
        return "closeTrigger";
    }
    propsFor(api) {
        return api.getCloseTriggerProps();
    }
    /** Unreachable as a container, for the reason given on the trigger. */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot close the popover.`);
        }
        super.render(api);
    }
}
/**
 * The arrow is a positioned box and the tip is what you see inside it.
 *
 * It must be a descendant of the positioner carrying `data-part="arrow"`, because
 * that is how floating-ui finds it, and floating-ui then writes `top`, `right`,
 * `bottom` and `left` onto it directly. Size and colour come from
 * `--arrow-size` and `--arrow-background`.
 */
export class UIPopoverArrow extends PopoverPart {
    get idKey() {
        return "arrow";
    }
    propsFor(api) {
        return api.getArrowProps();
    }
}
export class UIPopoverArrowTip extends PopoverPart {
    propsFor(api) {
        return api.getArrowTipProps();
    }
}
//# sourceMappingURL=parts.js.map