import { findBranded, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { SLIDER_ROOT, SLIDER_THUMB } from "./brands";
/** One warning per element, for a part that has to be a real form element. */
function warnOnce(part, child, consequence) {
    if (part.warned) {
        return;
    }
    part.warned = true;
    console.warn(`[@bagistoplus/ui] <${part.localName}> needs the \`delegate\` attribute and ${child} child. ` +
        `Without one ${consequence}.`);
}
function isThumb(owner) {
    return SLIDER_THUMB in owner;
}
/** A part that hangs off the root. */
class RootPart extends ZagPart {
    get ownerBrand() {
        return SLIDER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * first hidden input and names every thumb by this element's id, and only a
 * real label is a form label to the browser.
 */
export class UISliderLabel extends RootPart {
    constructor() {
        super(...arguments);
        this.warned = false;
    }
    get idKey() {
        return "label";
    }
    render(api) {
        if (!this.delegation.enabled) {
            warnOnce(this, "a <label>", "it is not a form label: `for` means nothing on it");
        }
        super.render(api);
    }
    propsFor(api) {
        return api.getLabelProps();
    }
}
/** The pointer surface. Zag looks for the thumbs inside it to measure them. */
export class UISliderControl extends RootPart {
    get idKey() {
        return "control";
    }
    propsFor(api) {
        return api.getControlProps();
    }
}
export class UISliderTrack extends RootPart {
    get idKey() {
        return "track";
    }
    propsFor(api) {
        return api.getTrackProps();
    }
}
/** The filled part of the track, positioned by the `--slider-range-*` properties. */
export class UISliderRange extends RootPart {
    get idKey() {
        return "range";
    }
    propsFor(api) {
        return api.getRangeProps();
    }
}
export class UISliderValueText extends RootPart {
    get idKey() {
        return "valueText";
    }
    propsFor(api) {
        return api.getValueTextProps();
    }
}
export class UISliderMarkerGroup extends RootPart {
    propsFor(api) {
        return api.getMarkerGroupProps();
    }
}
/**
 * Reflects a property write to the attribute. A framework rendering these
 * elements picks a property over `setAttribute` whenever `key in el`, and a
 * getter-only property swallows the write: Vue's client-side render does
 * exactly this, so the markup works from server HTML and silently loses the
 * value after a route change.
 */
function reflect(el, name, next) {
    if (next == null) {
        el.removeAttribute(name);
        return;
    }
    el.setAttribute(name, String(next));
}
/** A tick at `value`. `data-state` says whether it sits under, at or over the value. */
export class UISliderMarker extends RootPart {
    static { this.observedAttributes = ["value"]; }
    get value() {
        return numberAttribute(this, "value");
    }
    set value(next) {
        reflect(this, "value", next);
    }
    /** Named by value: Zag's `ids.marker` is a function of it. */
    get idKey() {
        return this.value === undefined ? undefined : "marker";
    }
    get idValue() {
        const value = this.value;
        return value === undefined ? undefined : String(value);
    }
    propsFor(api) {
        const value = this.value;
        return value === undefined ? null : api.getMarkerProps({ value });
    }
}
/**
 * One thumb. Its index is its place among the root's thumbs unless `index`
 * is written, and it owns the hidden input and the dragging indicator
 * written inside it, which take its index.
 *
 * Zag names every thumb by the label part through `aria-labelledby`, which
 * outranks an `aria-label` written on the thumb. Two thumbs need two names,
 * so the one the consumer wrote wins: Zag's `aria-labelledby` is dropped for
 * an authored `aria-label`, and an authored `aria-labelledby` replaces it.
 */
export class UISliderThumb extends ZagPart {
    static { this.observedAttributes = ["index", "name"]; }
    // `undefined` means not captured yet. Zag writes `aria-labelledby` on the
    // first render, so both are read before that render applies.
    #label;
    #labelledBy;
    get [SLIDER_THUMB]() {
        return true;
    }
    get index() {
        return numberAttribute(this, "index") ?? null;
    }
    set index(next) {
        reflect(this, "index", next);
    }
    /** The form name of this thumb's hidden input, over the root's `name`. */
    get name() {
        return this.getAttribute("name") ?? undefined;
    }
    set name(next) {
        reflect(this, "name", next);
    }
    /** The index Zag is told, or `undefined` before the root has numbered it. */
    get resolvedIndex() {
        return this.owner?.indexOf(this);
    }
    attributeChangedCallback() {
        this.owner?.thumbsChanged();
    }
    get ownerBrand() {
        return SLIDER_ROOT;
    }
    register(owner) {
        owner.registerThumb(this);
    }
    unregister(owner) {
        owner.unregisterThumb(this);
    }
    /** Named by index: Zag's `ids.thumb` is a function of it. */
    get idKey() {
        return this.resolvedIndex === undefined ? undefined : "thumb";
    }
    get idValue() {
        const index = this.resolvedIndex;
        return index === undefined ? undefined : String(index);
    }
    propsFor(api) {
        const index = this.resolvedIndex;
        if (index === undefined) {
            return null;
        }
        const props = api.getThumbProps({ index, name: this.name });
        this.#captureName();
        if (this.#label) {
            props["aria-label"] = this.#label;
            if (!this.#labelledBy) {
                delete props["aria-labelledby"];
            }
        }
        if (this.#labelledBy) {
            props["aria-labelledby"] = this.#labelledBy;
        }
        return props;
    }
    /** Read from the delegate target, the element Zag names. Uncached until it exists. */
    #captureName() {
        if (this.#label !== undefined) {
            return;
        }
        const target = this.delegation.target();
        if (!target) {
            return;
        }
        this.#label = target.getAttribute("aria-label");
        this.#labelledBy = target.getAttribute("aria-labelledby");
    }
}
/**
 * A part of one thumb. Written inside a thumb it registers with it and takes
 * its index; written outside one it registers with the root and needs
 * `index`.
 */
class ThumbPart extends ZagPart {
    static { this.observedAttributes = ["index"]; }
    get ownerBrand() {
        return findBranded(this, SLIDER_THUMB) ? SLIDER_THUMB : SLIDER_ROOT;
    }
    register(owner) {
        if (isThumb(owner)) {
            owner.registerPart(this);
            return;
        }
        owner.registerChild(this);
    }
    unregister(owner) {
        if (isThumb(owner)) {
            owner.unregisterPart(this);
            return;
        }
        owner.unregisterChild(this);
    }
    get thumb() {
        const owner = this.owner;
        return owner && isThumb(owner) ? owner : undefined;
    }
    /** The thumb's index inside one; the written `index` outside. */
    get index() {
        return this.thumb?.resolvedIndex ?? numberAttribute(this, "index");
    }
    set index(next) {
        reflect(this, "index", next);
    }
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag names it for the form, seeds
 * its value and writes every change into it, and a custom element is no form
 * control.
 */
export class UISliderHiddenInput extends ThumbPart {
    constructor() {
        super(...arguments);
        this.warned = false;
    }
    get idKey() {
        return this.index === undefined ? undefined : "hiddenInput";
    }
    get idValue() {
        const index = this.index;
        return index === undefined ? undefined : String(index);
    }
    render(api) {
        if (!this.delegation.enabled) {
            warnOnce(this, "an <input>", "nothing carries the value to a form");
        }
        super.render(api);
    }
    propsFor(api) {
        const index = this.index;
        return index === undefined ? null : api.getHiddenInputProps({ index, name: this.thumb?.name });
    }
}
/** Shown while its thumb drags, `hidden` otherwise, placed where the thumb is. */
export class UISliderDraggingIndicator extends ThumbPart {
    propsFor(api) {
        const index = this.index;
        return index === undefined ? null : api.getDraggingIndicatorProps({ index });
    }
}
//# sourceMappingURL=parts.js.map