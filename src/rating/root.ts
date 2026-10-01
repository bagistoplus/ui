import * as rating from "@zag-js/rating-group";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, numberAttribute, readDirection, readLocale } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { RATING_ROOT } from "./brands";
import type { UIRatingItem } from "./parts";

export interface RatingValueTextDetails {
  value: number;
  count: number;
}

export type RatingValueText = (details: RatingValueTextDetails) => string;

/**
 * A rating's configuration is Zag's props, kebab-cased. `value` is the
 * controlled prop and `default-value` the initial one, so the machine owns the
 * value unless the consumer writes `value`. It is read from `el.api.value` and
 * moved through `api.setValue()`.
 *
 * There is no `count`: it is the number of items, numbered 1 to N by document
 * order, so the two cannot disagree.
 *
 * `static` turns the rating into a picture of its value, for an average shown
 * beside reviews: the control is an image labelled with the value, the items
 * are hidden from assistive technology, and nothing responds to the pointer or
 * the keyboard. `readonly` is not that. It is a form control that cannot
 * change, and stays focusable as one.
 */
export class UIRating extends ZagRootElement<rating.Props, rating.Api> {
  static readonly observedAttributes = [
    "value",
    "default-value",
    "allow-half",
    "name",
    "form",
    "disabled",
    "readonly",
    "required",
    "static",
    "dir",
  ];

  readonly #items = new Set<UIRatingItem>();

  // Built lazily, once per render, and dropped whenever the items change.
  #order: Map<UIRatingItem, number> | undefined;

  #valueText: RatingValueText | null = null;

  get [RATING_ROOT](): true {
    return true;
  }

  /**
   * The text read out for a value. Called with an item's value to label that
   * item, and in `static` mode with the rating's own value, fractional, to
   * label the control. A function, so a property rather than an attribute;
   * set back to `null`, the defaults return: Zag's "N stars" for an item, and
   * "Rated V out of C" for a static control.
   */
  get getRatingValueText(): RatingValueText | null {
    return this.#valueText;
  }

  set getRatingValueText(next: RatingValueText | null | undefined) {
    this.#valueText = next ?? null;
    this.pushProps();
  }

  /** Not named `static`: a property may not shadow an attribute it does not reflect. */
  get isStatic(): boolean {
    return boolAttribute(this, "static") ?? false;
  }

  protected get componentName(): string {
    return "rating";
  }

  protected override get valueKeyedIds(): readonly string[] {
    return ["item"];
  }

  protected createMachine(props: () => rating.Props): VanillaMachine<any> {
    return new VanillaMachine(rating.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): rating.Api {
    return rating.connect(machine.service, normalizeProps);
  }

  protected machineProps(): rating.Props {
    const count = this.#items.size;
    const valueText = this.#valueText;

    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() } as rating.Props["ids"],
      dir: readDirection(this),
      count: count > 0 ? count : undefined,
      value: numberAttribute(this, "value"),
      defaultValue: numberAttribute(this, "default-value"),
      allowHalf: boolAttribute(this, "allow-half"),
      name: this.getAttribute("name") ?? undefined,
      form: this.getAttribute("form") ?? undefined,
      disabled: boolAttribute(this, "disabled"),
      // A static rating answers nothing, and Zag's handlers check this first.
      readOnly: this.isStatic || boolAttribute(this, "readonly"),
      required: boolAttribute(this, "required"),
      translations: valueText ? { ratingValueText: (index) => valueText({ value: index, count }) } : undefined,

      onValueChange: (details) => this.emit("value-change", details),
      onHoverChange: (details) => this.emit("hover-change", details),
    };
  }

  registerItem(item: UIRatingItem): void {
    this.#items.add(item);
    this.#order = undefined;
    this.registerChild(item);
    // The count is a machine prop, and it just changed.
    this.pushProps();
  }

  unregisterItem(item: UIRatingItem): void {
    this.#items.delete(item);
    this.#order = undefined;
    this.unregisterChild(item);
    this.pushProps();
  }

  /** The value Zag is told for this item: its place among the others, from 1. */
  indexOf(item: UIRatingItem): number | undefined {
    this.#order ??= order(sorted([...this.#items]));

    return this.#order.get(item);
  }

  /** What the items show: the hovered value while hovering, the value otherwise, as Zag does. */
  shownValue(api: rating.Api): number {
    return api.hovering ? api.hoveredValue : api.value;
  }

  /** The label of a static control. */
  staticLabel(api: rating.Api): string {
    const details = { value: Math.max(0, api.value), count: api.count };

    if (this.#valueText) {
      return this.#valueText(details);
    }

    return `Rated ${this.#format(details.value)} out of ${details.count}`;
  }

  #format(value: number): string {
    try {
      return new Intl.NumberFormat(readLocale(this), { maximumFractionDigits: 1 }).format(value);
    } catch {
      // A `lang` the browser does not know is a RangeError, not a reason to break.
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value);
    }
  }
}

/** Numbers the items in the order given, from 1, which is Zag's first value. */
function order(items: UIRatingItem[]): Map<UIRatingItem, number> {
  return new Map(items.map((item, index) => [item, index + 1]));
}

/** Document order, without a tag name in sight. */
function sorted<T extends Element>(elements: T[]): T[] {
  return elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
