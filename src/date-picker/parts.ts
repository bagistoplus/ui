import type * as datePicker from "@zag-js/date-picker";
import type { DateRangePreset } from "@zag-js/date-picker";

import { boolAttribute, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { DATE_PICKER_ROOT } from "./brands";
import { parseDates } from "./dates";
import type { UIDatePicker } from "./root";
import { viewOf } from "./view";

type Props = Record<string, unknown>;

export type UIDatePickerPart = ZagPart<datePicker.Api, UIDatePicker>;

/** Every authored part registers with the root, the view-scoped ones included. */
abstract class RootPart extends ZagPart<datePicker.Api, UIDatePicker> {
  protected get ownerBrand(): symbol {
    return DATE_PICKER_ROOT;
  }

  protected register(owner: UIDatePicker): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIDatePicker): void {
    owner.unregisterChild(this);
  }
}

/**
 * A part that only works as a real form element under `delegate`: a button
 * for Enter, Space, the focus ring and disabled pointer blocking, an input
 * for typing and submitting, a select for its options. Warned once.
 */
abstract class DelegatedPart extends RootPart {
  #warned = false;

  protected abstract get child(): string;

  protected abstract get consequence(): string;

  override render(api: datePicker.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and ${this.child} child. ` +
          `Without one ${this.consequence}.`,
      );
    }

    super.render(api);
  }
}

abstract class ButtonPart extends DelegatedPart {
  protected get child(): string {
    return "a <button>";
  }
}

export class UIDatePickerLabel extends RootPart {
  static readonly observedAttributes = ["index"];

  /** Which input this label names, in range mode. */
  get index(): number {
    return numberAttribute(this, "index") ?? 0;
  }

  protected override get idKey(): string {
    return "label";
  }

  protected override get idValue(): string {
    return String(this.index);
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getLabelProps({ index: this.index }) as Props;
  }
}

export class UIDatePickerControl extends RootPart {
  protected override get idKey(): string {
    return "control";
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getControlProps() as Props;
  }
}

/**
 * Always `delegate`, wrapping an `<input>`. Zag reads what was typed from the
 * element, writes the formatted date back into it and names it for the form.
 *
 * Under `open-on-focus`, focus arriving from outside the picker opens it.
 * Closing the calendar puts focus back on this field, which would otherwise
 * reopen what the shopper just answered, so focus arriving from inside the
 * picker opens nothing. A click reopens it after that, because the field
 * already holds the focus by then and fires no second focus event.
 */
export class UIDatePickerInput extends DelegatedPart {
  static readonly observedAttributes = ["index"];

  get index(): number {
    return numberAttribute(this, "index") ?? 0;
  }

  protected get child(): string {
    return "an <input>";
  }

  protected get consequence(): string {
    return "there is nothing to type in and nothing to submit";
  }

  protected override get idKey(): string {
    return "input";
  }

  protected override get idValue(): string {
    return String(this.index);
  }

  protected propsFor(api: datePicker.Api, owner: UIDatePicker): Props {
    const props = api.getInputProps({ index: this.index }) as Props;

    if (!owner.openOnFocus) {
      return props;
    }

    // Lowercased, as the normalizer writes every event key.
    const onFocusin = props.onfocusin as ((event: FocusEvent) => void) | undefined;

    return {
      ...props,
      onfocusin(event: FocusEvent) {
        onFocusin?.(event);

        const from = event.relatedTarget;

        if (from instanceof Node && owner.contains(from)) {
          return;
        }

        api.setOpen(true);
      },
    };
  }
}

export class UIDatePickerTrigger extends ButtonPart {
  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot open the calendar";
  }

  protected override get idKey(): string {
    return "trigger";
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getTriggerProps() as Props;
  }
}

/** Zag hides it while nothing is selected. */
export class UIDatePickerClearTrigger extends ButtonPart {
  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot clear the date";
  }

  protected override get idKey(): string {
    return "clearTrigger";
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getClearTriggerProps() as Props;
  }
}

/**
 * floating-ui owns part of this element's inline style, as it does for the
 * popover's positioner: do not write `transform`, `top` or `left` on it.
 */
export class UIDatePickerPositioner extends RootPart {
  protected override get idKey(): string {
    return "positioner";
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getPositionerProps() as Props;
  }
}

/** Presence on by default, for the reason the popover content gives. */
export class UIDatePickerContent extends RootPart {
  static readonly observedAttributes = ["presence"];

  #presence: PresenceController | undefined;

  protected override get idKey(): string {
    return "content";
  }

  override get presenceEnabled(): boolean {
    return boolAttribute(this, "presence") ?? true;
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getContentProps() as Props;
  }

  override render(api: datePicker.Api): void {
    const owner = this.owner;

    if (!owner) {
      return;
    }

    if (!this.presenceEnabled) {
      this.#presence?.stop();
      this.#presence = undefined;
      super.render(api);
      return;
    }

    const props = this.propsFor(api);
    const node = this.delegation.target();

    if (!node) {
      return;
    }

    this.#presence ??= new PresenceController(() => owner.scheduleRender());

    this.delegation.apply(this.#presence.decorate(node, props, api.open), this.scopeFor(owner));
  }

  protected override release(): void {
    this.#presence?.stop();
    this.#presence = undefined;
    super.release();
  }
}

/**
 * Always `delegate`, wrapping a `<select>` the component fills. Zag's props
 * carry `defaultValue`, which a `<select>` does not have as a property, so the
 * visible month or year is written as `value` here after the options.
 */
abstract class SelectPart extends DelegatedPart {
  protected get child(): string {
    return "a <select>";
  }

  protected get consequence(): string {
    return "there are no options to pick from";
  }

  protected abstract cells(api: datePicker.Api): datePicker.Cell[];

  protected abstract current(api: datePicker.Api): number;

  override render(api: datePicker.Api): void {
    const target = this.delegation.target();
    const select = target instanceof HTMLSelectElement ? target : undefined;

    if (select) {
      fillOptions(select, this.cells(api));
    }

    super.render(api);

    if (select) {
      const value = String(this.current(api));

      if (select.value !== value) {
        select.value = value;
      }
    }
  }
}

function fillOptions(select: HTMLSelectElement, cells: datePicker.Cell[]): void {
  const options = select.options;
  const same =
    options.length === cells.length &&
    cells.every((cell, index) => {
      const option = options[index];

      return (
        option !== undefined &&
        option.value === String(cell.value) &&
        option.textContent === cell.label &&
        option.disabled === Boolean(cell.disabled)
      );
    });

  if (same) {
    return;
  }

  select.replaceChildren(
    ...cells.map((cell) => {
      const option = document.createElement("option");

      option.value = String(cell.value);
      option.textContent = cell.label;
      option.disabled = Boolean(cell.disabled);

      return option;
    }),
  );
}

export class UIDatePickerMonthSelect extends SelectPart {
  protected override get idKey(): string {
    return "monthSelect";
  }

  protected cells(api: datePicker.Api): datePicker.Cell[] {
    return api.getMonths();
  }

  protected current(api: datePicker.Api): number {
    return api.visibleRange.start.month;
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getMonthSelectProps() as Props;
  }
}

export class UIDatePickerYearSelect extends SelectPart {
  protected override get idKey(): string {
    return "yearSelect";
  }

  protected cells(api: datePicker.Api): datePicker.Cell[] {
    return api.getYears();
  }

  protected current(api: datePicker.Api): number {
    return api.visibleRange.start.year;
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getYearSelectProps() as Props;
  }
}

/**
 * `value` is one of Zag's preset names, `last7Days` or `thisMonth`, or two
 * ISO dates as a comma list. Anything that reads as a date is taken as one.
 */
export class UIDatePickerPresetTrigger extends ButtonPart {
  static readonly observedAttributes = ["value"];

  get value(): string | null {
    return this.getAttribute("value");
  }

  set value(next: string | null) {
    if (next == null) {
      this.removeAttribute("value");
      return;
    }

    this.setAttribute("value", next);
  }

  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot pick the range";
  }

  protected propsFor(api: datePicker.Api): Props | null {
    const value = this.value;

    if (!value) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const dates = parseDates(value);

      return dates?.length ? (api.getPresetTriggerProps({ value: dates }) as Props) : null;
    }

    return api.getPresetTriggerProps({ value: value as DateRangePreset }) as Props;
  }
}

export class UIDatePickerViewControl extends RootPart {
  protected propsFor(api: datePicker.Api): Props {
    return api.getViewControlProps({ view: viewOf(this) }) as Props;
  }
}

/** Switches to the next larger view; Zag disables it at `max-view`. */
export class UIDatePickerViewTrigger extends ButtonPart {
  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot switch the view";
  }

  protected override get idKey(): string {
    return "viewTrigger";
  }

  protected override get idValue(): string {
    return viewOf(this);
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getViewTriggerProps({ view: viewOf(this) }) as Props;
  }
}

export class UIDatePickerPrevTrigger extends ButtonPart {
  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot move the calendar";
  }

  protected override get idKey(): string {
    return "prevTrigger";
  }

  protected override get idValue(): string {
    return viewOf(this);
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getPrevTriggerProps({ view: viewOf(this) }) as Props;
  }
}

export class UIDatePickerNextTrigger extends ButtonPart {
  protected get consequence(): string {
    return "it is not focusable and the keyboard cannot move the calendar";
  }

  protected override get idKey(): string {
    return "nextTrigger";
  }

  protected override get idValue(): string {
    return viewOf(this);
  }

  protected propsFor(api: datePicker.Api): Props {
    return api.getNextTriggerProps({ view: viewOf(this) }) as Props;
  }
}

/**
 * Zag's props for this part are data attributes. The text is
 * `api.visibleRangeText`, the month in the day view, the year in the month
 * view, the decade in the year view, and a part whose whole meaning is a
 * string writes it. Zag's `formatted` reads `start - end` in range mode even
 * when one month is visible, so the two are collapsed when they are equal.
 */
export class UIDatePickerRangeText extends RootPart {
  protected propsFor(api: datePicker.Api): Props {
    return api.getRangeTextProps() as Props;
  }

  override render(api: datePicker.Api): void {
    super.render(api);

    const target = this.delegation.target();
    const { start, end, formatted } = api.visibleRangeText;
    const text = start === end ? start : formatted;

    if (target && target.textContent !== text) {
      target.textContent = text;
    }
  }
}
