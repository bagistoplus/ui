import { ZagPart } from "../core/part";
import { TIMER_ITEM, TIMER_ROOT } from "./brands";
const TIME_PARTS = ["days", "hours", "minutes", "seconds", "milliseconds"];
/**
 * The collection layer: one time part, and the parts that render it.
 *
 * An ordinary part that owns parts, as the accordion item is. Zag's item
 * getters all take the type, and the value and the label under an item read
 * it from here rather than repeating it.
 */
export class UITimerItem extends ZagPart {
    static { this.observedAttributes = ["type"]; }
    get [TIMER_ITEM]() {
        return true;
    }
    /**
     * Reflected, for the reason the accordion item gives for `value`: a
     * framework that renders these elements tests `key in el` before choosing
     * between a property write and `setAttribute`, and a getter-only property
     * swallows the write.
     */
    get type() {
        return this.getAttribute("type");
    }
    set type(next) {
        if (next == null) {
            this.removeAttribute("type");
            return;
        }
        this.setAttribute("type", next);
    }
    /** Zag's time part, or `undefined` while `type` is missing or unknown. */
    get timePart() {
        const type = this.type;
        return TIME_PARTS.find((part) => part === type);
    }
    get ownerBrand() {
        return TIMER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
    propsFor(api) {
        const type = this.timePart;
        return type ? api.getItemProps({ type }) : null;
    }
}
//# sourceMappingURL=item.js.map