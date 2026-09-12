import type * as timer from "@zag-js/timer";

import { ZagPart } from "../core/part";
import { TIMER_ITEM, TIMER_ROOT } from "./brands";
import type { UITimerItem } from "./item";
import type { UITimer } from "./root";

type Props = Record<string, unknown>;

const ACTIONS: readonly timer.TimerAction[] = ["start", "pause", "resume", "reset", "restart"];

/** The area, the control, the separator and the triggers hang off the root. */
abstract class TimerPart extends ZagPart<timer.Api, UITimer> {
  protected get ownerBrand(): symbol {
    return TIMER_ROOT;
  }

  protected register(owner: UITimer): void {
    owner.registerChild(this);
  }

  protected unregister(owner: UITimer): void {
    owner.unregisterChild(this);
  }
}

/** The value and the label hang off their item, which knows the type. */
abstract class ItemPart extends ZagPart<timer.Api, UITimerItem> {
  protected get ownerBrand(): symbol {
    return TIMER_ITEM;
  }

  protected register(owner: UITimerItem): void {
    owner.registerPart(this);
  }

  protected unregister(owner: UITimerItem): void {
    owner.unregisterPart(this);
  }
}

/** `role="timer"`, with the label Zag rebuilds on every tick. */
export class UITimerArea extends TimerPart {
  protected override get idKey(): string {
    return "area";
  }

  protected propsFor(api: timer.Api): Props {
    return api.getAreaProps() as Props;
  }
}

export class UITimerControl extends TimerPart {
  protected propsFor(api: timer.Api): Props {
    return api.getControlProps() as Props;
  }
}

export class UITimerSeparator extends TimerPart {
  protected propsFor(api: timer.Api): Props {
    return api.getSeparatorProps() as Props;
  }
}

/**
 * Always `delegate`, wrapping a `<button>`. Zag writes `type="button"`, hides
 * the trigger while its action makes no sense, and answers a click; Enter,
 * Space and the focus ring come from a real button. Zag throws on an action
 * it does not know, so an unknown one renders nothing instead.
 */
export class UITimerActionTrigger extends TimerPart {
  static readonly observedAttributes = ["action"];

  #warned = false;

  get action(): string | null {
    return this.getAttribute("action");
  }

  set action(next: string | null) {
    if (next == null) {
      this.removeAttribute("action");
      return;
    }

    this.setAttribute("action", next);
  }

  protected propsFor(api: timer.Api): Props | null {
    const attribute = this.action;
    const action = ACTIONS.find((candidate) => candidate === attribute);

    return action ? (api.getActionTriggerProps({ action }) as Props) : null;
  }

  override render(api: timer.Api): void {
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

/**
 * Zag's props for this part are data attributes. The text is
 * `api.formattedTime[type]`, and a part whose whole meaning is a string
 * writes it, into the element that takes the props.
 */
export class UITimerItemValue extends ItemPart {
  protected propsFor(api: timer.Api, item: UITimerItem): Props | null {
    const type = item.timePart;

    return type ? (api.getItemValueProps({ type }) as Props) : null;
  }

  override render(api: timer.Api): void {
    super.render(api);

    const type = this.owner?.timePart;
    const target = this.delegation.target();

    if (!type || !target) {
      return;
    }

    const text = api.formattedTime[type];

    if (target.textContent !== text) {
      target.textContent = text;
    }
  }
}

export class UITimerItemLabel extends ItemPart {
  protected propsFor(api: timer.Api, item: UITimerItem): Props | null {
    const type = item.timePart;

    return type ? (api.getItemLabelProps({ type }) as Props) : null;
  }
}
