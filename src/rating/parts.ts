import type * as rating from "@zag-js/rating-group";

import { ZagPart } from "../core/part";
import { RATING_ROOT } from "./brands";
import type { UIRating } from "./root";

type Props = Record<string, unknown>;

/** One warning per element, for a part that has to be a real form element. */
function warnOnce(part: ZagPart<rating.Api, any> & { warned: boolean }, child: string, consequence: string): void {
  if (part.warned) {
    return;
  }

  part.warned = true;
  console.warn(
    `[@bagistoplus/ui] <${part.localName}> needs the \`delegate\` attribute and ${child} child. ` +
      `Without one ${consequence}.`,
  );
}

/** A part that hangs off the root. Every part of a rating does. */
abstract class RootPart extends ZagPart<rating.Api, UIRating> {
  protected get ownerBrand(): symbol {
    return RATING_ROOT;
  }

  protected register(owner: UIRating): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIRating): void {
    owner.unregisterChild(this);
  }
}

/**
 * The name the consumer wrote on an element, which beats the one generated
 * for it. `undefined` means not captured yet: Zag writes `aria-label` and
 * `aria-labelledby` on the first render, so both are read before that render
 * applies, and from the delegate target, the element Zag names.
 */
class AuthoredName {
  #label: string | null | undefined;
  #labelledBy: string | null | undefined;

  /** Puts the authored name over the generated one in `props`. */
  apply(part: { target(): Element | null }, props: Props): void {
    this.#capture(part);

    if (this.#label) {
      props["aria-label"] = this.#label;

      if (!this.#labelledBy) {
        delete props["aria-labelledby"];
      }
    }

    if (this.#labelledBy) {
      props["aria-labelledby"] = this.#labelledBy;
    }
  }

  #capture(part: { target(): Element | null }): void {
    if (this.#label !== undefined) {
      return;
    }

    const target = part.target();

    if (!target) {
      return;
    }

    this.#label = target.getAttribute("aria-label");
    this.#labelledBy = target.getAttribute("aria-labelledby");
  }
}

/** Zag's interaction and radio semantics, which a static item has none of. */
function isInteractiveProp(key: string): boolean {
  return key === "role" || key === "tabindex" || key.startsWith("aria-") || key.startsWith("on");
}

/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * hidden input, and only a real label is a form label to the browser.
 */
export class UIRatingLabel extends RootPart {
  warned = false;

  protected override get idKey(): string {
    return "label";
  }

  override render(api: rating.Api): void {
    if (!this.delegation.enabled) {
      warnOnce(this, "a <label>", "it is not a form label: `for` means nothing on it");
    }

    super.render(api);
  }

  protected propsFor(api: rating.Api): Props {
    return api.getLabelProps() as Props;
  }
}

/**
 * The radio group, and the box the pointer is tracked over. The items must
 * sit inside it: that is where Zag looks for one to focus.
 *
 * In `static` mode it is an image instead, labelled with the value.
 */
export class UIRatingControl extends RootPart {
  readonly #name = new AuthoredName();

  protected override get idKey(): string {
    return "control";
  }

  protected propsFor(api: rating.Api, owner: UIRating): Props {
    const props = api.getControlProps() as Props;

    if (owner.isStatic) {
      props.role = "img";
      props["aria-label"] = owner.staticLabel(api);
      delete props["aria-labelledby"];
      delete props["aria-orientation"];
      delete props["aria-readonly"];
    }

    this.#name.apply(this.delegation, props);

    return props;
  }
}

/**
 * One star, or whatever the consumer draws. Its value is its place among the
 * root's items, from 1.
 *
 * `--rating-item-fill` says how much of it the shown value covers, from 0 to
 * 1, so a 4.3 fills four items and a third of the fifth. Style a fractional
 * value by it and not by `data-highlighted`, which Zag sets on every item up
 * to the value rounded up.
 */
export class UIRatingItem extends ZagPart<rating.Api, UIRating> {
  readonly #name = new AuthoredName();

  /** The value Zag is told, or `undefined` before the root has numbered it. */
  get resolvedIndex(): number | undefined {
    return this.owner?.indexOf(this);
  }

  protected get ownerBrand(): symbol {
    return RATING_ROOT;
  }

  protected register(owner: UIRating): void {
    owner.registerItem(this);
  }

  protected unregister(owner: UIRating): void {
    owner.unregisterItem(this);
  }

  /** Named by value: Zag's `ids.item` is a function of it. */
  protected override get idKey(): string | undefined {
    return this.resolvedIndex === undefined ? undefined : "item";
  }

  protected override get idValue(): string | undefined {
    const index = this.resolvedIndex;

    return index === undefined ? undefined : String(index);
  }

  protected propsFor(api: rating.Api, owner: UIRating): Props | null {
    const index = this.resolvedIndex;

    if (index === undefined) {
      return null;
    }

    const props = api.getItemProps({ index }) as Props;

    props.style = { "--rating-item-fill": fill(owner.shownValue(api), index) };

    if (owner.isStatic) {
      for (const key of Object.keys(props)) {
        if (isInteractiveProp(key)) {
          delete props[key];
        }
      }

      props["aria-hidden"] = "true";

      return props;
    }

    this.#name.apply(this.delegation, props);

    return props;
  }
}

/**
 * Always `delegate`, wrapping an `<input>`. Zag names it for the form, seeds
 * its value and writes every change into it, and a custom element is no form
 * control.
 */
export class UIRatingHiddenInput extends RootPart {
  warned = false;

  protected override get idKey(): string {
    return "hiddenInput";
  }

  override render(api: rating.Api): void {
    if (!this.delegation.enabled) {
      warnOnce(this, "an <input>", "nothing carries the value to a form");
    }

    super.render(api);
  }

  protected propsFor(api: rating.Api): Props {
    return api.getHiddenInputProps() as Props;
  }
}

/** How much of the item at `index` the value covers, from 0 to 1. */
function fill(value: number, index: number): string {
  const covered = Math.min(1, Math.max(0, value - (index - 1)));

  // 4.3 - 4 is 0.2999999999999998, and that is not a value worth writing.
  return String(Math.round(covered * 1000) / 1000);
}
