import * as dialog from "@zag-js/dialog";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { DIALOG_ROOT } from "./brands";
const supportsTopLayer = typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";
function isTopLayerPart(child) {
    return "layer" in child && "present" in child;
}
export class UIDialog extends ZagRootElement {
    static { this.observedAttributes = [
        "default-open",
        "modal",
        "content-role",
        "trap-focus",
        "prevent-scroll",
        "restore-focus",
        "close-on-interact-outside",
        "close-on-escape",
        "default-trigger-value",
        "initial-focus",
        "dir",
        "top-layer",
    ]; }
    #parts = new Set();
    // `undefined` means nothing asked. Consumed by the first render.
    #pendingOpen;
    get [DIALOG_ROOT]() {
        return true;
    }
    /**
     * Whether the backdrop and the positioner are promoted into the top layer.
     *
     * False on a browser without `showPopover`, whatever the attribute says. The
     * dialog then stacks by `z-index` like any other fixed element, which is the
     * shape every consumer had before the attribute existed.
     */
    get topLayer() {
        return supportsTopLayer && this.hasAttribute("top-layer");
    }
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
    show() {
        this.#setOpen(true);
    }
    hide() {
        this.#setOpen(false);
    }
    registerChild(child) {
        super.registerChild(child);
        if (isTopLayerPart(child)) {
            this.#parts.add(child);
        }
    }
    unregisterChild(child) {
        super.unregisterChild(child);
        if (isTopLayerPart(child)) {
            this.#parts.delete(child);
        }
    }
    get componentName() {
        return "dialog";
    }
    createMachine(props) {
        return new VanillaMachine(dialog.machine, props);
    }
    connect(machine) {
        return dialog.connect(machine.service, normalizeProps);
    }
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
    machineProps() {
        const role = this.getAttribute("content-role");
        const initialFocus = this.getAttribute("initial-focus");
        return {
            id: this.scopeKey,
            ids: this.authoredIds(),
            dir: readDirection(this),
            defaultOpen: this.#pendingOpen ?? boolAttribute(this, "default-open"),
            modal: boolAttribute(this, "modal"),
            // Not `role`. Zag puts this on the content, but `role` on the host would
            // also be read as ARIA, and an alertdialog wrapping a second alertdialog
            // is what assistive technology would then see.
            role: role === "dialog" || role === "alertdialog" ? role : undefined,
            trapFocus: boolAttribute(this, "trap-focus"),
            preventScroll: boolAttribute(this, "prevent-scroll"),
            restoreFocus: boolAttribute(this, "restore-focus"),
            closeOnInteractOutside: boolAttribute(this, "close-on-interact-outside"),
            closeOnEscape: boolAttribute(this, "close-on-escape"),
            defaultTriggerValue: this.getAttribute("default-trigger-value") ?? undefined,
            // Resolved at focus time and inside this element, so a field that
            // arrives after mount is still found.
            initialFocusEl: initialFocus ? () => this.querySelector(initialFocus) : undefined,
            onOpenChange: (details) => this.emit("open-change", details),
            onTriggerValueChange: (details) => this.emit("trigger-value-change", details),
        };
    }
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
    afterRender(api) {
        this.#pendingOpen = undefined;
        const parts = [...this.#parts];
        const wanted = this.topLayer && (api.open || parts.some((part) => part.present));
        const promoted = parts
            .filter((part) => part.layer !== undefined)
            .sort((a, b) => a.layer - b.layer);
        for (const part of promoted) {
            const el = part.element;
            if (!el) {
                continue;
            }
            const shown = el.matches(":popover-open");
            // Both calls throw when the element is already in the asked-for state,
            // and `showPopover` also throws on a detached element or one that has
            // lost its `popover` attribute to a DOM differ. That last case is what
            // the consumer's re-render repairs: the attribute comes back through
            // props, and the next pass through here promotes it again.
            if (wanted && !shown && el.isConnected && el.hasAttribute("popover")) {
                el.showPopover();
            }
            else if (!wanted && shown) {
                el.hidePopover();
            }
        }
    }
    #setOpen(open) {
        const api = this.api;
        if (api) {
            api.setOpen(open);
            return;
        }
        this.#pendingOpen = open;
        this.scheduleRender();
    }
}
//# sourceMappingURL=root.js.map