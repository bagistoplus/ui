import { ZagPart } from "../core/part";
import { TIMER_ITEM, TIMER_ROOT } from "./brands";
const ACTIONS = ["start", "pause", "resume", "reset", "restart"];
/** The area, the control, the separator and the triggers hang off the root. */
class TimerPart extends ZagPart {
    get ownerBrand() {
        return TIMER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/** The value and the label hang off their item, which knows the type. */
class ItemPart extends ZagPart {
    get ownerBrand() {
        return TIMER_ITEM;
    }
    register(owner) {
        owner.registerPart(this);
    }
    unregister(owner) {
        owner.unregisterPart(this);
    }
}
/** `role="timer"`, with the label Zag rebuilds on every tick. */
export class UITimerArea extends TimerPart {
    get idKey() {
        return "area";
    }
    propsFor(api) {
        return api.getAreaProps();
    }
}
export class UITimerControl extends TimerPart {
    propsFor(api) {
        return api.getControlProps();
    }
}
export class UITimerSeparator extends TimerPart {
    propsFor(api) {
        return api.getSeparatorProps();
    }
}
/**
 * Always `delegate`, wrapping a `<button>`. Zag writes `type="button"`, hides
 * the trigger while its action makes no sense, and answers a click; Enter,
 * Space and the focus ring come from a real button. Zag throws on an action
 * it does not know, so an unknown one renders nothing instead.
 */
export class UITimerActionTrigger extends TimerPart {
    static { this.observedAttributes = ["action"]; }
    #warned = false;
    get action() {
        return this.getAttribute("action");
    }
    set action(next) {
        if (next == null) {
            this.removeAttribute("action");
            return;
        }
        this.setAttribute("action", next);
    }
    propsFor(api) {
        const attribute = this.action;
        const action = ACTIONS.find((candidate) => candidate === attribute);
        return action ? api.getActionTriggerProps({ action }) : null;
    }
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and a <button> child. ` +
                `Without one it is not focusable and the keyboard cannot reach it.`);
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
    propsFor(api, item) {
        const type = item.timePart;
        return type ? api.getItemValueProps({ type }) : null;
    }
    render(api) {
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
    propsFor(api, item) {
        const type = item.timePart;
        return type ? api.getItemLabelProps({ type }) : null;
    }
}
//# sourceMappingURL=parts.js.map