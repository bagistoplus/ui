# Headless custom elements over Zag

`@bagistoplus/ui` ships headless custom elements built on Zag machines. No shadow DOM, no styles beyond what the browser forces us to declare, and no framework dependency. Consumers write their own markup and style it with whatever CSS they already use, Tailwind included.

One component, the before/after, runs a machine the package wrote itself because Zag has none. ADR 0002 records what that machine must look like.

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

## A part has an owner, and may own parts

There are two classes. `ZagRootElement` owns a machine and has no owner. `ZagPart` is everything else, and its owner is the root **or another part**.

The accordion suggested a third shape. `ui-accordion-item` groups a value with the parts that render it, so it was written as its own kind of element, hand-implementing `PartOwner` beside a separate `ZagPart` hierarchy, and `ZagPart.render(api, owner)` took an owner argument that only a collection layer ever passed.

Tabs showed that was a generalisation from one example. Its anatomy is `root, list, trigger, content, indicator`, with triggers inside the list and panels as siblings of it, so a trigger and its panel live in **different subtrees** and each carries its own `value`. There is nothing to group them under. Building tabs on the earlier core meant either a second registration path for parts that hang off the root, or a fake collection layer wrapping nothing.

So the collection layer is not a kind of element. It is a part that happens to own parts, which any part may do. `data-part="item"` is as much a part as `data-part="item-trigger"`, and `findBranded` already means "nearest branded ancestor", which is the same question whether the answer is the root or an item.

The owner argument went with it. It was always redundant, since the only caller passed `this`, which is what the part's own `findBranded` had already resolved. `render(api)` reads `this.owner`, which makes `ZagPart` satisfy `Renderable` exactly, and the distinction between "a part under a collection layer" and "a part under the root" stops existing.

`propsFor()` returns `Props | null` in place of the item's early return, and `null` skips the **whole subtree**. It cannot mean "no props", because every Zag part returns at least `data-scope` and `data-part`. It means the element is not in a renderable state, and there is no version of that where the parts below it are fine.

This is the third turn of the same argument the section above records. A rule too uniform to be safe, then a boundary too fixed to generalise, and in both cases the fix was to find the thing that was actually invariant. Here it is that a part has an owner. Everything else was the accordion's shape mistaken for the library's.

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

Each attribute is observed on its own, so a morph pushes only what changed. The markup is readable in devtools and self documenting, which a `config='{"multiple":true}'` blob is not. The cost is a small per component attribute schema with type coercion for booleans, numbers and comma lists.

Two props are inherited from the page rather than written on every root. `dir` is read from the nearest `[dir]` ancestor, and `locale` from the nearest `[lang]`, because a storefront sets both once on the document. An attribute on the root wins over either.

### A boolean attribute has three states

Absent means "use the machine's default", present means `true`, and the literal value `"false"` means `false`.

The first convention was presence alone, which works only while every prop defaults to `false`. Accordion and tabs happened to be like that, and the tabs port paid for it by dropping `loop-focus` and `composite` from its surface with a note saying a presence attribute could not express "true unless absent". About half of Zag's booleans default to `true`, so the next component was always going to force the question. Popover forced it: three BlocksPro views need `close-on-interact-outside="false"`.

The rejected alternative was negated names, `no-close-on-interact-outside`, which has real HTML precedent in `novalidate` and `nomodule`. It was rejected because it would leave two boolean attributes in one package reading in opposite directions: `deselectable="false"` would mean `true` while `no-flip` would mean `false`. One rule that is slightly unusual beats two rules that contradict each other.

This does deviate from HTML, where `disabled="false"` still means disabled. It deviates in the direction people expect rather than the direction that surprises them, and it is total: there is no boolean attribute here that reads any other way.

### A nested prop flattens with an object prefix

A Zag prop whose type is an object becomes one attribute per key, named `<object>-<key>`. Scalars stay flat.

```html
<ui-tabs translations-list-label="Product details">
<ui-popover positioning-placement="bottom-end" positioning-gutter="8">
```

This came up over `positioning`, which has 24 fields. The prefix is a rule rather than a curated list, which is what makes it possible to expose the whole scalar surface mechanically instead of guessing which four or eight options people need. A JSON attribute would have done the same job with no key-to-type map, and was rejected for being uninspectable in devtools and unreadable in a Blade template.

The `positioning-*` list and its parser live once, in `src/core/positioning.ts`, and every root that positions with `@zag-js/popper` spreads the same twelve names into its observed attributes. Two copies would drift, and the drift would be invisible until one component accepted an attribute the other silently ignored.

`ids` is the one object prop that does **not** get attributes. The only case that matters is stopping Zag renaming an element a differ keys on, and `authoredId()` already covers it.

`formatOptions` on the number input is the one exception to the prefix. It is an `Intl.NumberFormatOptions`, not a Zag object, and three of its fields are exposed: `minimum-fraction-digits`, `maximum-fraction-digits` and `use-grouping`, under the `Intl` names. The prefix would have made `format-options-maximum-fraction-digits`, which nobody would write in a template, for an object whose scalar surface is not Zag's to grow.

### An authored id is honoured whether Zag names the part flatly or by value

Zag's `ElementIds` has two shapes. A part there is one of is a string, `content?: string`. A part there is one of per item is a function of the value, `trigger?: (value: string) => string`. The first shape was covered from the start; the second was not, so an id written on a tabs trigger or an accordion panel was read and then overwritten, and a differ keyed on `id` replaced those elements on every re-render.

The root now keeps both: flat ids in one map, value-keyed ids in a map per part, and it hands Zag one function per value-keyed key that reads its map **live**. Live, because `VanillaMachine` freezes `ids` into its scope when it is built and never rebuilds it, so a function closing over the map is what lets an item connected after the first frame still be named by the consumer. Zag falls back to its generated name when the function returns `undefined`, so a part without an authored id costs nothing. A value-keyed part reports its key only while it has a value, and reports the value beside the id, so the root can file it.

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

The name matches `@zag-js/presence`.

### Opt in or opt out follows arity

Popover inverts the default: its content animates unless you write `presence="false"` on it.

The difference is arity rather than taste. An accordion has one panel per item, so a single switch on the root beats N switches on N items, and defaulting it on would spin up a machine per item for consumers who animate nothing. A popover has exactly one content, so there is nothing to aggregate, the switch belongs on the element it governs, and the cost of leaving it on is one machine.

Leaving it on is also close to free for anyone who animates nothing, because `@zag-js/presence` keys on `animation-name` and lets `hidden` land on the same frame when none is declared.

The rule, stated once dialog existed to test it: **presence defaults on for a part there is exactly one of, and opt in for a part there is one of per item.** Dialog has two singleton presence bearing parts, the backdrop and the content, and both default on with their own `presence="false"`. A first reading of the popover rule, "one presence bearing part", would have made dialog a special case for no reason; the count that matters is per part, not per component.

## A stacking context is escaped by the top layer, never a portal

A `fixed` element inside an ancestor that has a `z-index` paints inside that ancestor's stacking context. A drawer in a `z-index: 40` header is capped at 40 against the page, and a portal to `<body>` is the usual escape.

The package does not portal, and the reason is that three things Zag does depend on where the element sits in the tree. Sequential focus follows DOM order, which is why Zag's popover has a `portalled` prop whose sole job is a tab proxy repairing an order the DOM no longer provides. `hideContentBelow` walks up from the content marking siblings `aria-hidden`, and gets the wrong answer from the wrong tree. And a server side re-render patches a block's own subtree, which a portalled element has left; the consuming package renders one drawer two different ways today for exactly that reason.

The top layer has none of those costs. An element with a `popover` attribute is promoted with `showPopover()`, paints above every stacking context, takes the viewport as its containing block, and does not move. Dialog's `top-layer` attribute does this to the backdrop and the positioner.

Three choices inside that:

- `popover="manual"`, not `auto`. An `auto` popover light-dismisses and closes other `auto` popovers, both of which would fight `@zag-js/dismissable`.
- The positioner, not the content. A top layer element takes the viewport as its containing block, so promoting the content would pull it out of the positioner's layout. Promoting the positioner leaves the content laid out inside it exactly as before.
- The root decides, not the parts. Zag gives the positioner no `hidden`, so on its own it cannot know when it is still needed through the content's exit animation. The root runs after every child has rendered and asks the presence bearing parts; one condition governs both promoted elements, and entry order puts the backdrop under the positioner whatever order the consumer wrote them in.

The user agent styles every `[popover]` as a centred, bordered box on a `Canvas` background, which `ui.css` resets on the two dialog parts only. On a browser without `showPopover` the attribute is inert and the dialog stacks by `z-index`, which is the shape every consumer had before.

The pre-upgrade guard for these two parts uses `!important`, the only one in the file that does. A dialog positioner nearly always carries an unlayered `flex` utility, which beats any normal declaration in the layer, and a full screen positioner painting before the bundle runs is a page nobody can click. Importance is scoped to `:not(:defined)` and is gone the moment the element upgrades.

## `show()` and `hide()`

`el.api` is the only imperative surface on accordion, tabs and popover, and it is undefined until the first frame after upgrade because the machine is built lazily inside the first render, which is what lets the parts report their authored ids first. Dialog is the first component whose consumers drive it from a reactive effect, and an effect's first run lands before that frame. `el.api?.setOpen(true)` silently does nothing there.

So `ui-dialog` also has `show()` and `hide()`. After the first frame they call `api.setOpen`, which ignores a state it is already in. Before it, the intent is read as `defaultOpen` when the machine is built, so the dialog starts in the asked-for state. Nothing is queued and no lifecycle hook exists for it; the lazy creation that caused the problem is also what makes the fix one field.

This is deliberately not a controlled `open` attribute. Zag's controlled mode buys exactly one thing, the ability to veto a close, and no consumer vetoes. Everything else it appears to buy, such as opening from an element outside the dialog, is `show()`.

## A nested component links to its ancestor after both have started

Zag's menu has one machine for a menu and a submenu. What makes one a submenu is being told its parent at runtime: `childApi.setParent(parentService)` and `parentApi.setChild(childService)`. Both are `send` calls, and `VanillaMachine.send` returns early on a machine that has not started. Zag's own examples run the two calls from an effect wrapped in a `setTimeout` for exactly this reason.

The package starts a machine at the end of its first render, after `afterRender`. So a hook that runs after `start()` is the only correct place for the link, and `afterStart()` exists for that one job. The parent has always started first: it connected first during parsing, so its frame ran first.

Which menu is the parent is a fact the DOM already states. A `ui-menu` whose nearest `ui-menu` ancestor exists is a submenu, found with the same `findBranded` walk every part uses. No `parent` attribute, and no `ui-submenu` tag: a second tag would say in a name what `setParent` already says, and would claim there are exactly two levels when there can be any number.

Two things follow from one element being described by two machines. The submenu's trigger needs the parent's item props merged in, which Zag does in `getTriggerItemProps(childApi)`, a **parent** api call. There is no `ui-menu-trigger-item` element for it: Zag already keys the part name on `isSubmenu` inside `getTriggerProps`, and the trigger makes the same decision one level up, where the parent api is reachable through its owner. And that element has to re-render on the parent's ticks as well as the child's, since the parent's highlight lands on it. So a submenu registers with its parent as a renderable, and the parent's render pass re-renders the whole submenu with its own api. Zag has no `removeChild`; a stopped submenu stays in the parent's children and every send to it is a no-op.

## A root may restart its machine

Some of Zag's effects bind to elements once, when the machine starts. The carousel's `trackSlideIntersections` and `trackSlideResize` observe the item elements they find at that moment and never look again, so an item connected later receives no `data-inview`, keeps `aria-hidden="true"`, and its resize refreshes nothing. `updateProps` cannot help: the props did not change, the elements did.

The package's answer is `restart()` on the root: stop the machine, build a new one on the next render, start it at the end of that render as on the first frame. What the element has learned survives, because none of it lives in the machine: the registered children, the authored ids, the scope key, and the machine props read from attributes. A root that restarts also passes what it wants to keep from the old machine as props of the new one; the carousel hands over the page as `defaultPage`.

It is a primitive, not a policy. Core never calls it. A component calls it when it knows its machine is blind to a change, and nowhere else, because a restart drops in-flight state such as a running autoplay or an unfinished drag.

## A derived count, and DOM order as the index

Zag's carousel requires `slideCount` and an `index` on every item, and has no fallback for either. Its React binding gets both from the array it maps over. A custom element has no array; it has children, and the children register with the root.

So the count is the number of registered items, and an item's index is its place among them in document order, computed fresh on every render from one sort of the registered set. Nothing caches an index, which is what makes an insertion in the middle correct: the render after it renumbers everything behind the new item. `slide-count` on the root and `index` on an item override both, for the consumer whose order is not the DOM's.

`hidden` is the one exclusion. An item carrying the attribute is not counted and has no index, because a gallery that hides the slides a selection leaves out would otherwise page onto empty frames. The attribute and not the layout, because the element can read an attribute on every render and cannot read layout.

The same rule numbers indicators inside their group. A thumbnail strip is then the carousel's own pagination with nothing bound.

## The root publishes what CSS cannot compute

The package writes only what Zag emits, with three exceptions on the carousel root, `--page`, `--page-count` and `data-autoplay-state`, and one on a marquee copy, `inert`.

The two custom properties exist because a progress bar needs the page and the page count, and a stylesheet cannot get either from Zag's output. Without them every consumer writes the same listener, and one that misses a page-count change without a page change, which is what a resize is. With them the bar is two `calc()` declarations. They sit next to the three custom properties Zag already writes on the same element, so the shape is Zag's own.

The data attribute exists for the same reason Zag puts `data-dragging` on the item group and `data-state` on most roots: so that an element other than the one owning the state can style itself by it. Zag writes `data-pressed` on the autoplay trigger only.

The marquee's `inert` exists because Zag hides a copy from assistive technology with `aria-hidden` and leaves it in the tab order, so a link in a strip with four copies would be five tab stops. Hit testing skips an inert subtree and lands on the viewport beneath, so pause on hover still works over a copy; the suite proves it.

Each extension is documented on the component page as an extension, so the contract stays readable: everything else on every element is Zag's.

## Breakpoints are tiers in the attribute

Zag has no breakpoints. A carousel that shows one slide on a phone and four on a desktop has to be told a different `slidesPerPage` at each width, and the usual answer is a listener in the consumer's framework that rebuilds the machine. That is the third thing on this component a consumer without a framework would have to script, after the progress bar and the indicators, and the rule that settled those two settles this one: the root does it.

The syntax is the attribute's own value with tiers, `slides-per-page="1 640:2 1024:4"`, on the four attributes a layout depends on: `slides-per-page`, `slides-per-move`, `spacing` and `padding`. It reads as `min-width` media queries read, mobile first, because that is the model every stylesheet already uses. The root keeps one `matchMedia` per distinct width, and a change goes through `pushProps()`, the same path an attribute write takes, so Zag re-measures and the indicators re-stamp with nothing rebuilt.

Viewport width, not the element's own width. A `ResizeObserver` would be the more self-contained choice, but a page's stylesheet switches on the viewport, and a carousel that switched on its container would disagree with the classes around it in a narrow column. Lining up with the stylesheet is worth more than self-containment here.

The cost is a syntax Zag does not have, on four attributes, and an attribute that no longer states the machine's current value in one glance. Both are documented on the component page, and a value without tiers is unchanged.

The parsing and the queries live in `src/core/tiers.ts`, because the marquee reads `speed`, `spacing` and `side` the same way. A root names its responsive attributes and hands the helper its `pushProps`.

## A part may create elements from a template

Indicators are one per page, and the page count is known only at render time, from `api.pageSnapPoints`, after Zag has measured the scroll container. A framework binding maps over that array. A custom element cannot ask its consumer to.

So `ui-carousel-indicator-group` with a `<template>` child stamps one clone per page, sets `index` on each, and adds or removes clones when the count changes. It is the one part in the package that creates elements, and it does so only when the consumer hands it a template: a group without one leaves its children alone, which is what a thumbnail strip wants. The alternatives were worse. A consumer-side listener misses a count change that arrives without a page change, and a server-rendered set is wrong whenever `slides-per-page` is above one.

A clone connects like any authored indicator and registers with the root, so the group does not render it; it only exists because of the group.

## A part may clone its consumer's markup

Zag's marquee asks for `multiplier + 1` contents, the first real and the rest copies, and the multiplier is measured from the root's width at start and on every resize. A framework binding maps over the number. A template, as the indicators use, would not do: the copies are the consumer's own children, which an editor edits in place, and a template goes stale the moment the source changes.

So `ui-marquee-viewport` treats its first content as the source and clones it, children and all, once per extra count. It strips every `id` inside a copy, because Zag looks elements up by id, and names the copy after the source when the source is named. It watches the source with a `MutationObserver` and rebuilds the copies when the children change, and watches the sizes with a `ResizeObserver` because Zag's count is computed once per connect and a `refs` write notifies nobody; the root reconnects two frames later, after Zag's own observer has written the dimensions.

The copies are cloned live DOM, and a consumer may carry things in the source that must not be copied: an editor's block identity, a directive that must not run twice. The package cannot know which, so it emits `ui-marquee:clone` with the detached copy before appending it. `dispatchEvent` is synchronous, so a listener strips what it wants and the copy enters the document already clean. Nothing about any consumer is in the package; the hook is the whole contract.

## An attribute that is also ARIA gets a prefixed name

Two of Zag's dialog props are `role` and `aria-label`, both of which it writes on the content. Neither can be an attribute of the same name on `ui-dialog`: the host has no role, so `role="alertdialog"` on it is read as ARIA in its own right, and assistive technology then sees an alertdialog wrapping a second alertdialog.

`role` becomes `content-role`, because it also changes machine defaults (an alertdialog ignores outside clicks and focuses its close trigger first) and so has to reach the machine.

`aria-label` gets no attribute at all. Zag emits the key only when its own prop is set, the normalizer drops `undefined`, and `applyProps` removes only what it wrote, so an `aria-label` the consumer writes on `ui-dialog-content` survives every render. That differs from tabs, where Zag returns `aria-label` from `getListProps` unconditionally and `translations-list-label` had to exist. The rule is: the package writes only what Zag emits, so anything Zag leaves out stays authorable, and an attribute for it would be one more thing to keep in sync.

The same rule covers the legacy presentational attributes. `align` is one: the browser maps `align="center"` on any HTML element to `text-align: center`, custom elements included, so a navigation menu viewport written with Zag's prop name had its links centred by the user agent stylesheet. The attribute is `viewport-align`. The test for a candidate name is whether the browser already means something by it on an element that is not a form control: `align`, `dir`, `hidden`, `lang` and `title` all do, and only `dir` is used here, because its meaning is the one we want.

## What ships

ESM and `.d.ts`. Consumers bundle it themselves.

One stylesheet, `ui.css`, carrying only what CSS must declare and JavaScript cannot fix in time:

```css
ui-accordion:not(:defined) ui-accordion-item-content { display: none }
[delegate] { display: contents }
```

The `:not(:defined)` rules are the reason this is a file rather than a stylesheet the package adopts on import. An adopted sheet runs after the bundle loads, by which point the browser has already painted every panel open. The accordion's animation recipe lives in the same file as a documented optional block, never as a default.

One animation is a default: the marquee's. Zag's marquee writes the duration, the delay, the loop count and the travel as custom properties on the root, toggles `data-paused` there, and restarts by resetting `style.animation` on every content, all of which assumes a stylesheet rule owns the animation. Without one the component measures, copies and pauses, and nothing moves. So `ui.css` carries the keyframes and the `animation` on `[data-scope="marquee"][data-part="content"]`, inside the layer like everything else, so a consumer's own rule wins. The header of the file names the category: an animation a machine drives through custom properties but cannot write itself.

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

### A machine tick renders synchronously

Only registrations coalesce. A notification from the running machine renders inside the subscription, which is what `@zag-js/vanilla` itself does.

Dialog is what made the difference visible. Zag's effects schedule their own frame from inside the transition, and the focus trap reads the DOM when that frame runs, looking for a tabbable node inside the content. That frame was requested before ours, so a render coalesced onto the next frame came one frame too late: the trap found the panel still `hidden`, activated on nothing, swallowed the error, and focus never moved. The same latent defect sat under popover's `auto-focus`, untested.

Two things follow. A render can tick the machine, since a part reporting an authored id during its render calls `updateProps`, so the synchronous path is guarded and a nested notification is deferred to the frame instead. And presence had to change with it: `decorate` read the presence machine's own `present`, which takes a change one tick later, so the panel was still `hidden` on the render that opened it. Presence now defers hiding only, never showing. A part asked to show is unhidden on that same render.

### Between ticks, nothing renders

That is the invariant, and it was broken for as long as presence existed without anyone noticing. `decorate` pushed `present` into the presence machine with `updateProps` on every render, `updateProps` notifies every subscriber, and the subscriber schedules a render. One render per frame, for every component with presence on, for as long as the page lived. It surfaced as a style toggled in devtools being put back a frame later.

Presence now pushes only a change of `present`. The cost of the loop had hidden a second fact: the popover test that stripped the positioner's `style` and called `reposition()` passed only because the next frame re-applied every prop. With the loop gone, what a differ strips stays stripped until a tick or a `flush()`, which is the model the dialog already documented. An idle component schedules no frame, and the popover suite asserts it.

A delegate target is an ordinary element, so unlike a child custom element it cannot announce itself. Two cases need catching: a bundle that is not deferred connects a part before its child is parsed, and a morph can swap the child for a different element. Each part therefore observes **its own children only**, never a subtree.

An earlier version observed the whole accordion subtree from the root. Measurement showed that was the wrong shape. It fired zero times during mount, because the package ships as `type="module"` and upgrades run after parsing, when children already exist. It did fire on content a merchant put inside a panel, forcing a full re-spread of all 150 parts for a change the library does not care about. Scoped per part, unrelated content churn now costs nothing.

## Props are compared against the DOM, not against a cache

`spreadProps` from `@zag-js/vanilla` remembers what it last wrote and skips an attribute whose value has not changed. That holds only while nothing else edits the DOM.

Server rendered pages break that assumption. A DOM diffing library that patches an element in place removes every attribute the incoming HTML does not carry, and Zag's attributes are all in that category: a server sends no `id`, no `data-scope`, no `data-part`, no `dir`. The element keeps its identity and loses its props, and a cache backed applier never writes them back. The failure this surfaced in was silent: Zag's `getRootEl` stopped resolving and arrow key navigation died, one re-render after load.

`applyProps` in `src/accordion/props.ts` therefore compares against the live DOM. Anything that strips an attribute gets it restored on the next render. It keeps its own record for two things the DOM cannot answer: which attributes this scope owns, so removing a prop removes the attribute, and event listeners. Listeners are registered once per event as a stable dispatcher that reads the latest props, rather than removed and re-added on every render as `spreadProps` does, because Zag returns fresh closures from every `connect`.

### `style` is applied per declaration, not as an attribute

This needed two changes, not one, and the second was only found because the first appeared to work.

The first version serialised a Zag style object to a CSS string and wrote it as an ordinary `style` attribute, on the grounds that the attribute path kept all three invariants above for free. That was wrong, and popover is what proved it.

A Zag style object is sometimes only a template. `getPositionerProps().style` contains `transform: translate3d(var(--x), var(--y), 0)`, and the coordinates never appear in the object: `@zag-js/popper` writes `--x` and `--y` directly with `setProperty` once floating-ui has measured. Replacing the whole attribute deletes them, the `transform` becomes invalid at computed-value time and resolves to `none`, and the panel lands at its containing block's origin. It would have happened on the first re-render after every open, because floating-ui's `onComplete` sets `currentPlacement`, which wakes the subscription that schedules that render.

The package also stops using `normalizeProps` from `@zag-js/vanilla`, which is where the attribute was really coming from. Its `toStyleString` flattens a style object into a CSS string before the applier ever sees it, so `applyProps` had no object to work with and no choice but to write an attribute. `src/core/normalize.ts` is a copy of it that differs in one line: a style object stays an object. Everything else, the prop renames, the lowercasing, dropping `undefined`, is unchanged.

The number input found a second difference. Vanilla renames `defaultValue` to `value`, which a cache backed applier writes once. Compared against the DOM, `value` is rewritten on every render, and a render follows every keystroke: the field's `1,` became `1` before the `5` arrived, because Zag's `defaultValue` is the formatted number and the formatted number has no trailing separator. `defaultValue` and `defaultChecked` are now written as the DOM properties they name. The browser gives them the semantics Zag means: they seed a field and stop mattering once it is dirty, and Zag writes the field's `value` itself when the machine changes it.

That ordering is worth recording as a lesson rather than a footnote. The per-declaration applier was written first, its unit tests passed because they hand it objects directly, and it was entirely inert for every real component until the normalizer changed too. A test that constructs its own input cannot tell you what the production path does.

So each declaration is compared, set and removed on its own. The invariants hold at declaration granularity rather than attribute granularity, and the component gains the property the attribute path structurally could not have: it no longer overwrites inline style it did not write. That is floating-ui's coordinates, and it is also a consumer's own `style` on the element, which the hotspot block relies on.

When it comes back matters as much as whether. The next render is a frame away, and the browser paints once in between with `data-state` missing, which restarts the animation keyed on it and, for a promoted dialog part, leaves the top layer for that frame. `flush()` on every root re-applies the api synchronously, so a consumer that runs a differ calls it from the same task and nothing is painted without the attributes.

What does not come back is a value we never wrote. A differ that strips the attribute while a popover is open takes floating-ui's coordinates with it, and `api.reposition()` is the repair. That stays the consumer's call rather than a self heal in the positioner: a morph only happens in an editor, so no storefront visitor reaches it, and the value is recoverable, unlike a lost `data-scope`.

The comparison has one more consequence, found on the carousel. Zag sometimes overrides a value from its own props imperatively: a mouse drag writes `scroll-snap-type: none` inline on the item group and restores it when the drag ends, while `getItemGroupProps().style` keeps saying `x mandatory`. A React binding never notices, since it diffs against its previous props. This applier compares against the DOM, finds `none`, and writes snapping back on at every pointer move, so the browser snapped on the first pixel. The item group part answers it by saying `none` in its own props while `api.isDragging`, so the two agree and nothing is written. The rule for the next such case: when Zag writes a declaration itself, the part mirrors it in the props for as long as Zag holds it.

What a re-render legitimately costs is worth knowing, and belongs to the consumer rather than here. A differ that keys on `id` sees a keyed live node against an unkeyed incoming one and replaces it, so child elements do not survive. State does, because the machine is keyed by the item's `value`, which the server does send. Focus does not: the focused trigger becomes a new element and the browser drops focus.

## Constraints this places on every element

Visual's morph moves nodes, so `connectedCallback` fires more than once per instance. Elements must be reconnect idempotent and must never rebuild machine state on reconnect.

The `data-scope` value comes from Zag rather than from a package prefix, so it is `accordion`, not `bp-accordion`. Consumers with existing `[data-scope="bp-accordion"]` selectors update them.

## What this does not cover

The 24 `BP*` Alpine data components in BlocksPro are not candidates. They are Bagisto coupled, reaching into the cart, the wishlist and Livewire islands, and they do not belong in a package that claims to be storefront agnostic.

Alpine does not leave the page. The host Bagisto theme loads it, and BlocksPro keeps two runtimes for the duration of the migration and possibly beyond.

`presence` is committed to as a cross component concept before the components that stress it hardest exist. A dialog's focus trap and a popover's teardown may want more than a boolean, and this decision does not pretend to have anticipated that.
