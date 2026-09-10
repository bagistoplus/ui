# Introduction

`@bagistoplus/ui` is a set of headless custom elements built on [Zag](https://zagjs.com). No shadow DOM, no framework, and no styles you did not write.

You supply the markup and the CSS. The package supplies state, keyboard handling and ARIA.

## Why custom elements

Most headless libraries ship a binding per framework: a React hook, a Vue composable, an Alpine plugin. Each binding hands the component's lifecycle to that framework, which is fine until something else owns the DOM.

On a server rendered page, something else does. A visual editor or a Livewire-style update re-renders a block on the server and applies the new HTML with a DOM differ. The differ patches elements in place, and a binding built on a framework's own cloning rules inherits that framework's quirks, which is how you end up with a component that shows the previous value after every edit, or one that needs a manual teardown and re-initialise on every re-render.

Custom elements are the platform's answer. `connectedCallback`, `disconnectedCallback` and `attributeChangedCallback` are lifecycle the browser guarantees to anything that edits the DOM. A re-render becomes an attribute change, the machine updates its props, and nothing is torn down.

That is the design in one line: **machine options are individual observed attributes**, so a re-render pushes only what changed.

## What headless means here

Every element carries `data-scope`, `data-part` and `data-state`, so any state is styleable. The package ships one small stylesheet, and everything in it is either a display default the browser gets wrong for custom elements, which default to `inline`, or a guard against a flash before the elements upgrade. Nothing decorative.

## The part that is not negotiable

A collapsed panel is really `hidden`. Not zero height, not clipped: hidden, so its links leave the tab order and the accessibility tree.

This matters because the usual way to animate an accordion is to keep the panel in flow and collapse its height, which leaves the content focusable and readable by a screen reader while it looks closed. Zag emits the `hidden` that fixes this; wrappers frequently strip it to make an animation work.

Here, animation is opt in through [`presence`](/guide/styling#animating-open-and-close), which defers `hidden` until the animation ends rather than dropping it.

## What you get

- One machine per component, from Zag, with its keyboard handling and ARIA intact
- Attributes in, `el.api` and bubbling `CustomEvent`s out
- Elements that survive being moved, re-rendered and re-attributed
- Nesting with no special handling

## Next

- [Getting Started](/guide/installation) to install it
- [Styling](/guide/styling) for the four rules worth reading before you write CSS
- [Accordion](/components/accordion) for the first component
