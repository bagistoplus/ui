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

  get value(): string | null {
    return this.getAttribute("value");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
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
