# Popover

A panel anchored to a trigger, positioned with floating-ui, dismissed by Escape or a click outside.

## Features

- ✅ Positioned by floating-ui, with flipping, sliding and viewport fitting
- ✅ Closes on Escape and on a click outside, and each can be turned off
- ✅ Exit animations work, because the panel stays mounted until yours finishes
- ✅ A closed panel is really hidden, so its links leave the tab order
- ✅ Optional modal mode, with focus containment and a scroll lock
- ✅ Several triggers can share one panel
- ✅ An optional arrow, sized and coloured by you
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/popover";
```

## Examples

### Basic

<ComponentExample>

<ui-popover positioning-placement="bottom-start" positioning-gutter="8">
  <ui-popover-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Delivery</button>
  </ui-popover-trigger>
  <ui-popover-positioner>
    <ui-popover-content class="w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <ui-popover-title class="font-medium">Delivery</ui-popover-title>
      <ui-popover-description class="mt-1 text-sm text-gray-600 dark:text-zinc-400">
        Ships in two working days. Free over 50.
      </ui-popover-description>
    </ui-popover-content>
  </ui-popover-positioner>
</ui-popover>

</ComponentExample>

::: tip Try it
Open it, then press Tab. Focus moves into the panel, because the panel is a DOM sibling of the trigger and nothing was moved anywhere.
:::

### With a close button and an arrow

The arrow has to be inside the positioner, and its size and colour come from `--arrow-size` and `--arrow-background`.

<ComponentExample>

<ui-popover positioning-placement="top" positioning-gutter="10">
  <ui-popover-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Size guide</button>
  </ui-popover-trigger>
  <ui-popover-positioner style="--arrow-size: 10px; --arrow-background: white">
    <ui-popover-content class="w-60 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <ui-popover-arrow>
        <ui-popover-arrow-tip class="border-l border-t border-gray-200 dark:border-zinc-800"></ui-popover-arrow-tip>
      </ui-popover-arrow>
      <div class="flex items-start justify-between gap-4">
        <ui-popover-title class="font-medium">Size guide</ui-popover-title>
        <ui-popover-close-trigger delegate>
          <button class="cursor-pointer rounded border-0 bg-transparent px-1 text-gray-500">✕</button>
        </ui-popover-close-trigger>
      </div>
      <p class="mt-1 text-sm text-gray-600 dark:text-zinc-400">Measure across the chest, under the arms.</p>
    </ui-popover-content>
  </ui-popover-positioner>
</ui-popover>

</ComponentExample>

### Animated

Give the content a `@keyframes` animation for each state. Presence is already on, so the exit animation has time to run.

Use an **animation**, never a transition. `@zag-js/presence` keys on `animation-name`, and a transition leaves it at `none`, so the panel snaps shut. See [Styling](/guide/styling#animating-open-and-close).

<ComponentExample>

<ui-popover positioning-placement="bottom" positioning-gutter="8">
  <ui-popover-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Fades</button>
  </ui-popover-trigger>
  <ui-popover-positioner>
    <ui-popover-content class="ui-doc-fade w-56 origin-[var(--transform-origin)] rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      Closing runs the exit animation before the panel is hidden.
    </ui-popover-content>
  </ui-popover-positioner>
</ui-popover>

</ComponentExample>

```css
ui-popover-content[data-state="open"] { animation: fade-in 150ms ease-out }
ui-popover-content[data-state="closed"] { animation: fade-out 100ms ease-in }

@keyframes fade-in { from { opacity: 0; transform: scale(0.96) } to { opacity: 1; transform: scale(1) } }
@keyframes fade-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.96) } }
```

`--transform-origin` is written by floating-ui and points at the trigger, so a scale animation grows out of the button rather than out of the panel's own centre.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-popover` | Owns the machine, `el.api` and the events. Renders no Zag part of its own |
| `ui-popover-anchor` | Optional. What to position against, when it should not be the trigger |
| `ui-popover-trigger` | Opens and closes. Always `delegate`, wrapping a real `<button>` |
| `ui-popover-indicator` | Optional. A styling hook carrying `data-state` |
| `ui-popover-positioner` | **Required.** The element floating-ui positions |
| `ui-popover-content` | The panel. `role="dialog"` |
| `ui-popover-title` | Names the panel through `aria-labelledby` |
| `ui-popover-description` | Describes it through `aria-describedby` |
| `ui-popover-close-trigger` | Optional. Always `delegate`, wrapping a real `<button>` |
| `ui-popover-arrow` | Optional. Must be inside the positioner |
| `ui-popover-arrow-tip` | The visible shape inside the arrow |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**`ui-popover` is not an anatomy part.** Popover's anatomy has no root, so this element carries only `data-scope="popover"` and no `data-part`. It is still a real box, and it is what the trigger and the positioner sit in.

**`ui-popover-positioner` is required, and it is not the content.** floating-ui positions the positioner and the content is styled inside it. They carry different ids and cannot be the same element.

**The positioner's inline style is partly floating-ui's.** Zag's props give it `position`, `top`, `left` and a `transform` that reads `var(--x)` and `var(--y)`, and `@zag-js/popper` writes those coordinates in after it measures. Do not write `transform`, `top` or `left` on it, and see [Surviving a DOM differ](#surviving-a-dom-differ).

### Attributes on `ui-popover`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-open` | boolean | `false` | Open on first render. Read once, at machine start |
| `modal` | boolean | `false` | Contains focus, locks body scroll, hides the rest of the page from assistive technology |
| `auto-focus` | boolean | `true` | Focus the first focusable thing in the panel on open |
| `restore-focus` | boolean | `true` | Return focus to the trigger on close |
| `close-on-interact-outside` | boolean | `true` | Close when something outside is clicked |
| `close-on-escape` | boolean | `true` | Close on Escape |
| `default-trigger-value` | string | none | Which trigger is current, when there is more than one |
| `translations-close-trigger-label` | string | `close` | Accessible name for the close button |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | none | Yours. Zag writes no id to this element |

An `id` written on a **part** is kept too, rather than replaced by a generated one. See [Naming the parts](#naming-the-parts).

### Positioning

Zag's `positioning` prop is an object, so it flattens one attribute per key. See [Usage](/guide/usage#nested-options-take-a-prefix).

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `positioning-placement` | `Placement` | `bottom` | Any floating-ui placement, such as `top-start` or `bottom-end` |
| `positioning-strategy` | `absolute` \| `fixed` | `absolute` | Use `fixed` when an ancestor clips or transforms |
| `positioning-gutter` | number | `8` | Gap between the trigger and the panel |
| `positioning-shift` | number | none | Offset along the other axis |
| `positioning-overflow-padding` | number | `8` | Keep this far from the viewport edge |
| `positioning-arrow-padding` | number | `4` | Keep the arrow this far from the panel's corner |
| `positioning-flip` | boolean \| list | `true` | Flip to the opposite side when it does not fit. A comma list gives explicit fallbacks, such as `top,right` |
| `positioning-slide` | boolean | `true` | Slide along the side when it does not fit |
| `positioning-overlap` | boolean | `false` | Allow the panel to overlap the trigger |
| `positioning-same-width` | boolean | `false` | Match the trigger's width |
| `positioning-fit-viewport` | boolean | `false` | Cap the size to the space available |
| `positioning-hide-when-detached` | boolean | `false` | Hide when the trigger scrolls out of view |

Every attribute is observed. Changing one updates the machine in place, so an open popover stays open and simply repositions.

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`. That last form is the only way to turn off the six options above whose default is `true`, such as `close-on-escape="false"`.

There is deliberately no `value` attribute for controlled open state. Use `el.api.setOpen()`.

The remaining positioning options are function-valued (`getAnchorElement`, `onComplete`, `onPositioned`, `updatePosition`, and `boundary` in its element form) and no attribute can express them. `getAnchorElement` has a markup answer in `ui-popover-anchor`. `boundary` has no attribute because its only string form, `clipping-ancestors`, is already what floating-ui does when the option is absent.

There is no `portalled` attribute, and the prop is always `false`. Zag never moves any DOM itself; the prop only tells the machine whether your framework did, and its sole effect is a tab focus proxy that repairs an order the DOM no longer provides. Nothing here moves, so the proxy would be wrong. When an ancestor's `overflow` becomes the problem, reach for the top layer rather than a portal: `popover="manual"` on the positioner plus `positioning-strategy="fixed"` escapes every clip and stacking context while leaving the element exactly where it is.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-popover-trigger` | `value` | Optional. Only needed when several triggers share one panel |
| `ui-popover-content` | `presence` | `presence="false"` hides the panel immediately instead of waiting for an exit animation |

### Several triggers, one panel

Give each trigger a `value` and name the starting one with `default-trigger-value`. The current trigger gets `data-current`, and clicking a different one switches the panel across without closing it.

```html
<ui-popover default-trigger-value="s">
  <ui-popover-trigger delegate value="s"><button>Small</button></ui-popover-trigger>
  <ui-popover-trigger delegate value="m"><button>Medium</button></ui-popover-trigger>
  <ui-popover-positioner>
    <ui-popover-content>…</ui-popover-content>
  </ui-popover-positioner>
</ui-popover>
```

### Naming the panel

Put a `ui-popover-title` and a `ui-popover-description` in the panel and Zag points `aria-labelledby` and `aria-describedby` at them.

Both have to be in the **initial markup**. Zag checks for them one frame after the machine starts and does not look again, so a title added later is never referenced.

### Naming the parts

Write an `id` on any part except the trigger and the indicator and the component keeps it, telling Zag to generate that name instead of its own:

```html
<ui-popover-positioner id="filters-popper">
  <ui-popover-content id="filters-panel">
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. morphdom treats a keyed live node against an **unkeyed** incoming one as incompatible and replaces the element outright rather than patching it, taking its listeners and floating-ui's measured coordinates with it. Server rendering the same id on both sides is what keeps the element alive across a re-render.

Ids are read once, when the machine is built at the end of the first frame. A part appended later takes a generated name.

### Surviving a DOM differ

A differ that patches an element in place removes every attribute the incoming HTML did not carry. Most of what this component writes comes straight back, because props are compared against the live DOM rather than a cache.

The exception is the positioner's coordinates. `--x`, `--y`, `--z-index` and `--transform-origin` are written by floating-ui, not by this component, so nothing here restores them and the panel jumps to its containing block's origin.

The repair is one call, and it belongs wherever you handle the re-render:

```js
document.querySelector("ui-popover").api.reposition();
```

### `el.api`

The live Zag api, undefined before upgrade.

```js
const el = document.querySelector("ui-popover");

el.api.open;                  // boolean
el.api.setOpen(true);
el.api.reposition();
el.api.setTriggerValue("m");
```

### Events

| Event | Detail |
|-------|--------|
| `ui-popover:open-change` | `{ open }` |
| `ui-popover:trigger-value-change` | `{ value, triggerElement }` |

Both bubble.

### Data attributes

| Element | Attributes |
|---------|------------|
| `ui-popover-trigger` | `data-state`, `data-placement`, `data-side`, `data-current`, `data-value`, `data-ownedby` |
| `ui-popover-content` | `data-state`, `data-expanded`, `data-placement`, `data-side` |
| `ui-popover-indicator` | `data-state` |

`data-state` is always `open` or `closed`. `data-side` is the resolved side after flipping, so it is the one to style an arrow or a slide direction against, not the placement you asked for.
