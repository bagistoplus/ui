import type * as datePicker from "@zag-js/date-picker";

import { findBranded } from "../core/dom";
import { ZagPart } from "../core/part";
import { DATE_PICKER_ROOT, DATE_PICKER_VIEW } from "./brands";
import { isView } from "./dates";
import type { UIDatePicker } from "./root";

type Props = Record<string, unknown>;

/**
 * One of the three calendars: `day`, `month` or `year`. Zag hides every view
 * but the current one, so all three sit in the content at once.
 *
 * Not a collection layer. The parts inside register with the root like any
 * other and read their `view` from here through `viewOf`, so a part written
 * outside any view is the day view with no special case.
 */
export class UIDatePickerView extends ZagPart<datePicker.Api, UIDatePicker> {
  static readonly observedAttributes = ["view"];

  get [DATE_PICKER_VIEW](): true {
    return true;
  }

  /**
   * Reflected, for the reason the accordion item gives for `value`: a
   * framework that renders these elements tests `key in el` before choosing
   * between a property write and `setAttribute`, and a getter-only property
   * swallows the write.
   */
  get view(): string | null {
    return this.getAttribute("view");
  }

  set view(next: string | null) {
    if (next == null) {
      this.removeAttribute("view");
      return;
    }

    this.setAttribute("view", next);
  }

  protected get ownerBrand(): symbol {
    return DATE_PICKER_ROOT;
  }

  protected register(owner: UIDatePicker): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIDatePicker): void {
    owner.unregisterChild(this);
  }

  protected propsFor(api: datePicker.Api): Props | null {
    const view = this.view;

    return isView(view) ? (api.getViewProps({ view }) as Props) : null;
  }
}

/** The view a part belongs to: the nearest `ui-date-picker-view`, or the day view. */
export function viewOf(part: Element): datePicker.DateView {
  const view = findBranded<UIDatePickerView>(part, DATE_PICKER_VIEW)?.view;

  return isView(view) ? view : "day";
}
