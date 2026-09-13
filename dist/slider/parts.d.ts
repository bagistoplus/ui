import type * as slider from "@zag-js/slider";
import { ZagPart } from "../core/part";
import { SLIDER_THUMB } from "./brands";
import type { UISlider } from "./root";
type Props = Record<string, unknown>;
export type UISliderPart = ZagPart<slider.Api, UISlider | UISliderThumb>;
/** A part that hangs off the root. */
declare abstract class RootPart extends ZagPart<slider.Api, UISlider> {
    protected get ownerBrand(): symbol;
    protected register(owner: UISlider): void;
    protected unregister(owner: UISlider): void;
}
/**
 * Always `delegate`, wrapping a `<label>`. Zag writes `for` pointing at the
 * first hidden input and names every thumb by this element's id, and only a
 * real label is a form label to the browser.
 */
export declare class UISliderLabel extends RootPart {
    warned: boolean;
    protected get idKey(): string;
    render(api: slider.Api): void;
    protected propsFor(api: slider.Api): Props;
}
/** The pointer surface. Zag looks for the thumbs inside it to measure them. */
export declare class UISliderControl extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: slider.Api): Props;
}
export declare class UISliderTrack extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: slider.Api): Props;
}
/** The filled part of the track, positioned by the `--slider-range-*` properties. */
export declare class UISliderRange extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: slider.Api): Props;
}
export declare class UISliderValueText extends RootPart {
    protected get idKey(): string;
    protected propsFor(api: slider.Api): Props;
}
export declare class UISliderMarkerGroup extends RootPart {
    protected propsFor(api: slider.Api): Props;
}
/** A tick at `value`. `data-state` says whether it sits under, at or over the value. */
export declare class UISliderMarker extends RootPart {
    static readonly observedAttributes: string[];
    get value(): number | undefined;
    set value(next: number | null | undefined);
    /** Named by value: Zag's `ids.marker` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: slider.Api): Props | null;
}
/**
 * One thumb. Its index is its place among the root's thumbs unless `index`
 * is written, and it owns the hidden input and the dragging indicator
 * written inside it, which take its index.
 *
 * Zag names every thumb by the label part through `aria-labelledby`, which
 * outranks an `aria-label` written on the thumb. Two thumbs need two names,
 * so the one the consumer wrote wins: Zag's `aria-labelledby` is dropped for
 * an authored `aria-label`, and an authored `aria-labelledby` replaces it.
 */
export declare class UISliderThumb extends ZagPart<slider.Api, UISlider> {
    #private;
    static readonly observedAttributes: string[];
    get [SLIDER_THUMB](): true;
    get index(): number | null;
    set index(next: number | null | undefined);
    /** The form name of this thumb's hidden input, over the root's `name`. */
    get name(): string | undefined;
    set name(next: string | null | undefined);
    /** The index Zag is told, or `undefined` before the root has numbered it. */
    get resolvedIndex(): number | undefined;
    attributeChangedCallback(): void;
    protected get ownerBrand(): symbol;
    protected register(owner: UISlider): void;
    protected unregister(owner: UISlider): void;
    /** Named by index: Zag's `ids.thumb` is a function of it. */
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    protected propsFor(api: slider.Api): Props | null;
}
/**
 * A part of one thumb. Written inside a thumb it registers with it and takes
 * its index; written outside one it registers with the root and needs
 * `index`.
 */
declare abstract class ThumbPart extends ZagPart<slider.Api, UISlider | UISliderThumb> {
    static readonly observedAttributes: string[];
    protected get ownerBrand(): symbol;
    protected register(owner: UISlider | UISliderThumb): void;
    protected unregister(owner: UISlider | UISliderThumb): void;
    protected get thumb(): UISliderThumb | undefined;
    /** The thumb's index inside one; the written `index` outside. */
    get index(): number | undefined;
    set index(next: number | null | undefined);
}
/**
 * Always `delegate`, wrapping an `<input>`. Zag names it for the form, seeds
 * its value and writes every change into it, and a custom element is no form
 * control.
 */
export declare class UISliderHiddenInput extends ThumbPart {
    warned: boolean;
    protected get idKey(): string | undefined;
    protected get idValue(): string | undefined;
    render(api: slider.Api): void;
    protected propsFor(api: slider.Api): Props | null;
}
/** Shown while its thumb drags, `hidden` otherwise, placed where the thumb is. */
export declare class UISliderDraggingIndicator extends ThumbPart {
    protected propsFor(api: slider.Api): Props | null;
}
export {};
//# sourceMappingURL=parts.d.ts.map