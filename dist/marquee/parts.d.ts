import type * as marquee from "@zag-js/marquee";
import { ZagPart } from "../core/part";
import { MARQUEE_CONTENT } from "./brands";
import { type UIMarquee } from "./root";
type Props = Record<string, unknown>;
export type UIMarqueePart = ZagPart<marquee.Api, UIMarquee>;
declare abstract class MarqueePart extends ZagPart<marquee.Api, UIMarquee> {
    protected get ownerBrand(): symbol;
    protected register(owner: UIMarquee): void;
    protected unregister(owner: UIMarquee): void;
}
/**
 * The row of contents, and the one part that creates elements.
 *
 * Zag renders `contentCount` contents: the first is the real one, the rest
 * are copies that fill the root so the loop never shows a gap. The count is
 * known only here, at render time, and it changes with the root's width, so
 * the copies cannot be authored. The first content child is the source; the
 * viewport clones its children once per extra count, and clones them again
 * when the source changes or the sizes do.
 *
 * A copy is built detached, handed to the consumer through `ui-marquee:clone`,
 * and appended afterwards. `dispatchEvent` is synchronous, so a listener that
 * strips an attribute does it before the copy is ever in the document.
 */
export declare class UIMarqueeViewport extends MarqueePart {
    #private;
    protected get idKey(): string;
    connectedCallback(): void;
    protected register(owner: UIMarquee): void;
    protected unregister(owner: UIMarquee): void;
    protected propsFor(api: marquee.Api): Props;
    /**
     * The name of the content at `index`: the source's own, or one derived
     * from it. The source is looked up here and not only at the first stamp,
     * because the root asks for the names during the render that precedes it,
     * and Zag then looks the source up by that name when it starts.
     */
    contentName(index: number): string | undefined;
    /** One copy per extra content. Called by the root after every render. */
    stamp(api: marquee.Api): void;
    protected release(): void;
}
/**
 * One track of items. The source is the one without `index`, or with `index`
 * 0; a copy carries the index the viewport gave it. A copy is `inert` on top
 * of Zag's `aria-hidden`, so a link inside it is not a second tab stop.
 */
export declare class UIMarqueeContent extends MarqueePart {
    static readonly observedAttributes: string[];
    get [MARQUEE_CONTENT](): true;
    get index(): number | null;
    /**
     * Reflected, for the reason the tabs trigger gives for `value`: a framework
     * that renders these elements tests `key in el` before choosing between a
     * property write and `setAttribute`, and a getter-only property swallows it.
     */
    set index(next: number | null);
    /** The id the consumer wrote, for the root's `ids.content` lookup. */
    get authoredName(): string | undefined;
    connectedCallback(): void;
    protected propsFor(api: marquee.Api): Props;
}
export declare class UIMarqueeItem extends MarqueePart {
    protected propsFor(api: marquee.Api): Props;
}
export declare class UIMarqueeEdge extends MarqueePart {
    static readonly observedAttributes: string[];
    protected propsFor(api: marquee.Api): Props;
}
export {};
//# sourceMappingURL=parts.d.ts.map