# Rating

A row of items, usually stars. A click picks a value, a hover previews one, and the arrow keys step it. With `allow-half` a pointer over the left half of an item picks half of it. With `static` the rating stops being an input and becomes a picture of a value, such as a product's average beside its reviews.

## Features

- ✅ As many items as you write, numbered 1 to N by document order
- ✅ Click, hover preview, and the arrow, Home and End keys
- ✅ Half values with `allow-half`
- ✅ `--rating-item-fill` on each item, so 4.3 fills a third of the fifth star
- ✅ `static` for a display only rating, read out as "Rated 4.3 out of 5"
- ✅ A hidden input, named for the form
- ✅ `default-value` to start, `value` to control
- ✅ Honours `dir`
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/rating";
```

`ui.css` makes the root and the control blocks, each item an inline flex box and the label inline. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

Five items, each drawing two stars: a grey one, and a coloured one clipped to `--rating-item-fill`. The component draws nothing itself. Click a star, hover to preview, or focus the rating and use the arrow keys.

<ComponentExample>

<div class="space-y-2">
  <ui-rating default-value="3">
    <ui-rating-label delegate><label class="text-sm">Your rating</label></ui-rating-label>
    <ui-rating-control class="mt-1 flex gap-1">
      <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    </ui-rating-control>
    <ui-rating-hidden-input delegate><input></ui-rating-hidden-input>
  </ui-rating>
</div>

</ComponentExample>

```html
<ui-rating default-value="3">
  <ui-rating-label delegate><label>Your rating</label></ui-rating-label>
  <ui-rating-control class="flex gap-1">
    <ui-rating-item class="relative size-6">
      <svg viewBox="0 0 24 24" class="absolute inset-0 fill-gray-300"><path d="…" /></svg>
      <svg viewBox="0 0 24 24" class="absolute inset-0 fill-amber-400"
           style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="…" /></svg>
    </ui-rating-item>
    <!-- four more items -->
  </ui-rating-control>
  <ui-rating-hidden-input delegate><input></ui-rating-hidden-input>
</ui-rating>
```

The count is the number of items. Write three and the rating goes from 1 to 3.

::: tip Try it
Focus the rating, then press the arrow keys. `Home` and `End` go to the first and the last item.
:::

### Half values

`allow-half` lets a pointer over the left half of an item pick half of it, and the arrow keys then step by halves. The fill variable reads `0.5` on that item, so the same markup draws the half star. Zag also sets `data-half` on it, for a design that swaps the icon rather than clipping it.

<ComponentExample>

<ui-rating default-value="2.5" allow-half>
  <ui-rating-control class="flex gap-1">
    <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    <ui-rating-item class="relative size-6 cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
  </ui-rating-control>
  <ui-rating-hidden-input delegate><input></ui-rating-hidden-input>
</ui-rating>

</ComponentExample>

```html
<ui-rating default-value="2.5" allow-half>…</ui-rating>
```

### Static

An average from many reviews is not an input. `static` makes the control an image labelled with the value, hides the items from assistive technology, takes them out of the tab order and ignores the pointer. The value keeps its fraction, and `--rating-item-fill` draws it.

<ComponentExample>

<div class="flex items-center gap-2">
  <ui-rating value="4.3" static>
    <ui-rating-control class="flex gap-0.5">
      <ui-rating-item class="relative size-4"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-4"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-4"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-4"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
      <ui-rating-item class="relative size-4"><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-gray-300 dark:fill-zinc-600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><svg viewBox="0 0 24 24" class="absolute inset-0 size-full fill-amber-400" style="clip-path: inset(0 calc(100% - var(--rating-item-fill, 0) * 100%) 0 0)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></ui-rating-item>
    </ui-rating-control>
  </ui-rating>
  <span class="text-sm opacity-70">4.3 (128 reviews)</span>
</div>

</ComponentExample>

```html
<ui-rating value="4.3" static>
  <ui-rating-control class="flex gap-0.5">…</ui-rating-control>
</ui-rating>
```

The control reads "Rated 4.3 out of 5", with the value formatted for the nearest `lang`. A page that renders on the server usually has the translated sentence already, and an `aria-label` written on the control wins:

```html
<ui-rating value="{{ $average }}" static>
  <ui-rating-control aria-label="{{ __('Rated :avg out of 5', ['avg' => $average]) }}">…</ui-rating-control>
</ui-rating>
```

::: warning Style by the fill, not by data-highlighted
Zag sets `data-highlighted` on every item up to the value rounded up, so at 4.3 all five items carry it. `--rating-item-fill` is the one that knows the fraction.
:::

`static` is not `readonly`. A `readonly` rating is still a form control, a radio group whose checked item takes focus. Use it for a value the user may read but not change, inside a form.

### In a form

The hidden input carries the value under the root's `name`, and `required` holds the form until a value is picked.

```html
<form>
  <ui-rating name="rating" required>
    <ui-rating-label delegate><label>Rate this product</label></ui-rating-label>
    <ui-rating-control>…</ui-rating-control>
    <ui-rating-hidden-input delegate><input></ui-rating-hidden-input>
  </ui-rating>
</form>
```

### Controlled

With `value` written, the value is yours. The element fires `ui-rating:value-change` for every click and key, and renders the attribute's value until you change it.

```html
<ui-rating id="stars" value="3">…</ui-rating>

<script>
  const stars = document.getElementById("stars");

  stars.addEventListener("ui-rating:value-change", (event) => {
    stars.setAttribute("value", event.detail.value);
  });
</script>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-rating` | Owns the machine, `el.api` and the events |
| `ui-rating-label` | Names the rating. Always `delegate` with a `<label>` |
| `ui-rating-control` | The radio group, or the image in `static` mode. The items sit inside it |
| `ui-rating-item` | One value. `role="radio"`, carries `--rating-item-fill`. One per value |
| `ui-rating-hidden-input` | The form field. Always `delegate` with an `<input>` |

Every element takes the machine's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

The items sit inside the control: that is where Zag looks for the one to focus after a key press.

### Attributes on `ui-rating`

| attribute | type | meaning |
|-----------|------|---------|
| `default-value` | number | the value on first render, none by default |
| `value` | number | the controlled value; the element renders it until you change it. May be fractional in `static` mode |
| `allow-half` | boolean | a pointer and the keys pick halves |
| `static` | boolean | a display of the value, not an input. See [Static](#static) |
| `name`, `form` | string | the form name of the hidden input |
| `required` | boolean | the form needs a value |
| `disabled` | boolean | ignores every input and takes the items out of the tab order |
| `readonly` | boolean | ignores every input, the checked item stays focusable |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |

There is no `count`. It is the number of items, so it cannot disagree with them.

### Attributes on the parts

| element | attribute | meaning |
|---------|-----------|---------|
| `ui-rating-control` | `aria-label`, `aria-labelledby` | its accessible name. In `static` mode it wins over the generated "Rated V out of C"; otherwise over the label part |
| `ui-rating-item` | `aria-label`, `aria-labelledby` | its accessible name, over `getRatingValueText` |

### `getRatingValueText`

A function, so a property on the root rather than an attribute. It is called with an item's value to label that item, and in `static` mode with the rating's own value, fractional, to label the control.

```js
stars.getRatingValueText = ({ value, count }) => `${value} of ${count}`;
stars.getRatingValueText = null; // "N stars" and "Rated V out of C" again
```

### `el.api`

Available on `ui-rating` only. Parts reach it with `el.closest("ui-rating").api`.

```js
const stars = document.querySelector("ui-rating");

stars.api.value;         // number, -1 when nothing is picked
stars.api.hoveredValue;  // number, -1 when not hovering
stars.api.hovering;      // boolean
stars.api.count;         // the number of items
stars.api.setValue(4);
stars.api.clearValue();
```

### Events

All bubble, and carry the machine's details object.

| Event | Detail |
|-------|--------|
| `ui-rating:value-change` | `{ value }`, on every click, key and api call |
| `ui-rating:hover-change` | `{ hoveredValue }`, as the pointer moves across the items, `-1` when it leaves |

### Custom properties

| property | on | value |
|----------|----|-------|
| `--rating-item-fill` | each item | how much of the item the shown value covers, from `0` to `1`. The shown value is the hovered one while hovering, the value otherwise |

Clip from the start edge. Under `rtl` the start is on the right, so flip the inset: `inset(0 0 0 calc(100% - var(--rating-item-fill, 0) * 100%))`.

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-rating` | `root` | `id`, `dir` |
| `ui-rating-label` | `label` | `id`, `for` pointing at the hidden input, `data-disabled`, `data-required` |
| `ui-rating-control` | `control` | `id`, `role="radiogroup"`, `aria-labelledby`, `data-readonly`, `data-disabled`. In `static` mode `role="img"` and `aria-label` instead |
| `ui-rating-item` | `item` | `id`, `role="radio"`, `tabindex`, `aria-checked`, `aria-posinset`, `aria-setsize`, `aria-label`, `data-checked`, `data-highlighted`, `data-half`, `data-readonly`, `data-disabled`, inline `--rating-item-fill`. In `static` mode only the `data-*`, the fill and `aria-hidden` |
| `ui-rating-hidden-input` | none | `id`, `type="text"`, `hidden`, `name`, `form`, `required`, the value |

Every part carries `data-scope="rating-group"`, Zag's name for the machine.

### Naming the parts

Write an `id` on the root or on any part and the component keeps it, an item included. Zag names the rest.

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### Before the elements upgrade

`ui.css` gives the parts their display and nothing more. Until the first render, one frame after upgrade, no item carries `--rating-item-fill`. Give every `var()` that reads it a fallback, as the examples do with `, 0`: without one the `clip-path` is invalid, resolves to `none`, and every star paints full. For a static rating that should paint filled before the bundle runs, render the variable on each item from the server: `style="--rating-item-fill: 0.3"`.
