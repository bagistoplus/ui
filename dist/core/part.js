import { Delegate } from "./delegate";
import { findBranded } from "./dom";
/**
 * Every element of a component except its root.
 *
 * A part finds its owner on connect and registers with it; the owner drives
 * rendering from there. The owner is found by a brand rather than a tag name
 * or `instanceof`, so a page that loaded the package twice still works.
 *
 * The owner is the root, or another part. Nothing here needs to know which,
 * and that is the point: an accordion groups a trigger and a panel under an
 * item, a tabs list holds triggers whose panels are somewhere else entirely,
 * and both are this one class.
 *
 * Where the props land is not the part's decision either. The consumer makes
 * it, with `delegate`, and `Delegate` answers it the same way for every
 * element.
 */
export class ZagPart extends HTMLElement {
    #delegate = new Delegate(this, () => this.scheduleRender());
    #owner = null;
    #authoredId;
    // Allocated on first use. Most parts never own anything, and an accordion of
    // 50 items carries 150 of them.
    #parts;
    get scopeKey() {
        return this.#owner?.scopeKey ?? this.localName;
    }
    get presenceEnabled() {
        return this.#owner?.presenceEnabled ?? false;
    }
    scheduleRender() {
        this.#owner?.scheduleRender();
    }
    registerId(part, id, value) {
        this.#owner?.registerId(part, id, value);
    }
    connectedCallback() {
        const owner = findBranded(this, this.ownerBrand);
        if (this.#owner && this.#owner !== owner) {
            this.unregister(this.#owner);
        }
        this.#owner = owner;
        if (owner) {
            this.register(owner);
        }
        this.#contributeId();
        this.#delegate.observe();
    }
    disconnectedCallback() {
        // A morph moves nodes, and so does the editor when it reorders a list, so
        // a disconnect is not a removal. Wait one microtask: a move is already
        // back in the document by then.
        queueMicrotask(() => {
            if (this.isConnected) {
                return;
            }
            if (this.#owner) {
                this.unregister(this.#owner);
            }
            this.#owner = null;
            this.#delegate.disconnect();
            this.release();
        });
    }
    attributeChangedCallback() {
        this.scheduleRender();
    }
    registerPart(part) {
        this.#parts ??= new Set();
        this.#parts.add(part);
        this.scheduleRender();
    }
    unregisterPart(part) {
        this.#parts?.delete(part);
    }
    render(api) {
        const owner = this.#owner;
        if (!owner) {
            return;
        }
        // Retried here for a delegating part, whose child does not exist yet when it
        // connects during parsing.
        this.#contributeId();
        const props = this.propsFor(api, owner);
        // `null` is never "no props": every Zag part returns at least data-scope
        // and data-part. It means this element is not in a renderable state, and
        // nothing below it can be either, so the whole subtree is skipped.
        if (!props) {
            return;
        }
        this.#delegate.apply(props, this.scopeFor(owner));
        if (this.#parts) {
            for (const part of this.#parts) {
                part.render(api);
            }
        }
    }
    get owner() {
        return this.#owner;
    }
    /**
     * Named `delegation`, not `delegate`, and that is not cosmetic.
     *
     * TypeScript's `protected` is erased, so this accessor is a real property on
     * the prototype at runtime. `delegate` is also an attribute consumers write,
     * and a framework choosing between `setAttribute` and a property assignment
     * tests `key in el`. A property of the same name makes it pick the property,
     * write to a getter, and lose the attribute entirely.
     *
     * The rule this follows: no attribute name may be shadowed by a class
     * property, unless that property reflects back to the attribute.
     */
    get delegation() {
        return this.#delegate;
    }
    /**
     * The key in the machine's `ids` prop this part maps to. Parts that leave it
     * undefined take whatever id Zag generates.
     *
     * A part Zag names by value returns its key only while it has a value, and
     * returns that value from `idValue`, so the root can file the id under it.
     */
    get idKey() {
        return undefined;
    }
    /** The value a value-keyed part's id is filed under. Undefined for a flat one. */
    get idValue() {
        return undefined;
    }
    /**
     * The id the consumer wrote, if any.
     *
     * Read from the delegate target, so it is the element Zag will actually name.
     * Nothing is cached until that element exists: with `delegate` this runs before
     * the child is parsed, and caching `null` there would lose the id for good.
     */
    authoredId() {
        if (this.#authoredId === undefined) {
            const target = this.#delegate.target();
            if (!target) {
                return undefined;
            }
            this.#authoredId = target.getAttribute("id");
        }
        return this.#authoredId ?? undefined;
    }
    scopeFor(owner) {
        this.scope = owner.scopeKey;
        return this.scope;
    }
    #contributeId() {
        const key = this.idKey;
        if (!key) {
            return;
        }
        const id = this.authoredId();
        if (id) {
            this.registerId(key, id, this.idValue);
        }
    }
    /** Called when the element is genuinely removed, not merely moved. */
    release() {
        if (this.scope) {
            this.#delegate.release(this.scope);
        }
    }
}
//# sourceMappingURL=part.js.map