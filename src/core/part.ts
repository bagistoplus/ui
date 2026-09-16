import { Delegate } from "./delegate";
import { findBranded, REPAIR_MARKER } from "./dom";
import type { PartOwner, Renderable } from "./root";

type Props = Record<string, unknown>;

/**
 * Every element of a component except its root.
 *
 * A part finds its owner on connect and registers with it; the owner drives
 * rendering from there. The owner is found by a brand rather than a tag name
 * or `instanceof`, so a page that loaded the package twice still works.
 *
 * The owner is the root, or another part. Nothing here needs to know which,
 * and that is the point: an accordion groups a trigger and a panel under an
 * item, a tabs list holds triggers whose panels are somewhere else entirely,
 * and both are this one class.
 *
 * Where the props land is not the part's decision either. The consumer makes
 * it, with `delegate`, and `Delegate` answers it the same way for every
 * element.
 */
export abstract class ZagPart<TApi, TOwner extends PartOwner>
  extends HTMLElement
  implements PartOwner, Renderable<TApi>
{
  readonly #delegate = new Delegate(this, () => this.scheduleRender());

  #owner: TOwner | null = null;

  #authoredId: string | null | undefined;

  // Allocated on first use. Most parts never own anything, and an accordion of
  // 50 items carries 150 of them.
  #parts: Set<ZagPart<TApi, any>> | undefined;

  protected scope: string | undefined;

  get scopeKey(): string {
    return this.#owner?.scopeKey ?? this.localName;
  }

  get presenceEnabled(): boolean {
    return this.#owner?.presenceEnabled ?? false;
  }

  scheduleRender(): void {
    this.#owner?.scheduleRender();
  }

  registerId(part: string, id: string, value?: string): void {
    this.#owner?.registerId(part, id, value);
  }

  connectedCallback(): void {
    const owner = findBranded<TOwner>(this, this.ownerBrand);

    if (this.#owner && this.#owner !== owner) {
      this.unregister(this.#owner);
    }

    this.#owner = owner;

    if (owner) {
      this.register(owner);
    }

    this.#contributeId();
    this.#delegate.observe();
  }

  disconnectedCallback(): void {
    // A morph moves nodes, and so does the editor when it reorders a list, so
    // a disconnect is not a removal. Wait one microtask: a move is already
    // back in the document by then.
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

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    // The marker going missing means a DOM differ has just stripped every
    // attribute the server did not send from this element. `applyProps`
    // compares against the live DOM, so one render puts all of them back.
    // Its return is that repair landing, not news.
    if (name === REPAIR_MARKER && newValue !== null) {
      return;
    }

    this.scheduleRender();
  }

  registerPart(part: ZagPart<TApi, any>): void {
    this.#parts ??= new Set();
    this.#parts.add(part);
    this.scheduleRender();
  }

  unregisterPart(part: ZagPart<TApi, any>): void {
    this.#parts?.delete(part);
  }

  render(api: TApi): void {
    const owner = this.#owner;

    if (!owner) {
      return;
    }

    // Retried here for a delegating part, whose child does not exist yet when it
    // connects during parsing.
    this.#contributeId();

    const props = this.propsFor(api, owner);

    // `null` is never "no props": every Zag part returns at least data-scope
    // and data-part. It means this element is not in a renderable state, and
    // nothing below it can be either, so the whole subtree is skipped.
    if (!props) {
      return;
    }

    this.#delegate.apply(props, this.scopeFor(owner));

    if (this.#parts) {
      for (const part of this.#parts) {
        part.render(api);
      }
    }
  }

  protected get owner(): TOwner | null {
    return this.#owner;
  }

  /**
   * Named `delegation`, not `delegate`, and that is not cosmetic.
   *
   * TypeScript's `protected` is erased, so this accessor is a real property on
   * the prototype at runtime. `delegate` is also an attribute consumers write,
   * and a framework choosing between `setAttribute` and a property assignment
   * tests `key in el`. A property of the same name makes it pick the property,
   * write to a getter, and lose the attribute entirely.
   *
   * The rule this follows: no attribute name may be shadowed by a class
   * property, unless that property reflects back to the attribute.
   */
  protected get delegation(): Delegate {
    return this.#delegate;
  }

  /**
   * The key in the machine's `ids` prop this part maps to. Parts that leave it
   * undefined take whatever id Zag generates.
   *
   * A part Zag names by value returns its key only while it has a value, and
   * returns that value from `idValue`, so the root can file the id under it.
   */
  protected get idKey(): string | undefined {
    return undefined;
  }

  /** The value a value-keyed part's id is filed under. Undefined for a flat one. */
  protected get idValue(): string | undefined {
    return undefined;
  }

  /**
   * The id the consumer wrote, if any.
   *
   * Read from the delegate target, so it is the element Zag will actually name.
   * Nothing is cached until that element exists: with `delegate` this runs before
   * the child is parsed, and caching `null` there would lose the id for good.
   */
  protected authoredId(): string | undefined {
    if (this.#authoredId === undefined) {
      const target = this.#delegate.target();

      if (!target) {
        return undefined;
      }

      this.#authoredId = target.getAttribute("id");
    }

    return this.#authoredId ?? undefined;
  }

  /** The brand of the element this part registers with. */
  protected abstract get ownerBrand(): symbol;

  protected abstract register(owner: TOwner): void;

  protected abstract unregister(owner: TOwner): void;

  protected abstract propsFor(api: TApi, owner: TOwner): Props | null;

  protected scopeFor(owner: TOwner): string {
    this.scope = owner.scopeKey;

    return this.scope;
  }

  #contributeId(): void {
    const key = this.idKey;

    if (!key) {
      return;
    }

    const id = this.authoredId();

    if (id) {
      this.registerId(key, id, this.idValue);
    }
  }

  /** Called when the element is genuinely removed, not merely moved. */
  protected release(): void {
    if (this.scope) {
      this.#delegate.release(this.scope);
    }
  }
}
