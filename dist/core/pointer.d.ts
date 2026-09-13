/**
 * Pointer helpers shared by the machines the package writes itself.
 */
/**
 * A synthetic pointer has no active pointer to capture, and the browser throws
 * for it. The capture only matters for a pointer that leaves the window mid
 * drag, so losing it is not worth an exception.
 */
export declare function capturePointer(el: Element, pointerId: number): void;
export declare function releasePointer(el: Element, pointerId: number): void;
/** A press that starts on a control belongs to that control, not to the surface around it. */
export declare function isInteractiveTarget(target: EventTarget | null): boolean;
//# sourceMappingURL=pointer.d.ts.map