/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * Dialog needs only one. Every part registers with the root, including the
 * content, which sits inside the positioner rather than under anything that owns
 * it.
 */
export const DIALOG_ROOT = Symbol.for("@bagistoplus/ui.dialog.root");
//# sourceMappingURL=brands.js.map