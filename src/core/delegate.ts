import { applyProps, releaseProps } from "./props.js";

type Props = Record<string, unknown>;

/**
 * Where a machine's props land.
 *
 * By default an element is a container: Zag's props go on the element itself,
 * so a class written on it behaves the way anyone would expect. With
 * `delegate` they go on its single element child instead, and the element
 * costs no layout of its own.
 *
 * That is the escape hatch for everything the host cannot be. A custom element
 * cannot be a `<ul>` or an `<li>`, and only a real `<button>` brings Enter,
 * Space, focus rings and disabled pointer blocking.
 */
export class Delegate {
  readonly #host: HTMLElement;
  readonly #onChange: () => void;

  #observer: MutationObserver | undefined;
  #applied: Element | undefined;
  #warned = false;

  constructor(host: HTMLElement, onChange: () => void) {
    this.#host = host;
    this.#onChange = onChange;
  }

  get enabled(): boolean {
    return this.#host.hasAttribute("delegate");
  }

  /**
   * The delegate target is an ordinary element, so it cannot announce itself
   * the way a child custom element does. Two cases need catching: a bundle that
   * is not deferred connects the host before its child is parsed, and a morph
   * can swap the child for a different element later. Scope is the host's own
   * children, nothing deeper, so unrelated content never forces a render.
   * Measurement showed a subtree observer was the wrong shape: it never fired
   * at mount and fired on content nobody cares about.
   */
  observe(): void {
    if (!this.enabled) {
      return;
    }

    this.#observer ??= new MutationObserver(this.#onChange);
    this.#observer.observe(this.#host, { childList: true });
  }

  disconnect(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  apply(props: Props, scope: string): void {
    const target = this.target();

    if (this.#applied && this.#applied !== target) {
      releaseProps(this.#applied, scope);
    }

    this.#applied = target ?? undefined;

    if (target) {
      applyProps(target, props, scope);
    }
  }

  release(scope: string): void {
    if (this.#applied) {
      releaseProps(this.#applied, scope);
      this.#applied = undefined;
    }
  }

  /**
   * Resolved on every call rather than cached. During HTML parsing the host
   * connects before its child exists, and a morph can swap the child
   * underneath us.
   */
  target(): HTMLElement | null {
    if (!this.enabled) {
      return this.#host;
    }

    const children = this.#host.children;

    if (children.length > 1 && !this.#warned) {
      this.#warned = true;
      console.warn(
        `[@bagistoplus/ui] <${this.#host.localName} delegate> expects exactly one element child ` +
          `and found ${children.length}. Using the first.`,
      );
    }

    return (children[0] as HTMLElement | undefined) ?? null;
  }
}
