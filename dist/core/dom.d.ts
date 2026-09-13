/**
 * DOM helpers shared by every component.
 *
 * Nothing here knows about a particular component, and nothing references a
 * tag name: a page can load the package twice, which breaks `instanceof`, and
 * the registration name is the one thing a consumer may have to change to dodge
 * a collision in the global custom element registry.
 */
export declare function findBranded<T>(start: Element, brand: symbol): T | null;
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
export declare function boolAttribute(el: Element, name: string): boolean | undefined;
/**
 * A numeric attribute. Absent or unparseable gives `undefined`, so the machine
 * keeps its own default rather than being handed a `NaN` that reaches
 * `Math.round` and spreads.
 */
export declare function numberAttribute(el: Element, name: string): number | undefined;
export declare function listAttribute(value: string | null): string[] | undefined;
/**
 * `{name}` placeholders in a translation, filled from `values`. Anything else
 * in the string, an unknown name included, is left alone.
 */
export declare function interpolate(template: string, values: Record<string, string | number>): string;
export declare function readDirection(el: Element): "ltr" | "rtl";
/**
 * The nearest `lang`, for a machine that parses or formats by locale. Zag
 * assumes `en-US` when told nothing, and a page sets its language once, on
 * the document, not on every root. Undefined keeps Zag's default.
 */
export declare function readLocale(el: Element): string | undefined;
/**
 * Custom element names are a global registry. Losing the race is silent unless
 * we say so, and a silent loss looks like the package simply not working.
 */
export declare function defineElement(name: string, ctor: CustomElementConstructor): void;
//# sourceMappingURL=dom.d.ts.map