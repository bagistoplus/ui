import { boolAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { DIALOG_ROOT } from "./brands";
/**
 * Every dialog part registers with the root, and every one answers the root's
 * top layer questions, most of them with "not me".
 */
class DialogPart extends ZagPart {
    get layer() {
        return undefined;
    }
    get present() {
        return false;
    }
    get element() {
        return this.delegation.target();
    }
    get ownerBrand() {
        return DIALOG_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * A part Zag hides with `hidden`, held through its exit animation.
 *
 * On by default, for the reason the popover content gives: there is exactly
 * one of each, so the switch belongs on the element it governs and the cost is
 * one machine. Dialog has two such parts, the backdrop and the content, and
 * they animate independently, so each carries its own switch.
 */
class PresentDialogPart extends DialogPart {
    static { this.observedAttributes = ["presence"]; }
    #presence;
    get presenceEnabled() {
        return boolAttribute(this, "presence") ?? true;
    }
    /**
     * With presence off there is no machine to ask, and the answer is simply
     * whether the dialog is open.
     */
    get present() {
        return this.#presence?.present ?? this.owner?.api?.open ?? false;
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
        const props = this.propsFor(api, owner);
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
export class UIDialogTrigger extends DialogPart {
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
     * Reflected, because a property assignment must reach the attribute. See
     * `UIPopoverTrigger.value` for the framework behaviour that makes this
     * necessary; it is the same here.
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
     * Zag's trigger props carry `type="button"`, `aria-expanded` and a click
     * handler, and no `tabindex`. A container trigger is unreachable: nothing
     * focuses it and nothing turns Enter or Space into a click except a real
     * `<button>`.
     */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot open the dialog.`);
        }
        super.render(api);
    }
}
/**
 * Optional. The dim layer behind a modal, and the surface an outside click lands
 * on. It carries `hidden` and `data-state` from Zag, so it animates exactly as
 * the content does.
 */
export class UIDialogBackdrop extends PresentDialogPart {
    /** First into the top layer, so the positioner paints over it. */
    get layer() {
        return 0;
    }
    get idKey() {
        return "backdrop";
    }
    propsFor(api, owner) {
        const props = api.getBackdropProps();
        return owner.topLayer ? { ...props, popover: "manual" } : props;
    }
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
export class UIDialogPositioner extends DialogPart {
    get layer() {
        return 1;
    }
    get idKey() {
        return "positioner";
    }
    propsFor(api, owner) {
        const props = api.getPositionerProps();
        return owner.topLayer ? { ...props, popover: "manual" } : props;
    }
}
/**
 * The panel. `role`, `aria-modal` and the focus trap all land here.
 *
 * An `aria-label` you author on this element survives. Zag emits the key only
 * when its own `aria-label` prop is set, and the applier never removes an
 * attribute it did not write, so there is no attribute for it on the root.
 */
export class UIDialogContent extends PresentDialogPart {
    get idKey() {
        return "content";
    }
    propsFor(api) {
        return api.getContentProps();
    }
}
/**
 * Naming the dialog. Zag only points `aria-labelledby` at this element once it
 * has seen it in the document, which it checks one frame after opening, so it
 * has to be present in the initial markup rather than added later.
 */
export class UIDialogTitle extends DialogPart {
    get idKey() {
        return "title";
    }
    propsFor(api) {
        return api.getTitleProps();
    }
}
/** Describing it. Same one-frame rule as the title. */
export class UIDialogDescription extends DialogPart {
    get idKey() {
        return "description";
    }
    propsFor(api) {
        return api.getDescriptionProps();
    }
}
export class UIDialogCloseTrigger extends DialogPart {
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
                `Without one it is not focusable and the keyboard cannot close the dialog.`);
        }
        super.render(api);
    }
}
//# sourceMappingURL=parts.js.map