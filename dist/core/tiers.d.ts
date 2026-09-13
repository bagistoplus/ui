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
export declare class Tiers {
    #private;
    constructor(el: Element, attributes: readonly string[], onChange: () => void);
    /** The value of a responsive attribute for the current viewport. */
    value(name: string): string | undefined;
    /** Re-reads the attributes: a query per new width, none for a width no longer used. */
    watch(): void;
    unwatch(): void;
}
/**
 * `"1 640:2 1024:4"` becomes three tiers, the first at width 0. A token
 * without a width is the base; a token with an unparseable width is dropped.
 */
export declare function parseTiers(value: string | null): Tier[];
/** A tier value as a number, or `undefined` when it is not one. */
export declare function numberOf(value: string | undefined): number | undefined;
//# sourceMappingURL=tiers.d.ts.map