# @bagistoplus/ui

Headless custom elements built on [Zag](https://zagjs.com). No shadow DOM, no framework, no styles you did not write.

You supply the markup and the CSS. The package supplies state, keyboard handling and ARIA.

```html
<link rel="stylesheet" href="node_modules/@bagistoplus/ui/ui.css" />
```

```js
import "@bagistoplus/ui/accordion";
import "@bagistoplus/ui/tabs";
```

Each component is its own entry point, so you ship only what you use.

| Component | Import | Elements |
| --- | --- | --- |
| Accordion | `@bagistoplus/ui/accordion` | `ui-accordion`, `ui-accordion-item`, `ui-accordion-item-trigger`, `ui-accordion-item-content`, `ui-accordion-item-indicator` |
| Tabs | `@bagistoplus/ui/tabs` | `ui-tabs`, `ui-tabs-list`, `ui-tabs-trigger`, `ui-tabs-content`, `ui-tabs-indicator` |
| Popover | `@bagistoplus/ui/popover` | `ui-popover`, `ui-popover-anchor`, `ui-popover-trigger`, `ui-popover-indicator`, `ui-popover-positioner`, `ui-popover-content`, `ui-popover-title`, `ui-popover-description`, `ui-popover-close-trigger`, `ui-popover-arrow`, `ui-popover-arrow-tip` |
| Dialog | `@bagistoplus/ui/dialog` | `ui-dialog`, `ui-dialog-trigger`, `ui-dialog-backdrop`, `ui-dialog-positioner`, `ui-dialog-content`, `ui-dialog-title`, `ui-dialog-description`, `ui-dialog-close-trigger` |
| Menu | `@bagistoplus/ui/menu` | `ui-menu`, `ui-menu-trigger`, `ui-menu-indicator`, `ui-menu-positioner`, `ui-menu-content`, `ui-menu-arrow`, `ui-menu-arrow-tip`, `ui-menu-item`, `ui-menu-item-text`, `ui-menu-item-indicator`, `ui-menu-item-group`, `ui-menu-item-group-label`, `ui-menu-separator` |
| Navigation Menu | `@bagistoplus/ui/navigation-menu` | `ui-navigation-menu`, `ui-navigation-menu-list`, `ui-navigation-menu-item`, `ui-navigation-menu-trigger`, `ui-navigation-menu-trigger-proxy`, `ui-navigation-menu-viewport-proxy`, `ui-navigation-menu-item-indicator`, `ui-navigation-menu-link`, `ui-navigation-menu-content`, `ui-navigation-menu-viewport-positioner`, `ui-navigation-menu-viewport`, `ui-navigation-menu-indicator`, `ui-navigation-menu-arrow` |
| Carousel | `@bagistoplus/ui/carousel` | `ui-carousel`, `ui-carousel-item-group`, `ui-carousel-item`, `ui-carousel-control`, `ui-carousel-prev-trigger`, `ui-carousel-next-trigger`, `ui-carousel-autoplay-trigger`, `ui-carousel-indicator-group`, `ui-carousel-indicator`, `ui-carousel-progress-text` |
| Marquee | `@bagistoplus/ui/marquee` | `ui-marquee`, `ui-marquee-viewport`, `ui-marquee-content`, `ui-marquee-item`, `ui-marquee-edge` |
| Number Input | `@bagistoplus/ui/number-input` | `ui-number-input`, `ui-number-input-label`, `ui-number-input-control`, `ui-number-input-input`, `ui-number-input-increment-trigger`, `ui-number-input-decrement-trigger`, `ui-number-input-value-text`, `ui-number-input-scrubber` |

The examples below use the accordion. Everything they show about `delegate`, styling and the api applies to every component.

```html
<ui-accordion collapsible default-value="shipping">
  <ui-accordion-item value="shipping">
    <ui-accordion-item-trigger delegate>
      <button class="flex w-full items-center justify-between p-4">
        Shipping
        <ui-accordion-item-indicator>
          <span class="transition-transform data-[state=open]:rotate-180">▾</span>
        </ui-accordion-item-indicator>
      </button>
    </ui-accordion-item-trigger>
    <ui-accordion-item-content>
      <div class="p-4">Ships in two working days.</div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>
```

## Containers by default, `delegate` to opt out

One rule, no exceptions:

> Without `delegate`, an element is a **container**: Zag's props land on it, you style it directly, and a class you write on it does what you expect.
>
> With `delegate`, it hands those props to its **single element child** and goes `display: contents`, costing no layout of its own.

Reach for `delegate` when the host cannot be the element the context requires. A custom element cannot be a `<ul>` or an `<li>`, so a real list delegates:

```html
<ui-accordion delegate>
  <ul>
    <li>
      <ui-accordion-item value="a">…</ui-accordion-item>
    </li>
  </ul>
</ui-accordion>
```

A delegating element renders nothing and waits if it has no element child, because during HTML parsing it connects before its child exists. With more than one element child it warns and uses the first.

**`ui-accordion-item-trigger` always needs it.** Zag's trigger props say `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus rings and disabled pointer blocking come from the browser, and only a real `<button>` provides them. There is no `tabindex` either, so a container trigger cannot even be reached. It warns in the console if you forget.

Style the elements directly. Zag puts `data-scope`, `data-part`, `data-state` and `hidden` on whichever element took the props, so `data-[state=open]:` variants work where you write them, and `ui-accordion-item[data-state="open"]` styles a whole item by state. With `delegate` those attributes are on the child, so the class goes there too:

```html
<!-- wrong: a delegating host is display:contents and carries no data-state -->
<ui-accordion-item-trigger delegate class="flex w-full data-[state=open]:bg-neutral-100">
  <button>…</button>
</ui-accordion-item-trigger>

<!-- right -->
<ui-accordion-item-trigger delegate>
  <button class="flex w-full data-[state=open]:bg-neutral-100">…</button>
</ui-accordion-item-trigger>
```

**Any display rule you write for `ui-accordion-item-content` needs `:not([hidden])`.** Zag applies `hidden` to that element, and `[hidden] { display: none }` is a *user agent* rule, so any author rule beats it and leaves a closed panel visible and still tabbable.

## Attributes

On `ui-accordion`:

| attribute | type | meaning |
| --- | --- | --- |
| `multiple` | boolean | more than one item open at a time |
| `collapsible` | boolean | an open item can be closed again |
| `disabled` | boolean | disables every item |
| `orientation` | `vertical` \| `horizontal` | arrow key axis, default `vertical` |
| `default-value` | comma list | items open on first render |
| `presence` | boolean | see below |
| `dir` | `ltr` \| `rtl` | inherited from the nearest `[dir]` ancestor when absent |

On `ui-accordion-item`: `value` (required, unique within the accordion) and `disabled`.

Every attribute is observed. Changing one updates the machine in place and keeps the current state, which is the point of this package: a server that re-renders the markup does not have to tear the component down.

There is deliberately no `value` attribute for controlled state. Use `el.api.setValue()`.

Zag owns the `id` of every element it touches, so it writes ids onto items, triggers and panels to wire up `aria-controls` and `aria-labelledby`. The root is the exception: an `id` you author on `ui-accordion` is kept and used as Zag's root id, so `#your-id` keeps working.

## The api

`el.api` is the live Zag [accordion api](https://zagjs.com/components/react/accordion): `value`, `setValue()`, `getItemState()`.

```js
await customElements.whenDefined("ui-accordion");

const root = document.querySelector("ui-accordion");
root.api.setValue([...root.api.value, "returns"]);
```

It is `undefined` before the element upgrades and connects.

This is Zag's own api, published as ours. A Zag major version is a major version here.

Zag's callbacks arrive as bubbling `CustomEvent`s: `ui-accordion:value-change` and `ui-accordion:focus-change`, with Zag's details object as `event.detail`.

## Animating open and close

Off by default. A closed panel gets Zag's `hidden`, which keeps it out of the tab order and out of the accessibility tree, and there is no animation.

Add `presence` to the root. The panel is three boxes, and the middle one is easy to get wrong:

```html
<ui-accordion presence>
  <ui-accordion-item value="a">
    <ui-accordion-item-trigger delegate><button>…</button></ui-accordion-item-trigger>
    <ui-accordion-item-content class="panel">
      <div>                      <!-- the grid row: no padding, border or margin -->
        <div class="p-4">…</div> <!-- spacing goes here -->
      </div>
    </ui-accordion-item-content>
  </ui-accordion-item>
</ui-accordion>
```

**The grid row must be bare.** `min-height: 0` lets a grid item's *content* box reach zero, but padding, border and margin always count toward the track's minimum size. A row carrying its own padding has a floor equal to that padding, so the close eases down, stalls there, and only `hidden` finishes it, which reads as a snap.

```css
/* `:not([hidden])` matters. `[hidden]` is a user agent rule, so a bare
   `display: grid` beats it and leaves a closed panel visible and tabbable. */
ui-accordion-item-content.panel:not([hidden]) {
  display: grid;
  overflow: hidden;
}

/* the grid row */
ui-accordion-item-content.panel > * {
  min-height: 0;
}

ui-accordion-item-content.panel[data-state="open"] {
  animation: accordion-open 200ms ease-out;
}

ui-accordion-item-content.panel[data-state="closed"] {
  animation: accordion-close 200ms ease-out;
}

@keyframes accordion-open {
  from { grid-template-rows: 0fr }
  to { grid-template-rows: 1fr }
}

@keyframes accordion-close {
  from { grid-template-rows: 1fr }
  to { grid-template-rows: 0fr }
}
```

**Give the open and close keyframes different names.** Zag compares the running animation name with the previous one to decide whether a real exit animation started. Reusing one name for both makes it unmount immediately.

**It must be an animation, not a transition.** `@zag-js/presence` decides how long to keep a closing panel mounted by reading `animation-name` and waiting for `animationend`. A `transition` leaves `animation-name` at `none`, so the panel unmounts on the next frame and snaps shut.

`presence` is opt in because it costs a second state machine per panel, and because an animation whose `animationend` never arrives holds the panel unhidden, and therefore tabbable, until it does.

## `ui.css`

Load it in the document head, not from JavaScript. It carries display defaults for custom elements, which the browser renders `inline` otherwise, and `:not(:defined)` rules that stop every panel painting open before the elements upgrade. A stylesheet adopted on import arrives after that paint.

Everything in it sits in an `@layer ui`, so it loses to any unlayered CSS you write and to any Tailwind utility. **Load it before your own stylesheet.** The browser orders layers by first appearance, and that ordering is what lets `class="flex"` on a `ui-accordion` beat the `display: block` default.

```css
/* your stylesheet */
@import "@bagistoplus/ui/ui.css";
@import "tailwindcss";
```

## Element names

The elements register as `ui-accordion` and friends. Custom element names are a global registry, so if something else on your page already owns `ui-accordion`, this package warns in the console and does not install. Nothing inside the package depends on the names, so renaming them is a change at one line in each component's `index.ts`.

## Development

```
npm install
npx playwright install chromium
npm run dev         # the documentation site, with live demos
npm test            # Vitest in real Chromium
npm run typecheck
npm run build       # the package
npm run docs:build  # the site
```

If you already have Chrome installed and would rather skip Playwright's 180MB
Chromium download, run `UI_BROWSER_CHANNEL=chrome npm test`. CI uses the pinned
Chromium.

`npm run dev` serves the docs under `docs/`, which is the fastest way to see behavior: every component page carries live demos wired to the source, so an edit in `src/` reloads them. The demos are the same markup the page documents, so a demo that breaks is a documentation bug.

Tests run in real Chromium rather than jsdom. The value of this package is focus, keyboard and ARIA, and an assertion that a collapsed panel is not tabbable proves nothing in a fake DOM.

Design decisions and their costs are recorded in [docs/adr](docs/adr), which is excluded from the built site.
