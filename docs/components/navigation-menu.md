# Navigation Menu

A bar of triggers and links, each trigger opening a panel on hover, click or the keyboard, the way a site header's main navigation does.

## Features

- ✅ Hover with delays, click, and the keyboard, each switchable off
- ✅ Two shapes: a panel inside each item, or one shared viewport Zag positions and resizes
- ✅ A link can be the whole item, with the arrow keys reaching it
- ✅ Switch animations between panels in viewport mode
- ✅ Exit animations work, because a panel stays mounted until yours finishes
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/navigation-menu";
```

## Examples

### Nested

Each content sits inside its item. Zag positions nothing here: the panel is placed by your CSS, and `position: relative` on the item is what anchors it.

<ComponentExample>

<ui-navigation-menu open-delay="100" close-delay="200" translations-root-label="Example">
  <ui-navigation-menu-list>
    <ul class="flex list-none gap-2 p-0">
      <li>
        <ui-navigation-menu-item value="products" class="relative">
          <ui-navigation-menu-trigger delegate>
            <button class="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-3 py-1.5 text-sm font-medium data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800">Products <span class="text-xs">▾</span></button>
          </ui-navigation-menu-trigger>
          <ui-navigation-menu-content presence class="ui-doc-fade absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <ui-navigation-menu-link delegate><a href="#all" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">All products</a></ui-navigation-menu-link>
            <ui-navigation-menu-link delegate><a href="#new" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">New in</a></ui-navigation-menu-link>
            <ui-navigation-menu-link delegate><a href="#sale" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Sale</a></ui-navigation-menu-link>
          </ui-navigation-menu-content>
        </ui-navigation-menu-item>
      </li>
      <li>
        <ui-navigation-menu-item value="company" class="relative">
          <ui-navigation-menu-trigger delegate>
            <button class="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-3 py-1.5 text-sm font-medium data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800">Company <span class="text-xs">▾</span></button>
          </ui-navigation-menu-trigger>
          <ui-navigation-menu-content presence class="ui-doc-fade absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <ui-navigation-menu-link delegate><a href="#team" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Team</a></ui-navigation-menu-link>
            <ui-navigation-menu-link delegate><a href="#careers" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Careers</a></ui-navigation-menu-link>
          </ui-navigation-menu-content>
        </ui-navigation-menu-item>
      </li>
      <li>
        <ui-navigation-menu-item value="blog" delegate>
          <ui-navigation-menu-link delegate>
            <a href="#blog" class="inline-flex rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800">Blog</a>
          </ui-navigation-menu-link>
        </ui-navigation-menu-item>
      </li>
    </ul>
  </ui-navigation-menu-list>
</ui-navigation-menu>

</ComponentExample>

::: tip Try it
Focus "Products" and press ArrowRight twice: the arrows walk the bar, including the Blog link. Open a panel and press ArrowDown to move into it.
:::

### With a viewport

One shared surface under the bar. Zag writes `--viewport-x`, `--viewport-width` and `--viewport-height` on it, measured from the active trigger and the active content, so the surface slides and resizes between items. Every content is written inside the viewport, and `data-motion` on each says which way it is leaving or arriving.

<ComponentExample>

<ui-navigation-menu open-delay="100" close-delay="200" class="relative">
  <ui-navigation-menu-list>
    <ul class="flex list-none gap-2 p-0">
      <li>
        <ui-navigation-menu-item value="shop">
          <ui-navigation-menu-trigger delegate>
            <button class="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-3 py-1.5 text-sm font-medium data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800">Shop <span class="text-xs">▾</span></button>
          </ui-navigation-menu-trigger>
          <ui-navigation-menu-trigger-proxy></ui-navigation-menu-trigger-proxy>
          <ui-navigation-menu-viewport-proxy></ui-navigation-menu-viewport-proxy>
        </ui-navigation-menu-item>
      </li>
      <li>
        <ui-navigation-menu-item value="learn">
          <ui-navigation-menu-trigger delegate>
            <button class="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-transparent px-3 py-1.5 text-sm font-medium data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-zinc-800">Learn <span class="text-xs">▾</span></button>
          </ui-navigation-menu-trigger>
          <ui-navigation-menu-trigger-proxy></ui-navigation-menu-trigger-proxy>
          <ui-navigation-menu-viewport-proxy></ui-navigation-menu-viewport-proxy>
        </ui-navigation-menu-item>
      </li>
    </ul>
  </ui-navigation-menu-list>
  <ui-navigation-menu-viewport-positioner align="start" class="absolute left-0 top-full z-20 mt-1 translate-x-[var(--viewport-x)] transition-transform duration-200">
    <ui-navigation-menu-viewport align="start" class="ui-doc-fade relative h-[var(--viewport-height)] w-[var(--viewport-width)] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-lg transition-[width,height] duration-200 dark:border-zinc-800 dark:bg-zinc-900">
      <ui-navigation-menu-content value="shop" presence class="ui-doc-nav-motion absolute left-0 top-0 w-64 p-2">
        <ui-navigation-menu-link delegate><a href="#clothing" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Clothing</a></ui-navigation-menu-link>
        <ui-navigation-menu-link delegate><a href="#shoes" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Shoes</a></ui-navigation-menu-link>
        <ui-navigation-menu-link delegate><a href="#bags" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Bags</a></ui-navigation-menu-link>
      </ui-navigation-menu-content>
      <ui-navigation-menu-content value="learn" presence class="ui-doc-nav-motion absolute left-0 top-0 w-80 p-2">
        <ui-navigation-menu-link delegate><a href="#guides" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Guides</a></ui-navigation-menu-link>
        <ui-navigation-menu-link delegate><a href="#videos" class="block rounded px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800">Videos</a></ui-navigation-menu-link>
      </ui-navigation-menu-content>
    </ui-navigation-menu-viewport>
  </ui-navigation-menu-viewport-positioner>
</ui-navigation-menu>

</ComponentExample>

```css
ui-navigation-menu-content[data-motion="from-start"] { animation: enter-from-left 200ms ease }
ui-navigation-menu-content[data-motion="from-end"]   { animation: enter-from-right 200ms ease }
ui-navigation-menu-content[data-motion="to-start"]   { animation: exit-to-left 200ms ease }
ui-navigation-menu-content[data-motion="to-end"]     { animation: exit-to-right 200ms ease }
```

`data-motion` is only written in viewport mode. A nested panel has nothing to slide relative to, so its `data-motion` classes never fire.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-navigation-menu` | Owns the machine, `el.api` and the events. Zag's root part: carries `--trigger-*` and `--viewport-*` |
| `ui-navigation-menu-list` | **Required.** Holds the items. Zag gives it `position: relative`, the box a trigger is measured in |
| `ui-navigation-menu-item` | One value. Holds a trigger and, in nested mode, its content |
| `ui-navigation-menu-trigger` | Opens the item's panel. Always `delegate`, wrapping a real `<button>` |
| `ui-navigation-menu-link` | A link, in a panel or as the whole item. Always `delegate`, wrapping the `<a>` |
| `ui-navigation-menu-content` | The panel for one item |
| `ui-navigation-menu-viewport-positioner` | Viewport mode. The box you position; Zag writes nothing on it |
| `ui-navigation-menu-viewport` | Viewport mode. The one shared surface, sized and placed by Zag |
| `ui-navigation-menu-trigger-proxy` | Viewport mode. A hidden focus stop after the trigger that routes Tab into the content |
| `ui-navigation-menu-viewport-proxy` | Viewport mode. Points `aria-owns` at the item's content |
| `ui-navigation-menu-item-indicator` | Optional. A styling hook inside an item, carrying `data-state` |
| `ui-navigation-menu-indicator` | Optional. One element under the bar that follows the active trigger through `--trigger-*` |
| `ui-navigation-menu-arrow` | Optional. Inside the indicator |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**Which mode you are in is decided once.** Zag looks for the viewport when the machine starts. With one, every content is expected inside it and gets `data-motion`; without one, each content stays in its item and nothing is positioned. A viewport added later is not seen.

**A content or a link takes its `value` from where it sits.** Inside an item, neither needs one. Inside a viewport, a content names its item with `value`, and a link inside that content takes the content's.

### Attributes on `ui-navigation-menu`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-value` | string | none | The item open on first render. Read once, at machine start |
| `open-delay` | number | `200` | Milliseconds of hover before a panel opens |
| `close-delay` | number | `300` | Milliseconds after the pointer leaves before it closes |
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Which arrows walk the bar, and which one enters a panel |
| `disable-click-trigger` | boolean | `false` | Hover and keyboard only |
| `disable-hover-trigger` | boolean | `false` | Click and keyboard only |
| `disable-pointer-leave-close` | boolean | `false` | Passed to Zag as is. It guards the viewport's own pointer leave only; leaving a trigger or a content always starts the close timer, so in practice it changes nothing |
| `translations-root-label` | string | none | `aria-label` for the root. Write `aria-label` on a wrapping `<nav>` instead when you have one |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | none | Kept. Zag would otherwise name the root itself |

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`.

There is deliberately no `value` attribute for controlled state, and no `show()`: use `el.api.setValue()`.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-navigation-menu-item` | `value` | Required. Unique within the menu |
| `ui-navigation-menu-item` | `disabled` | Skipped by the keyboard, does not open |
| `ui-navigation-menu-content` | `value` | The item it belongs to. Required outside an item |
| `ui-navigation-menu-content` | `presence` | Opt in. Holds the panel through its exit animation |
| `ui-navigation-menu-link` | `value` | The item it belongs to. Defaults to the enclosing item's or content's |
| `ui-navigation-menu-link` | `current` | Writes `aria-current="page"` and `data-current` |
| `ui-navigation-menu-link` | `close-on-click` | `close-on-click="false"` keeps the panel open after the link is followed |
| `ui-navigation-menu-viewport` | `align` | `start`, `center` or `end`. Where `--viewport-x` lines the surface up against the trigger |
| `ui-navigation-menu-viewport` | `presence` | On by default. `presence="false"` hides it at once |
| `ui-navigation-menu-viewport-positioner` | `align` | The same value, for the `data-align` hook |

### Presence

The viewport is one element, so presence is on for it by default. Contents are one per item, so each panel that animates opts in with `presence`. A content's presence follows `el.api.value`, not Zag's own `hidden`: in viewport mode Zag keeps the previous panel unhidden until it hears the exit end, and presence is what holds it there and what fires that signal.

Use an **animation**, never a transition. `@zag-js/presence` keys on `animation-name`. See [Styling](/guide/styling#animating-open-and-close).

### A link as the whole item

Zag finds the links that belong on the bar with a direct-child selector, `[data-part=item] > [data-part=link]`, so the `<a>` has to be the child of the element that carries the item's props. Custom elements cannot vanish the way a framework component does, so the recipe delegates twice:

```html
<li>
  <ui-navigation-menu-item value="blog" delegate>
    <ui-navigation-menu-link delegate>
      <a href="/blog">Blog</a>
    </ui-navigation-menu-link>
  </ui-navigation-menu-item>
</li>
```

The item's props land on the link wrapper, the link's on the `<a>`, and the arrow keys reach it. Written without `delegate` on the item, the link still works with the mouse, Tab and Enter, but ArrowLeft and ArrowRight along the bar skip it.

Links inside a panel need none of this. Zag finds them by `data-ownedby` at any depth.

### Naming the parts

Write an `id` on the root, the list, the viewport, an item, its trigger or its content and the component keeps it. Item, trigger and content are named by value, so each item carries its own:

```html
<ui-navigation-menu-item value="shop" id="nav-shop">
  <ui-navigation-menu-trigger delegate><button id="nav-shop-trigger">Shop</button></ui-navigation-menu-trigger>
  <ui-navigation-menu-content id="nav-shop-panel">…</ui-navigation-menu-content>
</ui-navigation-menu-item>
```

With `delegate`, the id goes on the child, because the child is the element Zag names. A DOM differ keys on `id`, and a keyed live node against an unkeyed incoming one is replaced rather than patched; server rendering the same id on both sides is what keeps an element alive across a re-render.

### Surviving a DOM differ

Everything this component writes is a prop, the viewport's coordinates included, so a re-render that stripped attributes is repaired by the next machine tick or by `flush()`. There is no `reposition()` to call.

### `el.api`

The live Zag api, undefined before upgrade.

```js
const el = document.querySelector("ui-navigation-menu");

el.api.value;                 // string, "" when closed
el.api.setValue("shop");
el.api.setValue("");          // close
el.api.open;                  // boolean
```

### Events

| Event | Detail |
|-------|--------|
| `ui-navigation-menu:value-change` | `{ value }`, `""` when it closes |

It bubbles.

### Keyboard

| Key | On the bar | In a panel |
|-----|-----------|------------|
| ArrowLeft, ArrowRight | Move between triggers and delegated link items | Move between the panel's links |
| ArrowDown | Open trigger: move into the panel | |
| Home, End | First, last | |
| Tab | Next element; in viewport mode, from an open trigger into its panel | Next link, then out |
| Escape | Close | Close, focus returns to the trigger |
| Enter, Space | Toggle the panel | Follow the link, which closes the panel |

### Data attributes

| Element | Attributes |
|---------|------------|
| `ui-navigation-menu` | `data-orientation` |
| `ui-navigation-menu-item` | `data-state`, `data-value`, `data-disabled` |
| `ui-navigation-menu-trigger` | `data-state`, `data-value`, `data-disabled` |
| `ui-navigation-menu-content` | `data-state`, `data-value`, `data-motion` in viewport mode |
| `ui-navigation-menu-link` | `data-value`, `data-current`, `data-ownedby` |
| `ui-navigation-menu-viewport` | `data-state`, `data-align` |
| `ui-navigation-menu-indicator`, `ui-navigation-menu-item-indicator` | `data-state` |

`data-state` is always `open` or `closed`. On an item it stays `open` for the panel that is still animating out.
