# Image Zoom

A viewport, an image inside it and three buttons. A click, a double tap, a pinch, the wheel or the keyboard scales the image around the point under the pointer, and a drag pans it once it no longer fits.

## Features

- ✅ Click to zoom with a mouse, tap twice with a finger
- ✅ Pinch, ctrl plus wheel, `+`, `-` and `0`
- ✅ Drag or arrow keys to pan a zoomed image, clamped to its edges
- ✅ Increment, decrement and reset buttons that disable at the limits
- ✅ A swipe report while the image fits, for a wrapper that shows a list
- ✅ `default-value` to start zoomed, `value` to control the scale
- ✅ Honours `dir`: a swipe toward the end edge is `next`
- ✅ Keeps its state when a server re-renders the markup

Zag has no zoom component, so this one runs a machine the package wrote in Zag's shape. ADR 0002 in the repository records what that means and what it does not.

## Installation

```js
import "@bagistoplus/ui/image-zoom";
```

`ui.css` gives the root, the viewport and the image part their `display: block`. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

The viewport takes a size from your CSS and clips the image at its edges. Photos from Unsplash. Click the picture to zoom in, click again to reset, drag to pan. The buttons are real `<button>`s under `delegate`, disabled while their action makes no sense.

<ComponentExample>

<div class="space-y-3" onpointerover="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-image-zoom').addEventListener('ui-image-zoom:value-change', (event) => { this.querySelector('output').value = event.detail.value.toFixed(2); }); }" onfocusin="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-image-zoom').addEventListener('ui-image-zoom:value-change', (event) => { this.querySelector('output').value = event.detail.value.toFixed(2); }); }">
  <ui-image-zoom translations-increment-trigger="Zoom in" translations-decrement-trigger="Zoom out" translations-reset-trigger="Reset zoom">
    <ui-image-zoom-viewport class="aspect-video w-full rounded-lg bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
      <ui-image-zoom-image delegate>
        <img alt="A wristwatch with a leather strap" class="h-full w-full object-contain transition-transform duration-150 ease-out motion-reduce:transition-none" src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80">
      </ui-image-zoom-image>
    </ui-image-zoom-viewport>
    <div class="flex items-center gap-2">
      <ui-image-zoom-decrement-trigger delegate><button class="rounded-md bg-gray-200 px-3 py-1 text-sm disabled:opacity-40 dark:bg-zinc-700">−</button></ui-image-zoom-decrement-trigger>
      <ui-image-zoom-increment-trigger delegate><button class="rounded-md bg-gray-200 px-3 py-1 text-sm disabled:opacity-40 dark:bg-zinc-700">+</button></ui-image-zoom-increment-trigger>
      <ui-image-zoom-reset-trigger delegate><button class="rounded-md bg-gray-200 px-3 py-1 text-sm disabled:opacity-40 dark:bg-zinc-700">Reset</button></ui-image-zoom-reset-trigger>
      <span class="ms-auto text-sm tabular-nums opacity-70">Scale <output>1.00</output></span>
    </div>
  </ui-image-zoom>
</div>

</ComponentExample>

```html
<ui-image-zoom translations-increment-trigger="Zoom in" translations-decrement-trigger="Zoom out" translations-reset-trigger="Reset zoom">
  <ui-image-zoom-viewport class="aspect-video w-full">
    <ui-image-zoom-image delegate>
      <img src="product.jpg" alt="…" class="h-full w-full object-contain">
    </ui-image-zoom-image>
  </ui-image-zoom-viewport>
  <ui-image-zoom-decrement-trigger delegate><button>−</button></ui-image-zoom-decrement-trigger>
  <ui-image-zoom-increment-trigger delegate><button>+</button></ui-image-zoom-increment-trigger>
  <ui-image-zoom-reset-trigger delegate><button>Reset</button></ui-image-zoom-reset-trigger>
</ui-image-zoom>
```

::: tip Try it
Focus the viewport, then press `+`, `-` and `0`. Once zoomed, the arrow keys pan. Hold `ctrl` and use the wheel, or pinch on a touch screen.
:::

### Swipe

While the image fits, a horizontal drag is not a pan: the element reports it as `ui-image-zoom:swipe` with `next` or `previous`, and a wrapper that shows a list of images changes the item. Once zoomed, the same drag pans and nothing is reported.

<ComponentExample>

<div class="space-y-3" onpointerover="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-image-zoom').addEventListener('ui-image-zoom:swipe', (event) => { this.querySelector('output').value = event.detail.direction; }); }" onfocusin="if (!this.dataset.wired) { this.dataset.wired = ''; this.querySelector('ui-image-zoom').addEventListener('ui-image-zoom:swipe', (event) => { this.querySelector('output').value = event.detail.direction; }); }">
  <ui-image-zoom>
    <ui-image-zoom-viewport class="h-40 w-full rounded-lg bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
      <ui-image-zoom-image delegate>
        <img alt="A red running shoe" class="h-full w-full object-cover transition-transform duration-150 ease-out motion-reduce:transition-none" src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80">
      </ui-image-zoom-image>
    </ui-image-zoom-viewport>
    <p class="text-sm opacity-70">Drag sideways. Last swipe: <output>none</output></p>
  </ui-image-zoom>
</div>

</ComponentExample>

```html
<ui-image-zoom id="zoom">…</ui-image-zoom>

<script>
  document.getElementById("zoom").addEventListener("ui-image-zoom:swipe", (event) => {
    event.detail.direction; // "next" | "previous"
  });
</script>
```

### Controlled

With `value` written, the scale is yours. The element fires `ui-image-zoom:value-change` for every click, pinch, key and button, and renders the attribute's scale until you change it.

```html
<ui-image-zoom id="zoom" value="1">…</ui-image-zoom>

<script>
  const zoom = document.getElementById("zoom");

  zoom.addEventListener("ui-image-zoom:value-change", (event) => {
    zoom.setAttribute("value", event.detail.value);
  });
</script>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-image-zoom` | Owns the machine, `el.api` and the events. Carries the state attributes |
| `ui-image-zoom-viewport` | The gesture surface. Focusable, clips the image, takes the size |
| `ui-image-zoom-image` | The element the transform lands on. `delegate` around the `<img>` |
| `ui-image-zoom-increment-trigger` | Zooms in by `step`. Always `delegate` with a `<button>` |
| `ui-image-zoom-decrement-trigger` | Zooms out by `step`. Always `delegate` with a `<button>` |
| `ui-image-zoom-reset-trigger` | Back to a scale of 1. Always `delegate` with a `<button>` |

Every element takes the machine's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

Give the viewport a size. It is the box a pointer is measured against and the box that clips the scaled image, so a viewport with no size of its own zooms nothing you can see. The image part works without `delegate` too, as a block the transform moves, but the `<img>` is the element you size and fit, so hand it the props.

A control inside the viewport is left alone: a press that starts on a button, a link or a form field neither zooms nor pans.

### Attributes on `ui-image-zoom`

| attribute | type | meaning |
|-----------|------|---------|
| `default-value` | number | the scale on first render, default `1` |
| `value` | number | the controlled scale; the element renders it until you change it |
| `max` | number | the largest scale, default `4`. The floor is `1` and is not an attribute |
| `step` | number | what a button, `+`, `-` or a wheel notch adds, default `0.5` |
| `double-tap-scale` | number | the scale a click or a double tap goes to, default `2` |
| `swipe-threshold` | number | the horizontal travel, as a fraction of the viewport width, that counts as a swipe, default `0.15` |
| `disabled` | boolean | ignores every gesture, disables the buttons and takes the viewport out of the tab order |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |
| `translations-increment-trigger` | string | the increment trigger's `aria-label` |
| `translations-decrement-trigger` | string | the decrement trigger's `aria-label` |
| `translations-reset-trigger` | string | the reset trigger's `aria-label` |

`value` and `default-value` are Zag's pair. A changed `value` renders the new scale. A changed `default-value` does nothing after the first render; call `api.setValue()` for that. Both are clamped: a `value="9"` with the default `max` renders at 4.

### Gestures

| Input | While the image fits | Once zoomed |
|-------|----------------------|-------------|
| Mouse click | zooms to `double-tap-scale` at the pointer | resets |
| Finger tap, twice within 300 ms | zooms to `double-tap-scale` at the finger | resets |
| Drag | reports a swipe past `swipe-threshold` | pans |
| Pinch | scales by the change in distance | scales by the change in distance |
| `ctrl` plus wheel | one `step` per notch, at the pointer | one `step` per notch, at the pointer |
| `+` `=` | one `step` in | one `step` in |
| `-` `_` | one `step` out | one `step` out |
| `0` | nothing | resets |
| Arrow keys | left alone, for whatever wraps the surface | pan by a twentieth of the viewport, and stop propagating |

A single finger tap does nothing on purpose: a tap is how a person steadies or dismisses a fullscreen image, and zooming on it would fire by accident. A mouse click zooms at once, which is what the `zoom-in` cursor promises.

### `el.api`

Available on `ui-image-zoom` only. Parts reach it with `el.closest("ui-image-zoom").api`.

```js
const zoom = document.querySelector("ui-image-zoom");

zoom.api.value;         // number, 1 or more
zoom.api.offsetX;       // number, the pan as a fraction of the viewport, from its centre
zoom.api.offsetY;
zoom.api.zoomed;        // boolean, value above 1
zoom.api.panning;       // boolean, true between a press and its release
zoom.api.disabled;      // boolean
zoom.api.canIncrement;  // boolean
zoom.api.canDecrement;  // boolean
zoom.api.setValue(2);   // clamped to 1 and `max`, scaled around the centre
zoom.api.increment();
zoom.api.decrement();
zoom.api.reset();
```

`setValue()`, `increment()` and `decrement()` do nothing while `disabled`. On a controlled element they fire the event without changing the rendered scale.

### Events

Both bubble, and carry the machine's details object.

| Event | Detail |
|-------|--------|
| `ui-image-zoom:value-change` | `{ value }`, once per scale change |
| `ui-image-zoom:swipe` | `{ direction }`, `next` or `previous`, for a horizontal drag while the image fits |

`next` is the end edge of the writing direction: a drag to the left under `dir="ltr"`, a drag to the right under `dir="rtl"`.

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-image-zoom` | `root` | `id`, `dir`, `data-zoomed`, `data-panning`, `data-disabled` |
| `ui-image-zoom-viewport` | `viewport` | `id`, `tabindex`, `data-zoomed`, `data-panning`, `data-disabled`, inline `position`, `overflow`, `user-select`, `touch-action` and `cursor` |
| `ui-image-zoom-image` | `image` | `draggable="false"`, inline `transform` and `transform-origin` |
| `ui-image-zoom-increment-trigger` | `increment-trigger` | `type="button"`, `disabled` at `max`, `aria-label` |
| `ui-image-zoom-decrement-trigger` | `decrement-trigger` | `type="button"`, `disabled` at 1, `aria-label` |
| `ui-image-zoom-reset-trigger` | `reset-trigger` | `type="button"`, `disabled` at 1, `aria-label` |

The viewport's `cursor` reads `zoom-in`, `grab` or `grabbing` by state. Write your own on a class if you want another; an inline declaration the machine did not write is left alone, but these five it owns.

### Naming the parts

Write an `id` on the root or the viewport and the component keeps it. The machine names the other parts nothing, so their ids are yours already.

```html
<ui-image-zoom id="product-zoom">
  <ui-image-zoom-viewport id="product-zoom-viewport">…</ui-image-zoom-viewport>
</ui-image-zoom>
```

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### Before the elements upgrade

`ui.css` makes the root, the viewport and the image part blocks, and nothing more. The image sits at its natural size until the first render, which is one frame after upgrade, and the buttons are enabled until then. A `transition-transform` class on the `<img>` is yours to add; the machine writes the transform and nothing about how it gets there.
