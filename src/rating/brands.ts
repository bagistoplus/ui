/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 */
export const RATING_ROOT: unique symbol = Symbol.for("@bagistoplus/ui.rating.root");
