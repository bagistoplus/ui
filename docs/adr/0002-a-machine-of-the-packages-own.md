# A machine of the package's own

ADR 0001 says the package ships headless custom elements built on Zag machines. This records the one case where the machine is not Zag's, and what that case must look like.

## The case

Zag has no comparison component. BlocksPro's before/after block needed one, a reveal between two stacked slots, dragged by a handle, moved by a press on the surface and by the arrow keys, clipped by writing direction. BlocksPro wrote it against `@zag-js/core` and drove it through the same Alpine adapter as the Zag machines. When the block moved onto custom elements, the machine had two places to go: stay in the consumer, which would need the package to export its base classes, or come into the package as a component.

It came into the package. The element layer is the package's value, and it never inspects what a machine is. A machine built with `@zag-js/core`, `@zag-js/anatomy` and `@zag-js/dom-query` is a Zag machine in every way that layer can observe. Exporting the base classes instead would have made `ZagRootElement`, `ZagPart` and `Delegate` public API for the sake of one consumer, and left the same question open for the next behaviour Zag lacks.

## The bar

A machine the package writes is held to Zag's shape, so that a Zag package could replace it the day one exists and no element would change:

- One `machine.ts` next to `root.ts` and `parts.ts`, holding what a `@zag-js/*` package splits into files: the anatomy from `createAnatomy`, a `dom` object that finds elements by id through the scope with `ids` overrides, the schema, `createMachine`, and a `connect()` that takes the normalizer and returns `get*Props` getters carrying the anatomy's `data-scope` and `data-part`.
- Zag's prop names and Zag's shapes. `value` is controlled and `defaultValue` seeds, `disabled`, `dir`, `orientation`, `translations`, `onValueChange` with a details object. Nothing invents a third way to hold a value.
- No knowledge of any consumer. The machine finds its root by id, never by an attribute a host framework wrote, and its tests are the same browser tests every component has.

The before/after is the first. Its `data-scope` is `before-after`, and its machine is 400 lines of pointer, keyboard and clip path arithmetic that a consumer could not have written better on the element side.

## What this does not decide

Whether a second such machine belongs here is decided when one is asked for. A behaviour that reaches into a storefront's cart or a host's session is not a candidate, for the reason ADR 0001 gives for the `BP*` Alpine components: the package claims to be storefront agnostic.
