import { ZagPart } from "../core/part";
import { ACCORDION_ITEM, ACCORDION_ROOT } from "./brands";
/**
 * The collection layer: one value, and the parts that render it.
 *
 * It is an ordinary part that happens to own parts. Its own owner is the root,
 * and `data-part="item"` is as much a part as `data-part="item-trigger"` is.
 */
export class UIAccordionItem extends ZagPart {
    static { this.observedAttributes = ["value", "disabled"]; }
    get [ACCORDION_ITEM]() {
        return true;
    }
    get root() {
        return this.owner;
    }
    /**
     * Reflected, because a property assignment must reach the attribute.
     *
     * Any framework that renders these elements decides between `setAttribute`
     * and a property assignment by testing `key in el`, so declaring a getter is
     * what makes `value` a property in the first place. Without a setter the
     * write lands on a getter-only property and is lost, leaving the element with
     * no value at all: Vue's client-side render does exactly this, so the markup
     * works from server HTML and silently does nothing after a route change.
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
    get disabled() {
        return this.hasAttribute("disabled");
    }
    set disabled(next) {
        this.toggleAttribute("disabled", Boolean(next));
    }
    get ownerBrand() {
        return ACCORDION_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
    /** Named by value: Zag's `ids.item` is a function of it. */
    get idKey() {
        return this.value ? "item" : undefined;
    }
    get idValue() {
        return this.value ?? undefined;
    }
    propsFor(api) {
        const value = this.value;
        return value ? api.getItemProps({ value, disabled: this.disabled }) : null;
    }
}
//# sourceMappingURL=item.js.map