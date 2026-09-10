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

`ZagRootElement<TProps, TApi>`, the element that owns a machine. It handles the machine lifecycle, the child registry, coalesced rendering, the event namespace and the authored id capture.

```ts
protected abstract get componentName(): string;
protected abstract createMachine(props: () => TProps): VanillaMachine<any>;
protected abstract connect(machine: VanillaMachine<any>): TApi;
protected abstract machineProps(): TProps;
```

Two behaviours worth knowing:

**Renders are coalesced onto one animation frame.** Mounting registers every child and every part separately, so rendering per registration would be O(children × parts). Measured on 50 items and 150 parts, coalescing turns roughly 200 registrations into 2 renders.

**A disconnect is not a removal.** A DOM differ moves nodes, so `disconnectedCallback` defers one microtask and bails if the element is connected again by then. `#start()` returns early when a machine already exists, so state is never rebuilt on reconnect.

### `part.ts`

`ZagPart` owns finding the owner by brand, the register / unregister lifecycle, and one `render()`. There are no subclasses: where the props land is not the part's decision, it is the consumer's, and `delegate.ts` answers it the same way for every element.

### `delegate.ts`

`Delegate` decides which node takes a machine's props. Without `delegate` on the host that is the host itself; with it, the host's single element child. `ZagRootElement`, `UIAccordionItem` and `ZagPart` each own one, so the rule is written once and holds for the root, the collection layer and every part alike.

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

### `dom.ts`

`findBranded`, `listAttribute`, `readDirection`, `defineElement`.

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
