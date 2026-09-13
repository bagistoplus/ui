import type { Service } from "@zag-js/core";
import type { NormalizeProps, PropTypes, RequiredBy } from "@zag-js/types";
/**
 * A machine of the package's own, in Zag's shape. Zag ships no comparison
 * component, so this file is what `@zag-js/before-after` would be: an anatomy,
 * a `dom` that finds elements by id through the scope, a schema, the machine
 * and a `connect()`. The elements cannot tell it from a Zag machine. See ADR
 * 0002.
 */
export type Orientation = "horizontal" | "vertical";
export type Direction = "ltr" | "rtl";
export interface ValueChangeDetails {
    value: number;
}
export interface IntlTranslations {
    handle?: string | undefined;
    /** A template with `{value}` for the rounded percentage. */
    valueText?: string | undefined;
}
export interface ElementIds {
    root?: string | undefined;
    handle?: string | undefined;
}
export interface Props {
    id?: string | undefined;
    ids?: ElementIds | undefined;
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
    /** The controlled position, 0 to 100. */
    value?: number | undefined;
    /** The initial position when `value` is not written. Default 50. */
    defaultValue?: number | undefined;
    orientation?: Orientation | undefined;
    /** The positions the value snaps to. Default 1. */
    step?: number | undefined;
    disabled?: boolean | undefined;
    dir?: Direction | undefined;
    translations?: IntlTranslations | undefined;
    onValueChange?: ((details: ValueChangeDetails) => void) | undefined;
}
type Schema = {
    props: RequiredBy<Props, "orientation" | "step" | "disabled">;
    context: {
        value: number;
    };
    computed: {
        disabled: boolean;
        orientation: Orientation;
        step: number;
        dir: Direction;
    };
    state: "idle" | "dragging";
    action: "setValue";
    event: {
        type: "SET_VALUE";
        value: number;
    } | {
        type: "DRAG_START";
    } | {
        type: "DRAG_END";
    };
};
type ElementProps = Record<string, any>;
export interface Api {
    /** The position, 0 to 100. The percentage of the before slot that is visible. */
    value: number;
    dragging: boolean;
    disabled: boolean;
    orientation: Orientation;
    dir: Direction;
    setValue: (value: number) => void;
    getRootProps: () => ElementProps;
    getBeforeProps: () => ElementProps;
    getAfterProps: () => ElementProps;
    getSeparatorProps: () => ElementProps;
    getHandleProps: () => ElementProps;
}
export declare const anatomy: import("@zag-js/anatomy").AnatomyInstance<"root" | "before" | "after" | "separator" | "handle">;
export declare const machine: import("@zag-js/core").Machine<Schema>;
export declare function connect(service: Service<Schema>, normalize: NormalizeProps<PropTypes>): Api;
export {};
//# sourceMappingURL=machine.d.ts.map