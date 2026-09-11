# Dialog

A modal or non-modal panel over the page: a drawer, a confirmation, a fullscreen viewer. Focus is trapped, scroll is locked, and the rest of the page is hidden from assistive technology while it is open.

## Features

- ✅ Modal by default, with a focus trap, a scroll lock and `aria-hidden` on everything else
- ✅ Closes on Escape and on a click outside, and each can be turned off
- ✅ Exit animations work on the panel and on the backdrop, because both stay mounted until yours finishes
- ✅ A closed dialog is really hidden, so its links leave the tab order
- ✅ Escapes any stacking context through the native top layer, without moving in the DOM
- ✅ `show()` and `hide()` that are safe to call before the element has rendered
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/dialog";
```

## Examples

### Basic

<ComponentExample>

<ui-dialog top-layer>
  <ui-dialog-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Delete product</button>
  </ui-dialog-trigger>
  <ui-dialog-backdrop class="fixed inset-0 bg-black/50"></ui-dialog-backdrop>
  <ui-dialog-positioner class="fixed inset-0 grid place-items-center p-4">
    <ui-dialog-content class="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <ui-dialog-title class="text-lg font-semibold">Delete this product?</ui-dialog-title>
      <ui-dialog-description class="mt-1 text-sm text-gray-600 dark:text-zinc-400">
        It leaves the catalogue immediately. Orders that already contain it are not affected.
      </ui-dialog-description>
      <div class="mt-5 flex justify-end gap-2">
        <ui-dialog-close-trigger delegate>
          <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">Cancel</button>
        </ui-dialog-close-trigger>
        <ui-dialog-close-trigger delegate>
          <button class="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white">Delete</button>
        </ui-dialog-close-trigger>
      </div>
    </ui-dialog-content>
  </ui-dialog-positioner>
</ui-dialog>

</ComponentExample>

::: tip Try it
Open it, then press Tab repeatedly. Focus cycles inside the panel and never reaches the page behind it. Press Escape and focus returns to the button.
:::

### A drawer

The positioner is yours to lay out. Push the content to one edge and it is a drawer.

<ComponentExample>

<ui-dialog top-layer>
  <ui-dialog-trigger delegate>
    <button class="cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium dark:border-zinc-800 dark:bg-zinc-900">Open cart</button>
  </ui-dialog-trigger>
  <ui-dialog-backdrop class="ui-doc-dim fixed inset-0 bg-black/50"></ui-dialog-backdrop>
  <ui-dialog-positioner class="fixed inset-0 flex justify-end">
    <ui-dialog-content class="ui-doc-slide flex h-full w-80 max-w-full flex-col bg-white p-5 shadow-2xl dark:bg-zinc-900">
      <div class="flex items-center justify-between">
        <ui-dialog-title class="text-lg font-semibold">Your cart</ui-dialog-title>
        <ui-dialog-close-trigger delegate>
          <button class="cursor-pointer rounded border-0 bg-transparent px-1 text-gray-500">✕</button>
        </ui-dialog-close-trigger>
      </div>
      <p class="mt-4 text-sm text-gray-600 dark:text-zinc-400">Nothing in it yet.</p>
    </ui-dialog-content>
  </ui-dialog-positioner>
</ui-dialog>

</ComponentExample>

```css
ui-dialog-backdrop[data-state="open"]  { animation: dim-in 150ms ease-out }
ui-dialog-backdrop[data-state="closed"] { animation: dim-out 100ms ease-in }
ui-dialog-content[data-state="open"]   { animation: slide-in 200ms ease-out }
ui-dialog-content[data-state="closed"] { animation: slide-out 150ms ease-in }

@keyframes dim-in    { from { opacity: 0 } to { opacity: 1 } }
@keyframes dim-out   { from { opacity: 1 } to { opacity: 0 } }
@keyframes slide-in  { from { transform: translateX(100%) } to { transform: translateX(0) } }
@keyframes slide-out { from { transform: translateX(0) } to { transform: translateX(100%) } }
```

Use an **animation**, never a transition. `@zag-js/presence` keys on `animation-name`, and a transition leaves it at `none`, so the panel snaps shut. See [Styling](/guide/styling#animating-open-and-close). Presence is on for both the backdrop and the content, so each waits for its own animation, and the top layer is left only when the longer of the two has ended.

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-dialog` | Owns the machine, `el.api`, `show()`, `hide()` and the events. Renders no Zag part of its own |
| `ui-dialog-trigger` | Opens and closes. Always `delegate`, wrapping a real `<button>` |
| `ui-dialog-backdrop` | Optional. The dim layer, carrying `hidden` and `data-state` |
| `ui-dialog-positioner` | **Required.** Lays the content out over the page, and is what enters the top layer |
| `ui-dialog-content` | The panel. `role="dialog"`, or `alertdialog` |
| `ui-dialog-title` | Names the panel through `aria-labelledby` |
| `ui-dialog-description` | Describes it through `aria-describedby` |
| `ui-dialog-close-trigger` | Optional. Always `delegate`, wrapping a real `<button>` |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

**`ui-dialog` is not an anatomy part.** Dialog's anatomy has no root, so this element carries only `data-scope="dialog"` and no `data-part`. It is still a real box, and it is what the trigger, the backdrop and the positioner sit in.

**`ui-dialog-positioner` is required, and it is not the content.** The positioner is `fixed` over the page and lays the content out inside it, and with `top-layer` it is the element the browser promotes. Zag gives it no `hidden`, only `pointer-events: none` while closed, so give it no display rule of its own that would make it visible.

### Attributes on `ui-dialog`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `default-open` | boolean | `false` | Open on first render. Read once, at machine start |
| `modal` | boolean | `true` | Trap focus, lock body scroll, hide the rest of the page from assistive technology, close on an outside click. The four options below default to this value |
| `trap-focus` | boolean | `modal` | Keep Tab inside the panel |
| `prevent-scroll` | boolean | `modal` | Lock body scroll while open |
| `close-on-interact-outside` | boolean | `modal` | Close when something outside is clicked. Always `false` for an alertdialog |
| `close-on-escape` | boolean | `true` | Close on Escape |
| `restore-focus` | boolean | `true` | Return focus to the trigger on close. Only applies with a focus trap |
| `content-role` | `dialog` \| `alertdialog` | `dialog` | The `role` written on the content. An alertdialog also ignores outside clicks and focuses its close trigger first |
| `initial-focus` | selector | first tabbable | What to focus on open, resolved inside `ui-dialog` at open time |
| `default-trigger-value` | string | none | Which trigger is current, when there is more than one |
| `top-layer` | boolean | `false` | Promote the backdrop and the positioner into the browser's top layer while open. See [Escaping a stacking context](#escaping-a-stacking-context) |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | none | Yours. Zag writes no id to this element |

Every attribute is observed. Changing one updates the machine in place.

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`. That last form is the only way to turn off an option whose default is `true`, and for a dialog that is most of them: `modal="false"` alone gives a panel that traps nothing, locks nothing and lets the page behind it be used.

The attribute is `content-role`, not `role`, because `role` on this element would be read as ARIA in its own right and the wrapper would announce itself as a second alertdialog. The same reasoning is why there is no label attribute at all: see [Naming the panel](#naming-the-panel).

There is deliberately no `open` attribute for controlled state. Use `show()`, `hide()` or `el.api.setOpen()`. Zag's `finalFocusEl` and `persistentElements` have no attribute either.

### Attributes on the parts

| Element | Attribute | Description |
|---------|-----------|-------------|
| `ui-dialog-trigger` | `value` | Optional. Only needed when several triggers share one dialog |
| `ui-dialog-backdrop` | `presence` | `presence="false"` hides the backdrop immediately instead of waiting for an exit animation |
| `ui-dialog-content` | `presence` | Same, for the panel |
| `ui-dialog-content` | `aria-label` | Yours. Names the panel when there is no title. Zag leaves it alone |

### `show()` and `hide()`

```js
const el = document.querySelector("ui-dialog");

el.show();
el.hide();
```

These exist because `el.api` is undefined until the first frame after upgrade, and a reactive framework's first effect runs before that. A call made before the machine exists is not lost: the dialog simply starts in the state you asked for. After that, both go straight to Zag, which ignores a state it is already in, so calling `show()` from an effect on every change is safe.

```html
<ui-dialog x-data x-effect="open ? $el.show() : $el.hide()"></ui-dialog>
```

### Escaping a stacking context

A `fixed` element inside an ancestor with a `z-index` is painted inside that ancestor's stacking context, so a drawer in a `z-index: 40` header sits under anything at page level above 40. The usual answer is to move the element to `<body>`, and that breaks DOM order for Tab, breaks `aria-hidden`, which walks the tree from the content, and breaks any server side re-render that expects the element inside its own block.

`top-layer` takes the other route. The backdrop and the positioner get `popover="manual"`, and while the dialog is open the component calls `showPopover()` on the backdrop and then on the positioner, which paints them on the browser's top layer, above every stacking context on the page. They never move in the DOM. The backdrop is promoted first, so the panel paints over it regardless of the order you wrote them in, and both leave only after the last exit animation has ended.

```html
<ui-dialog top-layer>
```

`manual`, not `auto`. An `auto` popover dismisses itself and closes other popovers, and the dialog machine already owns dismissal.

Three things to know:

- **The user agent styles every `[popover]`** as a centred, bordered, padded box on a `Canvas` background. `ui.css` resets that on these two elements, and keeps only `position: fixed`. Your own `inset`, background and layout classes apply as usual.
- **It is inert where `showPopover` does not exist.** The attribute is not written and the dialog stacks by `z-index`, exactly as it does without `top-layer`.
- **Re-adding `popover` does not re-promote.** If something strips the attribute from a promoted element, the browser drops it out of the top layer. The next render writes the attribute back and promotes it again, so after a DOM differ has run, call `scheduleRender()` on `ui-dialog`.

### Several triggers, one dialog

Give each trigger a `value` and name the starting one with `default-trigger-value`. The current trigger gets `data-current`, and focus returns to it on close.

```html
<ui-dialog default-trigger-value="edit">
  <ui-dialog-trigger delegate value="edit"><button>Edit</button></ui-dialog-trigger>
  <ui-dialog-trigger delegate value="duplicate"><button>Duplicate</button></ui-dialog-trigger>
  <ui-dialog-positioner>
    <ui-dialog-content>…</ui-dialog-content>
  </ui-dialog-positioner>
</ui-dialog>
```

### Naming the panel

Put a `ui-dialog-title` and a `ui-dialog-description` in the panel and Zag points `aria-labelledby` and `aria-describedby` at them.

Both have to be in the **initial markup**. Zag checks for them one frame after opening and does not look again, so a title added later is never referenced.

A dialog with no visible title takes its name from an `aria-label` you write on `ui-dialog-content`:

```html
<ui-dialog-content aria-label="Newsletter offer">
```

There is no attribute for this on `ui-dialog`, and none is needed. Zag emits `aria-label` on the content only when its own prop is set, and the component never removes an attribute it did not write, so yours stays. Where a title is present, `aria-labelledby` wins over it, which is the correct precedence.

### Naming the parts

Write an `id` on any part except a valued trigger and the component keeps it, telling Zag to generate that name instead of its own:

```html
<ui-dialog-backdrop id="cart-backdrop"></ui-dialog-backdrop>
<ui-dialog-positioner id="cart-positioner">
  <ui-dialog-content id="cart-panel">
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. morphdom treats a keyed live node against an **unkeyed** incoming one as incompatible and replaces the element outright, taking its listeners and its presence state with it. Server rendering the same id on both sides is what keeps the element alive across a re-render.

Ids are read once, when the machine is built at the end of the first frame. A part appended later takes a generated name.

### `el.api`

The live Zag api, undefined before upgrade.

```js
const el = document.querySelector("ui-dialog");

el.api.open;                  // boolean
el.api.setOpen(true);
el.api.setTriggerValue("duplicate");
```

### Events

| Event | Detail |
|-------|--------|
| `ui-dialog:open-change` | `{ open }` |
| `ui-dialog:trigger-value-change` | `{ value, triggerElement }` |

Both bubble.

### Data attributes

| Element | Attributes |
|---------|------------|
| `ui-dialog-trigger` | `data-state`, `data-current`, `data-value`, `data-ownedby` |
| `ui-dialog-backdrop` | `data-state` |
| `ui-dialog-content` | `data-state` |

`data-state` is always `open` or `closed`.
