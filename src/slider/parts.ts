import type * as slider from "@zag-js/slider";

import { findBranded, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { SLIDER_ROOT, SLIDER_THUMB } from "./brands";
import type { UISlider } from "./root";

type Props = Record<string, unknown>;

export type UISliderPart = ZagPart<slider.Api, UISlider | UISliderThumb>;

/** One warning per element, for a part that has to be a real form element. */
function warnOnce(part: ZagPart<slider.Api, any> & { warned: boolean }, child: string, consequence: string): void {
  if (part.warned) {
    return;
  }

  part.warned = true;
  console.warn(
    `[@bagistoplus/ui] <${part.localName}> needs the \`delegate\` attribute and ${child} child. ` +
      `Without one ${consequence}.`,
  );
}

function isThumb(owner: UISlider | UISliderThumb): owner is UISliderThumb {
  return SLIDER_THUMB in owner;
}

/** A part that hangs off the root. */
abstract class RootPart extends ZagPart<slider.Api, UISlider> {
  protected get ownerBrand(): symbol {
    return SLIDER_ROOT;
  }

  protected register(owner: UISlider): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UISlider): void {
    owner.unregisterChild(this);
  }
}

/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * first hidden input and names every thumb by this element's id, and only a
 * real label is a form label to the browser.
 */
export class UISliderLabel extends RootPart {
  warned = false;

  protected override get idKey(): string {
    return "label";
  }

  override render(api: slider.Api): void {
    if (!this.delegation.enabled) {
      warnOnce(this, "a <label>", "it is not a form label: `for` means nothing on it");
    }

    super.render(api);
  }

  protected propsFor(api: slider.Api): Props {
    return api.getLabelProps() as Props;
  }
}

/** The pointer surface. Zag looks for the thumbs inside it to measure them. */
export class UISliderControl extends RootPart {
  protected override get idKey(): string {
    return "control";
  }

  protected propsFor(api: slider.Api): Props {
    return api.getControlProps() as Props;
  }
}

export class UISliderTrack extends RootPart {
  protected override get idKey(): string {
    return "track";
  }

  protected propsFor(api: slider.Api): Props {
    return api.getTrackProps() as Props;
  }
}

/** The filled part of the track, positioned by the `--slider-range-*` properties. */
export class UISliderRange extends RootPart {
  protected override get idKey(): string {
    return "range";
  }

  protected propsFor(api: slider.Api): Props {
    return api.getRangeProps() as Props;
  }
}

export class UISliderValueText extends RootPart {
  protected override get idKey(): string {
    return "valueText";
  }

  protected propsFor(api: slider.Api): Props {
    return api.getValueTextProps() as Props;
  }
}

export class UISliderMarkerGroup extends RootPart {
  protected propsFor(api: slider.Api): Props {
    return api.getMarkerGroupProps() as Props;
  }
}

/**
 * Reflects a property write to the attribute. A framework rendering these
 * elements picks a property over `setAttribute` whenever `key in el`, and a
 * getter-only property swallows the write: Vue's client-side render does
 * exactly this, so the markup works from server HTML and silently loses the
 * value after a route change.
 */
function reflect(el: HTMLElement, name: string, next: string | number | null | undefined): void {
  if (next == null) {
    el.removeAttribute(name);
    return;
  }

  el.setAttribute(name, String(next));
}

/** A tick at `value`. `data-state` says whether it sits under, at or over the value. */
export class UISliderMarker extends RootPart {
  static readonly observedAttributes = ["value"];

  get value(): number | undefined {
    return numberAttribute(this, "value");
  }

  set value(next: number | null | undefined) {
    reflect(this, "value", next);
  }

  /** Named by value: Zag's `ids.marker` is a function of it. */
  protected override get idKey(): string | undefined {
    return this.value === undefined ? undefined : "marker";
  }

  protected override get idValue(): string | undefined {
    const value = this.value;

    return value === undefined ? undefined : String(value);
  }

  protected propsFor(api: slider.Api): Props | null {
    const value = this.value;

    return value === undefined ? null : (api.getMarkerProps({ value }) as Props);
  }
}

/**
 * One thumb. Its index is its place among the root's thumbs unless `index`
 * is written, and it owns the hidden input and the dragging indicator
 * written inside it, which take its index.
 *
 * Zag names every thumb by the label part through `aria-labelledby`, which
 * outranks an `aria-label` written on the thumb. Two thumbs need two names,
 * so the one the consumer wrote wins: Zag's `aria-labelledby` is dropped for
 * an authored `aria-label`, and an authored `aria-labelledby` replaces it.
 */
export class UISliderThumb extends ZagPart<slider.Api, UISlider> {
  static readonly observedAttributes = ["index", "name"];

  // `undefined` means not captured yet. Zag writes `aria-labelledby` on the
  // first render, so both are read before that render applies.
  #label: string | null | undefined;
  #labelledBy: string | null | undefined;

  get [SLIDER_THUMB](): true {
    return true;
  }

  get index(): number | null {
    return numberAttribute(this, "index") ?? null;
  }

  set index(next: number | null | undefined) {
    reflect(this, "index", next);
  }

  /** The form name of this thumb's hidden input, over the root's `name`. */
  get name(): string | undefined {
    return this.getAttribute("name") ?? undefined;
  }

  set name(next: string | null | undefined) {
    reflect(this, "name", next);
  }

  /** The index Zag is told, or `undefined` before the root has numbered it. */
  get resolvedIndex(): number | undefined {
    return this.owner?.indexOf(this);
  }

  override attributeChangedCallback(): void {
    this.owner?.thumbsChanged();
  }

  protected get ownerBrand(): symbol {
    return SLIDER_ROOT;
  }

  protected register(owner: UISlider): void {
    owner.registerThumb(this);
  }

  protected unregister(owner: UISlider): void {
    owner.unregisterThumb(this);
  }

  /** Named by index: Zag's `ids.thumb` is a function of it. */
  protected override get idKey(): string | undefined {
    return this.resolvedIndex === undefined ? undefined : "thumb";
  }

  protected override get idValue(): string | undefined {
    const index = this.resolvedIndex;

    return index === undefined ? undefined : String(index);
  }

  protected propsFor(api: slider.Api): Props | null {
    const index = this.resolvedIndex;

    if (index === undefined) {
      return null;
    }

    const props = api.getThumbProps({ index, name: this.name }) as Props;

    this.#captureName();

    if (this.#label) {
      props["aria-label"] = this.#label;

      if (!this.#labelledBy) {
        delete props["aria-labelledby"];
      }
    }

    if (this.#labelledBy) {
      props["aria-labelledby"] = this.#labelledBy;
    }

    return props;
  }

  /** Read from the delegate target, the element Zag names. Uncached until it exists. */
  #captureName(): void {
    if (this.#label !== undefined) {
      return;
    }

    const target = this.delegation.target();

    if (!target) {
      return;
    }

    this.#label = target.getAttribute("aria-label");
    this.#labelledBy = target.getAttribute("aria-labelledby");
  }
}

/**
 * A part of one thumb. Written inside a thumb it registers with it and takes
 * its index; written outside one it registers with the root and needs
 * `index`.
 */
abstract class ThumbPart extends ZagPart<slider.Api, UISlider | UISliderThumb> {
  static readonly observedAttributes = ["index"];

  protected get ownerBrand(): symbol {
    return findBranded(this, SLIDER_THUMB) ? SLIDER_THUMB : SLIDER_ROOT;
  }

  protected register(owner: UISlider | UISliderThumb): void {
    if (isThumb(owner)) {
      owner.registerPart(this);
      return;
    }

    owner.registerChild(this);
  }

  protected unregister(owner: UISlider | UISliderThumb): void {
    if (isThumb(owner)) {
      owner.unregisterPart(this);
      return;
    }

    owner.unregisterChild(this);
  }

  protected get thumb(): UISliderThumb | undefined {
    const owner = this.owner;

    return owner && isThumb(owner) ? owner : undefined;
  }

  /** The thumb's index inside one; the written `index` outside. */
  get index(): number | undefined {
    return this.thumb?.resolvedIndex ?? numberAttribute(this, "index");
  }

  set index(next: number | null | undefined) {
    reflect(this, "index", next);
  }
}

/**
 * Always `delegate`, wrapping an `<input>`. Zag names it for the form, seeds
 * its value and writes every change into it, and a custom element is no form
 * control.
 */
export class UISliderHiddenInput extends ThumbPart {
  warned = false;

  protected override get idKey(): string | undefined {
    return this.index === undefined ? undefined : "hiddenInput";
  }

  protected override get idValue(): string | undefined {
    const index = this.index;

    return index === undefined ? undefined : String(index);
  }

  override render(api: slider.Api): void {
    if (!this.delegation.enabled) {
      warnOnce(this, "an <input>", "nothing carries the value to a form");
    }

    super.render(api);
  }

  protected propsFor(api: slider.Api): Props | null {
    const index = this.index;

    return index === undefined ? null : (api.getHiddenInputProps({ index, name: this.thumb?.name }) as Props);
  }
}

/** Shown while its thumb drags, `hidden` otherwise, placed where the thumb is. */
export class UISliderDraggingIndicator extends ThumbPart {
  protected propsFor(api: slider.Api): Props | null {
    const index = this.index;

    return index === undefined ? null : (api.getDraggingIndicatorProps({ index }) as Props);
  }
}
