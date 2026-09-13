# Date Picker

A calendar behind a text field, or inline, with the grid written for you from a few templates. Single dates, several, or a range across two fields.

## Features

- ✅ Single, multiple and range selection
- ✅ Day, month and year views, with a trigger that climbs between them
- ✅ The grid is generated: you describe one row, one header cell and one cell
- ✅ Locale aware weekdays, month names and input format, from `lang` or an attribute
- ✅ Closed days and closed weekdays from two attributes, or a rule of your own
- ✅ Opens from the trigger, from a click, or the moment the field is reached
- ✅ Full keyboard navigation, `role="grid"` and a live announcement on every month change
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/date-picker";
```

## Examples

### Single date

A field, a trigger, a clear trigger and the day view. `open-on-focus` opens the calendar as soon as the field is reached, so a visitor who tabs into it sees which days are taken instead of typing one that is refused. Sundays and the 12th are closed. The templates carry the classes; the element writes the rows.

<ComponentExample>

<ui-date-picker locale="en-US" open-on-focus open-on-click min="2026-03-03" unavailable-weekdays="0" unavailable-dates="2026-03-12" default-focused-value="2026-03-01" translations-trigger="Open the calendar" translations-clear-trigger="Clear the date" class="flex w-72 flex-col gap-2">
  <ui-date-picker-label delegate><label class="text-sm font-medium">Delivery date</label></ui-date-picker-label>
  <ui-date-picker-control class="relative flex items-center">
    <ui-date-picker-input delegate>
      <input class="w-full rounded-md border border-gray-300 px-3 py-2 pe-16 text-sm dark:border-zinc-600 dark:bg-zinc-800" />
    </ui-date-picker-input>
    <ui-date-picker-clear-trigger delegate>
      <button class="absolute inset-e-9 px-2 text-sm opacity-60 hover:opacity-100">×</button>
    </ui-date-picker-clear-trigger>
    <ui-date-picker-trigger delegate>
      <button class="absolute inset-e-0 px-3 text-sm">📅</button>
    </ui-date-picker-trigger>
  </ui-date-picker-control>
  <ui-date-picker-positioner>
    <ui-date-picker-content class="z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <ui-date-picker-view view="day" class="flex flex-col gap-2">
        <ui-date-picker-view-control class="flex items-center justify-between">
          <ui-date-picker-prev-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">‹</button></ui-date-picker-prev-trigger>
          <ui-date-picker-range-text class="text-sm font-medium"></ui-date-picker-range-text>
          <ui-date-picker-next-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">›</button></ui-date-picker-next-trigger>
        </ui-date-picker-view-control>
        <ui-date-picker-table>
          <template data-slot="table"><table class="w-full border-collapse"></table></template>
          <template data-slot="header"><th class="h-8 w-9 text-xs font-normal opacity-60"></th></template>
          <template data-slot="cell">
            <td class="p-0">
              <div class="mx-auto flex size-9 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-gray-100 data-today:font-semibold data-selected:bg-blue-600 data-selected:text-white data-focus:ring-2 data-focus:ring-blue-500 data-outside-range:opacity-30 data-unavailable:cursor-not-allowed data-unavailable:line-through data-unavailable:opacity-40 data-disabled:cursor-not-allowed data-disabled:opacity-30 dark:hover:bg-zinc-800"></div>
            </td>
          </template>
        </ui-date-picker-table>
      </ui-date-picker-view>
    </ui-date-picker-content>
  </ui-date-picker-positioner>
</ui-date-picker>

</ComponentExample>

```html
<ui-date-picker open-on-focus open-on-click min="2026-03-03" unavailable-weekdays="0" unavailable-dates="2026-03-12">
  <ui-date-picker-label delegate><label>Delivery date</label></ui-date-picker-label>
  <ui-date-picker-control>
    <ui-date-picker-input delegate><input /></ui-date-picker-input>
    <ui-date-picker-clear-trigger delegate><button>×</button></ui-date-picker-clear-trigger>
    <ui-date-picker-trigger delegate><button>📅</button></ui-date-picker-trigger>
  </ui-date-picker-control>
  <ui-date-picker-positioner>
    <ui-date-picker-content>
      <ui-date-picker-view view="day">
        <ui-date-picker-view-control>
          <ui-date-picker-prev-trigger delegate><button>‹</button></ui-date-picker-prev-trigger>
          <ui-date-picker-range-text></ui-date-picker-range-text>
          <ui-date-picker-next-trigger delegate><button>›</button></ui-date-picker-next-trigger>
        </ui-date-picker-view-control>
        <ui-date-picker-table>
          <template data-slot="table"><table></table></template>
          <template data-slot="header"><th></th></template>
          <template data-slot="cell"><td><div></div></td></template>
        </ui-date-picker-table>
      </ui-date-picker-view>
    </ui-date-picker-content>
  </ui-date-picker-positioner>
</ui-date-picker>
```

### Range

Two fields on one calendar. `index` names each input and its label; the field holding the focus is the end the next click answers, and Zag keeps the two in order whichever is clicked first. The calendar stays open until both ends are set.

<ComponentExample>

<ui-date-picker locale="en-US" selection-mode="range" open-on-click default-focused-value="2026-03-01" class="flex w-96 flex-col gap-2">
  <ui-date-picker-control class="grid grid-cols-2 gap-3">
    <div class="flex flex-col gap-1">
      <ui-date-picker-label index="0" delegate><label class="text-xs opacity-70">From</label></ui-date-picker-label>
      <ui-date-picker-input index="0" delegate><input class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800" /></ui-date-picker-input>
    </div>
    <div class="flex flex-col gap-1">
      <ui-date-picker-label index="1" delegate><label class="text-xs opacity-70">To</label></ui-date-picker-label>
      <div class="relative flex items-center">
        <ui-date-picker-input index="1" delegate><input class="w-full rounded-md border border-gray-300 px-3 py-2 pe-10 text-sm dark:border-zinc-600 dark:bg-zinc-800" /></ui-date-picker-input>
        <ui-date-picker-trigger delegate><button class="absolute inset-e-0 px-3 text-sm">📅</button></ui-date-picker-trigger>
      </div>
    </div>
  </ui-date-picker-control>
  <ui-date-picker-positioner>
    <ui-date-picker-content class="z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <ui-date-picker-view view="day" class="flex flex-col gap-2">
        <ui-date-picker-view-control class="flex items-center justify-between">
          <ui-date-picker-prev-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">‹</button></ui-date-picker-prev-trigger>
          <ui-date-picker-range-text class="text-sm font-medium"></ui-date-picker-range-text>
          <ui-date-picker-next-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">›</button></ui-date-picker-next-trigger>
        </ui-date-picker-view-control>
        <ui-date-picker-table>
          <template data-slot="table"><table class="w-full border-collapse"></table></template>
          <template data-slot="header"><th class="h-8 w-9 text-xs font-normal opacity-60"></th></template>
          <template data-slot="cell">
            <td class="p-0">
              <div class="mx-auto flex size-9 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-gray-100 data-in-hover-range:bg-blue-100 data-in-range:bg-blue-100 data-selected:bg-blue-600 data-selected:text-white data-focus:ring-2 data-focus:ring-blue-500 data-outside-range:opacity-30 dark:hover:bg-zinc-800 dark:data-in-hover-range:bg-blue-950 dark:data-in-range:bg-blue-950"></div>
            </td>
          </template>
        </ui-date-picker-table>
      </ui-date-picker-view>
    </ui-date-picker-content>
  </ui-date-picker-positioner>
</ui-date-picker>

</ComponentExample>

```html
<ui-date-picker selection-mode="range" open-on-click>
  <ui-date-picker-control>
    <ui-date-picker-label index="0" delegate><label>From</label></ui-date-picker-label>
    <ui-date-picker-input index="0" delegate><input /></ui-date-picker-input>
    <ui-date-picker-label index="1" delegate><label>To</label></ui-date-picker-label>
    <ui-date-picker-input index="1" delegate><input /></ui-date-picker-input>
    <ui-date-picker-trigger delegate><button>📅</button></ui-date-picker-trigger>
  </ui-date-picker-control>
  <ui-date-picker-positioner>…</ui-date-picker-positioner>
</ui-date-picker>
```

### Inline, with the three views

`inline` renders the calendar open, without a field. The view trigger in the middle of the control climbs from days to months to years, and a click in the month or year grid comes back down. The two selects jump straight to a month or a year, and the preset triggers select a range in one click.

<ComponentExample>

<ui-date-picker locale="en-US" inline selection-mode="range" default-focused-value="2026-03-01" class="inline-block">
  <ui-date-picker-content class="flex w-80 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
    <div class="flex gap-2">
      <ui-date-picker-month-select delegate><select class="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"></select></ui-date-picker-month-select>
      <ui-date-picker-year-select delegate><select class="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"></select></ui-date-picker-year-select>
    </div>
    <ui-date-picker-view view="day" class="flex flex-col gap-2">
      <ui-date-picker-view-control class="flex items-center justify-between">
        <ui-date-picker-prev-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">‹</button></ui-date-picker-prev-trigger>
        <ui-date-picker-view-trigger delegate><button class="rounded-md px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"><ui-date-picker-range-text></ui-date-picker-range-text></button></ui-date-picker-view-trigger>
        <ui-date-picker-next-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">›</button></ui-date-picker-next-trigger>
      </ui-date-picker-view-control>
      <ui-date-picker-table>
        <template data-slot="table"><table class="w-full border-collapse"></table></template>
        <template data-slot="header"><th class="h-8 w-9 text-xs font-normal opacity-60"></th></template>
        <template data-slot="cell">
          <td class="p-0">
            <div class="mx-auto flex size-9 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-gray-100 data-in-hover-range:bg-blue-100 data-in-range:bg-blue-100 data-selected:bg-blue-600 data-selected:text-white data-focus:ring-2 data-focus:ring-blue-500 data-outside-range:opacity-30 dark:hover:bg-zinc-800 dark:data-in-hover-range:bg-blue-950 dark:data-in-range:bg-blue-950"></div>
          </td>
        </template>
      </ui-date-picker-table>
    </ui-date-picker-view>
    <ui-date-picker-view view="month" class="flex flex-col gap-2">
      <ui-date-picker-view-control class="flex items-center justify-between">
        <ui-date-picker-prev-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">‹</button></ui-date-picker-prev-trigger>
        <ui-date-picker-view-trigger delegate><button class="rounded-md px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"><ui-date-picker-range-text></ui-date-picker-range-text></button></ui-date-picker-view-trigger>
        <ui-date-picker-next-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">›</button></ui-date-picker-next-trigger>
      </ui-date-picker-view-control>
      <ui-date-picker-table columns="4" format="short">
        <template data-slot="table"><table class="w-full border-collapse"></table></template>
        <template data-slot="cell">
          <td class="p-0.5">
            <div class="flex h-9 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-gray-100 data-selected:bg-blue-600 data-selected:text-white data-focus:ring-2 data-focus:ring-blue-500 data-disabled:opacity-30 dark:hover:bg-zinc-800"></div>
          </td>
        </template>
      </ui-date-picker-table>
    </ui-date-picker-view>
    <ui-date-picker-view view="year" class="flex flex-col gap-2">
      <ui-date-picker-view-control class="flex items-center justify-between">
        <ui-date-picker-prev-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">‹</button></ui-date-picker-prev-trigger>
        <ui-date-picker-view-trigger delegate><button class="rounded-md px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"><ui-date-picker-range-text></ui-date-picker-range-text></button></ui-date-picker-view-trigger>
        <ui-date-picker-next-trigger delegate><button class="size-8 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800">›</button></ui-date-picker-next-trigger>
      </ui-date-picker-view-control>
      <ui-date-picker-table columns="4">
        <template data-slot="table"><table class="w-full border-collapse"></table></template>
        <template data-slot="cell">
          <td class="p-0.5">
            <div class="flex h-9 cursor-pointer items-center justify-center rounded-md text-sm hover:bg-gray-100 data-selected:bg-blue-600 data-selected:text-white data-focus:ring-2 data-focus:ring-blue-500 data-disabled:opacity-30 dark:hover:bg-zinc-800"></div>
          </td>
        </template>
      </ui-date-picker-table>
    </ui-date-picker-view>
    <div class="flex gap-2 border-t border-gray-200 pt-3 dark:border-zinc-700">
      <ui-date-picker-preset-trigger value="last7Days" delegate><button class="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-zinc-800">Last 7 days</button></ui-date-picker-preset-trigger>
      <ui-date-picker-preset-trigger value="thisMonth" delegate><button class="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-zinc-800">This month</button></ui-date-picker-preset-trigger>
      <ui-date-picker-preset-trigger value="2026-03-10,2026-03-14" delegate><button class="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-zinc-800">Mar 10 to 14</button></ui-date-picker-preset-trigger>
    </div>
  </ui-date-picker-content>
</ui-date-picker>

</ComponentExample>

```html
<ui-date-picker inline selection-mode="range">
  <ui-date-picker-content>
    <ui-date-picker-month-select delegate><select></select></ui-date-picker-month-select>
    <ui-date-picker-year-select delegate><select></select></ui-date-picker-year-select>

    <ui-date-picker-view view="day">
      <ui-date-picker-view-control>
        <ui-date-picker-prev-trigger delegate><button>‹</button></ui-date-picker-prev-trigger>
        <ui-date-picker-view-trigger delegate>
          <button><ui-date-picker-range-text></ui-date-picker-range-text></button>
        </ui-date-picker-view-trigger>
        <ui-date-picker-next-trigger delegate><button>›</button></ui-date-picker-next-trigger>
      </ui-date-picker-view-control>
      <ui-date-picker-table>…templates…</ui-date-picker-table>
    </ui-date-picker-view>

    <ui-date-picker-view view="month">
      <ui-date-picker-view-control>…</ui-date-picker-view-control>
      <ui-date-picker-table columns="4" format="short">…</ui-date-picker-table>
    </ui-date-picker-view>

    <ui-date-picker-view view="year">
      <ui-date-picker-view-control>…</ui-date-picker-view-control>
      <ui-date-picker-table columns="4">…</ui-date-picker-table>
    </ui-date-picker-view>

    <ui-date-picker-preset-trigger value="last7Days" delegate><button>Last 7 days</button></ui-date-picker-preset-trigger>
    <ui-date-picker-preset-trigger value="2026-03-10,2026-03-14" delegate><button>Mar 10 to 14</button></ui-date-picker-preset-trigger>
  </ui-date-picker-content>
</ui-date-picker>
```

## API Reference

### Anatomy

Zag's date picker has 23 parts. You write 17 of them; the table writes the other 6 for you.

| Element | Description |
|---------|-------------|
| `ui-date-picker` | Owns the machine, `el.api` and the events |
| `ui-date-picker-label` | Names an input. `index` picks which, in range mode. `delegate` with a `<label>` |
| `ui-date-picker-control` | Groups the inputs and the triggers. Zag finds the inputs in it |
| `ui-date-picker-input` | Always `delegate` with an `<input>`. `index` picks the end, in range mode |
| `ui-date-picker-trigger` | Opens and closes the calendar. Always `delegate` with a `<button>` |
| `ui-date-picker-clear-trigger` | Clears the selection. Hidden while nothing is selected. Always `delegate` with a `<button>` |
| `ui-date-picker-positioner` | Positioned by floating-ui. Put the content in it |
| `ui-date-picker-content` | The calendar panel, `hidden` while closed |
| `ui-date-picker-view` | One calendar: `day`, `month` or `year`. Hidden unless current |
| `ui-date-picker-view-control` | Groups the triggers above a grid |
| `ui-date-picker-view-trigger` | Climbs to the next larger view. Always `delegate` with a `<button>` |
| `ui-date-picker-prev-trigger`, `ui-date-picker-next-trigger` | One month, year or decade back or forward. Always `delegate` with a `<button>` |
| `ui-date-picker-range-text` | The visible month, year or decade, written by the component |
| `ui-date-picker-table` | The grid, rendered from templates. See below |
| `ui-date-picker-month-select`, `ui-date-picker-year-select` | Always `delegate` with a `<select>` the component fills |
| `ui-date-picker-preset-trigger` | Selects a range named by `value`. Always `delegate` with a `<button>` |

Generated by the table, always under `delegate`, around the tag from the matching template:

| Element | Wraps | Attributes it reads |
|---------|-------|---------------------|
| `ui-date-picker-table-head` | `<thead>` | |
| `ui-date-picker-table-body` | `<tbody>` | |
| `ui-date-picker-table-row` | the `row` template's `<tr>` | |
| `ui-date-picker-table-header` | the `header` template's `<th>` | `index` into the weekdays, or `week` |
| `ui-date-picker-table-cell` | the `cell` template's `<td>` | `value`, `disabled`, `week-index` |
| `ui-date-picker-table-cell-trigger` | the first element child of that `<td>` | `value`, `label`, `disabled` |

Every authored element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

A part written inside a `ui-date-picker-view` reads its `view` from it. A table, a view control or a prev trigger written outside any view is the day view.

### The table and its templates

A calendar is 35 or 42 cells that change every month, so nobody authors them. `ui-date-picker-table` holds up to four templates and writes the rest:

| Template | Holds | Default without it |
|----------|-------|--------------------|
| `<template data-slot="table">` | one `<table>` | a bare `<table>` |
| `<template data-slot="row">` | one `<tr>`, used for the header row and every body row | a bare `<tr>` |
| `<template data-slot="header">` | one `<th>` | a bare `<th>` |
| `<template data-slot="cell">` | one `<td>` whose first element child is the trigger | `<td><div></div></td>` |

Rules:

- One tag per template, at the top of it. Anything inside that tag is cloned along, so an icon in a cell survives; the day number is appended after it.
- Nothing but templates goes in the table element. The `<table>` and everything in it belong to the component, and a morph that removes them is repaired on the next render.
- Custom elements cannot be written inside a `<table>`: the HTML parser moves them out before any script runs. That is why the six grid parts are generated, and why the templates hold plain table tags.
- Rows and cells are reused across months. A month change rewrites `value` on the existing cells and only adds or removes a row when the week count changes, so focus stays on a node that still exists.

The month and year views use the same templates, without a header row. `columns` sets the cells per row there (Zag's default is 4) and `format="short"` or `long` picks the month names.

### Attributes on `ui-date-picker`

Dates are ISO, `YYYY-MM-DD`. Lists are comma separated. A date that does not parse is dropped with one warning in the console, and the machine keeps its own default for it.

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `locale` | string | the nearest `lang`, else `en-US` | Weekday names, month names and the input format |
| `time-zone` | string | `UTC` | The zone used to decide what today is |
| `selection-mode` | `single` \| `multiple` \| `range` | `single` | |
| `value` | date list | none | The controlled selection |
| `default-value` | date list | none | The initial selection |
| `focused-value`, `default-focused-value` | date | today | The controlled or initial focused date, which decides the month shown first |
| `min`, `max` | date | none | Dates outside are `data-disabled` and cannot be selected |
| `unavailable-dates` | date list | none | Closed days: `data-unavailable`, not selectable |
| `unavailable-weekdays` | number list | none | Closed weekdays, Sunday `0` to Saturday `6` |
| `num-of-months` | number | `1` | Months shown at once |
| `start-of-week` | number | the locale's | `0` for Sunday |
| `fixed-weeks` | boolean | `false` | Always six rows |
| `show-week-numbers` | boolean | `false` | A first column with the ISO week number |
| `close-on-select` | boolean | `true` | Ignored in `multiple` mode |
| `open-on-click` | boolean | `false` | A click on the input opens the calendar |
| `open-on-focus` | boolean | `false` | Focus arriving from outside the picker opens it. Focus returning from inside, after a selection or Escape, does not |
| `disabled`, `readonly`, `required`, `invalid` | boolean | `false` | Land on the input as attributes and data attributes |
| `outside-day-selectable` | boolean | `false` | Days of the neighbouring months can be clicked |
| `max-selected-dates` | number | none | In `multiple` mode |
| `placeholder` | string | the locale's format | Written on the input, over its own |
| `name` | string | none | Written on the input for the form |
| `view`, `default-view` | `day` \| `month` \| `year` | `day` | The controlled or initial view |
| `min-view`, `max-view` | view | `day`, `year` | Where the view trigger stops |
| `open`, `default-open` | boolean | `false` | The controlled or initial open state |
| `inline` | boolean | `false` | Always open, no positioner logic, no trigger needed |
| `positioning-*` | | | The same attributes as the popover: `positioning-placement`, `positioning-gutter` and the rest |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` | |

Translations, over Zag's English defaults. Zag writes these as `aria-label`, over anything you author on the button, so localize them here:

| Attribute | On | Placeholders |
|-----------|----|--------------|
| `translations-trigger` | the trigger | |
| `translations-clear-trigger` | the clear trigger | |
| `translations-content` | the content | |
| `translations-prev-trigger`, `translations-next-trigger` | each prev or next trigger | `{view}`, the view it moves: `day`, `month` or `year` |
| `translations-view-trigger` | each view trigger | `{view}` and `{next}`, the view it leads to |
| `translations-month-select`, `translations-year-select` | the selects | |
| `translations-week-column-header` | the week number header | |

The day cell label stays Zag's, the full date in the locale.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-date-picker-label`, `ui-date-picker-input` | `index` | `0` or `1`, the end of a range. `0` when absent |
| `ui-date-picker-view` | `view` | `day`, `month` or `year`. Anything else renders nothing |
| `ui-date-picker-table` | `columns` | Cells per row in the month and year views |
| `ui-date-picker-table` | `format` | `short` or `long` month names in the month view |
| `ui-date-picker-preset-trigger` | `value` | A Zag preset such as `last7Days`, `last30Days`, `thisMonth`, `lastMonth`, `thisYear`, or two ISO dates as a comma list |

`view` and `value` are reflected properties as well, so a framework may assign them.

### What the component writes

Some parts are strings by nature, and the component writes them into the element that takes the props:

- `ui-date-picker-range-text` gets `api.visibleRangeText`: `March 2026` in the day view, `2026` in the month view, `2020 - 2029` in the year view. With several months visible it reads `March 2026 - April 2026`.
- The generated header cells get the narrow weekday name as text and the long one as `aria-label`.
- The generated cell triggers get the day number, or the month or year label. A week number cell gets its number.
- The selects get their `<option>`s from `api.getMonths()` and `api.getYears()`, and their `value` is the visible month or year. Zag's own props carry `defaultValue`, which a `<select>` does not have.

### `el.api` and `el.isDateUnavailable`

`api` is available on `ui-date-picker` only. Parts reach it with `el.closest("ui-date-picker").api`.

```js
const picker = document.querySelector("ui-date-picker");

picker.api.value;              // DateValue[]; String(date) is the ISO date
picker.api.valueAsString;      // string[], what the inputs show, in the locale
picker.api.open;               // boolean
picker.api.view;               // "day" | "month" | "year"
picker.api.visibleRangeText;   // { start, end, formatted }
picker.api.setValue([datePicker.parse("2026-03-17")]);
picker.api.clearValue();
picker.api.setOpen(true);
picker.api.goToNext();
picker.api.setView("month");
picker.api.selectToday();

// A rule of your own. It replaces the one built from the two list attributes;
// set it back to null and the lists apply again.
picker.isDateUnavailable = (date) => date.day === 13;
```

`parse` is exported by `@zag-js/date-picker`. `api.value` holds `CalendarDate` objects from `@internationalized/date`, whose `toString()` is the ISO date.

### Events

All bubble, and carry Zag's details object untouched.

| Event | Detail |
|-------|--------|
| `ui-date-picker:value-change` | `{ value, valueAsString, view }`. `String(value[0])` is the ISO date, `valueAsString[0]` is what the input shows |
| `ui-date-picker:focus-change` | the same plus `focusedValue` |
| `ui-date-picker:view-change` | `{ view }` |
| `ui-date-picker:visible-range-change` | `{ view, visibleRange: { start, end } }` |
| `ui-date-picker:open-change` | `{ open, value }` |

### Naming the parts

Write an `id` on the root, an input, a label, the content, the control, the positioner, a trigger, a select, or a prev, next or view trigger, and the component keeps it. Zag names the generated parts by date, view or index, and those are not yours to name.

```html
<ui-date-picker id="delivery">
  <ui-date-picker-control>
    <ui-date-picker-input delegate><input id="delivery-input" /></ui-date-picker-input>
  </ui-date-picker-control>
  …
</ui-date-picker>
```

With `delegate`, the id goes on the child, because the child is the element Zag names. A `<label for="delivery-input">` outside the component then names the field.

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-date-picker` | `root` | `id`, `data-state` |
| `ui-date-picker-label` | `label` | `for`, `data-index`, `data-state` |
| `ui-date-picker-control` | `control` | `id`, `data-disabled` |
| `ui-date-picker-input` | `input` | `id`, `name`, `placeholder`, `required`, `disabled`, `readonly`, `aria-invalid`, `data-index`, `data-state`, the typed and formatted value |
| `ui-date-picker-trigger` | `trigger` | `type="button"`, `aria-label`, `aria-expanded`, `aria-controls`, `aria-haspopup="grid"`, `data-state` |
| `ui-date-picker-clear-trigger` | `clear-trigger` | `type="button"`, `aria-label`, `hidden` while empty |
| `ui-date-picker-positioner` | `positioner` | `id`, floating-ui's position |
| `ui-date-picker-content` | `content` | `id`, `role="application"`, `aria-label`, `hidden`, `data-state`, `data-placement`, `data-inline` |
| `ui-date-picker-view` | `view` | `data-view`, `hidden` unless current |
| `ui-date-picker-view-control` | `view-control` | `data-view` |
| `ui-date-picker-view-trigger` | `view-trigger` | `type="button"`, `aria-label`, `disabled` at `max-view`, `data-view` |
| `ui-date-picker-prev-trigger`, `-next-trigger` | `prev-trigger`, `next-trigger` | `type="button"`, `aria-label`, `disabled` at `min` or `max`, `data-disabled` |
| `ui-date-picker-range-text` | `range-text` | the text |
| the `<table>` | `table` | `role="grid"`, `id`, `data-view`, `data-columns`, `aria-multiselectable`, keyboard handling |
| `<thead>`, `<tbody>`, `<tr>` | `table-head`, `table-body`, `table-row` | `data-view`, `data-disabled`, `aria-hidden` on the head |
| `<th>` | `table-header` | `scope="col"`, `aria-label`, the text |
| `<td>` | `table-cell` | `role="gridcell"`, `aria-selected`, `data-value`, `data-selected`, `data-in-range`, `data-outside-range`, `data-unavailable`, `data-disabled` |
| the trigger in a `<td>` | `table-cell-trigger` | `role="button"`, `tabindex`, `aria-label`, `data-value`, `data-view`, `data-today`, `data-focus`, `data-selected`, `data-range-start`, `data-range-end`, `data-in-range`, `data-in-hover-range`, `data-unavailable`, `data-disabled`, `data-weekend`, the text |
| `ui-date-picker-month-select`, `-year-select` | `month-select`, `year-select` | `id`, `aria-label`, `disabled`, the options |
| `ui-date-picker-preset-trigger` | `preset-trigger` | `type="button"`, `aria-label` |

### Before the elements upgrade

`ui.css` hides the positioner until the root upgrades, unless `default-open` or `inline` is set, so a closed calendar never paints open for a frame. The root, the control, the view control and the table are blocks; the content and each view are blocks too, guarded on `hidden`. The grid is empty until the first render, one frame after upgrade: an inline calendar shows its controls over nothing for that frame.
