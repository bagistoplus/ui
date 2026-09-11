# Usage

Attributes go in, `el.api` and events come out.

## Attributes in

Every machine option is an individual observed attribute:

```html
<ui-accordion multiple collapsible orientation="vertical" default-value="a,b">
```

### Booleans read three ways

Absent means "use the machine's default", present means `true`, and the literal value `"false"` means `false`.

```html
<ui-accordion multiple>              <!-- true -->
<ui-accordion multiple="false">      <!-- false -->
<ui-accordion>                       <!-- whatever Zag defaults to -->
```

The third form is what presence alone cannot express, and about half of Zag's booleans default to `true`, so it is not an edge case. Note that this deviates from HTML, where `disabled="false"` still means disabled. The deviation is uniform: every boolean attribute in this package reads the same way, so no two of them read the same markup in opposite directions.

### Nested options take a prefix

A Zag prop whose type is an object flattens into one attribute per key, named `<object>-<key>`:

```html
<ui-tabs translations-list-label="Product details">
<ui-popover positioning-placement="bottom-end" positioning-gutter="8">
```

Changing one updates the machine in place. The current open state survives, which is the point: a server can re-render the markup and the component does not reset.

```js
// This does not tear anything down.
document.querySelector("ui-accordion").toggleAttribute("multiple", true);
```

`default-value` is uncontrolled and read once, when the machine starts. To drive state after that, use the api.

## `delegate`: choosing which element takes the props

Every element is a container by default: Zag's props land on the element itself. Add `delegate` and it hands them to its single element child instead, going `display: contents` so it costs no layout.

```html
<ui-accordion delegate>
  <ul>
    <li>
      <ui-accordion-item value="a">
        <ui-accordion-item-trigger delegate><button>Item A</button></ui-accordion-item-trigger>
        <ui-accordion-item-content>Panel A</ui-accordion-item-content>
      </ui-accordion-item>
    </li>
  </ul>
</ui-accordion>
```

That is the escape hatch for everything the host cannot be. A custom element cannot be a `<ul>` or an `<li>`, because customized built-ins are not supported across browsers, so the root delegates to a real list. `data-scope`, `data-part`, `data-state`, `hidden` and the `id` are then on that child, and so is where your classes belong.

Two consequences worth knowing:

- **`ui-accordion-item-trigger` always needs it.** Zag's trigger props carry no `tabindex`, and Enter, Space, the focus ring and disabled pointer blocking all come from a real `<button>`. A container trigger is not reachable, so the element warns in the console.
- **Write the `id` on the child, not on the host.** A delegating root reads the authored id from its target, so everything Zag faces stays on one element.

A delegating element renders nothing and waits if it has no element child, because during HTML parsing it connects before its child is parsed. It watches its own children after that, so a child added later, or swapped by a DOM differ, still gets the props. With more than one element child it warns and uses the first.

## The api out

`el.api` is the live Zag api for the component. It is `undefined` until the element upgrades and connects, so wait for the definition first:

```js
await customElements.whenDefined("ui-accordion");

const root = document.querySelector("ui-accordion");

root.api.value;                              // ["shipping"]
root.api.setValue(["shipping", "returns"]);  // open both
root.api.getItemState({ value: "returns" }); // { expanded, focused, disabled }
```

::: tip Author your own id
Zag writes ids onto items, triggers and panels to wire up `aria-controls` and `aria-labelledby`, and those overwrite anything you put there. The root is the exception: an `id` you author on `ui-accordion` is kept and used as Zag's root id.

That is worth doing on a server rendered page. A DOM differ that keys on `id` compares the live node, which Zag renamed, against the incoming one from the server, decides they are incompatible, and replaces the element, taking the machine and every open panel with it.
:::

## Events out

Zag's callbacks arrive as bubbling `CustomEvent`s, namespaced by component:

```js
document.addEventListener("ui-accordion:value-change", (event) => {
  console.log(event.target.id, event.detail.value);
});
```

Because they bubble, one listener catches every accordion on the page. Disambiguate on `event.target`.

## Under a re-render

This is what the package is for, so it is worth being precise about what survives.

| | Survives a re-render |
|---|---|
| Machine state, the open items | **Yes**, because the machine is keyed by each item's `value`, which the server sends |
| The root element and its machine | **Yes**, if you authored an `id` the server also sends |
| Child element identity | **No**. A differ keying on `id` replaces them, since Zag's ids are not in the server HTML |
| Focus | **No**. The focused trigger becomes a new element and the browser drops focus |

Nothing may assume element identity across a re-render. The elements do not: children re-register on connect, and props are re-applied by comparing against the live DOM rather than a cache.
