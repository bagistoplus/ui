/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 */
export const TIMER_ROOT: unique symbol = Symbol.for("@bagistoplus/ui.timer.root");
export const TIMER_ITEM: unique symbol = Symbol.for("@bagistoplus/ui.timer.item");
