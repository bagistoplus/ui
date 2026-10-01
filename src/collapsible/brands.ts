/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 *
 * One is enough: every part registers with the root. A nested collapsible
 * still works, because a part registers with the nearest branded ancestor.
 */
export const COLLAPSIBLE_ROOT: unique symbol = Symbol.for("@bagistoplus/ui.collapsible.root");
