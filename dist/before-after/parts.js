import { ZagPart } from "../core/part";
import { BEFORE_AFTER_ROOT } from "./brands";
/**
 * Every before/after part registers with the root. All four are containers:
 * the machine positions them inside the root's box, and the handle carries
 * `role="slider"`, `tabindex` and the key handler, which a custom element holds
 * as well as a `<div>` does.
 */
class BeforeAfterPart extends ZagPart {
    get ownerBrand() {
        return BEFORE_AFTER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/** The slot clipped from the start edge to the handle. */
export class UIBeforeAfterBefore extends BeforeAfterPart {
    propsFor(api) {
        return api.getBeforeProps();
    }
}
/** The slot clipped from the handle to the end edge. */
export class UIBeforeAfterAfter extends BeforeAfterPart {
    propsFor(api) {
        return api.getAfterProps();
    }
}
export class UIBeforeAfterSeparator extends BeforeAfterPart {
    propsFor(api) {
        return api.getSeparatorProps();
    }
}
export class UIBeforeAfterHandle extends BeforeAfterPart {
    get idKey() {
        return "handle";
    }
    propsFor(api) {
        return api.getHandleProps();
    }
}
//# sourceMappingURL=parts.js.map