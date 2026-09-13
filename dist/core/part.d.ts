import { Delegate } from "./delegate";
import type { PartOwner, Renderable } from "./root";
type Props = Record<string, unknown>;
/**
 * Every element of a component except its root.
 *
 * A part finds its owner on connect and registers with it; the owner drives
 * rendering from there. The owner is found by a brand rather than a tag name
 * or `instanceof`, so a page that loaded the package twice still works.
 *
 * The owner is the root, or another part. Nothing here needs to know which,
 * and that is the point: an accordion groups a trigger and a panel under an
 * item, a tabs list holds triggers whose panels are somewhere else entirely,
 * and both are this one class.
 *
 * Where the props land is not the part's decision either. The consumer makes
 * it, with `delegate`, and `Delegate` answers it the same way for every
 * element.
 */
export declare abstract class ZagPart<TApi, TOwner extends PartOwner> extends HTMLElement implements PartOwner, Renderable<TApi> {
    #private;
    protected scope: string | undefined;
    get scopeKey(): string;
    get presenceEnabled(): boolean;
    scheduleRender(): void;
    registerId(part: string, id: string, value?: string): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    registerPart(part: ZagPart<TApi, any>): void;
    unregisterPart(part: ZagPart<TApi, any>): void;
    render(api: TApi): void;
    protected get owner(): TOwner | null;
    /**
     * Named `delegation`, not `delegate`, and that is not cosmetic.
     *
     * TypeScript's `protected` is erased, so this accessor is a real property on
     * the prototype at runtime. `delegate` is also an attribute consumers write,
     * and a framework choosing between `setAttribute` and a property assignment
     * tests `key in el`. A property of the same name makes it pick the property,
     * write to a getter, and lose the attribute entirely.
     *
     * The rule this follows: no attribute name may be shadowed by a class
     * property, unless that property reflects back to the attribute.
     */
    protected get delegation(): Delegate;
    /**
     * The key in the machine's `ids` prop this part maps to. Parts that leave it
     * undefined take whatever id Zag generates.
     *
     * A part Zag names by value returns its key only while it has a value, and
     * returns that value from `idValue`, so the root can file the id under it.
     */
    protected get idKey(): string | undefined;
    /** The value a value-keyed part's id is filed under. Undefined for a flat one. */
    protected get idValue(): string | undefined;
    /**
     * The id the consumer wrote, if any.
     *
     * Read from the delegate target, so it is the element Zag will actually name.
     * Nothing is cached until that element exists: with `delegate` this runs before
     * the child is parsed, and caching `null` there would lose the id for good.
     */
    protected authoredId(): string | undefined;
    /** The brand of the element this part registers with. */
    protected abstract get ownerBrand(): symbol;
    protected abstract register(owner: TOwner): void;
    protected abstract unregister(owner: TOwner): void;
    protected abstract propsFor(api: TApi, owner: TOwner): Props | null;
    protected scopeFor(owner: TOwner): string;
    /** Called when the element is genuinely removed, not merely moved. */
    protected release(): void;
}
export {};
//# sourceMappingURL=part.d.ts.map