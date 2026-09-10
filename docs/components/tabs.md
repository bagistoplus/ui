# Tabs

A set of panels, one visible at a time, selected by a row of tabs.

## Features

- ✅ Full keyboard navigation, including Home and End
- ✅ Automatic or manual activation
- ✅ Horizontal or vertical
- ✅ Hidden panels are really hidden, so their links leave the tab order
- ✅ An optional indicator that measures and follows the selected tab
- ✅ Nests without special handling
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/tabs";
```

## Examples

### Basic

Click a tab, or focus one and use the arrow keys.

<ComponentExample>

<ui-tabs default-value="shipping" class="w-full">
  <ui-tabs-list class="flex gap-1 border-b border-gray-200 dark:border-zinc-800">
    <ui-tabs-trigger delegate value="shipping">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium data-[selected]:text-blue-600">Shipping</button>
    </ui-tabs-trigger>
    <ui-tabs-trigger delegate value="returns">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium data-[selected]:text-blue-600">Returns</button>
    </ui-tabs-trigger>
    <ui-tabs-trigger delegate value="care">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium data-[selected]:text-blue-600">Care</button>
    </ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="shipping" class="p-4 text-gray-600 dark:text-zinc-400">Ships in two working days.</ui-tabs-content>
  <ui-tabs-content value="returns" class="p-4 text-gray-600 dark:text-zinc-400">Thirty days, unworn.</ui-tabs-content>
  <ui-tabs-content value="care" class="p-4 text-gray-600 dark:text-zinc-400">Cold wash, dry flat.</ui-tabs-content>
</ui-tabs>

</ComponentExample>

::: tip Try it
Tab into the row, then press the arrow keys. Only the selected tab is in the tab order, so one Tab press takes you past the whole row and into the panel.
:::

### With an indicator

`ui-tabs-indicator` is one element for the whole component, not one per tab. Zag measures the selected tab and writes the rect out as custom properties. Everything visible about it is yours: give it a size, a colour, and a `position: relative` ancestor to measure against.

<ComponentExample>

<ui-tabs default-value="all" class="w-full">
  <ui-tabs-list class="relative flex gap-1 border-b border-gray-200 dark:border-zinc-800">
    <ui-tabs-trigger delegate value="all">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium">All</button>
    </ui-tabs-trigger>
    <ui-tabs-trigger delegate value="in-stock">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium">In stock</button>
    </ui-tabs-trigger>
    <ui-tabs-trigger delegate value="on-sale">
      <button class="cursor-pointer border-0 bg-transparent px-4 py-2 text-sm font-medium">On sale</button>
    </ui-tabs-trigger>
    <ui-tabs-indicator class="bottom-0 h-0.5 w-[var(--width)] bg-blue-600"></ui-tabs-indicator>
  </ui-tabs-list>
  <ui-tabs-content value="all" class="p-4 text-gray-600 dark:text-zinc-400">Everything.</ui-tabs-content>
  <ui-tabs-content value="in-stock" class="p-4 text-gray-600 dark:text-zinc-400">Ready to ship.</ui-tabs-content>
  <ui-tabs-content value="on-sale" class="p-4 text-gray-600 dark:text-zinc-400">Reduced this week.</ui-tabs-content>
</ui-tabs>

</ComponentExample>

### Manual activation

By default the arrow keys select as they move. With `activation-mode="manual"` they only move focus, and Enter or Space selects. Use it when showing a panel is expensive.

```html
<ui-tabs default-value="a" activation-mode="manual">
  …
</ui-tabs>
```

### Vertical

`orientation="vertical"` swaps the arrow key axis to Up and Down, and sets `aria-orientation` on the list.

```html
<ui-tabs default-value="a" orientation="vertical">
  …
</ui-tabs>
```

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-tabs` | Owns the machine, `el.api` and the events |
| `ui-tabs-list` | `role="tablist"`. Holds the triggers and owns the keyboard |
| `ui-tabs-trigger` | One tab, identified by `value`. Always `delegate`, wrapping a real `<button>` |
| `ui-tabs-content` | One panel, identified by `value`. `role="tabpanel"` |
| `ui-tabs-indicator` | Optional, one per component. Carries the measured rect |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**A trigger and its panel are not related by nesting.** Triggers live in the list, panels are siblings of it, and the pair is matched by `value`. Unlike the accordion there is no element grouping them.

**`ui-tabs-list` is not optional.** Zag puts the arrow, Home and End handling on the list and guards it with a `contains` check, so a trigger outside the list never responds to the keyboard.

### Attributes on `ui-tabs`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-value` | string | none | The tab selected on first render. Read once, at machine start |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Arrow key axis. Anything but the exact string `vertical` reads as `horizontal` |
| `activation-mode` | `automatic` \| `manual` | `automatic` | Whether arrow keys select, or only move focus |
| `deselectable` | boolean | absent | Clicking the selected tab clears the selection |
| `list-label` | string | none | Accessible name for the tablist. See below |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | generated | Kept, and used as Zag's root id |

Every attribute is observed. Changing one updates the machine in place, so the selection survives.

There is deliberately no `value` attribute for controlled state. Use `el.api.setValue()`.

`loop-focus` and `composite` are not exposed. Both default to `true` in Zag, and a presence attribute cannot express "true unless absent" without a second boolean convention. Ask if you need them.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-tabs-trigger` | `value` | Required. Matches a panel |
| `ui-tabs-trigger` | `disabled` | Not selectable, and skipped by the arrow keys |
| `ui-tabs-content` | `value` | Required. Matches a trigger |

A trigger or panel with no `value` renders nothing at all, rather than rendering something broken.

### Naming the tablist

Write `list-label` on the root, **not `aria-label` on the list**. Zag returns `aria-label` from its list props whether or not a label exists, so an `aria-label` you write is removed on the first render.

`aria-labelledby` is untouched and is the better answer when a heading already names the tabs.

```html
<h2 id="details">Product details</h2>
<ui-tabs default-value="a">
  <ui-tabs-list aria-labelledby="details">…</ui-tabs-list>
</ui-tabs>
```

### `el.api`

Available on `ui-tabs` only. Parts reach it with `el.closest("ui-tabs").api`.

```js
const tabs = document.querySelector("ui-tabs");

tabs.api.value;              // the selected value, or null
tabs.api.setValue("returns");
tabs.api.clearValue();       // needs `deselectable`
tabs.api.selectNext();
tabs.api.selectPrev();
tabs.api.focus();            // focus the selected trigger
```

### Events

Both bubble, and carry Zag's details object.

| Event | Detail |
|-------|--------|
| `ui-tabs:value-change` | `{ value }` |
| `ui-tabs:focus-change` | `{ focusedValue }` |

### What lands on which element

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-tabs` | `root` | `dir`, `id` |
| `ui-tabs-list` | `list` | `role="tablist"`, `aria-orientation`, `data-orientation`, `data-focus`, `id` |
| the trigger's `<button>` | `trigger` | `role="tab"`, `type="button"`, `aria-selected`, `aria-controls`, `data-selected`, `data-value`, `data-ownedby`, `tabindex`, `id` |
| `ui-tabs-content` | `content` | `role="tabpanel"`, `aria-labelledby`, **`hidden`**, `data-selected`, `data-ownedby`, `tabindex`, `id` |
| `ui-tabs-indicator` | `indicator` | `position: absolute`, `--left`, `--top`, `--width`, `--height`, `hidden` until measured |

`data-ownedby` is the list's id, and is how nested tabs stay separate. Only the selected trigger has `tabindex="0"`, so one Tab press moves past the whole row.

### Keyboard

| Key | Action |
|-----|--------|
| `Tab` | Into the row, onto the selected tab only |
| `ArrowRight` / `ArrowLeft` | Previous and next, when horizontal. Wraps |
| `ArrowDown` / `ArrowUp` | Previous and next, when vertical. Wraps |
| `Home` / `End` | First and last |
| `Enter` / `Space` | Selects, under `activation-mode="manual"` |

Arrow direction follows `dir`, and disabled triggers are skipped.

### Before the elements upgrade

**Write `hidden` on every unselected panel, and `data-selected` on the selected trigger, server side.**

There is no stylesheet rule doing this for you, unlike the accordion, where every panel starts closed and `ui.css` can hide them all. One tab panel is always meant to be showing, so hiding them all would blank the component until the bundle loads.

It is also the better failure mode. If the script never runs, the selected panel stays readable and only switching is lost.

```html
<ui-tabs default-value="a">
  <ui-tabs-list>
    <ui-tabs-trigger delegate value="a"><button data-selected>A</button></ui-tabs-trigger>
    <ui-tabs-trigger delegate value="b"><button>B</button></ui-tabs-trigger>
  </ui-tabs-list>
  <ui-tabs-content value="a">Shown before upgrade, and after.</ui-tabs-content>
  <ui-tabs-content value="b" hidden>Hidden until selected.</ui-tabs-content>
</ui-tabs>
```

Zag takes both attributes over on the first render. `applyProps` compares against the live DOM, so a value it agrees with produces no write at all.

### No panel animation

There is no `presence` attribute on tabs.

An accordion panel collapses in place, so its animation *is* the layout change. Selecting a tab deselects another in the same render, so holding the outgoing panel mounted through an exit animation puts two full-height panels in the document at once, and everything below jumps. That only works if you stack the panels yourself, and this package does not ship layout.
