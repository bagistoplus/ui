import type * as timer from "@zag-js/timer";

import { ZagPart } from "../core/part";
import { TIMER_ITEM, TIMER_ROOT } from "./brands";
import type { UITimer } from "./root";

type Props = Record<string, unknown>;

const TIME_PARTS: readonly timer.TimePart[] = ["days", "hours", "minutes", "seconds", "milliseconds"];

/**
 * The collection layer: one time part, and the parts that render it.
 *
 * An ordinary part that owns parts, as the accordion item is. Zag's item
 * getters all take the type, and the value and the label under an item read
 * it from here rather than repeating it.
 */
export class UITimerItem extends ZagPart<timer.Api, UITimer> {
  static readonly observedAttributes = ["type"];

  get [TIMER_ITEM](): true {
    return true;
  }

  /**
   * Reflected, for the reason the accordion item gives for `value`: a
   * framework that renders these elements tests `key in el` before choosing
   * between a property write and `setAttribute`, and a getter-only property
   * swallows the write.
   */
  get type(): string | null {
    return this.getAttribute("type");
  }

  set type(next: string | null) {
    if (next == null) {
      this.removeAttribute("type");
      return;
    }

    this.setAttribute("type", next);
  }

  /** Zag's time part, or `undefined` while `type` is missing or unknown. */
  get timePart(): timer.TimePart | undefined {
    const type = this.type;

    return TIME_PARTS.find((part) => part === type);
  }

  protected get ownerBrand(): symbol {
    return TIMER_ROOT;
  }

  protected register(owner: UITimer): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UITimer): void {
    owner.unregisterChild(this);
  }

  protected propsFor(api: timer.Api): Props | null {
    const type = this.timePart;

    return type ? (api.getItemProps({ type }) as Props) : null;
  }
}
