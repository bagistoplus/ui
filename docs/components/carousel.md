# Carousel

A row of slides in a scroll snap container, paged by triggers, indicators, the keyboard, a drag, or a timer.

## Features

- ✅ Native scroll snapping, so touch and trackpad work the way the browser does them
- ✅ Counts its own slides and numbers them from the DOM
- ✅ Slides per page, slides per move, spacing and padding as attributes, changeable live
- ✅ Breakpoints in the same attributes, `slides-per-page="1 640:2 1024:4"`
- ✅ Stamps one indicator per page from a template
- ✅ Autoplay with a play and pause trigger
- ✅ Publishes the page and the page count as custom properties, for progress bars
- ✅ Loops, drags with the mouse, honours `dir`
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/carousel";
```

## Examples

### Basic

Three slides, previous and next, and dots stamped from a template.

<ComponentExample>

<ui-carousel class="relative w-full">
  <ui-carousel-item-group class="rounded-lg">
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100">One</ui-carousel-item>
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">Two</ui-carousel-item>
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100">Three</ui-carousel-item>
  </ui-carousel-item-group>
  <div class="mt-3 flex items-center justify-center gap-3">
    <ui-carousel-prev-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Prev</button>
    </ui-carousel-prev-trigger>
    <ui-carousel-indicator-group class="flex items-center gap-2">
      <template>
        <ui-carousel-indicator delegate>
          <button class="h-2.5 w-2.5 cursor-pointer rounded-full border-0 bg-gray-300 p-0 data-current:bg-blue-600 dark:bg-zinc-700"></button>
        </ui-carousel-indicator>
      </template>
    </ui-carousel-indicator-group>
    <ui-carousel-next-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Next</button>
    </ui-carousel-next-trigger>
  </div>
</ui-carousel>

</ComponentExample>

::: tip Try it
Swipe or scroll the row sideways. The browser does the snapping, and Zag reads the page back from the scroll position. Focus a dot and press the arrow keys.
:::

### Several per page

`slides-per-page` and `spacing` are attributes. Change them at runtime and the snap points are re-measured and the dots re-stamped.

<ComponentExample>

<ui-carousel slides-per-page="2" spacing="12px" class="relative w-full">
  <ui-carousel-item-group>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">1</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">2</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">3</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">4</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">5</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">6</ui-carousel-item>
  </ui-carousel-item-group>
  <div class="mt-3 flex items-center justify-center gap-3">
    <ui-carousel-prev-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Prev</button>
    </ui-carousel-prev-trigger>
    <ui-carousel-progress-text class="text-sm text-gray-600 dark:text-zinc-400"></ui-carousel-progress-text>
    <ui-carousel-next-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Next</button>
    </ui-carousel-next-trigger>
  </div>
</ui-carousel>

</ComponentExample>

### Autoplay

`autoplay` starts the rotation, `autoplay-delay` sets the interval in milliseconds, and the autoplay trigger toggles it. Autoplay implies `loop`. The root carries `data-autoplay-state`, so anything inside can style itself by it.

<ComponentExample>

<ui-carousel autoplay autoplay-delay="2500" class="group relative w-full">
  <ui-carousel-item-group class="rounded-lg">
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100">Spring</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-lime-100 text-lime-900 dark:bg-lime-950 dark:text-lime-100">Summer</ui-carousel-item>
    <ui-carousel-item class="flex h-32 items-center justify-center rounded-lg bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100">Autumn</ui-carousel-item>
  </ui-carousel-item-group>
  <div class="mt-3 flex items-center justify-center gap-3">
    <ui-carousel-autoplay-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900">
        <span class="group-data-[autoplay-state=playing]:hidden">Play</span>
        <span class="hidden group-data-[autoplay-state=playing]:inline">Pause</span>
      </button>
    </ui-carousel-autoplay-trigger>
    <span class="text-sm text-gray-600 dark:text-zinc-400 group-data-[autoplay-state=paused]:hidden">rotating</span>
  </div>
</ui-carousel>

</ComponentExample>

### A progress bar

The root writes `--page` and `--page-count`. A progress bar is one element and two `calc()` declarations, and nothing listens to anything.

<ComponentExample>

<ui-carousel class="relative w-full">
  <ui-carousel-item-group class="rounded-lg">
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">A</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">B</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">C</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">D</ui-carousel-item>
  </ui-carousel-item-group>
  <div class="mt-3 flex items-center justify-center gap-3">
    <ui-carousel-prev-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Prev</button>
    </ui-carousel-prev-trigger>
    <ui-carousel-indicator-group class="relative flex h-1 w-40 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
      <span class="pointer-events-none absolute inset-y-0 rounded-full bg-blue-600 transition-[inset-inline-start] duration-300" style="width: calc(100% / var(--page-count)); inset-inline-start: calc(var(--page) * 100% / var(--page-count));"></span>
      <template>
        <ui-carousel-indicator delegate>
          <button class="h-full flex-1 cursor-pointer border-0 bg-transparent p-0" aria-label="Go to page"></button>
        </ui-carousel-indicator>
      </template>
    </ui-carousel-indicator-group>
    <ui-carousel-next-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Next</button>
    </ui-carousel-next-trigger>
  </div>
</ui-carousel>

</ComponentExample>

The stamped hit areas make the bar clickable and give it the arrow keys; the fill is the span before the template.

### Thumbnails as indicators

An indicator group without a `<template>` stamps nothing. Its authored indicators are numbered in DOM order, so a strip of thumbnails is the carousel's own pagination and gets `data-current`, the arrow keys, and a click that pages.

<ComponentExample>

<ui-carousel class="w-full">
  <ui-carousel-item-group class="rounded-lg">
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-sky-200 text-sky-900">Sky</ui-carousel-item>
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-violet-200 text-violet-900">Violet</ui-carousel-item>
    <ui-carousel-item class="flex h-40 items-center justify-center rounded-lg bg-teal-200 text-teal-900">Teal</ui-carousel-item>
  </ui-carousel-item-group>
  <ui-carousel-indicator-group class="mt-3 flex gap-2">
    <ui-carousel-indicator delegate><button class="h-12 w-16 cursor-pointer rounded-md border-2 border-transparent bg-sky-200 p-0 data-current:border-blue-600"></button></ui-carousel-indicator>
    <ui-carousel-indicator delegate><button class="h-12 w-16 cursor-pointer rounded-md border-2 border-transparent bg-violet-200 p-0 data-current:border-blue-600"></button></ui-carousel-indicator>
    <ui-carousel-indicator delegate><button class="h-12 w-16 cursor-pointer rounded-md border-2 border-transparent bg-teal-200 p-0 data-current:border-blue-600"></button></ui-carousel-indicator>
  </ui-carousel-indicator-group>
</ui-carousel>

</ComponentExample>

### Breakpoints

`slides-per-page`, `slides-per-move`, `spacing` and `padding` accept tiers. The first value is the base, and each `width:value` after it applies from that viewport width up, the way `min-width` media queries do. The widest matching tier wins, and the root switches when the viewport crosses a width.

<ComponentExample>

<ui-carousel slides-per-page="1 640:2 1024:3" spacing="8px 1024:16px" class="relative w-full">
  <ui-carousel-item-group>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">1</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">2</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">3</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">4</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">5</ui-carousel-item>
    <ui-carousel-item class="flex h-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-800">6</ui-carousel-item>
  </ui-carousel-item-group>
  <div class="mt-3 flex items-center justify-center gap-3">
    <ui-carousel-prev-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Prev</button>
    </ui-carousel-prev-trigger>
    <ui-carousel-progress-text class="text-sm text-gray-600 dark:text-zinc-400"></ui-carousel-progress-text>
    <ui-carousel-next-trigger delegate>
      <button class="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900">Next</button>
    </ui-carousel-next-trigger>
  </div>
</ui-carousel>

</ComponentExample>

::: tip Try it
Resize the window across 640px and 1024px. The page count in the text follows.
:::

The tiers are viewport widths, not the carousel's own width, so they line up with the media queries in your stylesheet. An inline `--slides-per-page` before upgrade cannot know the viewport, so write the base tier there and let the first frame correct it, or write the same tiers as media queries on `--slides-per-page` in your own CSS.

### Hiding slides

An item with the `hidden` attribute is not a slide: it is left out of the count and the numbering, and a thumbnail with `hidden` is left out of its group the same way. Toggle it and the snap points follow. A gallery that shows a different subset per variant needs nothing else.

```html
<ui-carousel-item hidden>Not shown, not counted, not numbered.</ui-carousel-item>
```

Only the attribute counts. An item hidden by a class is still a slide, because the element cannot read layout on every render.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-carousel` | Owns the machine, `el.api` and the events. `role="region"` |
| `ui-carousel-item-group` | The scroll container. Zag writes the grid and the overflow, and measures the snap points from it |
| `ui-carousel-item` | One slide. Numbered from the DOM unless `index` is written |
| `ui-carousel-control` | Optional wrapper for the triggers. Data attributes only |
| `ui-carousel-prev-trigger` | Always `delegate`, wrapping a `<button>`. Disabled at the start unless `loop` |
| `ui-carousel-next-trigger` | Always `delegate`, wrapping a `<button>`. Disabled at the end unless `loop` |
| `ui-carousel-autoplay-trigger` | Always `delegate`, wrapping a `<button>`. Toggles autoplay |
| `ui-carousel-indicator-group` | Holds the indicators and their keyboard. Stamps a `<template>` child once per page |
| `ui-carousel-indicator` | One page. Always `delegate`, wrapping a `<button>` |
| `ui-carousel-progress-text` | Writes `page / pages` as its text |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**The item group is a grid before upgrade.** Zag's props put `display: grid`, `grid-auto-flow`, `grid-auto-columns: var(--slide-item-size)`, `gap: var(--slide-spacing)`, `scroll-snap-type` and `overflow` on it on the first render, and `ui.css` carries the same declarations as a default, so the slides are a row from the first paint. The root's `--slides-per-page` and `--slide-spacing` default to `1` and `0px` in the stylesheet; write them inline on `ui-carousel` when yours differ, or the row is one slide wide until the bundle runs.

### Counting and numbering

Zag needs to know how many slides there are and which index each one carries. Neither is repeated by the consumer:

- **The count** is the number of `ui-carousel-item` elements registered with the root that do not carry `hidden`. An item added or removed later is counted on the frame it connects or leaves.
- **The index** is an item's place among those, in document order. Insert an item in the middle and the ones after it are renumbered on the next render.
- **`slide-count`** on the root and **`index`** on an item take over. Write both or neither: an item with `index` is left out of the automatic numbering, so mixing the two on one carousel is undefined.

An indicator is numbered the same way among the non-hidden indicators of its own group, so a second group on the same carousel starts at zero again.

**An item added after start restarts the machine.** Zag binds its intersection and resize observers to the items it finds when it starts, and would never see a later one. The root rebuilds its machine on the next frame, once for any number of changes in that frame, and carries the page over. Toggling `hidden` does not restart anything, because the element was there at start.

### Attributes on `ui-carousel`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `slides-per-page` | number, tiered | `1` | How many slides fit one page. Fractions are allowed |
| `slides-per-move` | number \| `auto`, tiered | `auto` | How many slides one page turn moves. `auto` moves a whole page |
| `spacing` | CSS length, tiered | `0px` | The gap between slides |
| `padding` | CSS length, tiered | none | Scroll padding, so a neighbour shows at the edge |
| `loop` | boolean | `false` | Wraps at both ends |
| `allow-mouse-drag` | boolean | `false` | Drag with the mouse. Touch always drags |
| `auto-size` | boolean | `false` | Slides keep their own width |
| `autoplay` | boolean | `false` | Rotates on a timer, and implies `loop` |
| `autoplay-delay` | number | `4000` | Milliseconds between pages, when `autoplay` is set |
| `default-page` | number | `0` | The page shown first. Read once, at machine start |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Scroll axis |
| `snap-type` | `mandatory` \| `proximity` | `mandatory` | CSS scroll snap strictness |
| `in-view-threshold` | number | `0.6` | How much of a slide must show to count as in view |
| `slide-count` | number | derived | Overrides the derived count |
| `translations-*` | string | Zag's English | See below |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | generated | Kept, and used as Zag's root id |

Every attribute is observed. Changing `slides-per-page`, `slides-per-move` or `spacing` re-measures the snap points in place and re-stamps the indicators; changing `autoplay` starts or stops the rotation.

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`.

A tiered attribute is `base width:value width:value…`, whitespace separated, widths in CSS pixels, mobile first. `slides-per-page="3"` is a one-tier value. See [Breakpoints](#breakpoints).

### Translations

Zag's labels are functions of the index for three of them. The attributes carry `{name}` placeholders and nothing else is substituted. Indices are one based, because these strings are read to people.

| Attribute | Placeholders | Zag's default |
|-----------|--------------|---------------|
| `translations-item` | `{index}`, `{count}` | `{index} of {count}` |
| `translations-indicator` | `{index}` | `Go to slide {index}` |
| `translations-progress-text` | `{page}`, `{totalPages}` | `{page} / {totalPages}` |
| `translations-next-trigger` | none | `Next slide` |
| `translations-prev-trigger` | none | `Previous slide` |
| `translations-autoplay-start` | none | `Start slide rotation` |
| `translations-autoplay-stop` | none | `Stop slide rotation` |

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-carousel-item` | `index` | Overrides the DOM-order index |
| `ui-carousel-item` | `hidden` | Not a slide while present |
| `ui-carousel-indicator` | `index` | Overrides the DOM-order index within its group |
| `ui-carousel-indicator` | `read-only` | Shows the page but does not move to it on click |
| `ui-carousel-indicator` | `hidden` | Not an indicator while present |

### What the root adds to Zag

Three things the root writes that are not in Zag's props, next to the three custom properties that are:

| On `ui-carousel` | Value |
|------------------|-------|
| `--page` | The current page, zero based |
| `--page-count` | The number of pages |
| `data-autoplay-state` | `playing` or `paused` |

The two custom properties exist for progress styling, which CSS cannot compute from the page alone. The data attribute exists so that anything in the carousel, not only the autoplay trigger, can style itself by the rotation state. They are the only extensions of Zag's output in the package.

### Stamped indicators

An indicator group with a `<template>` child clones its first element once per page, sets `index` on each clone, and keeps the clones after the template, in page order. When the page count changes the extras are removed or the missing ones added. If the group has an `id`, each clone's button is named `{id}-{index}`.

A group without a template stamps nothing and numbers its authored indicators in DOM order. That is how a thumbnail strip becomes the carousel's pagination.

### Naming the parts

Write an `id` on the root, the item group, an item, a trigger, an indicator group or an indicator and the component keeps it. An item or an indicator is named by index, so each one carries its own id.

```html
<ui-carousel id="gallery">
  <ui-carousel-item-group id="gallery-slides">
    <ui-carousel-item id="gallery-slide-1">…</ui-carousel-item>
  </ui-carousel-item-group>
  <ui-carousel-indicator-group id="gallery-dots"><template>…</template></ui-carousel-indicator-group>
</ui-carousel>
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps an element alive across a re-render, and a carousel whose items are replaced rather than patched restarts its machine on every edit.

Two indicator groups on one carousel keep their own ids, and their clones are named after each group. Only the last registered group is the one Zag's arrow-key focus management finds by id; the other's arrows still page, and its focus stays where it is.

### `el.api`

Available on `ui-carousel` only. Parts reach it with `el.closest("ui-carousel").api`.

```js
const carousel = document.querySelector("ui-carousel");

carousel.api.page;                 // zero based
carousel.api.pageSnapPoints;       // one scroll offset per page
carousel.api.scrollTo(2);          // to a page; pass true for instant
carousel.api.scrollToIndex(5);     // to the page holding a slide
carousel.api.scrollNext();
carousel.api.scrollPrev();
carousel.api.play();
carousel.api.pause();
carousel.api.isPlaying;
carousel.api.isInView(3);
carousel.api.getProgressText();
carousel.api.refresh();            // re-measure the snap points
```

`refresh()` is what to call after you change the slides' size or visibility in a way the element cannot see, such as a class that hides one.

### Events

All bubble, and carry Zag's details object.

| Event | Detail |
|-------|--------|
| `ui-carousel:page-change` | `{ page, pageSnapPoint }` |
| `ui-carousel:drag-status-change` | `{ type, page, isDragging }` |
| `ui-carousel:autoplay-status-change` | `{ type, page, isPlaying }` |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-carousel` | `root` | `role="region"`, `aria-roledescription="carousel"`, `dir`, `data-orientation`, `data-autoplay-state`, `--slides-per-page`, `--slide-spacing`, `--slide-item-size`, `--page`, `--page-count`, `id` |
| `ui-carousel-item-group` | `item-group` | `aria-live`, `data-dragging`, `tabindex`, the grid and overflow style, `id` |
| `ui-carousel-item` | `item` | `role="group"`, `aria-roledescription="slide"`, `aria-label`, `aria-hidden`, `data-index`, `data-inview`, `scroll-snap-align`, `id` |
| the prev and next `<button>` | `prev-trigger`, `next-trigger` | `type="button"`, `disabled`, `aria-label`, `aria-controls`, `id` |
| the autoplay `<button>` | `autoplay-trigger` | `type="button"`, `data-pressed`, `aria-label` |
| `ui-carousel-indicator-group` | `indicator-group` | `data-orientation`, `id` |
| the indicator's `<button>` | `indicator` | `type="button"`, `data-index`, `data-current`, `data-readonly`, `aria-label`, `id` |
| `ui-carousel-progress-text` | `progress-text` | the text |

### Keyboard

| Key | Where | Action |
|-----|-------|--------|
| `ArrowRight` / `ArrowLeft` | the item group, when focused, or an indicator | Next and previous page, when horizontal |
| `ArrowDown` / `ArrowUp` | the same | Next and previous page, when vertical |
| `Home` / `End` | the same | First and last page |

Arrow direction follows `dir`. The item group is focusable only when nothing inside it is.

### Before the elements upgrade

Nothing is hidden and no stylesheet rule waits for the bundle. `ui.css` lays the item group out as the same grid Zag writes, so the slides are a row before and after upgrade; write `--slides-per-page` and `--slide-spacing` inline on the root when they are not `1` and `0px`. Indicators stamped from a template do not exist until the first render, so render a static set server side if a flash matters, and give the group no template in that case.
