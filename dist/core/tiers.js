export class Tiers {
    #el;
    #attributes;
    // One query per distinct tier width across the responsive attributes.
    #queries = new Map();
    #onChange;
    constructor(el, attributes, onChange) {
        this.#el = el;
        this.#attributes = attributes;
        this.#onChange = onChange;
    }
    /** The value of a responsive attribute for the current viewport. */
    value(name) {
        const tiers = parseTiers(this.#el.getAttribute(name));
        if (tiers.length === 0) {
            return undefined;
        }
        let value = tiers[0].value;
        for (const tier of tiers) {
            if (tier.width > 0 && this.#queries.get(tier.width)?.matches) {
                value = tier.value;
            }
        }
        return value;
    }
    /** Re-reads the attributes: a query per new width, none for a width no longer used. */
    watch() {
        const widths = new Set();
        for (const name of this.#attributes) {
            for (const tier of parseTiers(this.#el.getAttribute(name))) {
                if (tier.width > 0) {
                    widths.add(tier.width);
                }
            }
        }
        for (const [width, query] of this.#queries) {
            if (!widths.has(width)) {
                query.removeEventListener("change", this.#onChange);
                this.#queries.delete(width);
            }
        }
        for (const width of widths) {
            if (!this.#queries.has(width)) {
                const query = window.matchMedia(`(min-width: ${width}px)`);
                query.addEventListener("change", this.#onChange);
                this.#queries.set(width, query);
            }
        }
    }
    unwatch() {
        for (const query of this.#queries.values()) {
            query.removeEventListener("change", this.#onChange);
        }
        this.#queries.clear();
    }
}
/**
 * `"1 640:2 1024:4"` becomes three tiers, the first at width 0. A token
 * without a width is the base; a token with an unparseable width is dropped.
 */
export function parseTiers(value) {
    if (value == null) {
        return [];
    }
    const tiers = [];
    for (const token of value.trim().split(/\s+/)) {
        if (token === "") {
            continue;
        }
        const colon = token.indexOf(":");
        if (colon === -1) {
            tiers.push({ width: 0, value: token });
            continue;
        }
        const width = Number(token.slice(0, colon));
        if (Number.isFinite(width)) {
            tiers.push({ width, value: token.slice(colon + 1) });
        }
    }
    return tiers.sort((a, b) => a.width - b.width);
}
/** A tier value as a number, or `undefined` when it is not one. */
export function numberOf(value) {
    if (value == null || value === "") {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
//# sourceMappingURL=tiers.js.map