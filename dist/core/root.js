import { Delegate } from "./delegate";
import { boolAttribute } from "./dom";
let sequence = 0;
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
export class ZagRootElement extends HTMLElement {
    #children = new Set();
    #delegate = new Delegate(this, () => this.scheduleRender());
    #partIds = new Map();
    #valueIds = new Map();
    #id;
    #machine;
    #started = false;
    #api;
    #unsubscribe;
    #frame = 0;
    #rendering = false;
    // `undefined` means not captured yet. Zag's root props carry an id, so this
    // has to be read before the first render writes Zag's own id over it.
    #authoredId;
    /** The live Zag api. Undefined until the element upgrades and connects. */
    get api() {
        return this.#api;
    }
    /**
     * Scopes applied props, so two machines never fight over one node. Resolved
     * lazily: a custom element constructor cannot reach an abstract member.
     */
    get scopeKey() {
        this.#id ??= `ui-${this.componentName}-${++sequence}`;
        return this.#id;
    }
    get presenceEnabled() {
        return boolAttribute(this, "presence") ?? false;
    }
    /**
     * The running service, for a root that has to hand it to another machine.
     * Zag links a submenu to its parent with `setChild(service)`, not with an api.
     */
    get service() {
        return this.#machine?.service;
    }
    connectedCallback() {
        this.#delegate.observe();
        this.scheduleRender();
    }
    disconnectedCallback() {
        // A morph moves nodes, so a disconnect is not a removal. Wait one
        // microtask: a move is already back in the document by then.
        queueMicrotask(() => {
            if (this.isConnected) {
                return;
            }
            this.#delegate.disconnect();
            this.#stop();
        });
    }
    attributeChangedCallback() {
        if (!this.#machine) {
            return;
        }
        this.pushProps();
    }
    registerId(part, id, value) {
        if (value != null) {
            this.#registerValueId(part, value, id);
            return;
        }
        if (this.#partIds.get(part) === id) {
            return;
        }
        this.#partIds.set(part, id);
        // The machine may already be running: a part can connect at any time.
        this.pushProps();
    }
    registerChild(child) {
        this.#children.add(child);
        this.scheduleRender();
    }
    unregisterChild(child) {
        this.#children.delete(child);
    }
    /**
     * Re-applies the current api to every element, now, in the caller's task.
     */
    flush() {
        if (!this.#api) {
            this.scheduleRender();
            return;
        }
        this.#renderNow();
    }
    /**
     * Renders are coalesced to one frame. Mounting registers every child and
     * every part separately, so rendering on each would be O(children x parts).
     * Measured on an accordion of 50 items and 150 parts, coalescing turns
     * roughly 200 registrations into 2 renders.
     */
    scheduleRender() {
        if (this.#frame) {
            return;
        }
        this.#frame = requestAnimationFrame(() => {
            this.#frame = 0;
            this.#render();
        });
    }
    /**
     * The keys in Zag's `ids` that are functions of a value rather than names:
     * `trigger` and `content` on tabs, `item`, `itemTrigger` and `itemContent`
     * on an accordion. A subclass lists them; the default is none.
     */
    get valueKeyedIds() {
        return [];
    }
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
    authoredIds() {
        const ids = Object.fromEntries(this.#partIds);
        for (const key of this.valueKeyedIds) {
            ids[key] = (value) => this.#valueIds.get(key)?.get(String(value));
        }
        return Object.keys(ids).length > 0 ? ids : undefined;
    }
    /** No `updateProps` here: the function handed to Zag reads the map as it is now. */
    #registerValueId(part, value, id) {
        let ids = this.#valueIds.get(part);
        if (!ids) {
            ids = new Map();
            this.#valueIds.set(part, ids);
        }
        if (ids.get(value) === id) {
            return;
        }
        ids.set(value, id);
        this.scheduleRender();
    }
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
    authoredId() {
        if (this.#authoredId === undefined) {
            const target = this.#delegate.target();
            if (!target) {
                return undefined;
            }
            this.#authoredId = target.getAttribute("id");
        }
        return this.#authoredId ?? undefined;
    }
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
    rootProps(api) {
        return api.getRootProps?.() ?? { "data-scope": this.componentName };
    }
    /**
     * Runs once every child has rendered, and before the machine starts.
     *
     * `rootProps` runs before the children, so anything the root must do with
     * what a part computed during its own render has nowhere to go until here.
     * Dialog uses it to move its backdrop and positioner in and out of the top
     * layer, which depends on the content's presence state. Nothing else does.
     */
    afterRender(_api) { }
    /**
     * Runs once, right after the machine has started.
     *
     * `afterRender` cannot do this job: `send` on a machine that has not started
     * is a no-op, and everything that links two machines is a `send`. A submenu
     * registers with its parent here, and nowhere earlier.
     */
    afterStart(_api) { }
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
    restart() {
        if (!this.#machine) {
            return;
        }
        this.#stop();
        this.scheduleRender();
    }
    /**
     * Re-reads `machineProps()` into the running machine and renders. For a
     * root whose props come from somewhere other than its attributes: the
     * carousel counts its items, and a count changes without any attribute
     * doing so.
     */
    pushProps() {
        this.#machine?.updateProps(() => this.machineProps());
        this.scheduleRender();
    }
    emit(name, detail) {
        this.dispatchEvent(new CustomEvent(`ui-${this.componentName}:${name}`, { detail, bubbles: true }));
    }
    /**
     * Builds the machine and connects an api, but does NOT start it.
     *
     * `connect()` works on an unstarted service: the ids come from the scope and
     * the state is the initial one, which is exactly what the first render needs.
     *
     * Called from the first render rather than from `connectedCallback`, and that is
     * not a detail. `VanillaMachine` freezes `ids` into its scope when it is
     * constructed and `updateProps` never rebuilds it, while a custom element root
     * connects before any of its children are parsed. Waiting one frame is what lets
     * the parts report the ids their consumer wrote first. The consequence is that an
     * authored id is honoured for parts in the initial markup, not for one appended
     * later.
     */
    #create() {
        if (this.#machine) {
            return;
        }
        const machine = this.createMachine(() => this.machineProps());
        this.#machine = machine;
        this.#unsubscribe = machine.subscribe(() => {
            this.#api = this.connect(machine);
            this.#renderNow();
        });
        this.#api = this.connect(machine);
    }
    #stop() {
        if (this.#frame) {
            cancelAnimationFrame(this.#frame);
            this.#frame = 0;
        }
        this.#unsubscribe?.();
        this.#machine?.stop();
        this.#unsubscribe = undefined;
        this.#machine = undefined;
        this.#api = undefined;
        this.#started = false;
    }
    /**
     * A machine tick renders synchronously; only registrations coalesce.
     *
     * Zag's effects schedule their own frame from inside the transition, and
     * some of them read the DOM when it runs: the dialog's focus trap looks for
     * a tabbable node inside the content. That frame was requested before ours,
     * so a render coalesced onto the next frame would come one frame too late,
     * the trap would find the panel still `hidden`, and focus would silently
     * never move. Rendering inside the subscription is what `@zag-js/vanilla`
     * itself does.
     */
    #renderNow() {
        if (this.#rendering) {
            this.scheduleRender();
            return;
        }
        if (this.#frame) {
            cancelAnimationFrame(this.#frame);
            this.#frame = 0;
        }
        this.#render();
    }
    #render() {
        this.#rendering = true;
        try {
            this.#create();
            const api = this.#api;
            if (!api) {
                return;
            }
            const props = this.rootProps(api);
            if (props) {
                this.#delegate.apply(props, this.scopeKey);
            }
            for (const child of this.#children) {
                child.render(api);
            }
            this.afterRender(api);
            if (!this.#started && this.#machine) {
                this.#started = true;
                this.#machine.start();
                this.afterStart(api);
            }
        }
        finally {
            this.#rendering = false;
        }
    }
}
//# sourceMappingURL=root.js.map