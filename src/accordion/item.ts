import type * as accordion from "@zag-js/accordion";

import { ZagPart } from "../core/part";
import { ACCORDION_ITEM, ACCORDION_ROOT } from "./brands";
import type { UIAccordion } from "./root";

type Props = Record<string, unknown>;

/**
 * The collection layer: one value, and the parts that render it.
 *
 * It is an ordinary part that happens to own parts. Its own owner is the root,
 * and `data-part="item"` is as much a part as `data-part="item-trigger"` is.
 */
export class UIAccordionItem extends ZagPart<accordion.Api, UIAccordion> {
  static readonly observedAttributes = ["value", "disabled"];

  get [ACCORDION_ITEM](): true {
    return true;
  }

  get root(): UIAccordion | null {
    return this.owner;
  }

  /**
   * Reflected, because a property assignment must reach the attribute.
   *
   * Any framework that renders these elements decides between `setAttribute`
   * and a property assignment by testing `key in el`, so declaring a getter is
   * what makes `value` a property in the first place. Without a setter the
   * write lands on a getter-only property and is lost, leaving the element with
   * no value at all: Vue's client-side render does exactly this, so the markup
   * works from server HTML and silently does nothing after a route change.
   */
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

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(next: boolean) {
    this.toggleAttribute("disabled", Boolean(next));
  }

  protected get ownerBrand(): symbol {
    return ACCORDION_ROOT;
  }

  protected register(owner: UIAccordion): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UIAccordion): void {
    owner.unregisterChild(this);
  }

  protected propsFor(api: accordion.Api): Props | null {
    const value = this.value;

    return value ? (api.getItemProps({ value, disabled: this.disabled }) as Props) : null;
  }
}
