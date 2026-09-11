# Architecture

For contributors. Consumers do not need this page.

## The model

Zag owns the state machine and computes DOM props. The custom elements are a thin transport that gets those props onto real elements and keeps them there. There is no reactivity system, no virtual DOM and no templating.

```
attributes  →  machine props  →  connect()  →  applyProps()  →  DOM
     ↑                                                           │
     └──────────── attributeChangedCallback ─────────────────────┘
```

## `src/core/`

Five files, none of which know about a particular component.

### `root.ts`

`ZagRootElement<TProps, TApi>`, the element that owns a machine. It handles the machine lifecycle, the child registry, coalesced rendering, the event namespace and the authored ids, its own and its parts'.

```ts
protected abstract get componentName(): string;
protected abstract createMachine(props: () => TProps): VanillaMachine<any>;
protected abstract connect(machine: VanillaMachine<any>): TApi;
protected abstract machineProps(): TProps;
```

Three behaviours worth knowing:

**The machine is built at the start of the first render and started at the end of it.** `connect()` works on an unstarted service, since the ids come from the scope and the state is the initial one, which is all the first render needs. `machine.start()` then runs once children have rendered.

Both ends of that are deferred for the same underlying reason: a custom element root connects **before any of its children are parsed**, so `connectedCallback` is too early to know anything about the subtree. Construction has to wait because `VanillaMachine` freezes `ids` into its scope in the constructor and `updateProps` never rebuilds it, so a part cannot report the id its consumer wrote after the fact. The consequence is worth knowing: an authored id is honoured for parts present in the initial markup, not for one appended later.

Deferring `start()` matters because it runs the machine's entry actions **synchronously**, and some of them query the DOM. Zag's tabs machine measures the selected trigger there and attaches the observers that keep the measurement fresh. Starting in `connectedCallback` ran all of that against an empty element, and the action bailed rather than retrying: the indicator stayed invisible until the first selection change, and never tracked a resize at all.

Every other Zag binding is already ordered this way. React calls `connect()` during render, commits the DOM, and starts the machine from an effect. This is the same sequence with an animation frame in place of the effect.

**Registrations are coalesced onto one animation frame; a machine tick renders at once.** Mounting registers every child and every part separately, so rendering per registration would be O(children × parts). Measured on 50 items and 150 parts, coalescing turns roughly 200 registrations into 2 renders. A notification from the running machine is different: Zag's effects schedule a frame from inside the transition and some read the DOM when it runs, the dialog's focus trap among them, so the render they depend on happens synchronously inside the subscription rather than a frame later.

**A disconnect is not a removal.** A DOM differ moves nodes, so `disconnectedCallback` defers one microtask and bails if the element is connected again by then. Machine creation returns early when one already exists, so state is never rebuilt on reconnect.

### `part.ts`

`ZagPart` is every element of a component except its root. It owns finding the owner by brand, the register and unregister lifecycle, a `Delegate`, and one `render(api)`.

**A part's owner is the root, or another part, and nothing here needs to know which.** `findBranded` means "nearest branded ancestor", which is the same question either way. That is what lets one class cover both anatomies the package supports: an accordion groups a trigger and a panel under an item, while a tabs list holds triggers whose panels are somewhere else in the tree entirely.

**A part may own parts.** `#parts` allocates on first use, since most parts never own anything and an accordion of 50 items carries 150 of them. `render()` applies its own props, then renders whatever it owns.

`propsFor()` returns `Props | null`, and `null` skips the **whole subtree**. It never means "no props", because every Zag part returns at least `data-scope` and `data-part`. It means the element is not in a renderable state, and nothing below it can be either.

There are no subclasses in the core. Where the props land is not the part's decision, it is the consumer's, and `delegate.ts` answers it the same way for every element.

**A part can keep the id its consumer wrote.** Zag names every element it binds, so an authored `id` is overwritten on the first render unless the machine is told to generate that name instead. A part with an `idKey` reports its authored id to the root, which passes the collection through as the machine's `ids`.

That is not cosmetic. A DOM differ keys on `id`, and morphdom treats a keyed live node against an **unkeyed** incoming one as incompatible, so it replaces the element rather than patching it. The part loses its listeners, its machine-adjacent state and anything written to it imperatively, which for a popover positioner is floating-ui's measured coordinates. Matching keys on both sides is what keeps the element alive.

With `delegate` the id belongs on the child, because the child is the element Zag names.

### `delegate.ts`

`Delegate` decides which node takes a machine's props. Without `delegate` on the host that is the host itself; with it, the host's single element child. `ZagRootElement` and `ZagPart` each own one, which is every element in the package, so the rule is written once and holds everywhere.

The target is resolved on every apply, never cached, and the previous target is released when it changes, so a swapped-out element keeps no stale Zag attributes.

A delegating host observes **its own `childList` only**, never a subtree. Its target is an ordinary element that cannot announce itself the way a child custom element does, and two cases need catching: a non-deferred bundle connects the host before its child is parsed, and a differ can swap the child later.

An earlier version observed the whole subtree from the root. Measurement showed that was wrong: it fired zero times during mount, because the package ships as `type="module"` and upgrades run after parsing, and it fired on unrelated content inside panels, forcing a full re-spread for changes the library does not care about.

### `presence.ts`

`PresenceController` keeps an element mounted through its exit animation. Its contract is to **decorate** props, never to suppress them:

```ts
return { ...props, hidden: !this.#api?.present };
```

Zag's `hidden` is replaced with a deferred one, never dropped. Dropping it is exactly the accessibility bug this package exists to avoid.

### `props.ts`

`applyProps` replaces `spreadProps` from `@zag-js/vanilla`, which caches what it last wrote and skips unchanged attributes.

That cache holds only while nothing else edits the DOM. A differ patching an element in place removes every attribute the incoming HTML did not carry, and Zag's attributes are all in that category: a server sends no `id`, no `data-scope`, no `data-part`, no `dir`. The element keeps its identity and loses its props, and a cache-backed applier never writes them back. The failure was silent: `getRootEl` stopped resolving and arrow key navigation died, one re-render after load.

So the comparison is against the **live DOM**. The module keeps its own record for only two things the DOM cannot answer: which attributes this scope owns, and event listeners. Listeners are registered once per event type as a stable dispatcher that reads the latest props, because Zag returns fresh closures from every `connect`.

A `style` prop arrives as an **object** from anything Zag positions, and it is applied **one declaration at a time** with `setProperty`, never as a `style` attribute. Custom properties pass through untouched, and everything else converts from camelCase.

Per declaration is not a detail. A Zag style object is sometimes only a template: a positioner's `transform` reads `translate3d(var(--x), var(--y), 0)`, and `@zag-js/popper` writes `--x` and `--y` itself with `setProperty` after floating-ui measures. Writing the whole `style` attribute would delete every declaration we do not own, which is those coordinates and also any inline `style` the consumer put on the element. The popover would then land in the corner of its containing block on the first re-render after opening.

All three invariants above survive at declaration granularity. Comparison is against `getPropertyValue`, so a stripped `style` attribute leaves every read empty and the next render writes them all back. Removal is the same next-versus-previous set diff, over property names instead of attribute names.

What does not come back is a value we never wrote. If a differ strips the attribute while a popover is open, floating-ui's coordinates are gone until something recomputes them, and `api.reposition()` is the documented repair. That is deliberately the consumer's call: a morph only happens in an editor, and the value is recoverable, unlike a lost `data-scope`.

### `normalize.ts`

`normalizeProps`, passed to every `connect()` in the package instead of the one from `@zag-js/vanilla`.

One line differs: a `style` object stays an object. Vanilla's `toStyleString` flattens it to a CSS string, which forces `applyProps` down the whole-attribute path and takes floating-ui's coordinates with it. Everything else matches vanilla: the same prop renames, the same lowercasing, the same dropping of `undefined`.

### `dom.ts`

`findBranded`, `boolAttribute`, `listAttribute`, `readDirection`, `defineElement`.

`boolAttribute` returns `boolean | undefined`, and the `undefined` is the interesting part: an absent attribute means the caller omits the prop entirely so the machine applies its own default. Presence gives `true`, and the literal `"false"` gives `false`. Presence alone cannot turn off a prop that defaults to `true`, and about half of Zag's booleans do.

Nothing in the package references a tag name. A child finds its owner by walking `parentElement` and testing a `Symbol.for` brand, never `closest()` and never `instanceof`, which would break on a page that loaded the package twice.

## Adding a component

There is no factory, deliberately. A survey of fourteen Zag components found six structural shapes: keys that are strings, numbers, enums and in one case an object; components with no root part; one aliasing its root to a different prop getter; several needing resolver functions and option rewriting. A configuration object covering that has to re-admit callbacks for everything interesting, at which point the configuration is code with worse types and no stack traces.

Abstract classes express all six natively. A new component supplies:

1. **`brands.ts`** — one `Symbol.for` per layer that parts register with.
2. **A root** extending `ZagRootElement`: `observedAttributes`, `componentName`, `createMachine`, `connect`, and `machineProps()` mapping attributes to props and Zag callbacks to `this.emit(...)`. The accordion's is 50 lines.
3. **Optionally a collection layer**, like `ui-accordion-item`. It implements `PartOwner` by passing through to the root. Components whose parts hang directly off the root use the root as the owner instead; `PartOwner` being an interface is the seam for that, and nothing more has been built for it because nothing exercises it yet.
4. **Parts**, each a subclass answering `ownerBrand`, `register`, `unregister` and `propsFor`.
5. **`index.ts`** — the `defineElement` calls and the tag name map. The only file that mentions a tag name.

## Testing

Tests run in real Chromium through Vitest browser mode, not jsdom. The value of this package is focus, keyboard and ARIA, which is what jsdom models worst, and an assertion that a collapsed panel is not tabbable proves nothing in a fake DOM.

```sh
npm test
UI_BROWSER_CHANNEL=chrome npm test   # skip Playwright's Chromium download
```
