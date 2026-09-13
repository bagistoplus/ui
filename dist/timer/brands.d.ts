/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 */
export declare const TIMER_ROOT: unique symbol;
export declare const TIMER_ITEM: unique symbol;
//# sourceMappingURL=brands.d.ts.map