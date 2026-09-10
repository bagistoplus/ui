# Getting Started

## Install

```sh
npm install @bagistoplus/ui
```

## Import a component

Registration is a side effectful subpath import. There is no root export: importing the accordion never pulls another component's machine.

```js
import "@bagistoplus/ui/accordion";
```

That defines `ui-accordion`, `ui-accordion-item`, `ui-accordion-item-trigger`, `ui-accordion-item-content` and `ui-accordion-item-indicator`.

## Load the stylesheet

```css
/* your stylesheet */
@import "@bagistoplus/ui/ui.css";
@import "tailwindcss";
```

Or as a link in the document head:

```html
<link rel="stylesheet" href="/node_modules/@bagistoplus/ui/ui.css" />
```

::: warning Load it before your own styles, and load it as a file
Both halves of that matter, for different reasons.

**Before your own styles.** Everything in `ui.css` sits in an `@layer ui`. Layered CSS loses to unlayered CSS, which is what lets `class="flex"` on a `ui-accordion` beat the `display: block` default. But layer precedence follows *first appearance*, so if your stylesheet is parsed first, the ordering is established without `ui` in it and the guarantee inverts.

**As a file, in the head.** `ui.css` contains `:not(:defined)` rules that stop every panel painting open before the elements upgrade. A stylesheet injected by JavaScript arrives after that paint has already happened.
:::

## Write the markup

```html
<ui-accordion collapsible default-value="shipping">
  <ui-accordion-item value="shipping">
    <ui-accordion-item-trigger delegate>
      <button>Shipping</button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div>Ships in two working days.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>
```

The trigger wraps a real `<button>`. That is the one structural rule; [Styling](/guide/styling) explains why.

## Framework notes

The elements are plain custom elements, so they work anywhere HTML does. Two things to know:

**Server side rendering.** Registration calls `customElements.define` at module scope, which throws in Node. Import it on the client only:

```js
if (typeof window !== "undefined") {
  import("@bagistoplus/ui/accordion");
}
```

**Vue.** Tell the compiler these are custom elements, or it will try to resolve them as components:

```js
compilerOptions: {
  isCustomElement: (tag) => tag.startsWith("ui-"),
}
```

**Element name collisions.** Custom element names are a global registry. If something else on the page already owns `ui-accordion`, the package warns in the console and does not install rather than throwing.
