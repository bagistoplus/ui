import type * as accordion from "@zag-js/accordion";

import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { ACCORDION_ITEM } from "./brands";
import type { UIAccordionItem } from "./item";

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

  /** Named by the item's value: Zag's `ids.itemTrigger` is a function of it. */
  protected override get idKey(): string | undefined {
    return this.owner?.value ? "itemTrigger" : undefined;
  }

  protected override get idValue(): string | undefined {
    return this.owner?.value ?? undefined;
  }

  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null {
    const value = item.value;

    return value
      ? (api.getItemTriggerProps({ value, disabled: item.disabled }) as Props)
      : null;
  }

  /**
   * The one part that has no usable container form. Zag's trigger props say
   * `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus
   * rings and disabled pointer blocking come from the browser, and only a real
   * `<button>` provides them. There is no `tabindex` either, so a container
   * trigger is not even reachable.
   */
  override render(api: accordion.Api): void {
    if (!this.delegation.enabled && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
          `Without one it is not focusable and the keyboard cannot reach it.`,
      );
    }

    super.render(api);
  }
}

export class UIAccordionItemIndicator extends ItemPart {
  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null {
    const value = item.value;

    return value
      ? (api.getItemIndicatorProps({ value, disabled: item.disabled }) as Props)
      : null;
  }
}

export class UIAccordionItemContent extends ItemPart {
  #presence: PresenceController | undefined;

  /** Named by the item's value, like the trigger. */
  protected override get idKey(): string | undefined {
    return this.owner?.value ? "itemContent" : undefined;
  }

  protected override get idValue(): string | undefined {
    return this.owner?.value ?? undefined;
  }

  protected propsFor(api: accordion.Api, item: UIAccordionItem): Props | null {
    const value = item.value;

    return value
      ? (api.getItemContentProps({ value, disabled: item.disabled }) as Props)
      : null;
  }

  override render(api: accordion.Api): void {
    const item = this.owner;

    if (!item) {
      return;
    }

    if (!item.presenceEnabled) {
      this.#presence?.stop();
      this.#presence = undefined;
      super.render(api);
      return;
    }

    const props = this.propsFor(api, item);
    const node = this.delegation.target();

    if (!props || !node) {
      return;
    }

    this.#presence ??= new PresenceController(() => item.scheduleRender());

    const expanded = api.getItemState({ value: item.value!, disabled: item.disabled }).expanded;

    this.delegation.apply(this.#presence.decorate(node, props, expanded), this.scopeFor(item));
  }

  protected override release(): void {
    this.#presence?.stop();
    this.#presence = undefined;
    super.release();
  }
}
