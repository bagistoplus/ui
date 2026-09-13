/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * The number input needs only one: every part is a direct concern of the root.
 */
export declare const NUMBER_INPUT_ROOT: unique symbol;
//# sourceMappingURL=brands.d.ts.map