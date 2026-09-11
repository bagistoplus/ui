# Menu

A list of actions or links in a panel anchored to a button, with arrow keys, typeahead, and submenus that open to the side.

## Features

- ✅ Positioned by floating-ui, with the same attributes as the popover
- ✅ Arrow keys, Home, End, Enter and typeahead
- ✅ An item can be a link, with no wrapper around the `<a>`
- ✅ Submenus, any depth, written inside the parent's content
- ✅ Exit animations work, because the panel stays mounted until yours finishes
- ✅ Groups with labels, separators, and an optional arrow
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/menu";
```

## Examples

### Basic

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Actions</button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 ui-doc-fade w-48 origin-[var(--transform-origin)] rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item value="edit" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Edit</ui-menu-item>
      <ui-menu-item value="duplicate" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Duplicate</ui-menu-item>
      <ui-menu-separator class="my-1 block border-t border-gray-200 dark:border-zinc-800"></ui-menu-separator>
      <ui-menu-item value="delete" class="cursor-pointer rounded px-2 py-1.5 text-red-600 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Delete</ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

::: tip Try it
Open it and press ArrowDown, then type `d`. Typeahead jumps to the first item starting with that letter.
:::

### Links as items

Zag's menu has no link part: the item **is** the link. Write `delegate` on the item and the `<a>` receives the item's props, so it is the element the arrow keys highlight and Enter follows.

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Help</button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item value="docs" delegate><a href="/guide/introduction" class="block rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Documentation</a></ui-menu-item>
      <ui-menu-item value="github" delegate><a href="https://github.com/bagistoplus/ui" class="block rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">GitHub</a></ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

```html
<ui-menu-item value="docs" delegate>
  <a href="/docs">Documentation</a>
</ui-menu-item>
```

### Nested

A submenu is a `ui-menu` written inside the parent's content. Its trigger becomes a menu item of the parent on its own, and Zag places it to the side. Hover it, or highlight it and press ArrowRight; ArrowLeft goes back.

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">File</button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 w-48 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item value="new" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">New</ui-menu-item>
      <ui-menu>
        <ui-menu-trigger delegate>
          <button class="flex w-full cursor-pointer items-center justify-between rounded border-0 bg-transparent px-2 py-1.5 text-left text-sm data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Share <span aria-hidden="true">›</span></button>
        </ui-menu-trigger>
        <ui-menu-positioner>
          <ui-menu-content class="z-20 w-44 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
            <ui-menu-item value="mail" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Mail</ui-menu-item>
            <ui-menu-item value="link" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Copy link</ui-menu-item>
          </ui-menu-content>
        </ui-menu-positioner>
      </ui-menu>
      <ui-menu-item value="print" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">Print</ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

```html
<ui-menu>
  <ui-menu-trigger delegate><button>File</button></ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content>
      <ui-menu-item value="new">New</ui-menu-item>

      <ui-menu>
        <ui-menu-trigger delegate><button>Share</button></ui-menu-trigger>
        <ui-menu-positioner>
          <ui-menu-content>
            <ui-menu-item value="mail">Mail</ui-menu-item>
          </ui-menu-content>
        </ui-menu-positioner>
      </ui-menu>

      <ui-menu-item value="print">Print</ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>
```

There is no separate trigger item element and no `parent` attribute. Where the `ui-menu` sits says which menu is its parent, and the trigger inside a submenu carries the parent's item props as well as its own, so the parent's arrow keys reach it. Zag decides the submenu's placement itself: `right-start`, or `left-start` under `dir="rtl"`, so the `positioning-*` attributes on a submenu are ignored for placement.

Escape closes the whole tree. ArrowLeft closes only the submenu it was pressed in and returns to the parent.

### With an indicator

`ui-menu-indicator` carries `data-state`, so a chevron can turn without any script.

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">
      Sort by
      <ui-menu-indicator class="transition-transform duration-200 data-[state=open]:rotate-180">▾</ui-menu-indicator>
    </button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 w-52 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item value="newest" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Newest first</ui-menu-item>
      <ui-menu-item value="price-asc" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Price, low to high</ui-menu-item>
      <ui-menu-item value="price-desc" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Price, high to low</ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

```html
<ui-menu-trigger delegate>
  <button>
    Sort by
    <ui-menu-indicator class="transition-transform data-[state=open]:rotate-180">▾</ui-menu-indicator>
  </button>
</ui-menu-trigger>
```

### Groups, a separator and a disabled item

A group takes a `value`, and its label names it through `aria-labelledby`. A disabled item is skipped by the arrow keys and cannot be selected.

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Export</button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 w-52 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item-group value="documents">
        <ui-menu-item-group-label class="block px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">Documents</ui-menu-item-group-label>
        <ui-menu-item value="pdf" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">PDF</ui-menu-item>
        <ui-menu-item value="docx" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Word</ui-menu-item>
      </ui-menu-item-group>
      <ui-menu-separator class="my-1 block border-t border-gray-200 dark:border-zinc-800"></ui-menu-separator>
      <ui-menu-item-group value="data">
        <ui-menu-item-group-label class="block px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-400">Data</ui-menu-item-group-label>
        <ui-menu-item value="csv" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">CSV</ui-menu-item>
        <ui-menu-item value="xlsx" disabled class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Excel (soon)</ui-menu-item>
      </ui-menu-item-group>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

```html
<ui-menu-item-group value="documents">
  <ui-menu-item-group-label>Documents</ui-menu-item-group-label>
  <ui-menu-item value="pdf">PDF</ui-menu-item>
</ui-menu-item-group>
<ui-menu-separator></ui-menu-separator>
<ui-menu-item value="xlsx" disabled>Excel (soon)</ui-menu-item>
```

### Item text and an indicator inside the item

`ui-menu-item-text` and `ui-menu-item-indicator` sit inside an item and carry its `data-highlighted`, for a layout where the highlight has to style two boxes.

<ComponentExample>

<ui-menu positioning-placement="bottom-start" positioning-gutter="6">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">View</button>
  </ui-menu-trigger>
  <ui-menu-positioner>
    <ui-menu-content class="z-20 w-52 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-item value="grid" class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">
        <ui-menu-item-text>Grid</ui-menu-item-text>
        <ui-menu-item-indicator class="text-xs text-gray-400 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-white">⌘1</ui-menu-item-indicator>
      </ui-menu-item>
      <ui-menu-item value="list" class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-800">
        <ui-menu-item-text>List</ui-menu-item-text>
        <ui-menu-item-indicator class="text-xs text-gray-400 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-white">⌘2</ui-menu-item-indicator>
      </ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

### With an arrow

The arrow has to be inside the positioner, and its size and colour come from `--arrow-size` and `--arrow-background`, as on the popover.

<ComponentExample>

<ui-menu positioning-placement="bottom" positioning-gutter="10">
  <ui-menu-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Account</button>
  </ui-menu-trigger>
  <ui-menu-positioner style="--arrow-size: 10px; --arrow-background: white">
    <ui-menu-content class="z-20 w-52 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
      <ui-menu-arrow>
        <ui-menu-arrow-tip class="border-l border-t border-gray-200 dark:border-zinc-800"></ui-menu-arrow-tip>
      </ui-menu-arrow>
      <ui-menu-item value="profile" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Profile</ui-menu-item>
      <ui-menu-item value="orders" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Orders</ui-menu-item>
      <ui-menu-item value="logout" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Sign out</ui-menu-item>
    </ui-menu-content>
  </ui-menu-positioner>
</ui-menu>

</ComponentExample>

### Opened from code

`show()` and `hide()` are safe before the element has rendered, so a script can open a menu that has no trigger of its own. Two things follow from the button not being a `ui-menu-trigger`. A menu without a trigger has nothing to position against, so the script hands `reposition()` the box to anchor to. And a click on that button is an **outside** click as far as the menu knows, so the panel would dismiss on the pointerdown and the click would open it again: the script cancels the `pointerdown.outside` event for its own button, and toggles. The `ui-menu:select` event carries the item's `value`.

<ComponentExample>

<div class="flex items-center gap-3">
  <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900" onclick="const menu = this.parentElement.querySelector('ui-menu'); if (!menu.dataset.wired) { menu.dataset.wired = ''; menu.addEventListener('ui-menu:select', (event) => { this.parentElement.querySelector('[data-selected]').textContent = 'Selected ' + event.detail.value; }); menu.querySelector('ui-menu-content').addEventListener('pointerdown.outside', (event) => { if (this.contains(event.detail.target)) { event.preventDefault(); } }); } if (menu.api.open) { menu.hide(); } else { menu.show(); menu.api.reposition({ getAnchorRect: () => this.getBoundingClientRect() }); }">Toggle from a script</button>
  <ui-menu positioning-placement="bottom-start" positioning-gutter="6">
    <ui-menu-positioner>
      <ui-menu-content aria-label="Choices" class="z-20 w-52 rounded-lg border border-gray-200 bg-white p-1 text-sm shadow-lg outline-none dark:border-zinc-800 dark:bg-zinc-900">
        <ui-menu-item value="one" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">One</ui-menu-item>
        <ui-menu-item value="two" class="cursor-pointer rounded px-2 py-1.5 data-[highlighted]:bg-gray-100 data-[disabled]:cursor-default data-[disabled]:opacity-40 dark:data-[highlighted]:bg-zinc-800">Two</ui-menu-item>
      </ui-menu-content>
    </ui-menu-positioner>
  </ui-menu>
  <span class="text-sm text-gray-600 dark:text-zinc-400" data-selected>Nothing selected yet</span>
</div>

</ComponentExample>

```js
const menu = document.querySelector("ui-menu");
const button = document.querySelector("#toggle");

menu.addEventListener("ui-menu:select", (event) => {
  console.log(event.detail.value);
});

// The button is not the trigger, so to the menu it is outside. Without this,
// a click on it while the menu is open dismisses on pointerdown and reopens on click.
menu.querySelector("ui-menu-content").addEventListener("pointerdown.outside", (event) => {
  if (button.contains(event.detail.target)) {
    event.preventDefault();
  }
});

button.addEventListener("click", () => {
  if (menu.api.open) {
    menu.hide();
    return;
  }

  menu.show();
  menu.api.reposition({ getAnchorRect: () => button.getBoundingClientRect() });
});
```

`pointerdown.outside` and `focus.outside` are the cancelable events Zag's dismissable layer fires on the content before it dismisses; cancelling one keeps the menu open. `getAnchorRect` is one of the function-valued positioning options no attribute can express, which is why it is passed here rather than written on the element. A menu with a `ui-menu-trigger` needs none of this: Zag positions against the trigger and excludes it from outside clicks whether the menu was opened by a click or by `show()`. The `reposition()` call places the panel once; a menu that must follow its anchor through scrolling and resizing wants a real trigger.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-menu` | Owns the machine, `el.api` and the events. Renders no Zag part of its own. Inside another menu's content, it is a submenu |
| `ui-menu-trigger` | Opens and closes. Always `delegate`, wrapping a real `<button>`. In a submenu it is also an item of the parent |
| `ui-menu-indicator` | Optional. A styling hook carrying `data-state` |
| `ui-menu-positioner` | **Required.** The element floating-ui positions |
| `ui-menu-content` | The panel. `role="menu"` |
| `ui-menu-item` | An action. With `delegate` around an `<a>`, a link |
| `ui-menu-item-text` | Optional. The item's text, carrying the item's highlight state |
| `ui-menu-item-indicator` | Optional. A marker inside the item, carrying the item's highlight state |
| `ui-menu-item-group` | Groups items under a label. `role="group"` |
| `ui-menu-item-group-label` | Names its group through `aria-labelledby` |
| `ui-menu-separator` | `role="separator"` |
| `ui-menu-arrow` | Optional. Must be inside the positioner |
| `ui-menu-arrow-tip` | The visible shape inside the arrow |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**`ui-menu` is not an anatomy part.** Menu's anatomy has no root, so this element carries only `data-scope="menu"` and no `data-part`. It is still a real box, and it is what the trigger and the positioner sit in.

**Not shipped:** Zag's option items (checkbox and radio items with a `checked` prop) and its context trigger (a menu opened by right click or long press at a point). Both carry state or an opening path no consumer has asked for yet.

### Attributes on `ui-menu`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-open` | boolean | `false` | Open on first render. Read once, at machine start |
| `close-on-select` | boolean | `true` | Close when an item is selected |
| `loop-focus` | boolean | `false` | ArrowDown on the last item wraps to the first |
| `typeahead` | boolean | `true` | Printable characters jump to a matching item |
| `composite` | boolean | `true` | `false` when the menu is part of a larger widget, such as a combobox: the panel becomes `role="dialog"` |
| `default-highlighted-value` | string | none | The item highlighted on first render |
| `default-trigger-value` | string | none | Which trigger is current, when there is more than one |
| `positioning-*` | | | The twelve positioning attributes. Same names and defaults as the [popover](/components/popover#positioning), except `positioning-placement`, which defaults to `bottom-start` |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | none | Yours. Zag writes no id to this element |

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`.

There is deliberately no `open` attribute for controlled state. Use `show()`, `hide()` or `el.api.setOpen()`.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-menu-trigger` | `value` | Optional. Only needed when several triggers share one menu. Ignored inside a submenu |
| `ui-menu-content` | `presence` | `presence="false"` hides the panel immediately instead of waiting for an exit animation |
| `ui-menu-item` | `value` | Required. Reported by `ui-menu:select`. An item without one renders nothing |
| `ui-menu-item` | `disabled` | Skipped by the keyboard, not selectable |
| `ui-menu-item` | `value-text` | What typeahead matches, when the text content is not it |
| `ui-menu-item` | `close-on-select` | Per item override of the root's setting |
| `ui-menu-item-group` | `value` | Required. Names the group, and its label through it |

### `show()` and `hide()`

Both are safe at any time, unlike `el.api.setOpen`, which is undefined until the first frame after upgrade. A call made before the machine exists is read as `default-open` when the machine is built. After that it goes to Zag, which ignores a state it is already in.

```js
document.querySelector("ui-menu").show();
```

### Naming the panel

Write `aria-label` on `ui-menu-content`. Zag only writes that attribute when it was given one, and never removes what it did not write, so yours stays.

```html
<ui-menu-content aria-label="File actions">
```

Without one, Zag points `aria-labelledby` at the trigger.

### Naming the parts

Write an `id` on the trigger, the positioner, the content or the arrow and the component keeps it, telling Zag to generate that name instead of its own. Items are named from their `value` and take no id.

```html
<ui-menu-trigger delegate><button id="file-trigger">File</button></ui-menu-trigger>
<ui-menu-positioner id="file-popper">
  <ui-menu-content id="file-panel">
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. morphdom treats a keyed live node against an **unkeyed** incoming one as incompatible and replaces the element outright rather than patching it, taking its listeners and floating-ui's measured coordinates with it. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### Surviving a DOM differ

The same rule as the [popover](/components/popover#surviving-a-dom-differ): after a re-render that touched an open menu, call `el.api.reposition()` for the coordinates floating-ui writes. `flush()` covers a differ that only stripped attributes and nothing ticked afterwards.

```js
document.querySelector("ui-menu").api.reposition();
```

### `flush()`

Re-applies the current api to every element, synchronously. Before the element has rendered it schedules the first render instead. A submenu flushes with its parent.

### `el.api`

The live Zag api, undefined before upgrade.

```js
const el = document.querySelector("ui-menu");

el.api.open;                    // boolean
el.api.setOpen(true);
el.api.highlightedValue;        // string | null
el.api.setHighlightedValue("edit");
el.api.reposition();
```

`el.parentMenu` is the `ui-menu` this one is a submenu of, or `null`.

### Events

| Event | Detail |
|-------|--------|
| `ui-menu:open-change` | `{ open }` |
| `ui-menu:select` | `{ value }` |
| `ui-menu:highlight-change` | `{ highlightedValue }` |
| `ui-menu:trigger-value-change` | `{ value, triggerElement }` |

All bubble. A submenu's events bubble through its parent's content, so listen on the menu you mean and read `event.target`.

### Data attributes

| Element | Attributes |
|---------|------------|
| `ui-menu-trigger` | `data-state`, `data-placement`, `data-side`, and in a submenu `data-highlighted` from the parent |
| `ui-menu-content` | `data-state`, `data-placement`, `data-side` |
| `ui-menu-item` | `data-highlighted`, `data-disabled`, `data-value` |
| `ui-menu-item-text`, `ui-menu-item-indicator` | `data-highlighted`, `data-disabled` |
| `ui-menu-indicator` | `data-state` |

`data-state` is always `open` or `closed`. Style the highlighted item against `data-highlighted`, never `:hover`: the keyboard moves the highlight without moving the pointer.
