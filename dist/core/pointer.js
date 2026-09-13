/**
 * Pointer helpers shared by the machines the package writes itself.
 */
const interactiveSelector = [
    "a[href]",
    "button",
    "input",
    "select",
    "textarea",
    "summary",
    "[contenteditable=true]",
    "[role=button]",
    "[role=link]",
    "[role=menuitem]",
    "[role=option]",
    "[role=switch]",
    "[role=tab]",
].join(",");
/**
 * A synthetic pointer has no active pointer to capture, and the browser throws
 * for it. The capture only matters for a pointer that leaves the window mid
 * drag, so losing it is not worth an exception.
 */
export function capturePointer(el, pointerId) {
    try {
        el.setPointerCapture(pointerId);
    }
    catch {
        // Not captured.
    }
}
export function releasePointer(el, pointerId) {
    if (el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId);
    }
}
/** A press that starts on a control belongs to that control, not to the surface around it. */
export function isInteractiveTarget(target) {
    return target instanceof Element ? Boolean(target.closest(interactiveSelector)) : false;
}
//# sourceMappingURL=pointer.js.map