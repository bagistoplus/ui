import type { DateValue, DateView } from "@zag-js/date-picker";
export declare const VIEWS: readonly DateView[];
export declare function isView(value: string | null | undefined): value is DateView;
/**
 * An ISO date, `YYYY-MM-DD`, as Zag's `CalendarDate`. Absent or blank gives
 * `undefined`, so the machine keeps its own default. Anything else gives
 * `undefined` too, with one warning per distinct value: `machineProps()` runs
 * on every prop push, and a warning per push would flood the console.
 */
export declare function parseDate(value: string | null): DateValue | undefined;
/** A comma list of ISO dates. Entries that do not parse are dropped. */
export declare function parseDates(value: string | null): DateValue[] | undefined;
/**
 * Sunday is 0, as `Date.getDay()` counts. Derived from the calendar date
 * itself rather than from a time zone, because the weekday of a year, month
 * and day is the same everywhere.
 */
export declare function weekdayOf(date: DateValue): number;
//# sourceMappingURL=dates.d.ts.map