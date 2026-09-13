import { createAnatomy } from "@zag-js/anatomy";
import { createMachine } from "@zag-js/core";
import { getEventPoint, getRelativePoint, trackPointerMove } from "@zag-js/dom-query";

import type { Scope, Service } from "@zag-js/core";
import type { JSX, NormalizeProps, PropTypes, RequiredBy } from "@zag-js/types";

import { capturePointer, isInteractiveTarget, releasePointer } from "../core/pointer";

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
  event: { type: "SET_VALUE"; value: number } | { type: "DRAG_START" } | { type: "DRAG_END" };
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

export const anatomy = createAnatomy("before-after").parts("root", "before", "after", "separator", "handle");

const parts = anatomy.build();

const dom = {
  getRootId: (scope: Scope) => scope.ids?.root ?? `before-after:${scope.id}`,
  getHandleId: (scope: Scope) => scope.ids?.handle ?? `before-after:${scope.id}:handle`,
  getRootEl: (scope: Scope) => scope.getById(dom.getRootId(scope)),
  getHandleEl: (scope: Scope) => scope.getById(dom.getHandleId(scope)),
};

export const machine = createMachine<Schema>({
  props({ props }) {
    return {
      orientation: "horizontal",
      step: 1,
      disabled: false,
      ...props,
    };
  },

  initialState() {
    return "idle";
  },

  context({ bindable, prop }) {
    return {
      value: bindable<number>(() => ({
        defaultValue: normalize(prop("defaultValue") ?? 50, prop("step") ?? 1),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value });
        },
      })),
    };
  },

  computed: {
    disabled: ({ prop }) => Boolean(prop("disabled")),
    orientation: ({ prop }) => prop("orientation") ?? "horizontal",
    step: ({ prop }) => Math.max(1, Number(prop("step") ?? 1)),
    dir: ({ prop }) => prop("dir") ?? "ltr",
  },

  on: {
    SET_VALUE: {
      actions: ["setValue"],
    },
  },

  states: {
    idle: {
      on: {
        DRAG_START: {
          target: "dragging",
        },
      },
    },
    dragging: {
      on: {
        DRAG_END: {
          target: "idle",
        },
      },
    },
  },

  implementations: {
    actions: {
      setValue({ context, computed, event }) {
        context.set("value", normalize(event.value, computed("step")));
      },
    },
  },
});

export function connect(service: Service<Schema>, normalize: NormalizeProps<PropTypes>): Api {
  const { context, computed, state, prop, scope, send } = service;

  // Clamped here as well as on every set, so a controlled value outside the
  // range renders and announces the nearest edge.
  const value = clamp(context.get("value"));
  const orientation = computed("orientation");
  const dir = computed("dir");
  const disabled = computed("disabled");
  const dragging = state.matches("dragging");
  const translations = prop("translations") ?? {};

  const setValue = (nextValue: number) => {
    if (disabled) {
      return;
    }

    send({ type: "SET_VALUE", value: nextValue });
  };

  const root = () => dom.getRootEl(scope) ?? scope.getDoc().documentElement;

  return {
    value,
    dragging,
    disabled,
    orientation,
    dir,
    setValue,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir,
        "data-orientation": orientation,
        "data-disabled": disabled ? "" : undefined,
        "data-dragging": dragging ? "" : undefined,
        style: {
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
        },
        onPointerDown(event: JSX.PointerEvent<HTMLElement>) {
          if (disabled || isFromHandle(scope, event.target) || isInteractiveTarget(event.target)) {
            return;
          }

          event.preventDefault();
          setValue(valueFromPoint(getEventPoint(event), root(), orientation, dir));
          dom.getHandleEl(scope)?.focus();
        },
      });
    },

    getBeforeProps() {
      return normalize.element({
        ...parts.before.attrs,
        style: {
          position: "absolute",
          inset: "0",
          clipPath: beforeClipPath(value, orientation, dir),
        },
      });
    },

    getAfterProps() {
      return normalize.element({
        ...parts.after.attrs,
        style: {
          position: "absolute",
          inset: "0",
          clipPath: afterClipPath(value, orientation, dir),
        },
      });
    },

    getSeparatorProps() {
      return normalize.element({
        ...parts.separator.attrs,
        "aria-hidden": "true",
        "data-orientation": orientation,
        style: separatorStyle(value, orientation, dir),
      });
    },

    getHandleProps() {
      return normalize.element({
        ...parts.handle.attrs,
        id: dom.getHandleId(scope),
        role: "slider",
        tabIndex: disabled ? -1 : 0,
        "aria-disabled": disabled,
        "aria-label": translations.handle,
        "aria-orientation": orientation,
        "aria-valuemax": 100,
        "aria-valuemin": 0,
        "aria-valuenow": Math.round(value),
        "aria-valuetext": valueText(translations.valueText, value),
        "data-orientation": orientation,
        style: handleStyle(value, orientation, dir),
        onKeyDown(event: JSX.KeyboardEvent<HTMLElement>) {
          const nextValue = keyValue(event, { dir, orientation, value });

          if (nextValue === null) {
            return;
          }

          event.preventDefault();
          setValue(nextValue);
        },
        onPointerDown(event: JSX.PointerEvent<HTMLElement>) {
          if (disabled) {
            return;
          }

          const handle = event.currentTarget;

          if (!(handle instanceof Element)) {
            return;
          }

          const surface = root();

          event.preventDefault();
          capturePointer(handle, event.pointerId);
          setValue(valueFromPoint(getEventPoint(event), surface, orientation, dir));
          send({ type: "DRAG_START" });

          const stop = trackPointerMove(scope.getDoc(), {
            onPointerMove({ point }) {
              setValue(valueFromPoint(point, surface, orientation, dir));
            },
            onPointerUp({ event: upEvent }) {
              releasePointer(handle, upEvent.pointerId);
              send({ type: "DRAG_END" });
              stop();
            },
          });
        },
      });
    },
  };
}

interface KeyContext {
  dir: Direction;
  orientation: Orientation;
  value: number;
}

function keyValue(event: JSX.KeyboardEvent<HTMLElement>, context: KeyContext): number | null {
  const step = event.key === "PageUp" || event.key === "PageDown" ? 10 : 1;

  if (event.key === "Home") {
    return 0;
  }

  if (event.key === "End") {
    return 100;
  }

  if (event.key === "PageUp") {
    return context.value + step;
  }

  if (event.key === "PageDown") {
    return context.value - step;
  }

  if (context.orientation === "vertical") {
    if (event.key === "ArrowDown") {
      return context.value + step;
    }

    if (event.key === "ArrowUp") {
      return context.value - step;
    }

    return null;
  }

  if (event.key === "ArrowRight") {
    return context.value + (context.dir === "rtl" ? -step : step);
  }

  if (event.key === "ArrowLeft") {
    return context.value + (context.dir === "rtl" ? step : -step);
  }

  return null;
}

function valueFromPoint(
  point: { x: number; y: number },
  surface: Element,
  orientation: Orientation,
  dir: Direction,
): number {
  if (!(surface instanceof HTMLElement)) {
    return 50;
  }

  const relative = getRelativePoint(point, surface);

  return clamp(relative.getPercentValue({ dir, orientation }) * 100);
}

function isFromHandle(scope: Scope, target: EventTarget | null): boolean {
  return target instanceof Node ? Boolean(dom.getHandleEl(scope)?.contains(target)) : false;
}

function beforeClipPath(value: number, orientation: Orientation, dir: Direction): string {
  if (orientation === "vertical") {
    return `inset(0 0 ${100 - value}% 0)`;
  }

  return dir === "rtl" ? `inset(0 0 0 ${100 - value}%)` : `inset(0 ${100 - value}% 0 0)`;
}

function afterClipPath(value: number, orientation: Orientation, dir: Direction): string {
  if (orientation === "vertical") {
    return `inset(${value}% 0 0 0)`;
  }

  return dir === "rtl" ? `inset(0 ${value}% 0 0)` : `inset(0 0 0 ${value}%)`;
}

function separatorStyle(value: number, orientation: Orientation, dir: Direction): Record<string, string> {
  if (orientation === "vertical") {
    return {
      position: "absolute",
      left: "0",
      right: "0",
      top: `${value}%`,
      transform: "translateY(-50%)",
    };
  }

  return {
    position: "absolute",
    top: "0",
    bottom: "0",
    left: `${dir === "rtl" ? 100 - value : value}%`,
    transform: "translateX(-50%)",
  };
}

function handleStyle(value: number, orientation: Orientation, dir: Direction): Record<string, string> {
  if (orientation === "vertical") {
    return {
      position: "absolute",
      left: "50%",
      top: `${value}%`,
      transform: "translate(-50%, -50%)",
    };
  }

  return {
    position: "absolute",
    left: `${dir === "rtl" ? 100 - value : value}%`,
    top: "50%",
    transform: "translate(-50%, -50%)",
  };
}

function valueText(template: string | undefined, value: number): string {
  const rounded = String(Math.round(value));

  return template ? template.replaceAll("{value}", rounded) : `${rounded} percent`;
}

function normalize(value: number, step: number): number {
  return clamp(Math.round(value / step) * step);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 50));
}
