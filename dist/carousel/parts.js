import { boolAttribute, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { CAROUSEL_INDICATOR_GROUP, CAROUSEL_ROOT } from "./brands";
/**
 * Every carousel part registers with the root. An indicator group is a brand
 * for numbering, not an owner: its indicators still render from the root,
 * because the root is where the index of each one is decided.
 */
class CarouselPart extends ZagPart {
    get ownerBrand() {
        return CAROUSEL_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * Reflected `index`, for the reason the tabs trigger gives for `value`: a
 * framework that renders these elements tests `key in el` before choosing
 * between a property write and `setAttribute`, and a getter-only property
 * swallows it.
 */
function reflectIndex(el, next) {
    if (next == null) {
        el.removeAttribute("index");
        return;
    }
    el.setAttribute("index", String(next));
}
/** One warning per element, for a part that has to be a real `<button>`. */
function warnOnce(part, delegated) {
    if (delegated || part.warned) {
        return;
    }
    part.warned = true;
    console.warn(`[@bagistoplus/ui] <${part.localName}> needs the \`delegate\` attribute and a <button> child. ` +
        `Without one it is not focusable and cannot be disabled.`);
}
/**
 * The scroll container. Zag writes the grid, the snap type and the overflow
 * into its style, observes its children for insertions, and measures the
 * snap points from it.
 */
export class UICarouselItemGroup extends CarouselPart {
    get idKey() {
        return "itemGroup";
    }
    /**
     * Zag turns snapping off for a mouse drag by writing `scroll-snap-type:
     * none` inline itself, outside its props, and puts it back when the drag
     * ends. Props are compared against the DOM here, so the value in the props
     * has to say `none` too while a drag runs, or every pointer move would write
     * snapping back on and the browser would snap on the first pixel.
     */
    propsFor(api) {
        const props = api.getItemGroupProps();
        if (api.isDragging && props.style !== null && typeof props.style === "object") {
            return { ...props, style: { ...props.style, scrollSnapType: "none" } };
        }
        return props;
    }
}
/**
 * One slide. Its index is its place among the root's countable items unless
 * `index` is written, and while it is `hidden` it has no index and renders
 * nothing, so the props it last received stay where they are until it is
 * shown again.
 */
export class UICarouselItem extends CarouselPart {
    static { this.observedAttributes = ["index", "hidden"]; }
    get index() {
        return numberAttribute(this, "index") ?? null;
    }
    set index(next) {
        reflectIndex(this, next);
    }
    /** The id the consumer wrote, for the root's `ids.item` lookup. */
    get authoredName() {
        return this.authoredId();
    }
    connectedCallback() {
        super.connectedCallback();
        // Captured before the first render writes Zag's name over it.
        this.authoredId();
    }
    attributeChangedCallback() {
        this.owner?.itemsChanged(false);
    }
    register(owner) {
        owner.registerItem(this);
    }
    unregister(owner) {
        owner.unregisterItem(this);
    }
    propsFor(api, owner) {
        const index = owner.indexOf(this);
        return index === undefined ? null : api.getItemProps({ index });
    }
}
export class UICarouselControl extends CarouselPart {
    propsFor(api) {
        return api.getControlProps();
    }
}
export class UICarouselPrevTrigger extends CarouselPart {
    constructor() {
        super(...arguments);
        this.warned = false;
    }
    get idKey() {
        return "prevTrigger";
    }
    propsFor(api) {
        return api.getPrevTriggerProps();
    }
    render(api) {
        warnOnce(this, this.delegation.enabled);
        super.render(api);
    }
}
export class UICarouselNextTrigger extends CarouselPart {
    constructor() {
        super(...arguments);
        this.warned = false;
    }
    get idKey() {
        return "nextTrigger";
    }
    propsFor(api) {
        return api.getNextTriggerProps();
    }
    render(api) {
        warnOnce(this, this.delegation.enabled);
        super.render(api);
    }
}
export class UICarouselAutoplayTrigger extends CarouselPart {
    constructor() {
        super(...arguments);
        this.warned = false;
    }
    propsFor(api) {
        return api.getAutoplayTriggerProps();
    }
    render(api) {
        warnOnce(this, this.delegation.enabled);
        super.render(api);
    }
}
/**
 * Holds the indicators and owns their keyboard. It is also the one part that
 * creates elements: with a `<template>` child it stamps one clone per page,
 * because the page count is known only here, at render time, from
 * `api.pageSnapPoints`. Without a template it leaves its children alone, which
 * is what a strip of thumbnails wants.
 */
export class UICarouselIndicatorGroup extends CarouselPart {
    #clones = [];
    get [CAROUSEL_INDICATOR_GROUP]() {
        return true;
    }
    get idKey() {
        return "indicatorGroup";
    }
    connectedCallback() {
        super.connectedCallback();
        this.authoredId();
    }
    /**
     * An authored id is kept as final here too. Zag has one `indicatorGroup` id
     * per carousel, so the flat registration would let the last group name every
     * group, and Zag never looks a group up by id.
     */
    propsFor(api) {
        const props = api.getIndicatorGroupProps();
        const id = this.authoredId();
        return id ? { ...props, id } : props;
    }
    render(api) {
        super.render(api);
        this.#stamp(api);
    }
    #stamp(api) {
        const target = this.delegation.target();
        const template = target?.querySelector(":scope > template");
        if (!target || !template) {
            return;
        }
        const count = api.pageSnapPoints.length;
        const groupId = this.authoredId();
        // A DOM differ that re-renders the group from server markup removes the
        // clones, since the server never sent them. Only the ones still here count.
        this.#clones = this.#clones.filter((clone) => clone.parentElement === target);
        while (this.#clones.length > count) {
            this.#clones.pop()?.remove();
        }
        while (this.#clones.length < count) {
            const index = this.#clones.length;
            const fragment = document.importNode(template.content, true);
            const clone = fragment.firstElementChild;
            if (!clone) {
                return;
            }
            clone.setAttribute("index", String(index));
            // Named before it connects, so the indicator captures it as authored.
            if (groupId) {
                const named = clone.hasAttribute("delegate") ? clone.firstElementChild : clone;
                named?.setAttribute("id", `${groupId}-${index}`);
            }
            const previous = this.#clones[index - 1] ?? template;
            previous.after(clone);
            this.#clones.push(clone);
        }
    }
}
/**
 * One page. Numbered among its group's non-hidden indicators unless `index`
 * is written. An authored id is kept as final, over Zag's, because Zag names
 * one indicator per page and a second group on the same carousel would
 * otherwise repeat every id of the first.
 */
export class UICarouselIndicator extends CarouselPart {
    static { this.observedAttributes = ["index", "read-only", "hidden"]; }
    get index() {
        return numberAttribute(this, "index") ?? null;
    }
    set index(next) {
        reflectIndex(this, next);
    }
    get authoredName() {
        return this.authoredId();
    }
    connectedCallback() {
        super.connectedCallback();
        this.authoredId();
    }
    attributeChangedCallback() {
        this.owner?.indicatorsChanged();
    }
    register(owner) {
        owner.registerIndicator(this);
    }
    unregister(owner) {
        owner.unregisterIndicator(this);
    }
    propsFor(api, owner) {
        const index = owner.indicatorIndexOf(this);
        if (index === undefined) {
            return null;
        }
        const props = api.getIndicatorProps({ index, readOnly: boolAttribute(this, "read-only") });
        const id = this.authoredName;
        return id ? { ...props, id } : props;
    }
}
/**
 * Zag's props for this part are two data attributes. The text is
 * `api.getProgressText()`, and a part whose whole meaning is a string writes
 * it, into the element that takes the props.
 */
export class UICarouselProgressText extends CarouselPart {
    propsFor(api) {
        return api.getProgressTextProps();
    }
    render(api) {
        super.render(api);
        const target = this.delegation.target();
        const text = api.getProgressText();
        if (target && target.textContent !== text) {
            target.textContent = text;
        }
    }
}
//# sourceMappingURL=parts.js.map