import * as carousel from "@zag-js/carousel";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { CAROUSEL_ROOT } from "./brands";
import type { UICarouselIndicator, UICarouselItem } from "./parts";
type Props = Record<string, unknown>;
/**
 * Zag's carousel is told how many slides it has and which index each one
 * carries. Neither is a fact the consumer has to repeat: the items are
 * elements, they register here, and the DOM already orders them. So the count
 * is the number of registered items that are not `hidden`, and an item's index
 * is its place among those, unless the consumer writes `slide-count` or
 * `index` and takes over.
 *
 * `hidden` is the one exclusion, because it is the one the element can read
 * without layout. An item hidden by a class is still a slide.
 */
export declare class UICarousel extends ZagRootElement<carousel.Props, carousel.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [CAROUSEL_ROOT](): true;
    protected get componentName(): string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    protected createMachine(props: () => carousel.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): carousel.Api;
    protected machineProps(): carousel.Props;
    /**
     * Three things Zag does not write, added next to the three custom properties
     * it does. `--page` and `--page-count` are what a progress bar needs and
     * cannot compute from CSS alone, and `data-autoplay-state` lets anything in
     * the carousel, not only the autoplay trigger, style itself by it.
     */
    protected rootProps(api: carousel.Api): Props;
    protected afterStart(): void;
    registerItem(item: UICarouselItem): void;
    unregisterItem(item: UICarouselItem): void;
    registerIndicator(indicator: UICarouselIndicator): void;
    unregisterIndicator(indicator: UICarouselIndicator): void;
    /**
     * An item joined, left, or changed what it is counted as.
     *
     * A changed count is pushed to the running machine, whose `slideCount`
     * watcher re-measures the snap points. An item that joined or left after
     * start also needs the machine rebuilt, because Zag's intersection and
     * resize observers were bound to the items it found at start and will never
     * see this one. That is coalesced onto one frame, so a differ swapping ten
     * items restarts once. A `hidden` toggle needs no restart: the element was
     * there at start and is already observed.
     */
    itemsChanged(structural: boolean): void;
    indicatorsChanged(): void;
    /** The index Zag is told for this item, or `undefined` while it is hidden. */
    indexOf(item: UICarouselItem): number | undefined;
    /**
     * Numbered among the indicators of its own group, so a stamped clone and an
     * authored thumbnail count the same way, and a second group starts at zero.
     */
    indicatorIndexOf(indicator: UICarouselIndicator): number | undefined;
}
export {};
//# sourceMappingURL=root.d.ts.map