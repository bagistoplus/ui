import { boolAttribute, listAttribute, numberAttribute } from "./dom";
/**
 * Zag's `positioning` prop is an object, so it flattens one attribute per key.
 *
 * Shared by every root that positions a panel with `@zag-js/popper`: popover
 * and menu today.
 */
export const POSITIONING_ATTRIBUTES = [
    "positioning-placement",
    "positioning-strategy",
    "positioning-gutter",
    "positioning-shift",
    "positioning-overflow-padding",
    "positioning-arrow-padding",
    "positioning-flip",
    "positioning-slide",
    "positioning-overlap",
    "positioning-same-width",
    "positioning-fit-viewport",
    "positioning-hide-when-detached",
];
/**
 * Every value may be `undefined`, and that is deliberate rather than sloppy.
 * `VanillaMachine` runs Zag's `compact` over these props recursively before the
 * machine sees them, so an absent attribute becomes an absent key and Zag's own
 * default survives. Passing an explicit `undefined` would spread straight over
 * that default instead, which for `gutter` would silently mean zero.
 */
export function readPositioning(el) {
    const strategy = el.getAttribute("positioning-strategy");
    return {
        placement: el.getAttribute("positioning-placement") ?? undefined,
        strategy: strategy === "absolute" || strategy === "fixed" ? strategy : undefined,
        gutter: numberAttribute(el, "positioning-gutter"),
        shift: numberAttribute(el, "positioning-shift"),
        overflowPadding: numberAttribute(el, "positioning-overflow-padding"),
        arrowPadding: numberAttribute(el, "positioning-arrow-padding"),
        flip: readFlip(el),
        slide: boolAttribute(el, "positioning-slide"),
        overlap: boolAttribute(el, "positioning-overlap"),
        sameWidth: boolAttribute(el, "positioning-same-width"),
        fitViewport: boolAttribute(el, "positioning-fit-viewport"),
        hideWhenDetached: boolAttribute(el, "positioning-hide-when-detached"),
    };
}
/** The one positioning option Zag takes as either a boolean or a list. */
function readFlip(el) {
    const value = el.getAttribute("positioning-flip");
    if (value == null) {
        return undefined;
    }
    if (value === "" || value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    return listAttribute(value);
}
//# sourceMappingURL=positioning.js.map