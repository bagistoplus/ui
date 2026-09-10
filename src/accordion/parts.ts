import type * as accordion from "@zag-js/accordion";

import { ZagPart } from "../core/part.js";
import { PresenceController } from "../core/presence.js";
import { ACCORDION_ITEM } from "./brands.js";
import type { UIAccordionItem } from "./item.js";

type Props = Record<string, unknown>;

export type UIAccordionPart = ZagPart<accordion.Api, UIAccordionItem>;

/** The accordion's parts all hang off the item, not off the root. */
abstract class ItemPart extends ZagPart<accordion.Api, UIAccordionItem> {
  protected get ownerBrand(): symbol {
    return ACCORDION_ITEM;
  }

  protected register(owner: UIAccordionItem): void {
    owner.registerPart(this);
  }

  protected unregister(owner: UIAccordionItem): void {
    owner.unregisterPart(this);
  }
}

export class UIAccordionItemTrigger extends ItemPart {
  #warned = false;

  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props {
    return api.getItemTriggerProps({ value: item.value!, disabled: item.disabled }) as Props;
  }

  /**
   * The one part that has no usable container form. Zag's trigger props say
   * `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus
   * rings and disabled pointer blocking come from the browser, and only a real
   * `<button>` provides them. There is no `tabindex` either, so a container
   * trigger is not even reachable.
   */
  override render(api: accordion.Api, item: UIAccordionItem): void {
    if (!this.delegate.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one it is not focusable and the keyboard cannot reach it.`,
      );
    }

    super.render(api, item);
  }
}

export class UIAccordionItemIndicator extends ItemPart {
  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props {
    return api.getItemIndicatorProps({ value: item.value!, disabled: item.disabled }) as Props;
  }
}

export class UIAccordionItemContent extends ItemPart {
  #presence: PresenceController | undefined;

  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props {
    return api.getItemContentProps({ value: item.value!, disabled: item.disabled }) as Props;
  }

  override render(api: accordion.Api, item: UIAccordionItem): void {
    if (!item.presenceEnabled) {
      this.#presence?.stop();
      this.#presence = undefined;
      super.render(api, item);
      return;
    }

    const node = this.delegate.target();

    if (!node) {
      return;
    }

    this.#presence ??= new PresenceController(() => item.scheduleRender());

    const props = this.propsFor(api, item);
    const expanded = api.getItemState({ value: item.value!, disabled: item.disabled }).expanded;

    this.delegate.apply(this.#presence.decorate(node, props, expanded), this.scopeFor(item));
  }

  protected override release(): void {
    this.#presence?.stop();
    this.#presence = undefined;
    super.release();
  }
}
