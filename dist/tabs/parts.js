import { ZagPart } from "../core/part";
import { TABS_ROOT } from "./brands";
/**
 * Every tabs part registers with the root.
 *
 * Unlike the accordion there is nothing in between: a trigger lives inside the
 * list and its panel is a sibling of the list, so the two are in different
 * subtrees and each carries its own `value`.
 */
class TabsPart extends ZagPart {
    get ownerBrand() {
        return TABS_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * Not optional, and not decoration. Zag puts the arrow, Home and End handling
 * on the list, guarded by a `contains` check, so a trigger only responds to the
 * keyboard while it is a descendant of this element. Both trigger and content
 * also carry `data-ownedby` pointing at this element's id.
 */
export class UITabsList extends TabsPart {
    get idKey() {
        return "list";
    }
    propsFor(api) {
        return api.getListProps();
    }
}
export class UITabsTrigger extends TabsPart {
    static { this.observedAttributes = ["value", "disabled"]; }
    #warned = false;
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
    /** Named by value: Zag's `ids.trigger` is a function of it. */
    get idKey() {
        return this.value ? "trigger" : undefined;
    }
    get idValue() {
        return this.value ?? undefined;
    }
    propsFor(api) {
        const value = this.value;
        return value ? api.getTriggerProps({ value, disabled: this.disabled }) : null;
    }
    /**
     * Zag hands this part a roving `tabindex`, so a plain container is reachable
     * with the arrow keys. What it has no handler for at all is activation:
     * `getTriggerProps` returns `onClick`, `onFocus` and `onBlur` and no key
     * handler, so nothing turns Enter or Space into a click except a real
     * `<button>`. A container trigger can be focused and never used.
     */
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one the arrow keys reach it but Enter and Space cannot activate it.`);
        }
        super.render(api);
    }
}
export class UITabsContent extends TabsPart {
    static { this.observedAttributes = ["value"]; }
    /** Reflected, for the reason given on the trigger. */
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
    /** Named by value, like the trigger. */
    get idKey() {
        return this.value ? "content" : undefined;
    }
    get idValue() {
        return this.value ?? undefined;
    }
    propsFor(api) {
        const value = this.value;
        return value ? api.getContentProps({ value }) : null;
    }
}
/**
 * A single element for the whole component, not one per tab. Zag measures the
 * selected trigger and writes the rect out as custom properties, so the CSS
 * that draws it is entirely yours: this part supplies `--left`, `--top`,
 * `--width` and `--height`, plus `position: absolute`.
 */
export class UITabsIndicator extends TabsPart {
    get idKey() {
        return "indicator";
    }
    propsFor(api) {
        return api.getIndicatorProps();
    }
}
//# sourceMappingURL=parts.js.map