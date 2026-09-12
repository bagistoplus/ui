import type * as carousel from "@zag-js/carousel";

import { boolAttribute, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { CAROUSEL_INDICATOR_GROUP, CAROUSEL_ROOT } from "./brands";
import type { UICarousel } from "./root";

type Props = Record<string, unknown>;

export type UICarouselPart = ZagPart<carousel.Api, UICarousel>;

/**
 * Every carousel part registers with the root. An indicator group is a brand
 * for numbering, not an owner: its indicators still render from the root,
 * because the root is where the index of each one is decided.
 */
abstract class CarouselPart extends ZagPart<carousel.Api, UICarousel> {
  protected get ownerBrand(): symbol {
    return CAROUSEL_ROOT;
  }

  protected register(owner: UICarousel): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UICarousel): void {
    owner.unregisterChild(this);
  }
}

/**
 * Reflected `index`, for the reason the tabs trigger gives for `value`: a
 * framework that renders these elements tests `key in el` before choosing
 * between a property write and `setAttribute`, and a getter-only property
 * swallows it.
 */
function reflectIndex(el: HTMLElement, next: number | null): void {
  if (next == null) {
    el.removeAttribute("index");
    return;
  }

  el.setAttribute("index", String(next));
}

/** One warning per element, for a part that has to be a real `<button>`. */
function warnOnce(part: ZagPart<carousel.Api, UICarousel> & { warned: boolean }, delegated: boolean): void {
  if (delegated || part.warned) {
    return;
  }

  part.warned = true;
  console.warn(
    `[@bagistoplus/ui] <${part.localName}> needs the \`delegate\` attribute and a <button> child. ` +
      `Without one it is not focusable and cannot be disabled.`,
  );
}

/**
 * The scroll container. Zag writes the grid, the snap type and the overflow
 * into its style, observes its children for insertions, and measures the
 * snap points from it.
 */
export class UICarouselItemGroup extends CarouselPart {
  protected override get idKey(): string {
    return "itemGroup";
  }

  protected propsFor(api: carousel.Api): Props {
    return api.getItemGroupProps() as Props;
  }
}

/**
 * One slide. Its index is its place among the root's countable items unless
 * `index` is written, and while it is `hidden` it has no index and renders
 * nothing, so the props it last received stay where they are until it is
 * shown again.
 */
export class UICarouselItem extends CarouselPart {
  static readonly observedAttributes = ["index", "hidden"];

  get index(): number | null {
    return numberAttribute(this, "index") ?? null;
  }

  set index(next: number | null) {
    reflectIndex(this, next);
  }

  /** The id the consumer wrote, for the root's `ids.item` lookup. */
  get authoredName(): string | undefined {
    return this.authoredId();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Captured before the first render writes Zag's name over it.
    this.authoredId();
  }

  override attributeChangedCallback(): void {
    this.owner?.itemsChanged(false);
  }

  protected override register(owner: UICarousel): void {
    owner.registerItem(this);
  }

  protected override unregister(owner: UICarousel): void {
    owner.unregisterItem(this);
  }

  protected propsFor(api: carousel.Api, owner: UICarousel): Props | null {
    const index = owner.indexOf(this);

    return index === undefined ? null : (api.getItemProps({ index }) as Props);
  }
}

export class UICarouselControl extends CarouselPart {
  protected propsFor(api: carousel.Api): Props {
    return api.getControlProps() as Props;
  }
}

export class UICarouselPrevTrigger extends CarouselPart {
  warned = false;

  protected override get idKey(): string {
    return "prevTrigger";
  }

  protected propsFor(api: carousel.Api): Props {
    return api.getPrevTriggerProps() as Props;
  }

  override render(api: carousel.Api): void {
    warnOnce(this, this.delegation.enabled);
    super.render(api);
  }
}

export class UICarouselNextTrigger extends CarouselPart {
  warned = false;

  protected override get idKey(): string {
    return "nextTrigger";
  }

  protected propsFor(api: carousel.Api): Props {
    return api.getNextTriggerProps() as Props;
  }

  override render(api: carousel.Api): void {
    warnOnce(this, this.delegation.enabled);
    super.render(api);
  }
}

export class UICarouselAutoplayTrigger extends CarouselPart {
  warned = false;

  protected propsFor(api: carousel.Api): Props {
    return api.getAutoplayTriggerProps() as Props;
  }

  override render(api: carousel.Api): void {
    warnOnce(this, this.delegation.enabled);
    super.render(api);
  }
}

/**
 * Holds the indicators and owns their keyboard. It is also the one part that
 * creates elements: with a `<template>` child it stamps one clone per page,
 * because the page count is known only here, at render time, from
 * `api.pageSnapPoints`. Without a template it leaves its children alone, which
 * is what a strip of thumbnails wants.
 */
export class UICarouselIndicatorGroup extends CarouselPart {
  readonly #clones: Element[] = [];

  get [CAROUSEL_INDICATOR_GROUP](): true {
    return true;
  }

  protected override get idKey(): string {
    return "indicatorGroup";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.authoredId();
  }

  /**
   * An authored id is kept as final here too. Zag has one `indicatorGroup` id
   * per carousel, so the flat registration would let the last group name every
   * group, and Zag never looks a group up by id.
   */
  protected propsFor(api: carousel.Api): Props {
    const props = api.getIndicatorGroupProps() as Props;
    const id = this.authoredId();

    return id ? { ...props, id } : props;
  }

  override render(api: carousel.Api): void {
    super.render(api);
    this.#stamp(api);
  }

  #stamp(api: carousel.Api): void {
    const target = this.delegation.target();
    const template = target?.querySelector<HTMLTemplateElement>(":scope > template");

    if (!target || !template) {
      return;
    }

    const count = api.pageSnapPoints.length;
    const groupId = this.authoredId();

    while (this.#clones.length > count) {
      this.#clones.pop()?.remove();
    }

    while (this.#clones.length < count) {
      const index = this.#clones.length;
      const fragment = document.importNode(template.content, true);
      const clone = fragment.firstElementChild;

      if (!clone) {
        return;
      }

      clone.setAttribute("index", String(index));

      // Named before it connects, so the indicator captures it as authored.
      if (groupId) {
        const named = clone.hasAttribute("delegate") ? clone.firstElementChild : clone;

        named?.setAttribute("id", `${groupId}-${index}`);
      }

      const previous = this.#clones[index - 1] ?? template;

      previous.after(clone);
      this.#clones.push(clone);
    }
  }
}

/**
 * One page. Numbered among its group's non-hidden indicators unless `index`
 * is written. An authored id is kept as final, over Zag's, because Zag names
 * one indicator per page and a second group on the same carousel would
 * otherwise repeat every id of the first.
 */
export class UICarouselIndicator extends CarouselPart {
  static readonly observedAttributes = ["index", "read-only", "hidden"];

  get index(): number | null {
    return numberAttribute(this, "index") ?? null;
  }

  set index(next: number | null) {
    reflectIndex(this, next);
  }

  get authoredName(): string | undefined {
    return this.authoredId();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.authoredId();
  }

  override attributeChangedCallback(): void {
    this.owner?.indicatorsChanged();
  }

  protected override register(owner: UICarousel): void {
    owner.registerIndicator(this);
  }

  protected override unregister(owner: UICarousel): void {
    owner.unregisterIndicator(this);
  }

  protected propsFor(api: carousel.Api, owner: UICarousel): Props | null {
    const index = owner.indicatorIndexOf(this);

    if (index === undefined) {
      return null;
    }

    const props = api.getIndicatorProps({ index, readOnly: boolAttribute(this, "read-only") }) as Props;
    const id = this.authoredName;

    return id ? { ...props, id } : props;
  }
}

/**
 * Zag's props for this part are two data attributes. The text is
 * `api.getProgressText()`, and a part whose whole meaning is a string writes
 * it, into the element that takes the props.
 */
export class UICarouselProgressText extends CarouselPart {
  protected propsFor(api: carousel.Api): Props {
    return api.getProgressTextProps() as Props;
  }

  override render(api: carousel.Api): void {
    super.render(api);

    const target = this.delegation.target();
    const text = api.getProgressText();

    if (target && target.textContent !== text) {
      target.textContent = text;
    }
  }
}
