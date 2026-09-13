import type { VanillaMachine } from "@zag-js/vanilla";
type Props = Record<string, unknown>;
/** What a part needs from whatever it registers with. */
export interface PartOwner {
    readonly scopeKey: string;
    readonly presenceEnabled: boolean;
    scheduleRender(): void;
    registerId(part: string, id: string, value?: string): void;
}
/** What `authoredIds()` hands Zag: a name, or a function of the value. */
export type AuthoredIds = Record<string, string | ((value: string | number) => string | undefined)>;
/** Anything the root renders in its pass. */
export interface Renderable<TApi> {
    render(api: TApi): void;
}
/**
 * The element that owns a Zag machine.
 *
 * Zag is framework agnostic by design: a machine, plus a `connect()` that turns
 * a state snapshot into plain prop objects. Everything below is the transport
 * that gets those props onto real elements and keeps them there.
 *
 * A subclass supplies the machine, the attribute schema and the props mapping.
 * Nothing else.
 */
export declare abstract class ZagRootElement<TProps, TApi> extends HTMLElement implements PartOwner {
    #private;
    /** The live Zag api. Undefined until the element upgrades and connects. */
    get api(): TApi | undefined;
    /**
     * Scopes applied props, so two machines never fight over one node. Resolved
     * lazily: a custom element constructor cannot reach an abstract member.
     */
    get scopeKey(): string;
    get presenceEnabled(): boolean;
    /**
     * The running service, for a root that has to hand it to another machine.
     * Zag links a submenu to its parent with `setChild(service)`, not with an api.
     */
    protected get service(): VanillaMachine<any>["service"] | undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    registerId(part: string, id: string, value?: string): void;
    registerChild(child: Renderable<TApi>): void;
    unregisterChild(child: Renderable<TApi>): void;
    /**
     * Re-applies the current api to every element, now, in the caller's task.
     */
    flush(): void;
    /**
     * Renders are coalesced to one frame. Mounting registers every child and
     * every part separately, so rendering on each would be O(children x parts).
     * Measured on an accordion of 50 items and 150 parts, coalescing turns
     * roughly 200 registrations into 2 renders.
     */
    scheduleRender(): void;
    /** Used for the generated id and the event namespace, e.g. "accordion". */
    protected abstract get componentName(): string;
    protected abstract createMachine(props: () => TProps): VanillaMachine<any>;
    protected abstract connect(machine: VanillaMachine<any>): TApi;
    protected abstract machineProps(): TProps;
    /**
     * The keys in Zag's `ids` that are functions of a value rather than names:
     * `trigger` and `content` on tabs, `item`, `itemTrigger` and `itemContent`
     * on an accordion. A subclass lists them; the default is none.
     */
    protected get valueKeyedIds(): readonly string[];
    /**
     * Flat ids as they were registered. Every value-keyed key gets a function
     * that reads its map LIVE, and that is the point: `VanillaMachine` freezes
     * `ids` into its scope when it is built and never rebuilds it, so a function
     * closing over the map is what lets an item connected after the first frame
     * still be named by the consumer. Zag falls back to its own name when the
     * function returns `undefined`, so an item without an authored id costs
     * nothing. The value is a string or a number: the date picker keys its
     * inputs by index.
     */
    protected authoredIds(): AuthoredIds | undefined;
    /**
     * The id the consumer wrote, if any. Zag renames the element otherwise, and
     * a DOM differ that keys on `id` then treats the live node as incompatible
     * with the incoming one and replaces it, taking the machine with it.
     *
     * Read from the delegate target, so everything Zag faces stays on one
     * element. Nothing is cached until that element exists: with `delegate` this
     * runs before the child is parsed, and caching `null` there would freeze the
     * authored id and take the morph key with it.
     */
    protected authoredId(): string | undefined;
    /**
     * Not every machine has a root part. Popover's anatomy has no `root` at all,
     * and menu's is the same, so the fallback is everything those roots can
     * honestly claim: the scope, and nothing else.
     *
     * `data-scope` on its own is a shape Zag never emits, since it always pairs it
     * with a `data-part`. That is harmless, because every Zag DOM query matches on
     * both together, and it keeps a root recognisable in devtools whether or not
     * its machine has a root part.
     */
    protected rootProps(api: TApi): Props | null;
    /**
     * Runs once every child has rendered, and before the machine starts.
     *
     * `rootProps` runs before the children, so anything the root must do with
     * what a part computed during its own render has nowhere to go until here.
     * Dialog uses it to move its backdrop and positioner in and out of the top
     * layer, which depends on the content's presence state. Nothing else does.
     */
    protected afterRender(_api: TApi): void;
    /**
     * Runs once, right after the machine has started.
     *
     * `afterRender` cannot do this job: `send` on a machine that has not started
     * is a no-op, and everything that links two machines is a `send`. A submenu
     * registers with its parent here, and nowhere earlier.
     */
    protected afterStart(_api: TApi): void;
    /**
     * Stops the machine and builds a new one on the next render.
     *
     * For a machine whose effects bind to elements once, at start. Zag's carousel
     * subscribes its intersection and resize observers to the items it finds
     * then, and an item connected later is never observed. A restart is the only
     * way such a machine sees a changed element set. Everything the element has
     * learned stays: the children, the authored ids and the scope key, so the new
     * machine is named and rendered like the first, and `afterStart` runs again.
     */
    protected restart(): void;
    /**
     * Re-reads `machineProps()` into the running machine and renders. For a
     * root whose props come from somewhere other than its attributes: the
     * carousel counts its items, and a count changes without any attribute
     * doing so.
     */
    protected pushProps(): void;
    protected emit(name: string, detail: unknown): void;
}
export {};
//# sourceMappingURL=root.d.ts.map