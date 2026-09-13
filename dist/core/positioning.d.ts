import type { PositioningOptions } from "@zag-js/popover";
/**
 * Zag's `positioning` prop is an object, so it flattens one attribute per key.
 *
 * Shared by every root that positions a panel with `@zag-js/popper`: popover
 * and menu today.
 */
export declare const POSITIONING_ATTRIBUTES: readonly ["positioning-placement", "positioning-strategy", "positioning-gutter", "positioning-shift", "positioning-overflow-padding", "positioning-arrow-padding", "positioning-flip", "positioning-slide", "positioning-overlap", "positioning-same-width", "positioning-fit-viewport", "positioning-hide-when-detached"];
/**
 * Every value may be `undefined`, and that is deliberate rather than sloppy.
 * `VanillaMachine` runs Zag's `compact` over these props recursively before the
 * machine sees them, so an absent attribute becomes an absent key and Zag's own
 * default survives. Passing an explicit `undefined` would spread straight over
 * that default instead, which for `gutter` would silently mean zero.
 */
export declare function readPositioning(el: Element): PositioningOptions;
//# sourceMappingURL=positioning.d.ts.map