import type * as accordion from "@zag-js/accordion";

import { Delegate } from "../core/delegate";
import { findBranded } from "../core/dom";
import type { PartOwner, Renderable } from "../core/root";
import { ACCORDION_ITEM, ACCORDION_ROOT } from "./brands";
import type { UIAccordionPart } from "./parts";
import type { UIAccordion } from "./root";

/**
 * The collection layer: one value, and the parts that render it.
 *
 * It is what its parts register with, so it satisfies `PartOwner` by passing
 * through to the root.
 */
export class UIAccordionItem extends HTMLElement implements PartOwner, Renderable<accordion.Api> {
  static readonly observedAttributes = ["value", "disabled"];

  get [ACCORDION_ITEM](): true {
    return true;
  }

  readonly #parts = new Set<UIAccordionPart>();
  readonly #delegate = new Delegate(this, () => this.scheduleRender());

  #root: UIAccordion | null = null;

  get root(): UIAccordion | null {
    return this.#root;
  }

  get value(): string | null {
    return this.getAttribute("value");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  get scopeKey(): string {
    return this.#root?.scopeKey ?? "ui-accordion";
  }

  get presenceEnabled(): boolean {
    return this.#root?.presenceEnabled ?? false;
  }

  scheduleRender(): void {
    this.#root?.scheduleRender();
  }

  connectedCallback(): void {
    const root = findBranded<UIAccordion>(this, ACCORDION_ROOT);

    if (this.#root && this.#root !== root) {
      this.#root.unregisterChild(this);
    }

    this.#root = root;
    root?.registerChild(this);

    this.#delegate.observe();
  }

  disconnectedCallback(): void {
    queueMicrotask(() => {
      if (this.isConnected) {
        return;
      }

      // Read before the root goes, or `scopeKey` falls back to its default and
      // releases the wrong scope.
      const scope = this.scopeKey;

      this.#root?.unregisterChild(this);
      this.#root = null;

      this.#delegate.disconnect();
      this.#delegate.release(scope);
    });
  }

  attributeChangedCallback(): void {
    this.#root?.scheduleRender();
  }

  registerPart(part: UIAccordionPart): void {
    this.#parts.add(part);
    this.#root?.scheduleRender();
  }

  unregisterPart(part: UIAccordionPart): void {
    this.#parts.delete(part);
  }

  render(api: accordion.Api): void {
    const value = this.value;

    if (!value || !this.#root) {
      return;
    }

    this.#delegate.apply(api.getItemProps({ value, disabled: this.disabled }), this.scopeKey);

    for (const part of this.#parts) {
      part.render(api, this);
    }
  }
}
