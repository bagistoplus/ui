import type { Service } from "@zag-js/core";
import type { NormalizeProps, PropTypes, RequiredBy } from "@zag-js/types";
/**
 * A machine of the package's own, in Zag's shape. Zag ships no zoom
 * component, so this file is what `@zag-js/image-zoom` would be: an anatomy,
 * a `dom` that finds elements by id through the scope, a schema, the machine
 * and a `connect()`. The elements cannot tell it from a Zag machine. See ADR
 * 0002.
 *
 * The value is the scale, `1` is the floor. Offsets are fractions of the
 * viewport, never pixels, so the machine never measures the DOM except to
 * place a pointer. An element scaled by `s` overflows its box by `(s - 1) / 2`
 * in each direction, which is the whole clamp.
 */
export type Direction = "ltr" | "rtl";
export type SwipeDirection = "next" | "previous";
export interface ValueChangeDetails {
    value: number;
}
export interface SwipeDetails {
    direction: SwipeDirection;
}
export interface IntlTranslations {
    incrementTrigger?: string | undefined;
    decrementTrigger?: string | undefined;
    resetTrigger?: string | undefined;
}
export interface ElementIds {
    root?: string | undefined;
    viewport?: string | undefined;
}
export interface Props {
    id?: string | undefined;
    ids?: ElementIds | undefined;
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
    /** The controlled scale, `1` or more. */
    value?: number | undefined;
    /** The initial scale when `value` is not written. Default 1. */
    defaultValue?: number | undefined;
    /** The largest scale. Default 4. */
    max?: number | undefined;
    /** What one increment, decrement, `+` or `-` adds. Default 0.5. */
    step?: number | undefined;
    /** The scale a click or a double tap goes to. Default 2. */
    doubleTapScale?: number | undefined;
    /** The horizontal travel, as a fraction of the viewport, that counts as a swipe. Default 0.15. */
    swipeThreshold?: number | undefined;
    disabled?: boolean | undefined;
    dir?: Direction | undefined;
    translations?: IntlTranslations | undefined;
    onValueChange?: ((details: ValueChangeDetails) => void) | undefined;
    /** A horizontal drag while the image fits. For a wrapper that shows a list. */
    onSwipe?: ((details: SwipeDetails) => void) | undefined;
}
type Schema = {
    props: RequiredBy<Props, "max" | "step" | "doubleTapScale" | "swipeThreshold" | "disabled">;
    context: {
        value: number;
        offsetX: number;
        offsetY: number;
    };
    computed: {
        disabled: boolean;
        max: number;
        step: number;
        dir: Direction;
    };
    state: "idle" | "panning" | "pinching";
    action: "applyZoom" | "applyPan" | "reset";
    event: {
        type: "ZOOM_BY";
        delta: number;
        x?: number;
        y?: number;
    } | {
        type: "ZOOM_TO";
        value: number;
        x?: number;
        y?: number;
    } | {
        type: "RESET";
    } | {
        type: "PAN_START";
    } | {
        type: "PAN_BY";
        dx: number;
        dy: number;
    } | {
        type: "PAN_END";
    } | {
        type: "PINCH_START";
    } | {
        type: "PINCH_END";
    };
};
type ElementProps = Record<string, any>;
export interface Api {
    /** The scale, `1` or more. */
    value: number;
    /** The pan, as fractions of the viewport measured from its centre. */
    offsetX: number;
    offsetY: number;
    zoomed: boolean;
    panning: boolean;
    disabled: boolean;
    canIncrement: boolean;
    canDecrement: boolean;
    setValue: (value: number) => void;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    getRootProps: () => ElementProps;
    getViewportProps: () => ElementProps;
    getImageProps: () => ElementProps;
    getIncrementTriggerProps: () => ElementProps;
    getDecrementTriggerProps: () => ElementProps;
    getResetTriggerProps: () => ElementProps;
}
export declare const anatomy: import("@zag-js/anatomy").AnatomyInstance<"image" | "root" | "viewport" | "incrementTrigger" | "decrementTrigger" | "resetTrigger">;
export declare const machine: import("@zag-js/core").Machine<Schema>;
export declare function connect(service: Service<Schema>, normalize: NormalizeProps<PropTypes>): Api;
export {};
//# sourceMappingURL=machine.d.ts.map