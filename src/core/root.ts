import type { VanillaMachine } from "@zag-js/vanilla";

import { Delegate } from "./delegate";
import { boolAttribute } from "./dom";

type Props = Record<string, unknown>;

let sequence = 0;

/** What a part needs from whatever it registers with. */
export interface PartOwner {
  readonly scopeKey: string;
  readonly presenceEnabled: boolean;
  scheduleRender(): void;
  registerId(part: string, id: string): void;
}

/** Anything the root renders in its pass. */
export interface Renderable<TApi> {
  render(api: TApi): void;
}

/**
 * The element that owns a Zag machine.
 *
 * Zag is framework agnostic by design: a machine, plus a `connect()` that turns
 * a state snapshot into plain prop objects. Everything below is the transport
 * that gets those props onto real elements and keeps them there.
 *
 * A subclass supplies the machine, the attribute schema and the props mapping.
 * Nothing else.
 */
export abstract class ZagRootElement<TProps, TApi> extends HTMLElement implements PartOwner {
  readonly #children = new Set<Renderable<TApi>>();
  readonly #delegate = new Delegate(this, () => this.scheduleRender());
  readonly #partIds = new Map<string, string>();

  #id: string | undefined;

  #machine: VanillaMachine<any> | undefined;
  #started = false;
  #api: TApi | undefined;
  #unsubscribe: (() => void) | undefined;
  #frame = 0;

  // `undefined` means not captured yet. Zag's root props carry an id, so this
  // has to be read before the first render writes Zag's own id over it.
  #authoredId: string | null | undefined;

  /** The live Zag api. Undefined until the element upgrades and connects. */
  get api(): TApi | undefined {
    return this.#api;
  }

  /**
   * Scopes applied props, so two machines never fight over one node. Resolved
   * lazily: a custom element constructor cannot reach an abstract member.
   */
  get scopeKey(): string {
    this.#id ??= `ui-${this.componentName}-${++sequence}`;

    return this.#id;
  }

  get presenceEnabled(): boolean {
    return boolAttribute(this, "presence") ?? false;
  }

  connectedCallback(): void {
    this.#delegate.observe();
    this.scheduleRender();
  }

  disconnectedCallback(): void {
    // A morph moves nodes, so a disconnect is not a removal. Wait one
    // microtask: a move is already back in the document by then.
    queueMicrotask(() => {
      if (this.isConnected) {
        return;
      }

      this.#delegate.disconnect();
      this.#stop();
    });
  }

  attributeChangedCallback(): void {
    if (!this.#machine) {
      return;
    }

    this.#machine.updateProps(() => this.machineProps());
    this.scheduleRender();
  }

  registerId(part: string, id: string): void {
    if (this.#partIds.get(part) === id) {
      return;
    }

    this.#partIds.set(part, id);

    // The machine may already be running: a part can connect at any time.
    this.#machine?.updateProps(() => this.machineProps());
    this.scheduleRender();
  }

  registerChild(child: Renderable<TApi>): void {
    this.#children.add(child);
    this.scheduleRender();
  }

  unregisterChild(child: Renderable<TApi>): void {
    this.#children.delete(child);
  }

  /**
   * Renders are coalesced to one frame. Mounting registers every child and
   * every part separately, so rendering on each would be O(children x parts).
   * Measured on an accordion of 50 items and 150 parts, coalescing turns
   * roughly 200 registrations into 2 renders.
   */
  scheduleRender(): void {
    if (this.#frame) {
      return;
    }

    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#render();
    });
  }

  /** Used for the generated id and the event namespace, e.g. "accordion". */
  protected abstract get componentName(): string;

  protected abstract createMachine(props: () => TProps): VanillaMachine<any>;

  protected abstract connect(machine: VanillaMachine<any>): TApi;

  protected abstract machineProps(): TProps;

  protected authoredIds(): Record<string, string> | undefined {
    return this.#partIds.size > 0 ? Object.fromEntries(this.#partIds) : undefined;
  }

  /**
   * The id the consumer wrote, if any. Zag renames the element otherwise, and
   * a DOM differ that keys on `id` then treats the live node as incompatible
   * with the incoming one and replaces it, taking the machine with it.
   *
   * Read from the delegate target, so everything Zag faces stays on one
   * element. Nothing is cached until that element exists: with `delegate` this
   * runs before the child is parsed, and caching `null` there would freeze the
   * authored id and take the morph key with it.
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

  /**
   * Not every machine has a root part. Popover's anatomy has no `root` at all,
   * and menu's is the same, so the fallback is everything those roots can
   * honestly claim: the scope, and nothing else.
   *
   * `data-scope` on its own is a shape Zag never emits, since it always pairs it
   * with a `data-part`. That is harmless, because every Zag DOM query matches on
   * both together, and it keeps a root recognisable in devtools whether or not
   * its machine has a root part.
   */
  protected rootProps(api: TApi): Props | null {
    return (api as { getRootProps?: () => Props }).getRootProps?.() ?? { "data-scope": this.componentName };
  }

  protected emit(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(`ui-${this.componentName}:${name}`, { detail, bubbles: true }));
  }

  /**
   * Builds the machine and connects an api, but does NOT start it.
   *
   * `connect()` works on an unstarted service: the ids come from the scope and
   * the state is the initial one, which is exactly what the first render needs.
   *
   * Called from the first render rather than from `connectedCallback`, and that is
   * not a detail. `VanillaMachine` freezes `ids` into its scope when it is
   * constructed and `updateProps` never rebuilds it, while a custom element root
   * connects before any of its children are parsed. Waiting one frame is what lets
   * the parts report the ids their consumer wrote first. The consequence is that an
   * authored id is honoured for parts in the initial markup, not for one appended
   * later.
   */
  #create(): void {
    if (this.#machine) {
      return;
    }

    const machine = this.createMachine(() => this.machineProps());

    this.#machine = machine;
    this.#unsubscribe = machine.subscribe(() => {
      this.#api = this.connect(machine);
      this.scheduleRender();
    });

    this.#api = this.connect(machine);
  }

  #stop(): void {
    if (this.#frame) {
      cancelAnimationFrame(this.#frame);
      this.#frame = 0;
    }

    this.#unsubscribe?.();
    this.#machine?.stop();

    this.#unsubscribe = undefined;
    this.#machine = undefined;
    this.#api = undefined;
    this.#started = false;
  }

  #render(): void {
    this.#create();

    const api = this.#api;

    if (!api) {
      return;
    }

    const props = this.rootProps(api);

    if (props) {
      this.#delegate.apply(props, this.scopeKey);
    }

    for (const child of this.#children) {
      child.render(api);
    }

    if (!this.#started && this.#machine) {
      this.#started = true;
      this.#machine.start();
    }
  }
}
