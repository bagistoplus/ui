---
layout: home

hero:
  name: "@bagistoplus/ui"
  text: Headless custom elements built on Zag
  tagline: No shadow DOM, no framework, no styles you did not write. State, keyboard handling and ARIA, on elements the browser already knows how to keep alive.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/installation
    - theme: alt
      text: View Components
      link: /components/accordion
    - theme: alt
      text: GitHub
      link: https://github.com/bagistoplus/ui

features:
  - icon: 🎨
    title: Headless
    details: You supply the markup and the CSS. The package supplies behaviour. Every element carries data-scope, data-part and data-state so you can style any state.

  - icon: ♿️
    title: Accessible, and it stays that way
    details: Zag's ARIA and keyboard handling, applied faithfully. A collapsed panel is really hidden, so its links leave the tab order and the accessibility tree.

  - icon: 🔁
    title: Survives a re-render
    details: A server can rewrite the markup and the component keeps its state. attributeChangedCallback pushes the new value into the machine instead of tearing anything down.
---

## Quick Example

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

```js
import "@bagistoplus/ui/accordion";
```

## Philosophy

The package provides **behaviour and accessibility**. You provide the **markup and the styling**.

It handles:

- ✅ State machines, by way of [Zag](https://zagjs.com)
- ✅ Keyboard interactions
- ✅ ARIA attributes and focus management
- ✅ Event dispatching
- ✅ Staying correct when a server re-renders the markup underneath it

You control:

- 🎨 Every element and its nesting
- 🎨 Every class and every rule
- 🎨 Animations, if you want them
- 🎨 Layout and spacing

## Why custom elements

Framework bindings hand a component's lifecycle to the framework. That works until something else owns the DOM, which on a server rendered page it does: a re-render replaces markup, and a binding built on a framework's own cloning rules inherits that framework's quirks.

Custom elements are the platform's answer. `connectedCallback` and `attributeChangedCallback` are lifecycle the browser guarantees, so a re-render updates a machine's props rather than rebuilding it, and a merchant setting applies on the first edit rather than the second.

## Inspiration

- [Zag.js](https://zagjs.com/) for the state machines and the accessibility work
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) for the patterns
