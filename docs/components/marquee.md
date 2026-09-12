# Marquee

A strip of content that scrolls across its box without end, paused by a hover, a focus, an attribute or the api.

## Features

- ✅ Copies its own content as many times as the box needs, and keeps the copies in step
- ✅ Speed, spacing and direction as attributes, changeable live
- ✅ Breakpoints in the same attributes, `speed="40 640:60 1024:80"`
- ✅ Horizontal or vertical, forwards or reversed, honours `dir`
- ✅ Pauses on hover and focus, or on a `paused` attribute you control
- ✅ Copies are `inert`, so a link in the strip is one tab stop
- ✅ Honours `prefers-reduced-motion`
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/marquee";
```

`ui.css` carries the animation. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

One content, four items. `auto-fill` makes as many copies as the box needs; without it there is exactly one, which is what follows the content into view.

<ComponentExample>

<ui-marquee auto-fill spacing="2rem" translations-root="Store promises" class="w-full rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
  <ui-marquee-viewport>
    <ui-marquee-content>
      <ui-marquee-item class="text-sm font-medium whitespace-nowrap">Free shipping over $50</ui-marquee-item>
      <ui-marquee-item class="text-sm font-medium whitespace-nowrap">New arrivals weekly</ui-marquee-item>
      <ui-marquee-item class="text-sm font-medium whitespace-nowrap">Secure checkout</ui-marquee-item>
      <ui-marquee-item class="text-sm font-medium whitespace-nowrap">Easy returns</ui-marquee-item>
    </ui-marquee-content>
  </ui-marquee-viewport>
</ui-marquee>

</ComponentExample>

::: tip Try it
Resize the window. The number of copies follows the width, and nothing listens for a resize in your code.
:::

### Pause on interaction

`pause-on-interaction` pauses on a pointer over the strip or a focus inside it. The root carries `data-paused` while it holds, so anything inside can style itself by it. Two edges fade the ends; Zag positions them, you paint them.

<ComponentExample>

<ui-marquee auto-fill pause-on-interaction speed="80" spacing="1.5rem" class="group relative w-full rounded-lg border border-gray-200 py-3 dark:border-zinc-700">
  <ui-marquee-viewport>
    <ui-marquee-content>
      <ui-marquee-item><a href="#pause-on-interaction" class="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-900 whitespace-nowrap dark:bg-blue-950 dark:text-blue-100">Spring</a></ui-marquee-item>
      <ui-marquee-item><a href="#pause-on-interaction" class="rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-900 whitespace-nowrap dark:bg-emerald-950 dark:text-emerald-100">Summer</a></ui-marquee-item>
      <ui-marquee-item><a href="#pause-on-interaction" class="rounded-md bg-amber-100 px-3 py-1 text-sm text-amber-900 whitespace-nowrap dark:bg-amber-950 dark:text-amber-100">Autumn</a></ui-marquee-item>
      <ui-marquee-item><a href="#pause-on-interaction" class="rounded-md bg-rose-100 px-3 py-1 text-sm text-rose-900 whitespace-nowrap dark:bg-rose-950 dark:text-rose-100">Winter</a></ui-marquee-item>
    </ui-marquee-content>
  </ui-marquee-viewport>
  <ui-marquee-edge side="start" class="w-12 bg-gradient-to-r from-white to-transparent dark:from-zinc-900"></ui-marquee-edge>
  <ui-marquee-edge side="end" class="w-12 bg-gradient-to-l from-white to-transparent dark:from-zinc-900"></ui-marquee-edge>
  <span class="absolute right-2 top-0 hidden text-xs text-gray-500 group-data-paused:inline dark:text-zinc-400">paused</span>
</ui-marquee>

</ComponentExample>

Press <kbd>Tab</kbd> into the strip: four links, not sixteen. The copies are `inert`.

### Vertical

`side="top"` scrolls upwards, `side="bottom"` downwards. Give the root a height; Zag measures it to decide how many copies fill it.

<ComponentExample>

<ui-marquee auto-fill side="top" speed="30" spacing="0.75rem" class="h-40 w-full rounded-lg bg-gray-100 dark:bg-zinc-800">
  <ui-marquee-viewport>
    <ui-marquee-content>
      <ui-marquee-item class="rounded-md bg-white px-3 py-2 text-sm shadow-sm dark:bg-zinc-900">Fast delivery</ui-marquee-item>
      <ui-marquee-item class="rounded-md bg-white px-3 py-2 text-sm shadow-sm dark:bg-zinc-900">Premium support</ui-marquee-item>
      <ui-marquee-item class="rounded-md bg-white px-3 py-2 text-sm shadow-sm dark:bg-zinc-900">Member rewards</ui-marquee-item>
    </ui-marquee-content>
  </ui-marquee-viewport>
</ui-marquee>

</ComponentExample>

### Controlled pausing

The `paused` attribute is Zag's controlled prop. While it is present a hover or a blur cannot resume the strip, and removing it hands control back. That is what an editor wants while a merchant edits an item.

<ComponentExample>

<div class="w-full">
  <ui-marquee id="controlled" auto-fill pause-on-interaction spacing="2rem" class="w-full rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
    <ui-marquee-viewport>
      <ui-marquee-content>
        <ui-marquee-item class="text-sm whitespace-nowrap">One</ui-marquee-item>
        <ui-marquee-item class="text-sm whitespace-nowrap">Two</ui-marquee-item>
        <ui-marquee-item class="text-sm whitespace-nowrap">Three</ui-marquee-item>
      </ui-marquee-content>
    </ui-marquee-viewport>
  </ui-marquee>
  <button onclick="const m = document.getElementById('controlled'); m.toggleAttribute('paused'); if (!m.hasAttribute('paused')) { m.api.resume(); }" class="mt-3 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900">Toggle <code>paused</code></button>
</div>

</ComponentExample>

The button calls `api.resume()` after removing the attribute. An uncontrolled machine keeps the last value it set itself, which may be paused if the pointer was over the strip when the attribute went on.

### Breakpoints

`speed`, `spacing` and `side` take tiers: a base value, then `width:value` pairs that apply from that viewport width up, the way `min-width` media queries do. This one scrolls upwards on a phone and sideways from 640px, faster from 1024px.

<ComponentExample>

<ui-marquee auto-fill side="top 640:start" speed="30 1024:80" spacing="0.75rem 640:2rem" class="h-32 w-full rounded-lg bg-gray-100 py-3 dark:bg-zinc-800">
  <ui-marquee-viewport>
    <ui-marquee-content>
      <ui-marquee-item class="text-sm whitespace-nowrap">Mobile first</ui-marquee-item>
      <ui-marquee-item class="text-sm whitespace-nowrap">Sideways from 640px</ui-marquee-item>
      <ui-marquee-item class="text-sm whitespace-nowrap">Faster from 1024px</ui-marquee-item>
    </ui-marquee-content>
  </ui-marquee-viewport>
</ui-marquee>

</ComponentExample>

The tiers are viewport widths, not the marquee's own width, so they line up with the media queries in your stylesheet. A `speed` or `spacing` change is pushed into the running machine. A `side` change rebuilds it, because Zag would otherwise recalculate the duration from the old axis, and the pause state is carried over.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-marquee` | Owns the machine, `el.api` and the events. `role="region"`, clips the strip |
| `ui-marquee-viewport` | The row of contents. Makes the copies |
| `ui-marquee-content` | One track of items. The first one is yours; the rest are its copies |
| `ui-marquee-item` | One item. Zag writes the spacing on it as a margin |
| `ui-marquee-edge` | Optional. Positioned at the `side` you name, for a fade |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

Write one `ui-marquee-content` and put the items in it. Never write a second one: the viewport would treat it as a copy it did not make, and remove it.

### Copies

Zag's marquee scrolls one content out of the box while its copies follow, and asks for `multiplier + 1` contents: one when the content is at least as wide as the box, more with `auto-fill` when it is narrower. A framework binding maps over that number. The viewport does it for you:

- **The source** is the first `ui-marquee-content` child of the viewport.
- **A copy** is a clone of the source element with the copy's `index`, holding a deep clone of the source's children. Every `id` inside a copy is removed, because two elements with one id are not HTML and Zag looks elements up by id.
- **Copies follow the source.** A change to the source's children, their attributes or their text rebuilds the copies on the next frame. A change to the source element's own attributes does not, because the component writes those itself on every render.
- **Copies follow the box.** A resize of the root or the source reconnects the api and adds or removes copies. Zag alone would not: it measures on resize but the count it computed at connect stays.
- **A copy removed by something else is stamped again** on the next render, with the others rebuilt so the numbering stays one to `n`. A DOM differ that re-renders the marquee from server markup removes them all, since the server never sent them, and they are back one frame later.

Each copy is named after the source when the source has an `id`: `{id}-1`, `{id}-2`, and so on. Without one, Zag names them.

### `ui-marquee:clone`

A copy is built detached, handed to you, and appended afterwards:

```js
marquee.addEventListener("ui-marquee:clone", (event) => {
  const { clone, index, source } = event.detail;

  for (const element of clone.querySelectorAll("[data-editor]")) {
    element.removeAttribute("data-editor");
  }
});
```

`dispatchEvent` is synchronous, so whatever the listener does to `clone` is done before the copy is in the document. It fires once per copy, on every rebuild. Use it to take out of a copy what only the original should carry: an editor's block markers, a framework directive that must not run twice, a tracking attribute.

A copy is a clone of live DOM. A framework that initialises on attributes will initialise the copy as a new tree, which is what a loop in that framework would have produced. A component with a server-side identity, such as a Livewire component, does not survive being copied; keep such things out of a marquee.

### Attributes on `ui-marquee`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `side` | `start` \| `end` \| `top` \| `bottom`, tiered | `start` | The side the content scrolls towards. `top` and `bottom` make it vertical |
| `speed` | number, tiered | `50` | Pixels per second |
| `spacing` | CSS length, tiered | `1rem` | The gap between items, written as a margin on each |
| `delay` | number | `0` | Seconds before the animation starts |
| `loop-count` | number | `0` | How many times to run. `0` is forever |
| `auto-fill` | boolean | `false` | Copy the content until it fills the box |
| `pause-on-interaction` | boolean | `false` | Pause on hover and on focus inside |
| `reverse` | boolean | `false` | Run the animation backwards |
| `paused` | boolean | none | Controlled. While present, nothing but the attribute changes the pause state |
| `default-paused` | boolean | `false` | Start paused, uncontrolled |
| `dir` | `ltr` \| `rtl` | inherited | Read from the nearest `dir` if not set here. Flips the travel |
| `translations-root` | string | `Marquee content` | The `aria-label` of the region |

The three tiered attributes take `base width:value…`, mobile first, on viewport `min-width` queries. A `speed` change recalculates the duration and restarts the animation, a `spacing` change recalculates the duration, both through Zag's own watchers. A `side` change restarts the machine: Zag's watcher would recalculate from the dimensions of the old axis and never again, so the root builds a new machine, which measures the new axis at start. An uncontrolled pause state survives the restart.

**The duration is recalculated on those three only.** Zag computes it from the content's size when it starts and again when `speed`, `spacing` or `side` change, but not when the content itself changes size afterwards. A marquee whose items grow after load runs at a slightly different speed until one of the three changes.

**With `auto-fill`, `speed` is divided by the number of copies.** Zag's duration is the content's size times the multiplier over `speed`, while its animation moves each content by its own size, so the strip travels `speed / multiplier` pixels per second: a 100px content filling a 400px box at `speed="100"` moves 25px per second. Without `auto-fill` the speed is exact. The package passes Zag's number through unchanged.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-marquee-content` | `index` | Written by the viewport on a copy. Leave it off the source |
| `ui-marquee-edge` | `side` | `start`, `end`, `top` or `bottom`. Where the edge sits |

### What the marquee adds to Zag

Two things the package writes that are not in Zag's props:

| Where | What |
|-------|------|
| a copy | `inert`, next to Zag's `aria-hidden="true"` and `role="presentation"` |
| the root | a reconnect after a resize, so `contentCount` follows the box |

`inert` because Zag hides a copy from assistive technology but not from the keyboard, and a link in a strip with four copies would be five tab stops. The reconnect because Zag's count is computed once per connect and nothing in Zag triggers one on a resize. Everything else on every element is Zag's.

### Naming the parts

Write an `id` on the root, the viewport or the source content and the component keeps it. A copy is named `{source id}-{index}`.

```html
<ui-marquee id="ticker">
  <ui-marquee-viewport id="ticker-viewport">
    <ui-marquee-content id="ticker-track">…</ui-marquee-content>
  </ui-marquee-viewport>
</ui-marquee>
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the source alive across a re-render.

### `el.api`

Available on `ui-marquee` only. Parts reach it with `el.closest("ui-marquee").api`.

```js
const marquee = document.querySelector("ui-marquee");

marquee.api.paused;        // boolean
marquee.api.orientation;   // "horizontal" | "vertical"
marquee.api.contentCount;  // the source plus its copies
marquee.api.pause();
marquee.api.resume();
marquee.api.togglePause();
marquee.api.restart();     // the animation, from the start
```

`marquee.refresh()` on the element itself reconnects the api. The viewport calls it after a resize; you should not need to.

### Events

All bubble, and carry Zag's details object.

| Event | Detail |
|-------|--------|
| `ui-marquee:pause-change` | `{ paused }` |
| `ui-marquee:loop-complete` | `{}`, once per loop of the source |
| `ui-marquee:complete` | `{}`, when a finite `loop-count` ends |
| `ui-marquee:clone` | `{ clone, index, source }`, before the copy is appended |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-marquee` | `root` | `role="region"`, `aria-roledescription="marquee"`, `aria-live="off"`, `aria-label`, `dir`, `data-state`, `data-orientation`, `data-paused`, the flex, clipping and containment style, `--marquee-duration`, `--marquee-spacing`, `--marquee-delay`, `--marquee-loop-count`, `--marquee-translate`, `id` |
| `ui-marquee-viewport` | `viewport` | `data-orientation`, `data-side`, the flex row style, `id` |
| `ui-marquee-content` | `content` | `dir`, `data-index`, `data-orientation`, `data-side`, `data-reverse`, `data-clone`, the flex and compositor style, `id`; a copy also `role="presentation"`, `aria-hidden`, `inert` |
| `ui-marquee-item` | `item` | `dir`, the spacing margin |
| `ui-marquee-edge` | `edge` | `dir`, `data-side`, `data-orientation`, the absolute position |

### Reduced motion

`ui.css` stops the animation and hides the copies under `prefers-reduced-motion: reduce`. The source stays where it is, readable, with its own items only.

### Before the elements upgrade

Nothing is hidden and no stylesheet rule waits for the bundle. `ui.css` lays the root, the viewport and the content out as the same flex boxes Zag writes on upgrade, with the root clipping, so the items are a row from the first paint. The copies do not exist until the first render, and a vertical marquee is horizontal until `side` is read, so give a vertical one its height in your own CSS rather than through the component.
