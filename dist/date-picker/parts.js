import { boolAttribute, numberAttribute } from "../core/dom";
import { ZagPart } from "../core/part";
import { PresenceController } from "../core/presence";
import { DATE_PICKER_ROOT } from "./brands";
import { parseDates } from "./dates";
import { viewOf } from "./view";
/** Every authored part registers with the root, the view-scoped ones included. */
class RootPart extends ZagPart {
    get ownerBrand() {
        return DATE_PICKER_ROOT;
    }
    register(owner) {
        owner.registerChild(this);
    }
    unregister(owner) {
        owner.unregisterChild(this);
    }
}
/**
 * A part that only works as a real form element under `delegate`: a button
 * for Enter, Space, the focus ring and disabled pointer blocking, an input
 * for typing and submitting, a select for its options. Warned once.
 */
class DelegatedPart extends RootPart {
    #warned = false;
    render(api) {
        if (!this.delegation.enabled && !this.#warned) {
            this.#warned = true;
            console.warn(`[@bagistoplus/ui] <${this.localName}> needs the \`delegate\` attribute and ${this.child} child. ` +
                `Without one ${this.consequence}.`);
        }
        super.render(api);
    }
}
class ButtonPart extends DelegatedPart {
    get child() {
        return "a <button>";
    }
}
export class UIDatePickerLabel extends RootPart {
    static { this.observedAttributes = ["index"]; }
    /** Which input this label names, in range mode. */
    get index() {
        return numberAttribute(this, "index") ?? 0;
    }
    get idKey() {
        return "label";
    }
    get idValue() {
        return String(this.index);
    }
    propsFor(api) {
        return api.getLabelProps({ index: this.index });
    }
}
export class UIDatePickerControl extends RootPart {
    get idKey() {
        return "control";
    }
    propsFor(api) {
        return api.getControlProps();
    }
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag reads what was typed from the
 * element, writes the formatted date back into it and names it for the form.
 *
 * Under `open-on-focus`, focus arriving from outside the picker opens it.
 * Closing the calendar puts focus back on this field, which would otherwise
 * reopen what the shopper just answered, so focus arriving from inside the
 * picker opens nothing. A click reopens it after that, because the field
 * already holds the focus by then and fires no second focus event.
 */
export class UIDatePickerInput extends DelegatedPart {
    static { this.observedAttributes = ["index"]; }
    get index() {
        return numberAttribute(this, "index") ?? 0;
    }
    get child() {
        return "an <input>";
    }
    get consequence() {
        return "there is nothing to type in and nothing to submit";
    }
    get idKey() {
        return "input";
    }
    get idValue() {
        return String(this.index);
    }
    propsFor(api, owner) {
        const props = api.getInputProps({ index: this.index });
        if (!owner.openOnFocus) {
            return props;
        }
        // Lowercased, as the normalizer writes every event key.
        const onFocusin = props.onfocusin;
        return {
            ...props,
            onfocusin(event) {
                onFocusin?.(event);
                const from = event.relatedTarget;
                if (from instanceof Node && owner.contains(from)) {
                    return;
                }
                api.setOpen(true);
            },
        };
    }
}
export class UIDatePickerTrigger extends ButtonPart {
    get consequence() {
        return "it is not focusable and the keyboard cannot open the calendar";
    }
    get idKey() {
        return "trigger";
    }
    propsFor(api) {
        return api.getTriggerProps();
    }
}
/** Zag hides it while nothing is selected. */
export class UIDatePickerClearTrigger extends ButtonPart {
    get consequence() {
        return "it is not focusable and the keyboard cannot clear the date";
    }
    get idKey() {
        return "clearTrigger";
    }
    propsFor(api) {
        return api.getClearTriggerProps();
    }
}
/**
 * floating-ui owns part of this element's inline style, as it does for the
 * popover's positioner: do not write `transform`, `top` or `left` on it.
 */
export class UIDatePickerPositioner extends RootPart {
    get idKey() {
        return "positioner";
    }
    propsFor(api) {
        return api.getPositionerProps();
    }
}
/** Presence on by default, for the reason the popover content gives. */
export class UIDatePickerContent extends RootPart {
    static { this.observedAttributes = ["presence"]; }
    #presence;
    get idKey() {
        return "content";
    }
    get presenceEnabled() {
        return boolAttribute(this, "presence") ?? true;
    }
    propsFor(api) {
        return api.getContentProps();
    }
    render(api) {
        const owner = this.owner;
        if (!owner) {
            return;
        }
        if (!this.presenceEnabled) {
            this.#presence?.stop();
            this.#presence = undefined;
            super.render(api);
            return;
        }
        const props = this.propsFor(api);
        const node = this.delegation.target();
        if (!node) {
            return;
        }
        this.#presence ??= new PresenceController(() => owner.scheduleRender());
        this.delegation.apply(this.#presence.decorate(node, props, api.open), this.scopeFor(owner));
    }
    release() {
        this.#presence?.stop();
        this.#presence = undefined;
        super.release();
    }
}
/**
 * Always `delegate`, wrapping a `<select>` the component fills. Zag's props
 * carry `defaultValue`, which a `<select>` does not have as a property, so the
 * visible month or year is written as `value` here after the options.
 */
class SelectPart extends DelegatedPart {
    get child() {
        return "a <select>";
    }
    get consequence() {
        return "there are no options to pick from";
    }
    render(api) {
        const target = this.delegation.target();
        const select = target instanceof HTMLSelectElement ? target : undefined;
        if (select) {
            fillOptions(select, this.cells(api));
        }
        super.render(api);
        if (select) {
            const value = String(this.current(api));
            if (select.value !== value) {
                select.value = value;
            }
        }
    }
}
function fillOptions(select, cells) {
    const options = select.options;
    const same = options.length === cells.length &&
        cells.every((cell, index) => {
            const option = options[index];
            return (option !== undefined &&
                option.value === String(cell.value) &&
                option.textContent === cell.label &&
                option.disabled === Boolean(cell.disabled));
        });
    if (same) {
        return;
    }
    select.replaceChildren(...cells.map((cell) => {
        const option = document.createElement("option");
        option.value = String(cell.value);
        option.textContent = cell.label;
        option.disabled = Boolean(cell.disabled);
        return option;
    }));
}
export class UIDatePickerMonthSelect extends SelectPart {
    get idKey() {
        return "monthSelect";
    }
    cells(api) {
        return api.getMonths();
    }
    current(api) {
        return api.visibleRange.start.month;
    }
    propsFor(api) {
        return api.getMonthSelectProps();
    }
}
export class UIDatePickerYearSelect extends SelectPart {
    get idKey() {
        return "yearSelect";
    }
    cells(api) {
        return api.getYears();
    }
    current(api) {
        return api.visibleRange.start.year;
    }
    propsFor(api) {
        return api.getYearSelectProps();
    }
}
/**
 * `value` is one of Zag's preset names, `last7Days` or `thisMonth`, or two
 * ISO dates as a comma list. Anything that reads as a date is taken as one.
 */
export class UIDatePickerPresetTrigger extends ButtonPart {
    static { this.observedAttributes = ["value"]; }
    get value() {
        return this.getAttribute("value");
    }
    set value(next) {
        if (next == null) {
            this.removeAttribute("value");
            return;
        }
        this.setAttribute("value", next);
    }
    get consequence() {
        return "it is not focusable and the keyboard cannot pick the range";
    }
    propsFor(api) {
        const value = this.value;
        if (!value) {
            return null;
        }
        if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            const dates = parseDates(value);
            return dates?.length ? api.getPresetTriggerProps({ value: dates }) : null;
        }
        return api.getPresetTriggerProps({ value: value });
    }
}
export class UIDatePickerViewControl extends RootPart {
    propsFor(api) {
        return api.getViewControlProps({ view: viewOf(this) });
    }
}
/** Switches to the next larger view; Zag disables it at `max-view`. */
export class UIDatePickerViewTrigger extends ButtonPart {
    get consequence() {
        return "it is not focusable and the keyboard cannot switch the view";
    }
    get idKey() {
        return "viewTrigger";
    }
    get idValue() {
        return viewOf(this);
    }
    propsFor(api) {
        return api.getViewTriggerProps({ view: viewOf(this) });
    }
}
export class UIDatePickerPrevTrigger extends ButtonPart {
    get consequence() {
        return "it is not focusable and the keyboard cannot move the calendar";
    }
    get idKey() {
        return "prevTrigger";
    }
    get idValue() {
        return viewOf(this);
    }
    propsFor(api) {
        return api.getPrevTriggerProps({ view: viewOf(this) });
    }
}
export class UIDatePickerNextTrigger extends ButtonPart {
    get consequence() {
        return "it is not focusable and the keyboard cannot move the calendar";
    }
    get idKey() {
        return "nextTrigger";
    }
    get idValue() {
        return viewOf(this);
    }
    propsFor(api) {
        return api.getNextTriggerProps({ view: viewOf(this) });
    }
}
/**
 * Zag's props for this part are data attributes. The text is
 * `api.visibleRangeText`, the month in the day view, the year in the month
 * view, the decade in the year view, and a part whose whole meaning is a
 * string writes it. Zag's `formatted` reads `start - end` in range mode even
 * when one month is visible, so the two are collapsed when they are equal.
 */
export class UIDatePickerRangeText extends RootPart {
    propsFor(api) {
        return api.getRangeTextProps();
    }
    render(api) {
        super.render(api);
        const target = this.delegation.target();
        const { start, end, formatted } = api.visibleRangeText;
        const text = start === end ? start : formatted;
        if (target && target.textContent !== text) {
            target.textContent = text;
        }
    }
}
//# sourceMappingURL=parts.js.map