# Accordion

A vertically stacked set of headings, each revealing a panel of content.

## Features

- ✅ Single or multiple items open at once
- ✅ Full keyboard navigation, including Home and End
- ✅ Collapsed panels are really hidden, so their links leave the tab order
- ✅ Optional open and close animation, opt in
- ✅ Nests without special handling
- ✅ Keeps its state when a server re-renders the markup

## Installation

```js
import "@bagistoplus/ui/accordion";
```

## Examples

### Basic

Only one panel opens at a time. Tab into it and use the arrow keys.

<ComponentExample>

<ui-accordion collapsible class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-accordion-item value="shipping" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Shipping</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Ships in two working days. <a href="#shipping" class="underline underline-offset-2">Read the policy</a>.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
  <ui-accordion-item value="returns" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Returns</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Thirty days, unworn.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>

</ComponentExample>

::: tip Try it
Open a panel, then Tab. The link inside a **closed** panel is unreachable, because the panel really is `hidden`.
:::

### Multiple open at once

<ComponentExample>

<ui-accordion multiple collapsible class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-accordion-item value="a" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>First</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Both panels can be open together.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
  <ui-accordion-item value="b" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Second</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Opening this one leaves the other alone.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>

</ComponentExample>

### Open by default

`default-value` takes a comma separated list of item values. It is read once, when the machine starts.

<ComponentExample>

<ui-accordion collapsible default-value="second" class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-accordion-item value="first" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>First</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Closed to begin with.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
  <ui-accordion-item value="second" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Second</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">This one starts open.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>

</ComponentExample>

### Animated

Add `presence` and give the panel a CSS animation. The panel stays mounted until `animationend`, then `hidden` lands. See [Styling](/guide/styling#animating-open-and-close) for the rules, all three of which fail silently if you get them wrong.

<ComponentExample>

<ui-accordion collapsible presence class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-accordion-item value="one" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Animated one</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content class="overflow-hidden [&:not([hidden])]:grid *:min-h-0 data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-close">
      <div>
        <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">The panel eases all the way to zero, then hides. <a href="#deep" class="underline underline-offset-2">This link is unreachable once it has.</a></div>
      </div>
    </ui-accordion-item-content>
  </ui-accordion-item>
  <ui-accordion-item value="two" class="border-gray-200 not-first:border-t dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Animated two</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content class="overflow-hidden [&:not([hidden])]:grid *:min-h-0 data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-close">
      <div>
        <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Watch one close while the other opens.</div>
      </div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>

</ComponentExample>

### Nested

Arrow keys stay inside one accordion. Zag scopes its trigger lookup with `data-ownedby`, so the inner triggers are invisible to the outer machine.

<ComponentExample>

<ui-accordion collapsible default-value="outer" class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
  <ui-accordion-item value="outer" class="border-gray-200 dark:border-zinc-800">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
        <span>Outer</span>
        <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="px-4 pb-4">
        <ui-accordion collapsible class="w-full rounded-lg border border-gray-200 dark:border-zinc-800">
          <ui-accordion-item value="inner-a" class="border-gray-200 not-first:border-t dark:border-zinc-800">
            <ui-accordion-item-trigger delegate>
              <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
                <span>Inner A</span>
                <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
              </button>
            </ui-accordion-item-trigger>
            <ui-accordion-item-content>
              <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Inner A body.</div>
            </ui-accordion-item-content>
          </ui-accordion-item>
          <ui-accordion-item value="inner-b" class="border-gray-200 not-first:border-t dark:border-zinc-800">
            <ui-accordion-item-trigger delegate>
              <button class="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent p-4 text-left font-medium">
                <span>Inner B</span>
                <ui-accordion-item-indicator class="shrink-0 transition-transform duration-150 data-[state=open]:rotate-180" aria-hidden="true">▾</ui-accordion-item-indicator>
              </button>
            </ui-accordion-item-trigger>
            <ui-accordion-item-content>
              <div class="px-4 pb-4 text-gray-600 dark:text-zinc-400">Inner B body.</div>
            </ui-accordion-item-content>
          </ui-accordion-item>
        </ui-accordion>
      </div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>

</ComponentExample>

## API Reference

### Anatomy

| Element | Description |
|---------|-------------|
| `ui-accordion` | Owns the machine, `el.api` and the events |
| `ui-accordion-item` | One item, identified by `value` |
| `ui-accordion-item-trigger` | The control. Always `delegate`, wrapping a real `<button>` |
| `ui-accordion-item-content` | The panel, `role="region"` |
| `ui-accordion-item-indicator` | Decorative, `aria-hidden="true"` |

Every element takes Zag's props on itself unless you write `delegate`, which hands them to its single element child. See [`delegate`](/guide/usage#delegate-choosing-which-element-takes-the-props) and [Styling](/guide/styling).

### Attributes on `ui-accordion`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `multiple` | boolean | absent | More than one item open at a time |
| `collapsible` | boolean | absent | An open item can be closed again |
| `disabled` | boolean | absent | Disables every item |
| `orientation` | `vertical` \| `horizontal` | `vertical` | Arrow key axis. Anything but the exact string `horizontal` reads as `vertical` |
| `default-value` | comma list | none | Items open on first render. Read once, at machine start |
| `presence` | boolean | absent | Keeps a closing panel mounted for its animation |
| `delegate` | boolean | absent | Applies Zag's props to the single element child instead of to this element. Available on every element in the anatomy |
| `dir` | `ltr` \| `rtl` | inherited | Taken from the nearest `[dir]` ancestor, including self |
| `id` | string | generated | Kept, and used as Zag's root id. See below |

Every attribute is observed. Changing one updates the machine in place, so the open state survives.

Every boolean attribute reads three ways. Absent means "use Zag's default", present means `true`, and the literal value `"false"` means `false`. See [Usage](/guide/usage#booleans-read-three-ways).

There is deliberately no `value` attribute for controlled state. Use `el.api.setValue()`.

### Attributes on `ui-accordion-item`

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | string | **required** | Unique within the accordion. Without it the item and all its parts render nothing |
| `disabled` | boolean | absent | Disables this item only |

### Naming the parts

Write an `id` on an item, its trigger or its panel and the component keeps it, telling Zag to generate that name instead of its own. All three are named by the item's `value`, so each item carries its own ids:

```html
<ui-accordion-item value="shipping" id="faq-shipping">
  <ui-accordion-item-trigger delegate><button id="faq-shipping-trigger">Shipping</button></ui-accordion-item-trigger>
  <ui-accordion-item-content id="faq-shipping-panel">…</ui-accordion-item-content>
</ui-accordion-item>
```

With `delegate`, the id goes on the child, because the child is the element Zag names.

This matters for DOM differs, which key on `id`. morphdom treats a keyed live node against an **unkeyed** incoming one as incompatible and replaces the element outright rather than patching it. Server rendering the same id on both sides is what keeps the element alive across a re-render.

### `el.api`

The live Zag accordion api. `undefined` until the element upgrades and connects.

```js
await customElements.whenDefined("ui-accordion");

const root = document.querySelector("ui-accordion");
root.api.setValue([...root.api.value, "returns"]);
```

| Member | Type | Description |
|--------|------|-------------|
| `value` | `string[]` | The open item values |
| `focusedValue` | `string \| null` | Value of the focused item |
| `setValue(value)` | `(string[]) => void` | Sets the open items. With `multiple` off, Zag truncates to the first |
| `getItemState(props)` | `({ value, disabled? }) => { expanded, focused, disabled }` | State of one item |

::: warning
This is Zag's own api, published as ours rather than wrapped in a facade. A Zag major version is a major version here.
:::

### Events

Both bubble, so one listener on `document` catches every accordion on the page.

| Event | Detail | Description |
|-------|--------|-------------|
| `ui-accordion:value-change` | `{ value: string[] }` | The set of open items changed |
| `ui-accordion:focus-change` | `{ value: string \| null }` | The focused item changed |

```js
document.addEventListener("ui-accordion:value-change", (event) => {
  console.log(event.target.id, event.detail.value);
});
```

### Data attributes

`data-scope` is always `accordion`. `data-part` is the anatomy part name.

| Element | `data-part` | Also carries |
|---------|-------------|--------------|
| `ui-accordion` | `root` | `dir`, `id`, `data-orientation` |
| `ui-accordion-item` | `item` | `data-state`, `data-focus`, `data-disabled`, `data-orientation`, `id` |
| `ui-accordion-item-content` | `item-content` | `role="region"`, `aria-labelledby`, **`hidden`**, `data-state`, `data-focus`, `data-disabled` |
| `ui-accordion-item-indicator` | `item-indicator` | `aria-hidden="true"`, `data-state`, `data-disabled` |
| the trigger's `<button>` | `item-trigger` | `type="button"`, `aria-controls`, `aria-expanded`, `disabled`, `data-state`, `data-ownedby` |

`data-state` is always `open` or `closed`. `data-focus` and `data-disabled` are present or absent. `data-ownedby` is the root id, and is how nested accordions stay separate.

With `delegate`, every attribute in the row above lands on the element's single child instead, and the host carries **nothing**. That is always the case for the trigger.

### Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle the focused item. Comes from the native `<button>` |
| `ArrowDown` / `ArrowUp` | Move between triggers, vertical orientation |
| `ArrowRight` / `ArrowLeft` | Move between triggers, horizontal orientation. Direction aware |
| `Home` | First trigger |
| `End` | Last trigger |
| `Tab` | Move out of the accordion. Only open panels contain tab stops |

## Accessibility

Follows the [WAI-ARIA Accordion Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).

- The trigger is a real `<button>`, so Enter, Space, focus rings and `disabled` are the browser's
- `aria-expanded` on the trigger, `aria-controls` to the panel, `aria-labelledby` back to the trigger
- The panel is `role="region"`
- A closed panel carries `hidden`, so it leaves both the tab order and the accessibility tree

That last point is the whole reason the package exists. An accordion that animates by keeping the panel in flow leaves its links focusable and readable by a screen reader while looking closed.

## Tips

- Give each item a stable `value`. It is the machine's key, so state survives a re-render as long as the value does
- Style a whole item by state with `ui-accordion-item[data-state="open"]`
- Put the `id` you want on `ui-accordion`. It is kept. Ids on items, triggers and panels belong to Zag
