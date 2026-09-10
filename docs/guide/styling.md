# Styling

The package ships no appearance. Every element carries `data-scope`, `data-part` and `data-state`, so you style the elements directly and key off state:

```css
ui-accordion-item[data-state="open"] {
  border-color: hsl(220 90% 56%);
}
```

Or with Tailwind:

```html
<ui-accordion-item class="data-[state=open]:border-blue-500">
```

Four rules are worth reading before you write any of it. Three of them fail **silently**: the markup looks right, nothing errors, and the result is subtly wrong.

## 1. Style whichever element took the props

Without `delegate`, an element is a **container**: Zag's props land on it, and a class you write on it behaves normally. With `delegate`, they land on its single element child, the host goes `display: contents`, and the class belongs on the child.

```html
<!-- wrong: a delegating host lays nothing out and carries no data-state -->
<ui-accordion-item-trigger delegate class="flex w-full data-[state=open]:bg-neutral-100">
  <button>…</button>
</ui-accordion-item-trigger>

<!-- right -->
<ui-accordion-item-trigger delegate>
  <button class="flex w-full data-[state=open]:bg-neutral-100">…</button>
</ui-accordion-item-trigger>
```

**`ui-accordion-item-trigger` always needs `delegate`.** Zag's trigger props say `type="button"`, `disabled` and `aria-expanded`, but Enter, Space, focus rings and disabled pointer blocking come from the browser, and the browser only provides them for a real `<button>`. There is no `tabindex` in those props either, so a container trigger cannot be reached at all. It warns in the console if you forget.

Everywhere else `delegate` is your choice, and it exists for the elements the host cannot be. A custom element cannot be a `<ul>` or an `<li>`, so a real list delegates from the root.

## 2. Any display rule for the panel needs `:not([hidden])`

```css
/* wrong: leaves a closed panel visible and still tabbable */
ui-accordion-item-content { display: grid }

/* right */
ui-accordion-item-content:not([hidden]) { display: grid }
```

**Why.** Zag applies `hidden` to the panel at rest, and `[hidden] { display: none }` is a **user agent** rule. Author rules beat user agent rules, including rules inside a cascade layer. So an unguarded `display` declaration beats `hidden`, and the panel stays visible and in the tab order while looking closed.

`ui.css` obeys this itself: `ui-accordion-item-content:not([hidden]) { display: block }`.

In Tailwind the guard is an arbitrary variant:

```html
<ui-accordion-item-content class="[&:not([hidden])]:grid">
```

::: danger This is the failure the package exists to prevent
An accordion whose collapsed panels are still focusable is broken for keyboard and screen reader users, and it looks perfectly fine.
:::

## 3. Animating open and close

Off by default. Add `presence` to the root, then style the panel with two CSS animations:

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

```css
/* `:not([hidden])`, per rule 2 */
.panel:not([hidden]) {
  display: grid;
  overflow: hidden;
}

/* the grid row */
.panel > * {
  min-height: 0;
}

.panel[data-state="open"] {
  animation: accordion-open 200ms ease-out;
}

.panel[data-state="closed"] {
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

Three things here are not stylistic preferences.

**It must be an animation, not a transition.** `@zag-js/presence` decides how long to keep a closing panel mounted by reading `animation-name` and waiting for `animationend`. A transition leaves `animation-name` at `none`, so the panel unmounts on the next frame and snaps shut.

**Open and close need different `@keyframes` names.** Zag compares the running animation name with the previous one to tell a real exit animation from none at all. One name for both reads as none, and it unmounts immediately.

**The enter needs nothing special.** A transition cannot run on an element that has just left `display: none`, because there is no start value to interpolate from. An animation can, which is the other reason this recipe uses one.

### Why `presence` is opt in

It costs a second state machine per panel. And an animation whose `animationend` never arrives holds the panel unhidden, and therefore tabbable, until it does. Zag bounds the common causes. It does not bound all of them.

## The stylesheet you must load

`ui.css` is small and contains nothing decorative:

```css
@layer ui {
  ui-accordion,
  ui-accordion-item { display: block }

  ui-accordion-item-content:not([hidden]):not([delegate]) { display: block }

  /* a transform cannot apply to display:contents, and it sits in a flex row */
  ui-accordion-item-indicator { display: inline-flex }

  /* before upgrade there is no `hidden` yet, so every panel would paint open */
  ui-accordion:not(:defined) ui-accordion-item-content { display: none }

  /* a delegating host must cost no layout, so it wins over every rule above */
  ui-accordion[delegate],
  ui-accordion-item[delegate],
  ui-accordion-item-trigger[delegate],
  ui-accordion-item-content[delegate],
  ui-accordion-item-indicator[delegate] { display: contents }
}
```

Custom elements default to `display: inline`, so those defaults are corrections, not opinions. The `@layer ui` wrapper is what lets your CSS win. See [Getting Started](/guide/installation#load-the-stylesheet) for why the load order matters.
