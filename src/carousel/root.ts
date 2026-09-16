import * as carousel from "@zag-js/carousel";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, findBranded, interpolate, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { Tiers, numberOf } from "../core/tiers";
import { CAROUSEL_INDICATOR_GROUP, CAROUSEL_ROOT } from "./brands";
import type { UICarouselIndicator, UICarouselItem } from "./parts";

type Props = Record<string, unknown>;

/** One numbered element: an item, or an indicator inside its group. */
interface Numbered extends HTMLElement {
  readonly index: number | null;
  readonly authoredName: string | undefined;
}

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
export class UICarousel extends ZagRootElement<carousel.Props, carousel.Api> {
  static readonly observedAttributes = [
    "slides-per-page",
    "slides-per-move",
    "spacing",
    "padding",
    "loop",
    "allow-mouse-drag",
    "auto-size",
    "autoplay",
    "autoplay-delay",
    "default-page",
    "orientation",
    "snap-type",
    "in-view-threshold",
    "slide-count",
    "dir",
    "translations-next-trigger",
    "translations-prev-trigger",
    "translations-autoplay-start",
    "translations-autoplay-stop",
    "translations-item",
    "translations-indicator",
    "translations-progress-text",
  ];

  readonly #items = new Set<UICarouselItem>();
  readonly #indicators = new Set<UICarouselIndicator>();

  // Built lazily, once per render, and dropped whenever the sets change.
  #itemOrder: Map<Numbered, number> | undefined;
  #indicatorOrder: Map<Numbered, number> | undefined;

  #count: number | undefined;
  #resumePage: number | undefined;
  #restartFrame = 0;

  readonly #tiers = new Tiers(this, RESPONSIVE_ATTRIBUTES, () => this.pushProps());

  get [CAROUSEL_ROOT](): true {
    return true;
  }

  protected get componentName(): string {
    return "carousel";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#tiers.watch();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#tiers.unwatch();
      }
    });
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    this.#tiers.watch();
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  protected createMachine(props: () => carousel.Props): VanillaMachine<any> {
    return new VanillaMachine(carousel.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): carousel.Api {
    return carousel.connect(machine.service, normalizeProps);
  }

  protected machineProps(): carousel.Props {
    const slidesPerMove = this.#tiers.value("slides-per-move");
    const autoplay = boolAttribute(this, "autoplay");
    const delay = numberAttribute(this, "autoplay-delay");

    return {
      id: this.scopeKey,
      ids: {
        root: this.authoredId(),
        ...this.authoredIds(),
        item: (index: number) => this.#itemAt(index)?.authoredName,
        indicator: (index: number) => this.#indicatorAt(index)?.authoredName,
      } as carousel.Props["ids"],
      dir: readDirection(this),

      slideCount: numberAttribute(this, "slide-count") ?? this.#countable().length,
      slidesPerPage: numberOf(this.#tiers.value("slides-per-page")),
      slidesPerMove: slidesPerMove === "auto" ? "auto" : numberOf(slidesPerMove),
      spacing: this.#tiers.value("spacing"),
      padding: this.#tiers.value("padding"),
      loop: boolAttribute(this, "loop"),
      allowMouseDrag: boolAttribute(this, "allow-mouse-drag"),
      autoSize: boolAttribute(this, "auto-size"),
      autoplay: autoplay && delay !== undefined ? { delay } : autoplay,
      defaultPage: this.#resumePage ?? numberAttribute(this, "default-page"),
      orientation: this.getAttribute("orientation") === "vertical" ? "vertical" : undefined,
      snapType: this.getAttribute("snap-type") === "proximity" ? "proximity" : undefined,
      inViewThreshold: numberAttribute(this, "in-view-threshold"),
      translations: this.#translations(),

      onPageChange: (details) => this.emit("page-change", details),
      onDragStatusChange: (details) => this.emit("drag-status-change", details),
      onAutoplayStatusChange: (details) => this.emit("autoplay-status-change", details),
    };
  }

  /**
   * Three things Zag does not write, added next to the three custom properties
   * it does. `--page` and `--page-count` are what a progress bar needs and
   * cannot compute from CSS alone, and `data-autoplay-state` lets anything in
   * the carousel, not only the autoplay trigger, style itself by it.
   */
  protected override rootProps(api: carousel.Api): Props {
    this.#itemOrder = undefined;
    this.#indicatorOrder = undefined;

    const props = api.getRootProps() as Props;
    const style = props.style !== null && typeof props.style === "object" ? (props.style as Props) : {};

    return {
      ...props,
      style: { ...style, "--page": api.page, "--page-count": api.pageSnapPoints.length },
      "data-autoplay-state": api.isPlaying ? "playing" : "paused",
    };
  }

  protected override afterStart(): void {
    this.#resumePage = undefined;
    this.#count = this.#countable().length;
  }

  registerItem(item: UICarouselItem): void {
    this.#items.add(item);
    this.registerChild(item);
    this.itemsChanged(true);
  }

  unregisterItem(item: UICarouselItem): void {
    this.#items.delete(item);
    this.unregisterChild(item);
    this.itemsChanged(true);
  }

  registerIndicator(indicator: UICarouselIndicator): void {
    this.#indicators.add(indicator);
    this.registerChild(indicator);
    this.indicatorsChanged();
  }

  unregisterIndicator(indicator: UICarouselIndicator): void {
    this.#indicators.delete(indicator);
    this.unregisterChild(indicator);
    this.indicatorsChanged();
  }

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
  itemsChanged(structural: boolean): void {
    this.#itemOrder = undefined;

    if (!this.api) {
      return;
    }

    if (structural) {
      this.#scheduleRestart();
      return;
    }

    const count = this.#countable().length;

    if (count !== this.#count) {
      this.#count = count;
      this.pushProps();
      return;
    }

    this.scheduleRender();
  }

  indicatorsChanged(): void {
    this.#indicatorOrder = undefined;
    this.scheduleRender();
  }

  /** The index Zag is told for this item, or `undefined` while it is hidden. */
  indexOf(item: UICarouselItem): number | undefined {
    if (item.index !== null) {
      return item.index;
    }

    this.#itemOrder ??= order(this.#countable());

    return this.#itemOrder.get(item);
  }

  /**
   * Numbered among the indicators of its own group, so a stamped clone and an
   * authored thumbnail count the same way, and a second group starts at zero.
   */
  indicatorIndexOf(indicator: UICarouselIndicator): number | undefined {
    if (indicator.index !== null) {
      return indicator.index;
    }

    if (!this.#indicatorOrder) {
      this.#indicatorOrder = new Map();

      const groups = new Map<Element | null, UICarouselIndicator[]>();

      for (const candidate of this.#indicators) {
        if (candidate.hidden) {
          continue;
        }

        const group = findBranded<Element>(candidate, CAROUSEL_INDICATOR_GROUP);
        const list = groups.get(group) ?? [];

        list.push(candidate);
        groups.set(group, list);
      }

      for (const list of groups.values()) {
        for (const [element, index] of order(list)) {
          this.#indicatorOrder.set(element, index);
        }
      }
    }

    return this.#indicatorOrder.get(indicator);
  }

  #itemAt(index: number): UICarouselItem | undefined {
    for (const item of this.#items) {
      if (this.indexOf(item) === index) {
        return item;
      }
    }

    return undefined;
  }

  #indicatorAt(index: number): UICarouselIndicator | undefined {
    for (const indicator of this.#indicators) {
      if (this.indicatorIndexOf(indicator) === index) {
        return indicator;
      }
    }

    return undefined;
  }

  /** The registered items that are not `hidden`, in document order. */
  #countable(): UICarouselItem[] {
    return sorted([...this.#items].filter((item) => !item.hidden));
  }

  #scheduleRestart(): void {
    if (this.#restartFrame) {
      return;
    }

    this.#restartFrame = requestAnimationFrame(() => {
      this.#restartFrame = 0;

      if (!this.isConnected) {
        return;
      }

      // The page is the one thing worth carrying over. It is read back as
      // `defaultPage` when the new machine is built.
      this.#resumePage = this.api?.page;
      this.restart();
    });
  }

  #translations(): carousel.IntlTranslations | undefined {
    const read = (name: string) => this.getAttribute(`translations-${name}`);
    const translations: carousel.IntlTranslations = {};

    const nextTrigger = read("next-trigger");
    const prevTrigger = read("prev-trigger");
    const autoplayStart = read("autoplay-start");
    const autoplayStop = read("autoplay-stop");
    const item = read("item");
    const indicator = read("indicator");
    const progressText = read("progress-text");

    if (nextTrigger) {
      translations.nextTrigger = nextTrigger;
    }

    if (prevTrigger) {
      translations.prevTrigger = prevTrigger;
    }

    if (autoplayStart) {
      translations.autoplayStart = autoplayStart;
    }

    if (autoplayStop) {
      translations.autoplayStop = autoplayStop;
    }

    // Indices are one based here: these strings are read to people.
    if (item) {
      translations.item = (index, count) => interpolate(item, { index: index + 1, count });
    }

    if (indicator) {
      translations.indicator = (index) => interpolate(indicator, { index: index + 1 });
    }

    if (progressText) {
      translations.progressText = ({ page, totalPages }) => interpolate(progressText, { page, totalPages });
    }

    return Object.keys(translations).length > 0 ? translations : undefined;
  }
}

const RESPONSIVE_ATTRIBUTES = ["slides-per-page", "slides-per-move", "spacing", "padding"] as const;

/** Numbers the elements without an explicit `index`, in the order given. */
function order<T extends Numbered>(elements: T[]): Map<T, number> {
  const map = new Map<T, number>();
  let next = 0;

  for (const element of elements) {
    if (element.index === null) {
      map.set(element, next++);
    }
  }

  return map;
}

/** Document order, without a tag name in sight. */
function sorted<T extends Element>(elements: T[]): T[] {
  return elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
