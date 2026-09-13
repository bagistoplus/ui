import * as marquee from "@zag-js/marquee";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { MARQUEE_ROOT } from "./brands";
import type { UIMarqueeViewport } from "./parts";
/** What `ui-marquee:clone` carries. The clone is not in the document yet. */
export interface CloneDetails {
    clone: Element;
    index: number;
    source: Element;
}
/** One of Zag's four sides, or `undefined` for anything else. */
export declare function sideOf(value: string | null | undefined): marquee.Side | undefined;
/**
 * Zag's marquee measures its root and its first content, works out how many
 * copies fill the root, and expects the consumer to render that many. The
 * copies are the viewport's job here; the root only tells it when to look.
 */
export declare class UIMarquee extends ZagRootElement<marquee.Props, marquee.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [MARQUEE_ROOT](): true;
    protected get componentName(): string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(): void;
    protected createMachine(props: () => marquee.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): marquee.Api;
    protected machineProps(): marquee.Props;
    /**
     * A side change rebuilds the machine instead of updating it.
     *
     * Zag watches `side` and recalculates the duration, but from the dimensions
     * it last measured, which were taken along the old axis: a row's width for
     * what is now a column. Its observer re-measures once the layout has
     * flipped, into a ref that recalculates nothing, so the wrong duration
     * stays until `speed` or `spacing` change. A new machine measures at start,
     * after the render that wrote the new axis. The pause state goes with it.
     */
    protected pushProps(): void;
    protected afterStart(): void;
    /**
     * The copies are stamped once every part has rendered, not from the
     * viewport's own render. The source is cloned with whatever attributes its
     * items carry at that moment, so a copy made before the items rendered would
     * lack their props until the next frame.
     */
    protected afterRender(api: marquee.Api): void;
    registerViewport(viewport: UIMarqueeViewport): void;
    unregisterViewport(viewport: UIMarqueeViewport): void;
    /**
     * Reconnects the api to what Zag has measured. `contentCount` is computed
     * at connect, so a resize Zag observed on its own is invisible until the
     * next connect, and nothing else in Zag triggers one.
     */
    refresh(): void;
    /** Emits `ui-marquee:clone`, for the viewport, before the copy is appended. */
    cloned(details: CloneDetails): void;
}
//# sourceMappingURL=root.d.ts.map