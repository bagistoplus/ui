import * as datePicker from "@zag-js/date-picker";
import type { DateValue, DateView } from "@zag-js/date-picker";

import { listAttribute } from "../core/dom";

export const VIEWS: readonly DateView[] = ["day", "month", "year"];

export function isView(value: string | null | undefined): value is DateView {
  return VIEWS.some((view) => view === value);
}

const warned = new Set<string>();

/**
 * An ISO date, `YYYY-MM-DD`, as Zag's `CalendarDate`. Absent or blank gives
 * `undefined`, so the machine keeps its own default. Anything else gives
 * `undefined` too, with one warning per distinct value: `machineProps()` runs
 * on every prop push, and a warning per push would flood the console.
 */
export function parseDate(value: string | null): DateValue | undefined {
  const text = value?.trim();

  if (!text) {
    return undefined;
  }

  try {
    return datePicker.parse(text);
  } catch {
    if (!warned.has(text)) {
      warned.add(text);
      console.warn(`[@bagistoplus/ui] "${text}" is not a date. Write it as YYYY-MM-DD.`);
    }

    return undefined;
  }
}

/** A comma list of ISO dates. Entries that do not parse are dropped. */
export function parseDates(value: string | null): DateValue[] | undefined {
  const items = listAttribute(value);

  if (!items) {
    return undefined;
  }

  return items.map(parseDate).filter((date): date is DateValue => date !== undefined);
}

/**
 * Sunday is 0, as `Date.getDay()` counts. Derived from the calendar date
 * itself rather than from a time zone, because the weekday of a year, month
 * and day is the same everywhere.
 */
export function weekdayOf(date: DateValue): number {
  return date.toDate("UTC").getUTCDay();
}
