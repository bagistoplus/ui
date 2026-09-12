# Before After

Two stacked slots and a handle between them. Drag the handle, press anywhere on the surface or use the arrow keys to reveal more of one and less of the other.

## Features

- ✅ Any content in either slot, images or not, clipped complementarily
- ✅ Drag, press and keyboard, with `role="slider"` on the handle
- ✅ Horizontal or vertical, honours `dir`
- ✅ `default-value` to start somewhere, `value` to control it
- ✅ `step` to snap the position
- ✅ Keeps its state when a server re-renders the markup

Zag has no comparison component, so this one runs a machine the package wrote in Zag's shape. ADR 0002 in the repository records what that means and what it does not.

## Installation

```js
import "@bagistoplus/ui/before-after";
```

`ui.css` gives the root its `display: block`. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

The root takes a size from your CSS. The slots fill it, the separator and the handle sit at the position.

<ComponentExample>

<ui-before-after translations-handle="Reveal" class="aspect-video w-full rounded-lg">
  <ui-before-after-before class="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-semibold text-slate-800">Before</ui-before-after-before>
  <ui-before-after-after class="flex items-center justify-center bg-gradient-to-br from-emerald-300 to-emerald-600 text-2xl font-semibold text-white">After</ui-before-after-after>
  <ui-before-after-separator class="w-0.5 bg-white/80 shadow-sm"></ui-before-after-separator>
  <ui-before-after-handle class="flex size-10 cursor-grab items-center justify-center rounded-full bg-white text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 active:cursor-grabbing">⇔</ui-before-after-handle>
</ui-before-after>

</ComponentExample>

```html
<ui-before-after translations-handle="Reveal" class="aspect-video w-full">
  <ui-before-after-before>…</ui-before-after-before>
  <ui-before-after-after>…</ui-before-after-after>
  <ui-before-after-separator class="w-0.5 bg-white/80"></ui-before-after-separator>
  <ui-before-after-handle class="size-10 rounded-full bg-white shadow-lg">⇔</ui-before-after-handle>
</ui-before-after>
```

::: tip Try it
Press anywhere on the surface, then use the arrow keys. Home and End jump to the edges, PageUp and PageDown move by ten.
:::

### Vertical

`orientation="vertical"` clips top to bottom. The separator becomes a horizontal line, and the up and down arrows move the handle.

<ComponentExample>

<ui-before-after orientation="vertical" default-value="35" translations-handle="Reveal" class="aspect-video w-full rounded-lg">
  <ui-before-after-before class="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-semibold text-slate-800">Before</ui-before-after-before>
  <ui-before-after-after class="flex items-center justify-center bg-gradient-to-br from-sky-300 to-sky-600 text-2xl font-semibold text-white">After</ui-before-after-after>
  <ui-before-after-separator class="h-0.5 bg-white/80 shadow-sm"></ui-before-after-separator>
  <ui-before-after-handle class="flex size-10 cursor-grab items-center justify-center rounded-full bg-white text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 active:cursor-grabbing">⇕</ui-before-after-handle>
</ui-before-after>

</ComponentExample>

### Driven from outside

The element owns the position. Move it from a script through `api.setValue()`, and follow it through `ui-before-after:value-change`. Here a range input does both.

<ComponentExample>

<div class="space-y-3" onpointerover="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-before-after').addEventListener('ui-before-after:value-change', (event) => { this.querySelector('input').value = event.detail.value; }); }" onfocusin="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-before-after').addEventListener('ui-before-after:value-change', (event) => { this.querySelector('input').value = event.detail.value; }); }">
  <ui-before-after id="driven-compare" default-value="50" translations-handle="Reveal" class="aspect-video w-full rounded-lg">
    <ui-before-after-before class="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-semibold text-slate-800">Before</ui-before-after-before>
    <ui-before-after-after class="flex items-center justify-center bg-gradient-to-br from-amber-300 to-amber-600 text-2xl font-semibold text-white">After</ui-before-after-after>
    <ui-before-after-separator class="w-0.5 bg-white/80 shadow-sm"></ui-before-after-separator>
    <ui-before-after-handle class="flex size-10 cursor-grab items-center justify-center rounded-full bg-white text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 active:cursor-grabbing">⇔</ui-before-after-handle>
  </ui-before-after>
  <label class="flex items-center gap-3 text-sm">
    Position
    <input type="range" min="0" max="100" value="50" class="flex-1" oninput="document.getElementById('driven-compare').api.setValue(Number(this.value))">
  </label>
</div>

</ComponentExample>

```html
<ui-before-after id="compare" default-value="50">…</ui-before-after>
<input type="range" min="0" max="100" value="50"
  oninput="document.getElementById('compare').api.setValue(Number(this.value))">

<script>
  document.getElementById("compare").addEventListener("ui-before-after:value-change", (event) => {
    document.querySelector("input[type=range]").value = event.detail.value;
  });
</script>
```

### Controlled

With `value` written, the position is yours. The element fires `ui-before-after:value-change` for every drag, press and key, and stays where the attribute says until you change it. Write the attribute back to follow the user, or leave it to hold the position.

```html
<ui-before-after id="compare" value="50">…</ui-before-after>

<script>
  const compare = document.getElementById("compare");

  compare.addEventListener("ui-before-after:value-change", (event) => {
    compare.setAttribute("value", event.detail.value);
  });
</script>
```

### Disabled

`disabled` marks the root with `data-disabled`, takes the handle out of the tab order and ignores every drag, press and key.

<ComponentExample>

<ui-before-after disabled default-value="60" translations-handle="Reveal" class="aspect-video w-full rounded-lg data-[disabled]:opacity-60">
  <ui-before-after-before class="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-semibold text-slate-800">Before</ui-before-after-before>
  <ui-before-after-after class="flex items-center justify-center bg-gradient-to-br from-rose-300 to-rose-600 text-2xl font-semibold text-white">After</ui-before-after-after>
  <ui-before-after-separator class="w-0.5 bg-white/80 shadow-sm"></ui-before-after-separator>
  <ui-before-after-handle class="flex size-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-lg">⇔</ui-before-after-handle>
</ui-before-after>

</ComponentExample>

### Right to left

The start edge follows the writing direction. Under `dir="rtl"` the before slot is revealed from the right, and the arrow keys follow the handle: left increases, right decreases.

<ComponentExample>

<div dir="rtl">
  <ui-before-after default-value="30" translations-handle="كشف" class="aspect-video w-full rounded-lg">
    <ui-before-after-before class="flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400 text-2xl font-semibold text-slate-800">قبل</ui-before-after-before>
    <ui-before-after-after class="flex items-center justify-center bg-gradient-to-br from-violet-300 to-violet-600 text-2xl font-semibold text-white">بعد</ui-before-after-after>
    <ui-before-after-separator class="w-0.5 bg-white/80 shadow-sm"></ui-before-after-separator>
    <ui-before-after-handle class="flex size-10 cursor-grab items-center justify-center rounded-full bg-white text-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500 active:cursor-grabbing">⇔</ui-before-after-handle>
  </ui-before-after>
</div>

</ComponentExample>

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-before-after` | Owns the machine, `el.api` and the event. The surface a press lands on, and the box both slots fill |
| `ui-before-after-before` | The slot revealed from the start edge to the handle |
| `ui-before-after-after` | The slot revealed from the handle to the end edge |
| `ui-before-after-separator` | The line at the position. `aria-hidden`, so style it and nothing else |
| `ui-before-after-handle` | The slider. Focusable, draggable, moved by the keys |

Every element takes the machine's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling). None of the five needs it: the handle carries `role="slider"` and `tabindex` as well as any element does.

Give the root a size. The slots are positioned absolutely inside it, so a root with no height of its own is a root with no height.

### Attributes on `ui-before-after`

| attribute | type | meaning |
|-----------|------|---------|
| `default-value` | number | the position on first render, 0 to 100, default `50` |
| `value` | number | the controlled position; the element holds it until you change it |
| `orientation` | `horizontal` \| `vertical` | the axis, default `horizontal` |
| `step` | number | the positions the value snaps to, default `1` |
| `disabled` | boolean | ignores every input and takes the handle out of the tab order |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |
| `translations-handle` | string | the handle's `aria-label` |
| `translations-value-text` | string | a template for the handle's `aria-valuetext`, with `{value}` for the rounded percentage. Default `{value} percent` |

The position is the percentage of the before slot that is visible, measured from the start edge. It is written on `value` and `default-value` as a plain number, `default-value="35"`, and clamped to the range: a controlled `value="150"` renders and announces 100.

`value` and `default-value` are Zag's pair. A changed `value` moves the handle. A changed `default-value` does nothing after the first render; call `api.setValue()` for that.

### `el.api`

Available on `ui-before-after` only. Parts reach it with `el.closest("ui-before-after").api`.

```js
const compare = document.querySelector("ui-before-after");

compare.api.value;        // number, 0 to 100
compare.api.dragging;     // boolean, true between a handle press and its release
compare.api.disabled;     // boolean
compare.api.orientation;  // "horizontal" | "vertical"
compare.api.dir;          // "ltr" | "rtl"
compare.api.setValue(80); // snapped to `step` and clamped
```

`setValue()` does nothing while `disabled`, and on a controlled element it fires the event without moving the handle.

### Events

Bubbles, and carries the details object.

| Event | Detail |
|-------|--------|
| `ui-before-after:value-change` | `{ value }`, once per change of the position, never for an equal value |

There is no drag start or drag end event. `data-dragging` on the root and `api.dragging` say the same thing.

### Keyboard

With the handle focused:

| Key | Horizontal | Vertical |
|-----|------------|----------|
| `ArrowRight` / `ArrowLeft` | one step towards the end / the start edge, following `dir` | nothing |
| `ArrowDown` / `ArrowUp` | nothing | one step down / up |
| `PageUp` / `PageDown` | ten steps up / down | ten steps up / down |
| `Home` / `End` | 0 / 100 | 0 / 100 |

A press on the surface moves the handle there and focuses it. A press that starts on a link, a button, a form control or anything with an interactive role inside a slot is left alone, so a slot can hold content that is itself clickable.

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-before-after` | `root` | `id`, `dir`, `data-orientation`, `data-disabled`, `data-dragging`, `position: relative`, `overflow: hidden`, `user-select: none`, `touch-action: none` |
| `ui-before-after-before` | `before` | `position: absolute`, `inset: 0`, the `clip-path` |
| `ui-before-after-after` | `after` | `position: absolute`, `inset: 0`, the complementary `clip-path` |
| `ui-before-after-separator` | `separator` | `aria-hidden`, `data-orientation`, the absolute position along the axis, a centering `transform` |
| `ui-before-after-handle` | `handle` | `id`, `role="slider"`, `tabindex`, `aria-label`, `aria-orientation`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, `aria-disabled`, `data-orientation`, the absolute position, a centering `transform` |

The positions are inline styles written by the machine on every render, in percent along the axis and centered on the other one. Style the size, the colour and the cursor; leave `position`, `left`, `top`, `inset` and `transform` to the machine.

### Naming the parts

Write an `id` on `ui-before-after` or `ui-before-after-handle` and the machine keeps it. Without one it names them itself.

### Before the elements upgrade

Nothing is hidden and no stylesheet rule waits for the bundle. Until the first render the slots are two ordinary children of an ordinary box: both visible, neither clipped, stacked in document order. The root gets its `display: block` from `ui.css`, so a size you give it in your own CSS holds from the first paint; the clipping arrives with the bundle.
