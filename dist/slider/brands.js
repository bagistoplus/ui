/**
 * Brands, not tag names. A `Symbol.for` brand survives a page that loaded the
 * package twice, which `instanceof` does not, and it keeps the tag names
 * renameable.
 */
export const SLIDER_ROOT = Symbol.for("@bagistoplus/ui.slider.root");
export const SLIDER_THUMB = Symbol.for("@bagistoplus/ui.slider.thumb");
//# sourceMappingURL=brands.js.map