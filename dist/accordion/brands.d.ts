/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 */
export declare const ACCORDION_ROOT: unique symbol;
export declare const ACCORDION_ITEM: unique symbol;
//# sourceMappingURL=brands.d.ts.map