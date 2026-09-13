/**
 * DOM helpers shared by every component.
 *
 * Nothing here knows about a particular component, and nothing references a
 * tag name: a page can load the package twice, which breaks `instanceof`, and
 * the registration name is the one thing a consumer may have to change to dodge
 * a collision in the global custom element registry.
 */
export function findBranded(start, brand) {
    for (let node = start.parentElement; node; node = node.parentElement) {
        if (node[brand] === true) {
            return node;
        }
    }
    return null;
}
/**
 * A boolean attribute with three states, not two.
 *
 * Absent returns `undefined`, so the caller passes nothing and the machine
 * applies its own default. Present returns `true`, and the literal value
 * `"false"` returns `false`. That last case is the point: half of Zag's booleans
 * default to `true`, and presence alone can only ever turn something on.
 *
 * It does deviate from HTML, where `disabled="false"` still means disabled. The
 * deviation is deliberate and total: one rule for every boolean attribute here,
 * so no two of them read the same markup in opposite directions.
 */
export function boolAttribute(el, name) {
    const value = el.getAttribute(name);
    if (value === null) {
        return undefined;
    }
    return value !== "false";
}
/**
 * A numeric attribute. Absent or unparseable gives `undefined`, so the machine
 * keeps its own default rather than being handed a `NaN` that reaches
 * `Math.round` and spreads.
 */
export function numberAttribute(el, name) {
    const value = el.getAttribute(name);
    if (value == null || value.trim() === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
export function listAttribute(value) {
    if (value == null) {
        return undefined;
    }
    const items = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    return items.length > 0 ? items : undefined;
}
/**
 * `{name}` placeholders in a translation, filled from `values`. Anything else
 * in the string, an unknown name included, is left alone.
 */
export function interpolate(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}
export function readDirection(el) {
    return el.closest("[dir]")?.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}
/**
 * The nearest `lang`, for a machine that parses or formats by locale. Zag
 * assumes `en-US` when told nothing, and a page sets its language once, on
 * the document, not on every root. Undefined keeps Zag's default.
 */
export function readLocale(el) {
    return el.closest("[lang]")?.getAttribute("lang") || undefined;
}
/**
 * Custom element names are a global registry. Losing the race is silent unless
 * we say so, and a silent loss looks like the package simply not working.
 */
export function defineElement(name, ctor) {
    const existing = customElements.get(name);
    if (existing === ctor) {
        return;
    }
    if (existing) {
        console.warn(`[@bagistoplus/ui] <${name}> is already registered by something else. ` +
            `The @bagistoplus/ui element was not installed and will not work.`);
        return;
    }
    customElements.define(name, ctor);
}
//# sourceMappingURL=dom.js.map