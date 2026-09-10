# Headless custom elements over Zag

`@bagistoplus/ui` ships headless custom elements built on Zag machines. No shadow DOM, no styles beyond what the browser forces us to declare, and no framework dependency. Consumers write their own markup and style it with whatever CSS they already use, Tailwind included.

The package exists for two reasons. BlocksPro's interactive primitives are welded to Alpine, and nothing outside BlocksPro can use them. Both problems have the same fix: move the Zag layer onto the platform's own component model.

## Containers by default, `delegate` to opt out

Every element takes Zag's props on itself. Writing `delegate` hands them to its single element child instead, and puts the host at `display: contents` so it costs no layout.

```html
<ui-accordion-item-trigger delegate>
  <button class="flex w-full items-center justify-between">
    Heading
    <ui-accordion-item-indicator class="transition-transform data-[state=open]:rotate-180">▾</ui-accordion-item-indicator>
  </button>
</ui-accordion-item-trigger>
```

`ui-accordion-item-trigger` is the one element that cannot work without it. `getItemTriggerProps()` returns `type: "button"`, `disabled`, `aria-expanded`, `aria-controls`, and an `onKeyDown` that handles arrows, Home and End only. Enter, Space, focus rings and disabled pointer blocking are the browser's job, and the browser only does that job for a `<button>`. There is no `tabindex` in those props either, so a container trigger is not reachable at all. It warns in the console rather than failing silently.

The attribute is not called `as-child`. Radix and Ark use `asChild` for something materially different: there the wrapper component is removed and its props cloned onto the child. Here the wrapper stays in the DOM, so borrowing the name would teach a wrong model of the resulting tree.

### Two earlier positions, and why this is neither

The first version delegated from **every** part, unconditionally, on the grounds that one uniform rule is easier to teach than a boundary. That was wrong twice over. It cost a wrapper element per part, and the uniformity was itself the trap: a class written on a part element silently did nothing, and the first thing built against the rule, this package's own demo markup, got it wrong.

The second drew a boundary instead: the trigger delegates, everything else is a container, because **native semantics** were the only thing worth protecting. That fixed the silent failure and the wrapper cost, but it only answered the case the package had met so far. A custom element also cannot be a `<ul>` or an `<li>`, because customized built-ins are not supported across browsers, and no fixed boundary can know in advance which element a consumer's context demands.

So the decision is the consumer's, per element, and the default is the one that fails loudly rather than silently. A class on a container works; a class on a delegating host is visibly inert, and the consumer wrote the attribute that made it so.

A delegating host with no element child renders nothing and waits, because during HTML parsing it connects before its child exists. One with more than one element child warns and uses the first.

### `hidden` outranks a layered display default

Zag applies `hidden` to the content element at rest. `[hidden] { display: none }` is a **user agent** rule, so any author rule beats it, `@layer ui` included. `ui-accordion-item-content { display: block }` therefore left closed panels visible and still in the tab order, which is the exact defect this package exists to fix.

Every display rule for that element carries `:not([hidden])`, in `ui.css` and in the documented animation recipe. This did not arise while content delegated, because the props landed on an unstyled child that the UA rule still governed. It is the one real cost of the container model, and it is a documented rule rather than a silent trap only because a test caught it.

## The tag names are `ui-*`, and nothing inside depends on them

Custom element names live in a global registry shared with every other script on the page, and a duplicate `customElements.define` throws. `ui-accordion` is a name someone else could plausibly claim.

Registration is a side effectful subpath import, so there is nowhere to pass a prefix option:

```js
import "@bagistoplus/ui/accordion";
```

That buys tree shaking by construction. A consumer who imports only the accordion never pulls `@zag-js/carousel`. It also means the collision risk is real and unmitigated at the API level, so it is mitigated internally instead: **no code inside the package may reference a tag name.** A child finds its root by walking `parentElement` and testing a `Symbol.for("@bagistoplus/ui.accordion.root")` brand, never `closest("ui-accordion")` and never `instanceof`. The brand survives a page that loaded the package twice, which `instanceof` does not. A future rename then costs one line at the registration site.

## Configuration is attributes, state is `el.api`

Machine options arrive as individual observed attributes, not one JSON blob:

```html
<ui-accordion multiple collapsible orientation="vertical">
  <ui-accordion-item value="item-1">
```

Each attribute is observed on its own, so a morph pushes only what changed. The markup is readable in devtools and self documenting, which a `config='{"multiple":true}'` blob is not. The cost is a small per component attribute schema with type coercion for boolean presence, numbers and comma lists.

Imperative access is `el.api`, the live Zag `connect()` result:

```js
const root = document.querySelector("ui-accordion");
root.api.setValue([value, ...root.api.value]);
```

This publishes Zag's API shape as ours. A Zag major becomes our major. We accept that rather than hand maintain a facade for every component, and we say so in the README instead of pretending otherwise. `el.api` is undefined before upgrade, so consumers await `customElements.whenDefined`.

Zag callbacks become `CustomEvent`s that bubble.

## `presence` is opt in, and it requires CSS animations

By default the elements apply Zag's `hidden` faithfully. Closed content is `display: none`, which is correct for the accessibility tree and the tab order, and costs one machine per component.

BlocksPro's accordion today does the opposite. It strips Zag's `hidden` so a `grid-template-rows: 0fr` transition can run, and the result is that links inside a collapsed panel stay focusable and stay in the accessibility tree. Zag emitted the fix and the wrapper threw it away. That is the defect this package must not inherit.

The `presence` attribute on the root turns on `@zag-js/presence` for the component's collapsible parts:

```html
<ui-accordion presence>
```

`@zag-js/presence` keys on `animation-name` and `animationend`. Its `syncPresence` action reads the computed style and unmounts immediately when the name is `none`, when `animation-duration` is `0s`, when `display` is `none`, or when the document is hidden. It suspends the unmount only while a real CSS animation is running.

So the recipe is a `@keyframes` animation, never a `transition`. A transition leaves `animation-name` at `none`, Zag unmounts on the next frame, and the panel snaps shut. This is a hard requirement on consumers and the README leads with it.

It also means the enter needs no special handling. A transition cannot run on an element that has just left `display: none`, because there is no start value to interpolate from, but an animation can and does. Zag mounts the node and the open keyframes run.

Presence is opt in rather than default because its cost belongs to whoever asked for animation. Every collapsible part gains a second machine and a second subscription, and an animation whose `animationend` never arrives holds the panel unhidden and tabbable until it does. Zag bounds the common causes. It does not bound all of them.

The name matches `@zag-js/presence`, and the mechanism generalises to `ui-dialog`, `ui-popover` and `ui-menu`, which will need exactly the same thing.

## What ships

ESM and `.d.ts`. Consumers bundle it themselves.

One stylesheet, `ui.css`, carrying only what CSS must declare and JavaScript cannot fix in time:

```css
ui-accordion:not(:defined) ui-accordion-item-content { display: none }
[delegate] { display: contents }
```

The `:not(:defined)` rules are the reason this is a file rather than a stylesheet the package adopts on import. An adopted sheet runs after the bundle loads, by which point the browser has already painted every panel open. The animation recipe lives in the same file as a documented optional block, never as a default.

Every rule in it sits inside `@layer ui`. Unlayered CSS beats every layer, so an unlayered `display: block` on `ui-accordion` would beat a Tailwind `flex` utility and make the package unstylable by the very means it advertises. The layer inverts that, at the price of a documented ordering requirement: load `ui.css` before the consumer's own stylesheet, because layer precedence follows first appearance.

## Tests run in a real browser

Vitest browser mode with the Playwright provider. The whole value of a Zag based library is focus management, keyboard interaction and ARIA, which is what jsdom models worst, and Zag reaches for `ResizeObserver` and `matchMedia` besides. A test that asserts a collapsed panel is not tabbable proves nothing in jsdom.

## A shared core of base classes, not a factory

The accordion was written first as plain custom element classes, so the real problems surfaced before any abstraction existed: reconnect idempotence, delegation, presence, attribute coercion, and a props applier that survives a DOM differ. The runtime was then lifted into `src/core/` while the accordion remained its only consumer.

It is a set of abstract base classes, not the `define-zag-component.ts` style factory this ADR originally anticipated. A survey of the fourteen Zag components in the consuming package is what settled that. They span six structural shapes: keys that are strings, numbers, enums, and in one case a `DateValue` object; three components with no `root` part at all; one that maps `root` to `getAnchorProps`; eight needing resolver functions rather than a method name; seven needing to rewrite machine options before start; one needing a presence predicate that varies per item; one whose part reaches into a second component's api. Two of the factory's features are used exactly once each.

A configuration object that covers that has to re-admit callbacks for everything interesting, at which point the configuration is code with worse types and no stack traces. That is how the Alpine helper reached five hundred lines around a `PartDefinition` union of string, function, and object. Abstract classes express all six shapes natively.

`core/props.ts` moved untouched: it never had any component knowledge. `core/root.ts` owns the machine, the lifecycle, the coalescing and the event namespace; a component supplies an attribute schema, a machine reference and a props mapping. `core/part.ts` owns registration and the container/delegating split. `core/presence.ts` owns the second machine, and its contract is to decorate props rather than suppress them.

A part registers with an owner found by brand, and the owner satisfies a `PartOwner` interface rather than being a concrete class. The accordion's item implements it by passing through to the root. That is the seam a component whose parts hang directly off the root would use, and it is deliberately only a seam: nothing exercises the flat shape yet, so nothing was built for it. The twenty two accordion tests passed unmodified through the extraction, which is the only evidence that the behaviour is unchanged.

## The pilot, and when to stop

BlocksPro migrates `resources/views/components/cookie-preferences.blade.php` first, because it has fixed markup, no `@children` and no editor sync, then the accordion block itself, which has all three. The two recursive drawer views stay on Alpine, and so do the other thirteen Zag components. `define-zag-component.ts` is not touched.

Four things must hold before the remaining components move:

1. The `destroyTree` and `initTree` script in `accordion.blade.php` is deleted, and selecting or adding an item in Visual still opens it.
2. With `presence` set, a Chromium test proves a link in a collapsed panel is not tabbable and not in the accessibility tree once the transition settles, and that the panel animates in both directions.
3. A merchant setting applies on the first edit, not the second, with no re-init.
4. An Alpine `x-bp-carousel` and a `ui-accordion` coexist on one page with no double init and no CSS scope collision.

## Rendering is coalesced, and the only observer is per part

Mounting registers every item and every part separately, so rendering on each registration would be O(items x parts). Renders are therefore coalesced onto one animation frame. Measured on a 50 item accordion with 150 parts, that turns roughly 200 registrations into 2 renders.

A delegate target is an ordinary element, so unlike a child custom element it cannot announce itself. Two cases need catching: a bundle that is not deferred connects a part before its child is parsed, and a morph can swap the child for a different element. Each part therefore observes **its own children only**, never a subtree.

An earlier version observed the whole accordion subtree from the root. Measurement showed that was the wrong shape. It fired zero times during mount, because the package ships as `type="module"` and upgrades run after parsing, when children already exist. It did fire on content a merchant put inside a panel, forcing a full re-spread of all 150 parts for a change the library does not care about. Scoped per part, unrelated content churn now costs nothing.

## Props are compared against the DOM, not against a cache

`spreadProps` from `@zag-js/vanilla` remembers what it last wrote and skips an attribute whose value has not changed. That holds only while nothing else edits the DOM.

Server rendered pages break that assumption. A DOM diffing library that patches an element in place removes every attribute the incoming HTML does not carry, and Zag's attributes are all in that category: a server sends no `id`, no `data-scope`, no `data-part`, no `dir`. The element keeps its identity and loses its props, and a cache backed applier never writes them back. The failure this surfaced in was silent: Zag's `getRootEl` stopped resolving and arrow key navigation died, one re-render after load.

`applyProps` in `src/accordion/props.ts` therefore compares against the live DOM. Anything that strips an attribute gets it restored on the next render. It keeps its own record for two things the DOM cannot answer: which attributes this scope owns, so removing a prop removes the attribute, and event listeners. Listeners are registered once per event as a stable dispatcher that reads the latest props, rather than removed and re-added on every render as `spreadProps` does, because Zag returns fresh closures from every `connect`.

What a re-render legitimately costs is worth knowing, and belongs to the consumer rather than here. A differ that keys on `id` sees a keyed live node against an unkeyed incoming one and replaces it, so child elements do not survive. State does, because the machine is keyed by the item's `value`, which the server does send. Focus does not: the focused trigger becomes a new element and the browser drops focus.

## Constraints this places on every element

Visual's morph moves nodes, so `connectedCallback` fires more than once per instance. Elements must be reconnect idempotent and must never rebuild machine state on reconnect.

The `data-scope` value comes from Zag rather than from a package prefix, so it is `accordion`, not `bp-accordion`. Consumers with existing `[data-scope="bp-accordion"]` selectors update them.

## What this does not cover

The 24 `BP*` Alpine data components in BlocksPro are not candidates. They are Bagisto coupled, reaching into the cart, the wishlist and Livewire islands, and they do not belong in a package that claims to be storefront agnostic.

Alpine does not leave the page. The host Bagisto theme loads it, and BlocksPro keeps two runtimes for the duration of the migration and possibly beyond.

`presence` is committed to as a cross component concept before the components that stress it hardest exist. A dialog's focus trap and a popover's teardown may want more than a boolean, and this decision does not pretend to have anticipated that.
