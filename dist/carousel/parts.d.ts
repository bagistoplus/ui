import type * as carousel from "@zag-js/carousel";
import { ZagPart } from "../core/part";
import { CAROUSEL_INDICATOR_GROUP } from "./brands";
import type { UICarousel } from "./root";
type Props = Record<string, unknown>;
export type UICarouselPart = ZagPart<carousel.Api, UICarousel>;
/**
 * Every carousel part registers with the root. An indicator group is a brand
 * for numbering, not an owner: its indicators still render from the root,
 * because the root is where the index of each one is decided.
 */
declare abstract class CarouselPart extends ZagPart<carousel.Api, UICarousel> {
    protected get ownerBrand(): symbol;
    protected register(owner: UICarousel): void;
    protected unregister(owner: UICarousel): void;
}
/**
 * The scroll container. Zag writes the grid, the snap type and the overflow
 * into its style, observes its children for insertions, and measures the
 * snap points from it.
 */
export declare class UICarouselItemGroup extends CarouselPart {
    protected get idKey(): string;
    /**
     * Zag turns snapping off for a mouse drag by writing `scroll-snap-type:
     * none` inline itself, outside its props, and puts it back when the drag
     * ends. Props are compared against the DOM here, so the value in the props
     * has to say `none` too while a drag runs, or every pointer move would write
     * snapping back on and the browser would snap on the first pixel.
     */
    protected propsFor(api: carousel.Api): Props;
}
/**
 * One slide. Its index is its place among the root's countable items unless
 * `index` is written, and while it is `hidden` it has no index and renders
 * nothing, so the props it last received stay where they are until it is
 * shown again.
 */
export declare class UICarouselItem extends CarouselPart {
    static readonly observedAttributes: string[];
    get index(): number | null;
    set index(next: number | null);
    /** The id the consumer wrote, for the root's `ids.item` lookup. */
    get authoredName(): string | undefined;
    connectedCallback(): void;
    attributeChangedCallback(): void;
    protected register(owner: UICarousel): void;
    protected unregister(owner: UICarousel): void;
    protected propsFor(api: carousel.Api, owner: UICarousel): Props | null;
}
export declare class UICarouselControl extends CarouselPart {
    protected propsFor(api: carousel.Api): Props;
}
export declare class UICarouselPrevTrigger extends CarouselPart {
    warned: boolean;
    protected get idKey(): string;
    protected propsFor(api: carousel.Api): Props;
    render(api: carousel.Api): void;
}
export declare class UICarouselNextTrigger extends CarouselPart {
    warned: boolean;
    protected get idKey(): string;
    protected propsFor(api: carousel.Api): Props;
    render(api: carousel.Api): void;
}
export declare class UICarouselAutoplayTrigger extends CarouselPart {
    warned: boolean;
    protected propsFor(api: carousel.Api): Props;
    render(api: carousel.Api): void;
}
/**
 * Holds the indicators and owns their keyboard. It is also the one part that
 * creates elements: with a `<template>` child it stamps one clone per page,
 * because the page count is known only here, at render time, from
 * `api.pageSnapPoints`. Without a template it leaves its children alone, which
 * is what a strip of thumbnails wants.
 */
export declare class UICarouselIndicatorGroup extends CarouselPart {
    #private;
    get [CAROUSEL_INDICATOR_GROUP](): true;
    protected get idKey(): string;
    connectedCallback(): void;
    /**
     * An authored id is kept as final here too. Zag has one `indicatorGroup` id
     * per carousel, so the flat registration would let the last group name every
     * group, and Zag never looks a group up by id.
     */
    protected propsFor(api: carousel.Api): Props;
    render(api: carousel.Api): void;
}
/**
 * One page. Numbered among its group's non-hidden indicators unless `index`
 * is written. An authored id is kept as final, over Zag's, because Zag names
 * one indicator per page and a second group on the same carousel would
 * otherwise repeat every id of the first.
 */
export declare class UICarouselIndicator extends CarouselPart {
    static readonly observedAttributes: string[];
    get index(): number | null;
    set index(next: number | null);
    get authoredName(): string | undefined;
    connectedCallback(): void;
    attributeChangedCallback(): void;
    protected register(owner: UICarousel): void;
    protected unregister(owner: UICarousel): void;
    protected propsFor(api: carousel.Api, owner: UICarousel): Props | null;
}
/**
 * Zag's props for this part are two data attributes. The text is
 * `api.getProgressText()`, and a part whose whole meaning is a string writes
 * it, into the element that takes the props.
 */
export declare class UICarouselProgressText extends CarouselPart {
    protected propsFor(api: carousel.Api): Props;
    render(api: carousel.Api): void;
}
export {};
//# sourceMappingURL=parts.d.ts.map