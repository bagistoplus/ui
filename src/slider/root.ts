import * as slider from "@zag-js/slider";
import { VanillaMachine } from "@zag-js/vanilla";

import { boolAttribute, listAttribute, numberAttribute, readDirection } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { ZagRootElement } from "../core/root";
import { SLIDER_ROOT } from "./brands";
import type { UISliderThumb } from "./parts";

const ORIENTATIONS = ["horizontal", "vertical"] as const;
const ORIGINS = ["start", "center", "end"] as const;
const ALIGNMENTS = ["contain", "center"] as const;
const COLLISIONS = ["none", "push", "swap"] as const;

export type ValueText = (details: slider.ValueTextDetails) => string;

/**
 * A slider's configuration is Zag's props, kebab-cased. The value is a list,
 * one number per thumb, written as a comma list: `value` is the controlled
 * list and `default-value` the initial one, so the machine owns the value
 * unless the consumer writes `value`. It is read from `el.api.value` and
 * moved through `api.setValue()` and `api.setThumbValue()`.
 *
 * The thumbs are numbered by their document order among the root's thumbs,
 * unless one writes `index`. Zag's `aria-label` and `aria-labelledby` arrays
 * are not attributes here: a thumb keeps the one the consumer wrote on it.
 */
export class UISlider extends ZagRootElement<slider.Props, slider.Api> {
  static readonly observedAttributes = [
    "value",
    "default-value",
    "min",
    "max",
    "step",
    "large-step",
    "min-steps-between-thumbs",
    "orientation",
    "origin",
    "thumb-alignment",
    "thumb-collision-behavior",
    "thumb-width",
    "thumb-height",
    "name",
    "form",
    "disabled",
    "readonly",
    "invalid",
    "dir",
  ];

  readonly #thumbs = new Set<UISliderThumb>();

  // Built lazily, once per render, and dropped whenever the thumbs change.
  #order: Map<UISliderThumb, number> | undefined;

  #valueText: ValueText | null = null;

  get [SLIDER_ROOT](): true {
    return true;
  }

  /**
   * The text a thumb reads out for its value, `aria-valuetext`. A function,
   * so a property rather than an attribute; set back to `null`, the thumb
   * reads the bare number again.
   */
  get getAriaValueText(): ValueText | null {
    return this.#valueText;
  }

  set getAriaValueText(next: ValueText | null | undefined) {
    this.#valueText = next ?? null;
    this.pushProps();
  }

  protected get componentName(): string {
    return "slider";
  }

  protected override get valueKeyedIds(): readonly string[] {
    return ["thumb", "hiddenInput", "marker"];
  }

  protected createMachine(props: () => slider.Props): VanillaMachine<any> {
    return new VanillaMachine(slider.machine, props);
  }

  protected connect(machine: VanillaMachine<any>): slider.Api {
    return slider.connect(machine.service, normalizeProps);
  }

  protected machineProps(): slider.Props {
    return {
      id: this.scopeKey,
      // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
      ids: { root: this.authoredId(), ...this.authoredIds() } as slider.Props["ids"],
      dir: readDirection(this),
      value: numberList(this.getAttribute("value")),
      defaultValue: numberList(this.getAttribute("default-value")),
      min: numberAttribute(this, "min"),
      max: numberAttribute(this, "max"),
      step: numberAttribute(this, "step"),
      largeStep: numberAttribute(this, "large-step"),
      minStepsBetweenThumbs: numberAttribute(this, "min-steps-between-thumbs"),
      orientation: oneOf(ORIENTATIONS, this.getAttribute("orientation")),
      origin: oneOf(ORIGINS, this.getAttribute("origin")),
      thumbAlignment: oneOf(ALIGNMENTS, this.getAttribute("thumb-alignment")),
      thumbCollisionBehavior: oneOf(COLLISIONS, this.getAttribute("thumb-collision-behavior")),
      thumbSize: this.#thumbSize(),
      name: this.getAttribute("name") ?? undefined,
      form: this.getAttribute("form") ?? undefined,
      disabled: boolAttribute(this, "disabled"),
      readOnly: boolAttribute(this, "readonly"),
      invalid: boolAttribute(this, "invalid"),
      getAriaValueText: this.#valueText ?? undefined,

      onValueChange: (details) => this.emit("value-change", details),
      onValueChangeEnd: (details) => this.emit("value-change-end", details),
      onFocusChange: (details) => this.emit("focus-change", details),
    };
  }

  registerThumb(thumb: UISliderThumb): void {
    this.#thumbs.add(thumb);
    this.#order = undefined;
    this.registerChild(thumb);
  }

  unregisterThumb(thumb: UISliderThumb): void {
    this.#thumbs.delete(thumb);
    this.#order = undefined;
    this.unregisterChild(thumb);
    this.scheduleRender();
  }

  /** A thumb wrote or dropped `index`, so the others may shift. */
  thumbsChanged(): void {
    this.#order = undefined;
    this.scheduleRender();
  }

  /** The index Zag is told for this thumb: the written one, or its place among the others. */
  indexOf(thumb: UISliderThumb): number | undefined {
    if (thumb.index !== null) {
      return thumb.index;
    }

    this.#order ??= order(sorted([...this.#thumbs]));

    return this.#order.get(thumb);
  }

  /** Built only when both are set, which is what tells Zag not to measure. */
  #thumbSize(): slider.Props["thumbSize"] {
    const width = numberAttribute(this, "thumb-width");
    const height = numberAttribute(this, "thumb-height");

    if (width === undefined || height === undefined) {
      return undefined;
    }

    return { width, height };
  }
}

function numberList(value: string | null): number[] | undefined {
  const numbers = listAttribute(value)?.map(Number).filter(Number.isFinite);

  return numbers && numbers.length > 0 ? numbers : undefined;
}

function oneOf<T extends string>(options: readonly T[], value: string | null): T | undefined {
  return options.find((option) => option === value);
}

/** Numbers the thumbs without an explicit `index`, in the order given. */
function order(thumbs: UISliderThumb[]): Map<UISliderThumb, number> {
  const map = new Map<UISliderThumb, number>();
  let next = 0;

  for (const thumb of thumbs) {
    if (thumb.index === null) {
      map.set(thumb, next++);
    }
  }

  return map;
}

/** Document order, without a tag name in sight. */
function sorted<T extends Element>(elements: T[]): T[] {
  return elements.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
