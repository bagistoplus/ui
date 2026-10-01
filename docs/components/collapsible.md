# Collapsible

One panel that a button shows and hides. The building block under a "Read more", a filter group in a sidebar, or a single question and answer. For several panels that know about each other, use the [Accordion](/components/accordion).

## Features

- ✅ A real `<button>` trigger with `aria-expanded` and `aria-controls`
- ✅ A closed panel is `hidden`, out of the tab order and the accessibility tree
- ✅ `collapsed-height` for a "Read more" that stays partly visible when closed
- ✅ The panel's measured size as `--height` and `--width`, for a height animation
- ✅ Waits for the closing animation before it hides the panel, no extra attribute needed
- ✅ `default-open` to start, `open` to control
- ✅ Nests
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/collapsible";
```

`ui.css` makes the root and an open panel blocks, the indicator an inline flex box, and hides a closed panel until the element upgrades. Load it before your own stylesheet, as the [styling guide](/guide/styling) says.

## Examples

### Basic

<ComponentExample>

<ui-collapsible class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-collapsible-trigger delegate>
    <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
      <span>Shipping</span>
      <ui-collapsible-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-collapsible-indicator>
    </button>
  </ui-collapsible-trigger>
  <ui-collapsible-content>
    <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Ships in two working days. <a href="#shipping" class="underline underline-offset-2">Read the policy</a>.</div>
  </ui-collapsible-content>
</ui-collapsible>

</ComponentExample>

```html
<ui-collapsible>
  <ui-collapsible-trigger delegate>
    <button>
      Shipping
      <ui-collapsible-indicator aria-hidden="true">▾</ui-collapsible-indicator>
    </button>
  </ui-collapsible-trigger>
  <ui-collapsible-content>
    Ships in two working days. <a href="/shipping">Read the policy</a>.
  </ui-collapsible-content>
</ui-collapsible>
```

The trigger is always `delegate` with a `<button>` child. Zag gives it no `tabindex` and no key handling, so anything else is unreachable from the keyboard, and the element warns once in the console.

::: tip Try it
Tab through the example while it is closed. The link inside is skipped, because the panel really is `hidden`.
:::

### Open by default

<ComponentExample>

<ui-collapsible default-open class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-collapsible-trigger delegate>
    <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
      <span>Materials</span>
      <ui-collapsible-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-collapsible-indicator>
    </button>
  </ui-collapsible-trigger>
  <ui-collapsible-content>
    <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Organic cotton, recycled polyester lining.</div>
  </ui-collapsible-content>
</ui-collapsible>

</ComponentExample>

```html
<ui-collapsible default-open>…</ui-collapsible>
```

`default-open` also exempts the panel from the pre-upgrade guard in `ui.css`, so it paints open before the bundle runs.

### Animated

Give the panel a CSS **animation** that reads `--height`. Zag measures the panel into that property on every open and close, waits for `animationend` while closing, and only then writes `hidden`.

<ComponentExample>

<ui-collapsible class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-collapsible-trigger delegate>
    <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
      <span>Care</span>
      <ui-collapsible-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-collapsible-indicator>
    </button>
  </ui-collapsible-trigger>
  <ui-collapsible-content class="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
    <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Wash cold, inside out. Dry flat. The panel eases to zero, then hides.</div>
  </ui-collapsible-content>
</ui-collapsible>

</ComponentExample>

```css
ui-collapsible-content {
  overflow: hidden;
}

ui-collapsible-content[data-state="open"] {
  animation: collapsible-down 220ms ease-out;
}

ui-collapsible-content[data-state="closed"] {
  animation: collapsible-up 220ms ease-out;
}

@keyframes collapsible-down {
  from { height: var(--collapsed-height, 0); }
  to { height: var(--height); }
}

@keyframes collapsible-up {
  from { height: var(--height); }
  to { height: var(--collapsed-height, 0); }
}

@media (prefers-reduced-motion: reduce) {
  ui-collapsible-content[data-state] {
    animation: none;
  }
}
```

`var(--collapsed-height, 0)` makes the same two keyframes work for a plain panel and for a [Read more](#read-more).

`ui.css` ships no animation. It is yours to write, or to leave out.

::: warning A transition will not animate the close
Zag looks for an animation, by `animationName`, and waits for `animationend`. It does not see a `transition`, so a panel styled with one is hidden on the next frame and never animates closed. Use `@keyframes`.
:::

A panel that starts open with `default-open` does not animate on the first paint: Zag leaves `data-state` off the content until the first toggle.

### Read more

`collapsed-height` keeps a closed panel partly visible instead of hiding it. Zag clips it with an inline `overflow: hidden` and `max-height`, and marks every link and control inside it `inert`, so the half-visible text cannot be tabbed into.

<ComponentExample>

<ui-collapsible collapsed-height="72" class="group w-full">
  <ui-collapsible-content class="overflow-hidden text-gray-600 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up dark:text-zinc-400" style="overflow:hidden;max-height:72px">
    <p class="m-0">Cut from a heavyweight organic cotton jersey, this tee holds its shape wash after wash. The relaxed fit sits just below the hip, with dropped shoulders and a ribbed crew neck that will not stretch out. Garment dyed for a soft, lived-in hand and a colour that fades evenly over time. <a href="#size-guide" class="underline underline-offset-2">See the size guide</a>.</p>
  </ui-collapsible-content>
  <ui-collapsible-trigger delegate>
    <button class="mt-2 cursor-pointer border-0 bg-transparent p-0 font-medium underline underline-offset-2">
      <span class="group-data-[state=open]:hidden">Read more</span>
      <span class="hidden group-data-[state=open]:inline">Read less</span>
    </button>
  </ui-collapsible-trigger>
</ui-collapsible>

</ComponentExample>

```html
<ui-collapsible collapsed-height="72">
  <ui-collapsible-content style="overflow:hidden;max-height:72px">
    <p>Cut from a heavyweight organic cotton jersey…</p>
  </ui-collapsible-content>
  <ui-collapsible-trigger delegate>
    <button>Read more</button>
  </ui-collapsible-trigger>
</ui-collapsible>
```

A bare number is pixels. Anything else is passed to CSS as written: `collapsed-height="4.5rem"`. `collapsed-width` does the same horizontally.

The inline `style` on the content is for the first paint. CSS cannot read a length out of an attribute, so `ui.css` has nothing to clip the panel with before the bundle runs, and without that style the whole text would show and then snap shut. Zag writes the same two properties on upgrade and removes them on open.

::: warning Write exactly overflow and max-height
The component removes on open only what Zag wrote. A `height` or an `overflow-y` rendered by the server is not Zag's, so it stays, and the panel never opens past it.
:::

### Controlled

With `open` written, the state is yours. The element fires `ui-collapsible:open-change` for every click and renders the attribute until you change it.

```html
<ui-collapsible id="filters" open="false">…</ui-collapsible>

<script>
  const filters = document.getElementById("filters");

  filters.addEventListener("ui-collapsible:open-change", (event) => {
    filters.setAttribute("open", event.detail.open);
  });
</script>
```

Write `open="false"` to hold it closed. A bare `open` holds it open. Removing the attribute closes the panel and hands the state back to the machine, so the next click toggles it without you.

### Nested

A part belongs to the nearest `ui-collapsible` above it, so one collapsible can sit inside another's panel and each keeps its own state.

```html
<ui-collapsible>
  <ui-collapsible-trigger delegate><button>Category</button></ui-collapsible-trigger>
  <ui-collapsible-content>
    <ui-collapsible>
      <ui-collapsible-trigger delegate><button>Subcategory</button></ui-collapsible-trigger>
      <ui-collapsible-content>…</ui-collapsible-content>
    </ui-collapsible>
  </ui-collapsible-content>
</ui-collapsible>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-collapsible` | Owns the machine, `el.api` and the events |
| `ui-collapsible-trigger` | Toggles the panel. Always `delegate` with a `<button>` |
| `ui-collapsible-indicator` | A styling hook for the open state, such as a chevron. Optional |
| `ui-collapsible-content` | The panel. The one element Zag measures and watches |

Every element takes the machine's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

### Attributes on `ui-collapsible`

| attribute | type | meaning |
|-----------|------|---------|
| `default-open` | boolean | open on first render |
| `open` | boolean | the controlled state; the element renders it until you change it. See [Controlled](#controlled) |
| `disabled` | boolean | the trigger ignores clicks |
| `collapsed-height` | number \| CSS length | a closed panel is clipped to this height instead of hidden. A bare number is pixels |
| `collapsed-width` | number \| CSS length | the same, horizontally |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |

### `el.api`

Available on `ui-collapsible` only. Parts reach it with `el.closest("ui-collapsible").api`.

```js
const panel = document.querySelector("ui-collapsible");

panel.api.open;        // boolean, false from the moment it starts closing
panel.api.visible;     // boolean, true while open and while the close animates
panel.api.disabled;    // boolean
panel.api.setOpen(true);
panel.api.measureSize(); // re-reads --height and --width, after the content changed while open
```

::: warning
This is Zag's own api, published as ours rather than wrapped in a facade. A Zag major version is a major version here.
:::

### Events

Both bubble, so one listener on `document` catches every collapsible on the page.

| Event | Detail | Description |
|-------|--------|-------------|
| `ui-collapsible:open-change` | `{ open: boolean }` | A click or an api call asked to open or close |
| `ui-collapsible:exit-complete` | `null` | The close finished, after its animation if it has one |

### Custom properties

All on the content, written inline by Zag.

| property | value |
|----------|-------|
| `--height` | the panel's measured height, in pixels, updated on every open and close |
| `--width` | the panel's measured width, in pixels |
| `--collapsed-height` | `collapsed-height` as a length, when it is set |
| `--collapsed-width` | `collapsed-width` as a length, when it is set |

### What lands on which element

`data-scope` is always `collapsible`.

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-collapsible` | `root` | `id`, `dir`, `data-state` |
| the trigger's `<button>` | `trigger` | `id`, `type="button"`, `aria-controls`, `aria-expanded`, `data-state`, `data-disabled` |
| `ui-collapsible-indicator` | `indicator` | `dir`, `data-state`, `data-disabled` |
| `ui-collapsible-content` | `content` | `id`, **`hidden`** while closed, `data-state`, `data-disabled`, `data-has-collapsed-size`, the custom properties above. With a collapsed size and closed, no `hidden` but inline `overflow`, `min-height` and `max-height` |

`data-state` is `open` or `closed`, with one exception: on the content it is absent while the panel rests open, on first paint with `default-open` and again once the opening animation ends, so the animation does not replay. Style an open panel from the root, `ui-collapsible[data-state="open"]`, not from the content.

On the content `data-state` flips to `closed` the moment closing starts, which is what starts the closing animation, and `hidden` lands only after it ends. `aria-expanded` stays `true` until then.

### Naming the parts

Write an `id` on the root, on the trigger's `<button>` or on the content, and the component keeps it. Zag names the rest.

This matters for DOM differs, which key on `id`. Server rendering the same id on both sides is what keeps the element alive across a re-render.

## Accessibility

Follows the [WAI-ARIA Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

- The trigger is a real `<button>`, so Enter, Space, focus rings and `disabled` are the browser's
- `aria-expanded` on the trigger, `aria-controls` to the panel
- A closed panel carries `hidden`, so it leaves both the tab order and the accessibility tree
- A clipped "Read more" panel stays readable, as it is visible, but its links and controls are `inert` until it opens

## Known gaps

- **Find in page.** The browser cannot find text inside a closed panel, because it is `hidden`, not `hidden="until-found"`. The accordion has the same gap, and both will close it together. A [Read more](#read-more) panel is not hidden, so its text is found.
- **Transitions.** Only a CSS animation delays the close. See [Animated](#animated).
