import * as datePicker from "@zag-js/date-picker";
import { VanillaMachine } from "@zag-js/vanilla";
import { boolAttribute, interpolate, listAttribute, numberAttribute, readDirection, readLocale } from "../core/dom";
import { normalizeProps } from "../core/normalize";
import { POSITIONING_ATTRIBUTES, readPositioning } from "../core/positioning";
import { ZagRootElement } from "../core/root";
import { DATE_PICKER_ROOT } from "./brands";
import { isView, parseDate, parseDates, weekdayOf } from "./dates";
const SELECTION_MODES = ["single", "multiple", "range"];
/**
 * A date picker's configuration is Zag's props, kebab-cased. Dates are ISO,
 * `YYYY-MM-DD`; lists of them are comma separated. A date that does not parse
 * is dropped with a warning, so the machine keeps its own default for it.
 *
 * `ids` are frozen when the machine is built, one frame after the root
 * connects, so an authored id is honored for parts in the initial markup and
 * not for one appended later.
 *
 * `open-on-focus` is the one behavior Zag does not have. Zag opens from the
 * trigger, and from a click on the input under `open-on-click`; the input part
 * adds focus arriving from outside the picker, so a shopper who tabs into the
 * field sees the days it takes instead of typing one it refuses.
 */
export class UIDatePicker extends ZagRootElement {
    static { this.observedAttributes = [
        "locale",
        "time-zone",
        "dir",
        "name",
        "selection-mode",
        "value",
        "default-value",
        "focused-value",
        "default-focused-value",
        "min",
        "max",
        "num-of-months",
        "start-of-week",
        "fixed-weeks",
        "show-week-numbers",
        "close-on-select",
        "open-on-click",
        "open-on-focus",
        "disabled",
        "readonly",
        "required",
        "invalid",
        "outside-day-selectable",
        "max-selected-dates",
        "placeholder",
        "view",
        "default-view",
        "min-view",
        "max-view",
        "open",
        "default-open",
        "inline",
        "unavailable-dates",
        "unavailable-weekdays",
        "translations-trigger",
        "translations-clear-trigger",
        "translations-content",
        "translations-month-select",
        "translations-year-select",
        "translations-week-column-header",
        "translations-prev-trigger",
        "translations-next-trigger",
        "translations-view-trigger",
        ...POSITIONING_ATTRIBUTES,
    ]; }
    #unavailable = null;
    get [DATE_PICKER_ROOT]() {
        return true;
    }
    /**
     * A rule of your own. Set, it replaces the one built from
     * `unavailable-dates` and `unavailable-weekdays`; set back to `null`, the
     * lists apply again.
     */
    get isDateUnavailable() {
        return this.#unavailable;
    }
    set isDateUnavailable(next) {
        this.#unavailable = next ?? null;
        this.pushProps();
    }
    get openOnFocus() {
        return boolAttribute(this, "open-on-focus") ?? false;
    }
    get componentName() {
        return "date-picker";
    }
    get valueKeyedIds() {
        return ["label", "input", "table", "tableHeader", "tableBody", "tableRow", "prevTrigger", "nextTrigger", "viewTrigger"];
    }
    createMachine(props) {
        return new VanillaMachine(datePicker.machine, props);
    }
    connect(machine) {
        return datePicker.connect(machine.service, normalizeProps);
    }
    machineProps() {
        return {
            id: this.scopeKey,
            // Keep the ids the consumer wrote. Zag would otherwise rename the elements.
            ids: { root: this.authoredId(), ...this.authoredIds() },
            dir: readDirection(this),
            locale: this.getAttribute("locale") ?? readLocale(this),
            timeZone: this.getAttribute("time-zone") ?? undefined,
            name: this.getAttribute("name") ?? undefined,
            placeholder: this.getAttribute("placeholder") ?? undefined,
            selectionMode: this.#selectionMode(),
            value: parseDates(this.getAttribute("value")),
            defaultValue: parseDates(this.getAttribute("default-value")),
            focusedValue: parseDate(this.getAttribute("focused-value")),
            defaultFocusedValue: parseDate(this.getAttribute("default-focused-value")),
            min: parseDate(this.getAttribute("min")),
            max: parseDate(this.getAttribute("max")),
            numOfMonths: numberAttribute(this, "num-of-months"),
            startOfWeek: numberAttribute(this, "start-of-week"),
            maxSelectedDates: numberAttribute(this, "max-selected-dates"),
            fixedWeeks: boolAttribute(this, "fixed-weeks"),
            showWeekNumbers: boolAttribute(this, "show-week-numbers"),
            closeOnSelect: boolAttribute(this, "close-on-select"),
            openOnClick: boolAttribute(this, "open-on-click"),
            disabled: boolAttribute(this, "disabled"),
            readOnly: boolAttribute(this, "readonly"),
            required: boolAttribute(this, "required"),
            invalid: boolAttribute(this, "invalid"),
            outsideDaySelectable: boolAttribute(this, "outside-day-selectable"),
            open: boolAttribute(this, "open"),
            defaultOpen: boolAttribute(this, "default-open"),
            inline: boolAttribute(this, "inline"),
            view: this.#view("view"),
            defaultView: this.#view("default-view"),
            minView: this.#view("min-view"),
            maxView: this.#view("max-view"),
            positioning: readPositioning(this),
            translations: this.#translations(),
            isDateUnavailable: this.#unavailable ?? this.#unavailableFromLists(),
            onValueChange: (details) => this.emit("value-change", details),
            onFocusChange: (details) => this.emit("focus-change", details),
            onViewChange: (details) => this.emit("view-change", details),
            onVisibleRangeChange: (details) => this.emit("visible-range-change", details),
            onOpenChange: (details) => this.emit("open-change", details),
        };
    }
    #selectionMode() {
        const value = this.getAttribute("selection-mode");
        return SELECTION_MODES.find((mode) => mode === value);
    }
    #view(name) {
        const value = this.getAttribute(name);
        return isView(value) ? value : undefined;
    }
    /**
     * Zag merges these over its own English defaults, so only what is set is
     * sent. The labels Zag builds from a view take `{view}`, the view trigger
     * `{next}` as well, so one attribute can name all three calendars.
     */
    #translations() {
        const text = (name) => this.getAttribute(`translations-${name}`);
        const trigger = text("trigger");
        const clearTrigger = text("clear-trigger");
        const content = text("content");
        const monthSelect = text("month-select");
        const yearSelect = text("year-select");
        const weekColumnHeader = text("week-column-header");
        const prevTrigger = text("prev-trigger");
        const nextTrigger = text("next-trigger");
        const viewTrigger = text("view-trigger");
        const values = [
            trigger,
            clearTrigger,
            content,
            monthSelect,
            yearSelect,
            weekColumnHeader,
            prevTrigger,
            nextTrigger,
            viewTrigger,
        ];
        if (values.every((value) => value === null)) {
            return undefined;
        }
        return {
            trigger: trigger === null ? undefined : () => trigger,
            clearTrigger: clearTrigger ?? undefined,
            content: content ?? undefined,
            monthSelect: monthSelect ?? undefined,
            yearSelect: yearSelect ?? undefined,
            weekColumnHeader: weekColumnHeader ?? undefined,
            prevTrigger: prevTrigger === null ? undefined : (view) => interpolate(prevTrigger, { view }),
            nextTrigger: nextTrigger === null ? undefined : (view) => interpolate(nextTrigger, { view }),
            viewTrigger: viewTrigger === null ? undefined : (view, next) => interpolate(viewTrigger, { view, next: next ?? "" }),
        };
    }
    #unavailableFromLists() {
        const dates = new Set(parseDates(this.getAttribute("unavailable-dates"))?.map((date) => date.toString()));
        const weekdays = new Set(listAttribute(this.getAttribute("unavailable-weekdays"))?.map(Number));
        if (dates.size === 0 && weekdays.size === 0) {
            return undefined;
        }
        return (date) => weekdays.has(weekdayOf(date)) || dates.has(date.toString());
    }
}
//# sourceMappingURL=root.js.map