import * as presence from "@zag-js/presence";
import { VanillaMachine } from "@zag-js/vanilla";

import { normalizeProps } from "./normalize";

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
 * the tab order forever. And only the hiding is deferred: a part that has just
 * been asked to show is unhidden on this very render, because Zag's own effects
 * read the DOM one frame after opening and must find it visible.
 */
export class PresenceController {
  #machine: ReturnType<typeof createPresenceMachine> | undefined;
  #api: presence.Api | undefined;
  #unsubscribe: (() => void) | undefined;
  #node: HTMLElement | undefined;

  constructor(private readonly onChange: () => void) {}

  /** Whether the node still has to be shown, an exit animation included. */
  get present(): boolean {
    return this.#api?.present ?? false;
  }

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

    // Showing is never deferred, only hiding. The machine takes a change of
    // `present` on its own tick, one notification after this returns, and Zag's
    // effects schedule a frame from inside the transition that opened the
    // component: the dialog's focus trap looks for a tabbable node when that
    // frame runs. A panel still `hidden` then has none, and focus never moves.
    return { ...props, hidden: present ? false : !this.#api?.present };
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
