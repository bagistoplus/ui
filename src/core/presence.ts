import * as presence from "@zag-js/presence";
import { VanillaMachine, normalizeProps } from "@zag-js/vanilla";

type Props = Record<string, unknown>;

function createPresenceMachine(present: () => boolean) {
  return new VanillaMachine(presence.machine, () => ({ present: present() }));
}

/**
 * Keeps an element mounted through its exit animation.
 *
 * Zag applies `hidden` the moment a part closes, which is correct for the
 * accessibility tree and the tab order but leaves no time to animate. Presence
 * holds the element unhidden until `animationend`, then lets `hidden` land.
 *
 * It keys on `animation-name`, never on transitions: a transition leaves
 * `animation-name` at `none`, so Zag unmounts on the next frame.
 *
 * The contract is to DECORATE props, not to suppress them. Zag's `hidden` is
 * replaced with a deferred one, never dropped, or a closed part would stay in
 * the tab order forever.
 */
export class PresenceController {
  #machine: ReturnType<typeof createPresenceMachine> | undefined;
  #api: presence.Api | undefined;
  #unsubscribe: (() => void) | undefined;
  #node: HTMLElement | undefined;

  constructor(private readonly onChange: () => void) {}

  /**
   * Applies the deferred `hidden` on top of whatever Zag returned.
   *
   * The node is a parameter, not a constructor field: with `delegate` the
   * animated element is the part's child, and a morph can swap it.
   */
  decorate(node: HTMLElement, props: Props, present: boolean): Props {
    this.#ensure(node, present);
    this.#machine?.updateProps(() => ({ present }));
    this.#refresh();

    return { ...props, hidden: !this.#api?.present };
  }

  stop(): void {
    this.#unsubscribe?.();
    this.#machine?.stop();

    this.#unsubscribe = undefined;
    this.#machine = undefined;
    this.#api = undefined;
    this.#node = undefined;
  }

  #ensure(node: HTMLElement, present: boolean): void {
    if (!this.#machine) {
      const machine = createPresenceMachine(() => present);

      this.#machine = machine;
      this.#unsubscribe = machine.subscribe(() => {
        this.#refresh();
        this.onChange();
      });

      machine.start();
      this.#refresh();
    }

    // Re-issued whenever the machine is rebuilt, not only when the node moves.
    if (this.#node !== node) {
      this.#node = node;
      this.#api?.setNode(node);
    }
  }

  #refresh(): void {
    if (this.#machine) {
      this.#api = presence.connect(this.#machine.service, normalizeProps);
    }
  }
}
