/**
 * Responsive attribute values, as tiers.
 *
 * `slides-per-page="1 640:2 1024:4"` is one value for every width below
 * 640px, another from 640px, another from 1024px: the same rule as `min-width`
 * media queries, mobile first. The widest matching tier wins. A value without
 * tiers is a one-tier value, so `slides-per-page="3"` is unchanged.
 *
 * Zag has no breakpoints. A root that wants them watches one `matchMedia`
 * query per distinct width across its responsive attributes and pushes its
 * props when any of them flips, so a tier change goes through the same path
 * as any attribute write.
 */
export interface Tier {
  width: number;
  value: string;
}

export class Tiers {
  readonly #el: Element;
  readonly #attributes: readonly string[];

  // One query per distinct tier width across the responsive attributes.
  readonly #queries = new Map<number, MediaQueryList>();
  readonly #onChange: () => void;

  constructor(el: Element, attributes: readonly string[], onChange: () => void) {
    this.#el = el;
    this.#attributes = attributes;
    this.#onChange = onChange;
  }

  /** The value of a responsive attribute for the current viewport. */
  value(name: string): string | undefined {
    const tiers = parseTiers(this.#el.getAttribute(name));

    if (tiers.length === 0) {
      return undefined;
    }

    let value = tiers[0]!.value;

    for (const tier of tiers) {
      if (tier.width > 0 && this.#queries.get(tier.width)?.matches) {
        value = tier.value;
      }
    }

    return value;
  }

  /** Re-reads the attributes: a query per new width, none for a width no longer used. */
  watch(): void {
    const widths = new Set<number>();

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

  unwatch(): void {
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
export function parseTiers(value: string | null): Tier[] {
  if (value == null) {
    return [];
  }

  const tiers: Tier[] = [];

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
export function numberOf(value: string | undefined): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}
