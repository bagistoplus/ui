/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * Dialog needs only one. Every part registers with the root, including the
 * content, which sits inside the positioner rather than under anything that owns
 * it.
 */
export declare const DIALOG_ROOT: unique symbol;
//# sourceMappingURL=brands.d.ts.map