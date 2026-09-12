# Timer

A countdown or a stopwatch, one element per time part, with the digits written for you and an accessible label rebuilt on every tick.

## Features

- ✅ Countdown from a duration, or count up to one
- ✅ Days, hours, minutes, seconds and milliseconds as separate parts, zero padded
- ✅ Start, pause, resume, reset and restart from buttons or from the api
- ✅ `role="timer"` with a label you write as a template
- ✅ A tick event with the raw and the formatted time
- ✅ A changed duration restarts the timer, with no script
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/timer";
```

## Examples

### Countdown

One day, two hours, three minutes and four seconds from the moment the page loaded. Each `ui-timer-item` names its time part, and the value part inside it shows the padded number. Zag writes `--value` on every item, the raw number, for a CSS reel or a progress ring.

<ComponentExample>

<ui-timer countdown start-ms="93784000" auto-start translations-area-label="Sale ends in {days} days {hours} hours {minutes} minutes {seconds} seconds">
  <ui-timer-area class="flex gap-3">
    <ui-timer-item type="days" class="flex w-20 flex-col items-center rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
      <ui-timer-item-value class="text-3xl font-bold tabular-nums"></ui-timer-item-value>
      <ui-timer-item-label class="text-xs uppercase opacity-70">Days</ui-timer-item-label>
    </ui-timer-item>
    <ui-timer-item type="hours" class="flex w-20 flex-col items-center rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
      <ui-timer-item-value class="text-3xl font-bold tabular-nums"></ui-timer-item-value>
      <ui-timer-item-label class="text-xs uppercase opacity-70">Hours</ui-timer-item-label>
    </ui-timer-item>
    <ui-timer-item type="minutes" class="flex w-20 flex-col items-center rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
      <ui-timer-item-value class="text-3xl font-bold tabular-nums"></ui-timer-item-value>
      <ui-timer-item-label class="text-xs uppercase opacity-70">Minutes</ui-timer-item-label>
    </ui-timer-item>
    <ui-timer-item type="seconds" class="flex w-20 flex-col items-center rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
      <ui-timer-item-value class="text-3xl font-bold tabular-nums"></ui-timer-item-value>
      <ui-timer-item-label class="text-xs uppercase opacity-70">Seconds</ui-timer-item-label>
    </ui-timer-item>
  </ui-timer-area>
</ui-timer>

</ComponentExample>

```html
<ui-timer countdown start-ms="93784000" auto-start translations-area-label="Sale ends in {days} days {hours} hours {minutes} minutes {seconds} seconds">
  <ui-timer-area>
    <ui-timer-item type="days">
      <ui-timer-item-value></ui-timer-item-value>
      <ui-timer-item-label>Days</ui-timer-item-label>
    </ui-timer-item>
    <ui-timer-item type="hours">…</ui-timer-item>
    <ui-timer-item type="minutes">…</ui-timer-item>
    <ui-timer-item type="seconds">…</ui-timer-item>
  </ui-timer-area>
</ui-timer>
```

### Stopwatch

Without `countdown` the timer counts up from zero to `target-ms`. The action triggers are real buttons under `delegate`; Zag hides each one while its action makes no sense, so the four below read as one control. `interval="100"` makes the milliseconds move.

<ComponentExample>

<ui-timer target-ms="600000" interval="100">
  <ui-timer-area class="flex items-baseline gap-1 font-mono text-3xl tabular-nums">
    <ui-timer-item type="minutes"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
    <ui-timer-separator>:</ui-timer-separator>
    <ui-timer-item type="seconds"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
    <ui-timer-separator>.</ui-timer-separator>
    <ui-timer-item type="milliseconds" class="text-lg opacity-70"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
  </ui-timer-area>
  <ui-timer-control class="mt-3 flex gap-2">
    <ui-timer-action-trigger action="start" delegate><button class="rounded-md bg-blue-600 px-3 py-1 text-sm text-white">Start</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="pause" delegate><button class="rounded-md bg-gray-200 px-3 py-1 text-sm dark:bg-zinc-700">Pause</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="resume" delegate><button class="rounded-md bg-blue-600 px-3 py-1 text-sm text-white">Resume</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="reset" delegate><button class="rounded-md bg-gray-200 px-3 py-1 text-sm dark:bg-zinc-700">Reset</button></ui-timer-action-trigger>
  </ui-timer-control>
</ui-timer>

</ComponentExample>

```html
<ui-timer target-ms="600000" interval="100">
  <ui-timer-area>
    <ui-timer-item type="minutes"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
    <ui-timer-separator>:</ui-timer-separator>
    <ui-timer-item type="seconds"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
    <ui-timer-separator>.</ui-timer-separator>
    <ui-timer-item type="milliseconds"><ui-timer-item-value></ui-timer-item-value></ui-timer-item>
  </ui-timer-area>
  <ui-timer-control>
    <ui-timer-action-trigger action="start" delegate><button>Start</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="pause" delegate><button>Pause</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="resume" delegate><button>Resume</button></ui-timer-action-trigger>
    <ui-timer-action-trigger action="reset" delegate><button>Reset</button></ui-timer-action-trigger>
  </ui-timer-control>
</ui-timer>
```

### Area label

`translations-area-label` is a template. The placeholders take the raw numbers, so `{hours}` reads `1`, not `01`: the label is for a screen reader, and "1 hour" is what a person says. The area below has no items; it shows its own `aria-label` through a `::before` rule, so you can watch the label follow the ticks.

<ComponentExample>

<ui-timer countdown start-ms="3725000" auto-start translations-area-label="{hours} hours, {minutes} minutes and {seconds} seconds left">
  <ui-timer-area class="text-sm before:content-[attr(aria-label)]"></ui-timer-area>
</ui-timer>

</ComponentExample>

```html
<ui-timer countdown start-ms="3725000" auto-start translations-area-label="{hours} hours, {minutes} minutes and {seconds} seconds left">
  <ui-timer-area>…</ui-timer-area>
</ui-timer>
```

Without the attribute Zag's own label is used: `0 days 01:02:05`.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-timer` | Owns the machine, `el.api` and the events |
| `ui-timer-area` | `role="timer"`, carries the label. Put the items in it |
| `ui-timer-item` | One time part, named by `type`. Zag writes `--value` on it |
| `ui-timer-item-value` | The padded number for its item, written by the component |
| `ui-timer-item-label` | The caption for its item. Yours to fill |
| `ui-timer-separator` | Hidden from assistive technology. Yours to fill |
| `ui-timer-control` | Groups the action triggers |
| `ui-timer-action-trigger` | One action, named by `action`. Always `delegate` with a `<button>` |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

The value and the label read their time part from the `ui-timer-item` around them, so write `type` once per unit. A value or a label outside an item renders nothing.

### Attributes on `ui-timer`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `countdown` | boolean | `false` | Count down from `start-ms` instead of up from it |
| `start-ms` | number | `0` | Where the count starts, in milliseconds |
| `target-ms` | number | none | Where the count stops. A countdown stops at `0` when it is not set |
| `auto-start` | boolean | `false` | Run from the first render |
| `interval` | number | `1000` | Milliseconds between ticks |
| `translations-area-label` | string | Zag's | The `aria-label` of the area. Placeholders: `{days}`, `{hours}`, `{minutes}`, `{seconds}`, `{milliseconds}` |

Two things are settled when the machine is built, and no attribute changes them afterwards:

- **`auto-start` is read once.** It picks the initial state and nothing else. Toggling it later does nothing; call `api.start()`.
- **Zag validates the numbers together**, and throws in the console for a combination it rejects: an `interval` of `0` or less, a negative `start-ms` or `target-ms`, a countdown whose `start-ms` is not above `target-ms`, or a countdown with `start-ms` at `0` and no `target-ms`. The component passes the attributes through as they are; the rules are yours to keep.

A changed `start-ms` does reach a running timer: Zag watches it and restarts the count from the new value.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-timer-item` | `type` | `days`, `hours`, `minutes`, `seconds` or `milliseconds`. Anything else renders nothing |
| `ui-timer-action-trigger` | `action` | `start`, `pause`, `resume`, `reset` or `restart`. Anything else renders nothing |

Both are reflected properties as well, so a framework may assign them.

### What the value part writes

Zag's props for `ui-timer-item-value` are data attributes; the number itself is `api.formattedTime[type]`, which a framework binding would render as the element's text. The component writes it for you, on every render, into the element that takes the props. Padding is Zag's: two digits for days, hours, minutes and seconds, three for milliseconds. Anything you put in it is replaced on the first render.

### Naming the parts

Write an `id` on the root or the area and the component keeps it. Zag names the other parts nothing, so their ids are yours already.

```html
<ui-timer id="sale-countdown" countdown start-ms="3600000" auto-start>
  <ui-timer-area id="sale-countdown-area">…</ui-timer-area>
</ui-timer>
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### `el.api`

Available on `ui-timer` only. Parts reach it with `el.closest("ui-timer").api`.

```js
const timer = document.querySelector("ui-timer");

timer.api.running;          // boolean
timer.api.paused;           // boolean
timer.api.time;             // { days, hours, minutes, seconds, milliseconds }, numbers
timer.api.formattedTime;    // the same, zero padded strings
timer.api.progressPercent;  // 0 to 1
timer.api.start();
timer.api.pause();
timer.api.resume();
timer.api.reset();          // back to start-ms; a running timer keeps running, a paused one goes idle
timer.api.restart();        // back to start-ms and running
```

### Events

All bubble, and carry Zag's details object.

| Event | Detail |
|-------|--------|
| `ui-timer:tick` | `{ value, time, formattedTime }`, once per interval while running |
| `ui-timer:complete` | `{}`, when the count reaches its target |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-timer` | `root` | `id` |
| `ui-timer-area` | `area` | `role="timer"`, `aria-label`, `aria-atomic`, `id` |
| `ui-timer-control` | `control` | |
| `ui-timer-item` | `item` | `data-type`, `--value` |
| `ui-timer-item-value` | `item-value` | `data-type`, the text |
| `ui-timer-item-label` | `item-label` | `data-type` |
| `ui-timer-separator` | `separator` | `aria-hidden` |
| `ui-timer-action-trigger` | `action-trigger` | `type="button"`, `hidden` by state |

### Before the elements upgrade

`ui.css` makes the root, the area, the control and each item blocks, and nothing more: the row is yours, through a `flex` class on the area, and it holds before and after upgrade alike. The value parts are empty until the first render, which is one frame after upgrade: a unit shows its label over nothing for that frame. Render the first value into the element yourself if that frame matters; the component replaces it with the same text.
