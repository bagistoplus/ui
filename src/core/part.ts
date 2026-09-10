import { Delegate } from "./delegate.js";
import { findBranded } from "./dom.js";
import type { PartOwner } from "./root.js";

type Props = Record<string, unknown>;

/**
 * A part of a component, other than its root.
 *
 * A part finds its owner on connect and registers with it; the owner drives
 * rendering from there. The owner is found by a brand rather than a tag name
 * or `instanceof`, so a page that loaded the package twice still works.
 *
 * Where the props land is not the part's decision. The consumer makes it, with
 * `delegate`, and `Delegate` answers it the same way for every element.
 */
export abstract class ZagPart<TApi, TOwner extends PartOwner> extends HTMLElement {
  readonly #delegate = new Delegate(this, () => this.owner?.scheduleRender());

  #owner: TOwner | null = null;

  protected scope: string | undefined;

  connectedCallback(): void {
    const owner = findBranded<TOwner>(this, this.ownerBrand);

    if (this.#owner && this.#owner !== owner) {
      this.unregister(this.#owner);
    }

    this.#owner = owner;

    if (owner) {
      this.register(owner);
    }

    this.#delegate.observe();
  }

  disconnectedCallback(): void {
    // A morph moves nodes, so a disconnect is not a removal. Wait one
    // microtask: a move is already back in the document by then.
    queueMicrotask(() => {
      if (this.isConnected) {
        return;
      }

      if (this.#owner) {
        this.unregister(this.#owner);
      }

      this.#owner = null;
      this.#delegate.disconnect();
      this.release();
    });
  }

  render(api: TApi, owner: TOwner): void {
    this.#delegate.apply(this.propsFor(api, owner), this.scopeFor(owner));
  }

  protected get owner(): TOwner | null {
    return this.#owner;
  }

  protected get delegate(): Delegate {
    return this.#delegate;
  }

  /** The brand of the element this part registers with. */
  protected abstract get ownerBrand(): symbol;

  protected abstract register(owner: TOwner): void;

  protected abstract unregister(owner: TOwner): void;

  protected abstract propsFor(api: TApi, owner: TOwner): Props;

  protected scopeFor(owner: TOwner): string {
    this.scope = owner.scopeKey;

    return this.scope;
  }

  /** Called when the element is genuinely removed, not merely moved. */
  protected release(): void {
    if (this.scope) {
      this.#delegate.release(this.scope);
    }
  }
}
