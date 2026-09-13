import { findBranded } from "../core/dom";
import { ZagPart } from "../core/part";
import { DATE_PICKER_ROOT, DATE_PICKER_VIEW } from "./brands";
import { isView } from "./dates";
/**
 * One of the three calendars: `day`, `month` or `year`. Zag hides every view
 * but the current one, so all three sit in the content at once.
 *
 * Not a collection layer. The parts inside register with the root like any
 * other and read their `view` from here through `viewOf`, so a part written
 * outside any view is the day view with no special case.
 */
export class UIDatePickerView extends ZagPart {
    static { this.observedAttributes = ["view"]; }
    get [DATE_PICKER_VIEW]() {
        return true;
    }
    /**
     * Reflected, for the reason the accordion item gives for `value`: a
     * framework that renders these elements tests `key in el` before choosing
     * between a property write and `setAttribute`, and a getter-only property
     * swallows the write.
     */
    get view() {
        return this.getAttribute("view");
    }
    set view(next) {
        if (next == null) {
            this.removeAttribute("view");
            return;
        }
        this.setAttribute("view", next);
    }
    get ownerBrand() {
        return DATE_PICKER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
    propsFor(api) {
        const view = this.view;
        return isView(view) ? api.getViewProps({ view }) : null;
    }
}
/** The view a part belongs to: the nearest `ui-date-picker-view`, or the day view. */
export function viewOf(part) {
    const view = findBranded(part, DATE_PICKER_VIEW)?.view;
    return isView(view) ? view : "day";
}
//# sourceMappingURL=view.js.map