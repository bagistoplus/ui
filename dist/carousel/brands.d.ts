/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * The carousel needs two. Every part registers with the root, but an
 * indicator is numbered among the indicators of its own group, so a group has
 * to be findable from an indicator.
 */
export declare const CAROUSEL_ROOT: unique symbol;
export declare const CAROUSEL_INDICATOR_GROUP: unique symbol;
//# sourceMappingURL=brands.d.ts.map