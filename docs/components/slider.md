# Slider

A track, a filled range and one or more thumbs. A press anywhere on the control moves the nearest thumb, a drag follows the pointer, and the arrow keys step a focused thumb. Two thumbs make a range.

## Features

- ✅ One thumb or several, numbered by document order
- ✅ Press, drag, and the arrow, Page, Home and End keys
- ✅ `min-steps-between-thumbs`, and `push` or `swap` when thumbs collide
- ✅ A hidden input per thumb, named for the form
- ✅ Markers along the track, styled by their place against the value
- ✅ A dragging indicator per thumb, shown while it moves
- ✅ `default-value` to start, `value` to control, both comma lists
- ✅ Horizontal or vertical, honours `dir`
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/slider";
```

`ui.css` gives the root, the control, the track, the range, the thumb and the markers their `display: block`. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

One thumb. The control takes a height from your CSS and the thumb a size, and Zag places the thumb and the range from the value. Press anywhere on the track, drag the thumb, or focus it and use the arrow keys.

<ComponentExample>

<div class="space-y-3" onpointerover="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-slider').addEventListener('ui-slider:value-change', (event) => { this.querySelector('output').value = event.detail.value[0]; }); }" onfocusin="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-slider').addEventListener('ui-slider:value-change', (event) => { this.querySelector('output').value = event.detail.value[0]; }); }">
  <ui-slider default-value="40">
    <div class="flex items-center justify-between text-sm">
      <ui-slider-label delegate><label>Volume</label></ui-slider-label>
      <ui-slider-value-text class="tabular-nums opacity-70"><output>40</output></ui-slider-value-text>
    </div>
    <ui-slider-control class="flex h-4 items-center">
      <ui-slider-track class="h-1 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
        <ui-slider-range class="h-full rounded-full bg-emerald-500"></ui-slider-range>
      </ui-slider-track>
      <ui-slider-thumb class="size-4 rounded-full border-2 border-emerald-500 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900">
        <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      </ui-slider-thumb>
    </ui-slider-control>
  </ui-slider>
</div>

</ComponentExample>

```html
<ui-slider default-value="40">
  <ui-slider-label delegate><label>Volume</label></ui-slider-label>
  <ui-slider-value-text></ui-slider-value-text>
  <ui-slider-control class="flex h-4 items-center">
    <ui-slider-track class="h-1 w-full">
      <ui-slider-range class="h-full"></ui-slider-range>
    </ui-slider-track>
    <ui-slider-thumb class="size-4 rounded-full">
      <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
    </ui-slider-thumb>
  </ui-slider-control>
</ui-slider>
```

::: tip Try it
Focus the thumb, then press the arrow keys. `Shift` with an arrow, or `PageUp` and `PageDown`, moves by `large-step`. `Home` and `End` go to the bounds.
:::

### Range

Two thumbs, one value each, and `min-steps-between-thumbs` keeps them apart. Each thumb carries its own `aria-label`, since one label cannot name both. A dragging indicator inside each thumb shows while that thumb moves. This is the shape of a price filter: it listens to `ui-slider:value-change-end`, which fires once when the pointer lifts or a key is released, and not to `value-change`, which fires on every move.

<ComponentExample>

<div class="space-y-3" onpointerover="if (!this.dataset.wired) { this.dataset.wired = ''; const slider = this.querySelector('ui-slider'); const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); const indicators = this.querySelectorAll('ui-slider-dragging-indicator'); slider.getAriaValueText = ({ value }) => format.format(value); slider.addEventListener('ui-slider:value-change', (event) => { event.detail.value.forEach((value, index) => { indicators[index].textContent = format.format(value); }); }); slider.addEventListener('ui-slider:value-change-end', (event) => { this.querySelector('output').value = event.detail.value.map((value) => format.format(value)).join(' to '); }); }" onfocusin="if (!this.dataset.wired) { this.dataset.wired = ''; const slider = this.querySelector('ui-slider'); const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); const indicators = this.querySelectorAll('ui-slider-dragging-indicator'); slider.getAriaValueText = ({ value }) => format.format(value); slider.addEventListener('ui-slider:value-change', (event) => { event.detail.value.forEach((value, index) => { indicators[index].textContent = format.format(value); }); }); slider.addEventListener('ui-slider:value-change-end', (event) => { this.querySelector('output').value = event.detail.value.map((value) => format.format(value)).join(' to '); }); }">
  <ui-slider min="0" max="500" step="5" default-value="80,320" min-steps-between-thumbs="2" name="price">
    <div class="flex items-center justify-between text-sm">
      <ui-slider-label delegate><label>Price</label></ui-slider-label>
      <ui-slider-value-text class="tabular-nums opacity-70"><output>$80 to $320</output></ui-slider-value-text>
    </div>
    <ui-slider-control class="mt-6 flex h-4 items-center">
      <ui-slider-track class="h-1 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
        <ui-slider-range class="h-full rounded-full bg-emerald-500"></ui-slider-range>
      </ui-slider-track>
      <ui-slider-thumb aria-label="Minimum price" class="size-4 rounded-full border-2 border-emerald-500 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900">
        <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
        <ui-slider-dragging-indicator class="bottom-full mb-2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">$80</ui-slider-dragging-indicator>
      </ui-slider-thumb>
      <ui-slider-thumb aria-label="Maximum price" class="size-4 rounded-full border-2 border-emerald-500 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900">
        <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
        <ui-slider-dragging-indicator class="bottom-full mb-2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">$320</ui-slider-dragging-indicator>
      </ui-slider-thumb>
    </ui-slider-control>
  </ui-slider>
</div>

</ComponentExample>

```html
<ui-slider id="price" min="0" max="500" step="5" default-value="80,320" min-steps-between-thumbs="2" name="price">
  <ui-slider-label delegate><label>Price</label></ui-slider-label>
  <ui-slider-control class="flex h-4 items-center">
    <ui-slider-track class="h-1 w-full"><ui-slider-range class="h-full"></ui-slider-range></ui-slider-track>
    <ui-slider-thumb aria-label="Minimum price" class="size-4 rounded-full">
      <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      <ui-slider-dragging-indicator class="bottom-full mb-2"></ui-slider-dragging-indicator>
    </ui-slider-thumb>
    <ui-slider-thumb aria-label="Maximum price" class="size-4 rounded-full">
      <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      <ui-slider-dragging-indicator class="bottom-full mb-2"></ui-slider-dragging-indicator>
    </ui-slider-thumb>
  </ui-slider-control>
</ui-slider>

<script>
  const slider = document.getElementById("price");
  const format = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  slider.getAriaValueText = ({ value }) => format.format(value);

  slider.addEventListener("ui-slider:value-change-end", (event) => {
    event.detail.value; // [80, 320], once per release
  });
</script>
```

The hidden inputs are named `price[]` here, one per thumb, because the root has a `name` and more than one thumb. A `name` written on a thumb replaces that for its own input.

### Markers

A marker sits at a value along the track and reads `data-state` as `under-value`, `at-value` or `over-value` against the thumbs. The group is positioned by Zag, each marker at the same offset the thumb would take.

<ComponentExample>

<div class="space-y-3">
  <ui-slider default-value="50" step="25">
    <ui-slider-control class="flex h-4 items-center">
      <ui-slider-track class="h-1 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
        <ui-slider-range class="h-full rounded-full bg-emerald-500"></ui-slider-range>
      </ui-slider-track>
      <ui-slider-thumb aria-label="Level" class="size-4 rounded-full border-2 border-emerald-500 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900">
        <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      </ui-slider-thumb>
    </ui-slider-control>
    <ui-slider-marker-group class="mt-1 h-5">
      <ui-slider-marker value="0" class="text-xs opacity-60 data-[state=at-value]:font-semibold data-[state=at-value]:opacity-100">0</ui-slider-marker>
      <ui-slider-marker value="25" class="text-xs opacity-60 data-[state=at-value]:font-semibold data-[state=at-value]:opacity-100">25</ui-slider-marker>
      <ui-slider-marker value="50" class="text-xs opacity-60 data-[state=at-value]:font-semibold data-[state=at-value]:opacity-100">50</ui-slider-marker>
      <ui-slider-marker value="75" class="text-xs opacity-60 data-[state=at-value]:font-semibold data-[state=at-value]:opacity-100">75</ui-slider-marker>
      <ui-slider-marker value="100" class="text-xs opacity-60 data-[state=at-value]:font-semibold data-[state=at-value]:opacity-100">100</ui-slider-marker>
    </ui-slider-marker-group>
  </ui-slider>
</div>

</ComponentExample>

```html
<ui-slider default-value="50" step="25">
  <ui-slider-control>…</ui-slider-control>
  <ui-slider-marker-group class="h-5">
    <ui-slider-marker value="0">0</ui-slider-marker>
    <ui-slider-marker value="50">50</ui-slider-marker>
    <ui-slider-marker value="100">100</ui-slider-marker>
  </ui-slider-marker-group>
</ui-slider>
```

### Vertical

`orientation="vertical"` turns the travel upward: the control takes a height, the track a width, and `ArrowUp` and `ArrowDown` step the thumb.

<ComponentExample>

<div class="flex justify-center">
  <ui-slider default-value="30" orientation="vertical">
    <ui-slider-control class="flex h-48 w-4 justify-center">
      <ui-slider-track class="h-full w-1 rounded-full bg-gray-200 dark:bg-zinc-700">
        <ui-slider-range class="w-full rounded-full bg-emerald-500"></ui-slider-range>
      </ui-slider-track>
      <ui-slider-thumb aria-label="Level" class="size-4 rounded-full border-2 border-emerald-500 bg-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-zinc-900">
        <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      </ui-slider-thumb>
    </ui-slider-control>
  </ui-slider>
</div>

</ComponentExample>

```html
<ui-slider default-value="30" orientation="vertical">
  <ui-slider-control class="flex h-48 w-4 justify-center">
    <ui-slider-track class="h-full w-1"><ui-slider-range class="w-full"></ui-slider-range></ui-slider-track>
    <ui-slider-thumb aria-label="Level" class="size-4 rounded-full">…</ui-slider-thumb>
  </ui-slider-control>
</ui-slider>
```

### Controlled

With `value` written, the list is yours. The element fires `ui-slider:value-change` for every press, drag and key, and renders the attribute's values until you change them.

```html
<ui-slider id="volume" value="40">…</ui-slider>

<script>
  const slider = document.getElementById("volume");

  slider.addEventListener("ui-slider:value-change", (event) => {
    slider.setAttribute("value", event.detail.value.join(","));
  });
</script>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-slider` | Owns the machine, `el.api` and the events. Carries the `--slider-*` custom properties and the state attributes |
| `ui-slider-label` | Names the slider. Always `delegate` with a `<label>` |
| `ui-slider-control` | The pointer surface. A press anywhere on it moves the nearest thumb. The thumbs sit inside it |
| `ui-slider-track` | The line the thumbs travel along |
| `ui-slider-range` | The filled part of the track, between the thumbs, or from the origin to the thumb |
| `ui-slider-thumb` | One value. `role="slider"`, focusable, the arrow keys. One per value |
| `ui-slider-hidden-input` | The form field for its thumb. Always `delegate` with an `<input>`, inside the thumb |
| `ui-slider-value-text` | Text that reads the value, `aria` linked to the slider |
| `ui-slider-marker-group` | Holds the markers, positioned like the control |
| `ui-slider-marker` | A tick at `value`, placed where a thumb at that value would be |
| `ui-slider-dragging-indicator` | Shown while its thumb drags, `hidden` otherwise. Inside the thumb |

Every element takes the machine's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

Two rules of placement. The thumbs sit inside the control: that is where Zag looks for them to measure their size, and a thumb outside it stays invisible. Give each thumb a size from your CSS; Zag reads it and insets the travel by half of it, so a thumb at the bounds stays inside the control. A hidden input and a dragging indicator sit inside their thumb and take its index. Written elsewhere, each needs `index`.

### Attributes on `ui-slider`

| attribute | type | meaning |
|-----------|------|---------|
| `default-value` | comma list | the values on first render, one per thumb, default `0` for a single thumb |
| `value` | comma list | the controlled values; the element renders them until you change them |
| `min` | number | default `0` |
| `max` | number | default `100` |
| `step` | number | default `1` |
| `large-step` | number | the step with `Shift`, `PageUp` and `PageDown`, default ten times `step` |
| `min-steps-between-thumbs` | number | the gap two thumbs keep, in steps, default `0` |
| `orientation` | `horizontal` \| `vertical` | default `horizontal` |
| `origin` | `start` \| `center` \| `end` | where a single thumb's range fills from, default `start` |
| `thumb-alignment` | `contain` \| `center` | `contain` keeps the thumb inside the track at the bounds, `center` lets its centre reach the edge, default `contain` |
| `thumb-collision-behavior` | `none` \| `push` \| `swap` | what a thumb does when dragged into another, default `none` |
| `thumb-width`, `thumb-height` | number | the thumb's size in pixels, both together; set, Zag does not measure |
| `name`, `form` | string | the form name of the hidden inputs, `name[]` when there is more than one thumb |
| `disabled` | boolean | ignores every input and takes the thumbs out of the tab order |
| `readonly` | boolean | ignores every input, the thumbs stay focusable |
| `invalid` | boolean | `data-invalid` on every part |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |

`value` and `default-value` are Zag's pair. A changed `value` renders the new list. A changed `default-value` does nothing after the first render; call `api.setValue()` for that.

### Attributes on the parts

| element | attribute | meaning |
|---------|-----------|---------|
| `ui-slider-thumb` | `index` | which value this thumb holds. Absent, the thumb takes its place among the root's thumbs in document order |
| `ui-slider-thumb` | `name` | the form name of its hidden input, over the root's `name` |
| `ui-slider-thumb` | `aria-label`, `aria-labelledby` | its accessible name. Zag would name every thumb by the label; one you write wins |
| `ui-slider-hidden-input`, `ui-slider-dragging-indicator` | `index` | the thumb it belongs to, when written outside one |
| `ui-slider-marker` | `value` | where the marker sits |

### `getAriaValueText`

A function, so a property on the root rather than an attribute. It turns a thumb's `aria-valuenow` into the `aria-valuetext` a screen reader speaks.

```js
slider.getAriaValueText = ({ value, index }) => `${value} euros`;
slider.getAriaValueText = null; // the bare number again
```

### `el.api`

Available on `ui-slider` only. Parts reach it with `el.closest("ui-slider").api`.

```js
const slider = document.querySelector("ui-slider");

slider.api.value;                 // number[], one per thumb
slider.api.dragging;              // boolean
slider.api.focused;               // boolean
slider.api.setValue([20, 80]);
slider.api.getThumbValue(1);
slider.api.setThumbValue(1, 50);
slider.api.getThumbMin(1);        // the bound the thumb before it sets
slider.api.getThumbMax(0);
slider.api.increment(0);
slider.api.decrement(0);
slider.api.focus();               // the first thumb
slider.api.getValuePercent(50);   // 0.5
slider.api.getPercentValue(0.5);  // 50
```

### Events

All bubble, and carry the machine's details object.

| Event | Detail |
|-------|--------|
| `ui-slider:value-change` | `{ value }`, on every move, key and api call |
| `ui-slider:value-change-end` | `{ value }`, once when the pointer lifts, a key is released or the api moves the value |
| `ui-slider:focus-change` | `{ focusedIndex, value }`, `-1` when no thumb has focus |

A filter fetches on `value-change-end`. A readout updates on `value-change`.

### Custom properties

Zag writes these on the root's style, and the range and the thumbs read them. A stylesheet may read them too, for a readout placed along the track.

| property | value |
|----------|-------|
| `--slider-thumb-offset-N` | where thumb `N` sits, a percent or a `calc()` |
| `--slider-thumb-width`, `--slider-thumb-height` | the measured or written thumb size |
| `--slider-thumb-transform` | the translate that centres a thumb on its offset |
| `--slider-range-start`, `--slider-range-end` | the range's insets from each end |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-slider` | `root` | `id`, `dir`, `data-orientation`, `data-disabled`, `data-dragging`, `data-focus`, `data-invalid`, the custom properties |
| `ui-slider-label` | `label` | `id`, `for` pointing at the first hidden input, the state attributes |
| `ui-slider-control` | `control` | `id`, the state attributes, inline `position`, `touch-action` and `user-select` |
| `ui-slider-track` | `track` | `id`, the state attributes, inline `position: relative` |
| `ui-slider-range` | `range` | `id`, the state attributes, inline `position: absolute` and the insets from the custom properties |
| `ui-slider-thumb` | `thumb` | `id`, `role="slider"`, `tabindex`, `data-index`, the `aria-value*` set, `aria-orientation`, `data-focus`, `data-dragging`, inline `position: absolute`, the offset, the transform and `visibility` until measured |
| `ui-slider-hidden-input` | none | `id`, `type="text"`, `hidden`, `name`, `form`, the value |
| `ui-slider-value-text` | `value-text` | `id`, the state attributes |
| `ui-slider-marker-group` | `marker-group` | `role="presentation"`, `aria-hidden`, inline `position: relative` and `pointer-events: none` |
| `ui-slider-marker` | `marker` | `id`, `data-value`, `data-state`, inline `position: absolute` and the offset |
| `ui-slider-dragging-indicator` | `dragging-indicator` | `hidden`, `data-state`, inline `position: absolute` and the offset of its thumb |

### Naming the parts

Write an `id` on the root or on any part and the component keeps it, a thumb, a hidden input and a marker included. Zag names the rest.

```html
<ui-slider id="price">
  <ui-slider-thumb id="price-min">…</ui-slider-thumb>
  <ui-slider-thumb id="price-max">…</ui-slider-thumb>
</ui-slider>
```

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### Before the elements upgrade

`ui.css` makes the root, the control, the track, the range, the thumbs and the markers blocks, and nothing more. Until the first render, one frame after upgrade, every thumb sits at the start of its control and the range fills nothing. Zag then keeps the thumbs invisible for the one frame it needs to measure them. The thumb count is read at that first render; a thumb added later is placed but not measured.
