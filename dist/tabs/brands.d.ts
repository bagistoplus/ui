/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * Tabs needs only one. Its anatomy has no collection layer: a trigger sits in
 * the list and its panel is a sibling of the list, so every part registers
 * with the root.
 */
export declare const TABS_ROOT: unique symbol;
//# sourceMappingURL=brands.d.ts.map