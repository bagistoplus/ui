import { createAnatomy } from "@zag-js/anatomy";
import { createMachine } from "@zag-js/core";

import type { Scope, Service } from "@zag-js/core";
import type { JSX, NormalizeProps, PropTypes, RequiredBy } from "@zag-js/types";

import { capturePointer, isInteractiveTarget } from "../core/pointer";

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
  event:
    | { type: "ZOOM_BY"; delta: number; x?: number; y?: number }
    | { type: "ZOOM_TO"; value: number; x?: number; y?: number }
    | { type: "RESET" }
    | { type: "PAN_START" }
    | { type: "PAN_BY"; dx: number; dy: number }
    | { type: "PAN_END" }
    | { type: "PINCH_START" }
    | { type: "PINCH_END" };
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

export const anatomy = createAnatomy("image-zoom").parts(
  "root",
  "viewport",
  "image",
  "incrementTrigger",
  "decrementTrigger",
  "resetTrigger",
);

const parts = anatomy.build();

const dom = {
  getRootId: (scope: Scope) => scope.ids?.root ?? `image-zoom:${scope.id}`,
  getViewportId: (scope: Scope) => scope.ids?.viewport ?? `image-zoom:${scope.id}:viewport`,
  getRootEl: (scope: Scope) => scope.getById(dom.getRootId(scope)),
  getViewportEl: (scope: Scope) => scope.getById(dom.getViewportId(scope)),
};

export const machine = createMachine<Schema>({
  props({ props }) {
    return {
      max: 4,
      step: 0.5,
      doubleTapScale: 2,
      swipeThreshold: 0.15,
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
        defaultValue: Math.max(1, prop("defaultValue") ?? 1),
        value: prop("value"),
        onChange(value) {
          prop("onValueChange")?.({ value });
        },
      })),
      offsetX: bindable<number>(() => ({ defaultValue: 0 })),
      offsetY: bindable<number>(() => ({ defaultValue: 0 })),
    };
  },

  computed: {
    disabled: ({ prop }) => Boolean(prop("disabled")),
    max: ({ prop }) => Math.max(1, Number(prop("max") ?? 4)),
    step: ({ prop }) => Math.max(0.1, Number(prop("step") ?? 0.5)),
    dir: ({ prop }) => prop("dir") ?? "ltr",
  },

  on: {
    ZOOM_BY: { actions: ["applyZoom"] },
    ZOOM_TO: { actions: ["applyZoom"] },
    RESET: { actions: ["reset"] },
    PAN_BY: { actions: ["applyPan"] },
  },

  states: {
    idle: {
      on: {
        PAN_START: { target: "panning" },
        PINCH_START: { target: "pinching" },
      },
    },
    panning: {
      on: {
        PAN_END: { target: "idle" },
        PINCH_START: { target: "pinching" },
      },
    },
    pinching: {
      on: {
        PINCH_END: { target: "idle" },
      },
    },
  },

  implementations: {
    actions: {
      applyZoom({ context, computed, event }) {
        const from = context.get("value");
        const to = clamp(event.type === "ZOOM_TO" ? event.value : from + event.delta, 1, computed("max"));

        if (to === from) {
          return;
        }

        // Keep whatever sits under the focal point exactly where it is.
        const focalX = event.x ?? 0;
        const focalY = event.y ?? 0;
        const offsetX = focalX - ((focalX - context.get("offsetX")) * to) / from;
        const offsetY = focalY - ((focalY - context.get("offsetY")) * to) / from;

        context.set("value", to);
        context.set("offsetX", clampOffset(offsetX, to));
        context.set("offsetY", clampOffset(offsetY, to));
      },
      applyPan({ context, event }) {
        if (event.type !== "PAN_BY") {
          return;
        }

        const value = context.get("value");

        context.set("offsetX", clampOffset(context.get("offsetX") + event.dx, value));
        context.set("offsetY", clampOffset(context.get("offsetY") + event.dy, value));
      },
      reset({ context }) {
        context.set("value", 1);
        context.set("offsetX", 0);
        context.set("offsetY", 0);
      },
    },
  },
});

export function connect(service: Service<Schema>, normalize: NormalizeProps<PropTypes>): Api {
  const { context, computed, state, prop, scope, send } = service;

  const disabled = computed("disabled");
  const max = computed("max");
  const step = computed("step");
  const dir = computed("dir");

  // Clamped here as well as on every set, so a controlled value outside the
  // range renders at the nearest edge, and the pan it allows follows it.
  const value = clamp(context.get("value"), 1, max);
  const offsetX = clampOffset(context.get("offsetX"), value);
  const offsetY = clampOffset(context.get("offsetY"), value);
  const panning = state.matches("panning");
  const zoomed = value > 1;
  const translations = prop("translations") ?? {};

  const zoomBy = (delta: number, focal?: Point) => {
    if (disabled) {
      return;
    }

    send({ type: "ZOOM_BY", delta, x: focal?.x, y: focal?.y });
  };

  const zoomTo = (next: number, focal?: Point) => {
    if (disabled) {
      return;
    }

    send({ type: "ZOOM_TO", value: next, x: focal?.x, y: focal?.y });
  };

  const reset = () => send({ type: "RESET" });

  const toggleZoom = (focal: Point) => {
    if (zoomed) {
      reset();

      return;
    }

    zoomTo(Number(prop("doubleTapScale") ?? 2), focal);
  };

  return {
    value,
    offsetX,
    offsetY,
    zoomed,
    panning,
    disabled,
    canIncrement: !disabled && value < max,
    canDecrement: !disabled && zoomed,
    setValue: (next) => zoomTo(next),
    increment: () => zoomBy(step),
    decrement: () => zoomBy(-step),
    reset,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        dir,
        "data-zoomed": zoomed ? "" : undefined,
        "data-panning": panning ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
      });
    },

    getViewportProps() {
      return normalize.element({
        ...parts.viewport.attrs,
        id: dom.getViewportId(scope),
        "data-zoomed": zoomed ? "" : undefined,
        "data-panning": panning ? "" : undefined,
        "data-disabled": disabled ? "" : undefined,
        tabIndex: disabled ? -1 : 0,
        style: {
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
          cursor: zoomed ? (panning ? "grabbing" : "grab") : "zoom-in",
        },
        onPointerDown(event: JSX.PointerEvent<HTMLElement>) {
          if (disabled || isInteractiveTarget(event.target)) {
            return;
          }

          startPointer(service, event, { toggleZoom, zoomTo });
        },
        onWheel(event: JSX.WheelEvent<HTMLElement>) {
          if (disabled || !event.ctrlKey) {
            return;
          }

          event.preventDefault();
          zoomBy(event.deltaY > 0 ? -step : step, focalPoint(event, event.currentTarget));
        },
        onKeyDown(event: JSX.KeyboardEvent<HTMLElement>) {
          if (disabled) {
            return;
          }

          handleKey(event, { zoomBy, reset, step, zoomed, send });
        },
      });
    },

    getImageProps() {
      return normalize.element({
        ...parts.image.attrs,
        // The string, not the boolean: absent, the browser drags an `<img>`.
        draggable: "false",
        style: {
          transformOrigin: "center center",
          transform: `translate(${offsetX * 100}%, ${offsetY * 100}%) scale(${value})`,
        },
      });
    },

    getIncrementTriggerProps() {
      return normalize.button({
        ...parts.incrementTrigger.attrs,
        type: "button",
        disabled: disabled || value >= max,
        "aria-label": translations.incrementTrigger,
        onClick: () => zoomBy(step),
      });
    },

    getDecrementTriggerProps() {
      return normalize.button({
        ...parts.decrementTrigger.attrs,
        type: "button",
        disabled: disabled || !zoomed,
        "aria-label": translations.decrementTrigger,
        onClick: () => zoomBy(-step),
      });
    },

    getResetTriggerProps() {
      return normalize.button({
        ...parts.resetTrigger.attrs,
        type: "button",
        disabled: disabled || !zoomed,
        "aria-label": translations.resetTrigger,
        onClick: reset,
      });
    },
  };
}

type Point = { x: number; y: number };

/** What the handlers read. Zag's JSX event types and the native ones both have these. */
type PointerLike = Pick<PointerEvent, "currentTarget" | "pointerId" | "pointerType" | "clientX" | "clientY">;
type KeyLike = Pick<KeyboardEvent, "key" | "preventDefault" | "stopPropagation">;

type PointerSession = {
  pointers: Map<number, Point>;
  origin: Point;
  last: Point;
  pinchDistance: number;
  pinchScale: number;
  moved: boolean;
  pointerType: string;
  cleanup: () => void;
};

const sessions = new WeakMap<Element, PointerSession>();

/**
 * A double tap has to be recognised by hand: `dblclick` is not dependable on
 * touch, and the second tap must land close to the first to count.
 */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DISTANCE = 0.05;

/**
 * A click is never perfectly still. Below this the pointer counts as having
 * stayed put, so a trackpad wobble does not swallow the zoom.
 */
const TAP_MOVE_TOLERANCE = 0.01;

function startPointer(
  service: Service<Schema>,
  event: PointerLike,
  handlers: { toggleZoom: (focal: Point) => void; zoomTo: (value: number, focal?: Point) => void },
) {
  const viewport = event.currentTarget;

  if (!(viewport instanceof Element)) {
    return;
  }

  const point = focalPoint(event, viewport);
  const existing = sessions.get(viewport);

  if (existing) {
    existing.pointers.set(event.pointerId, point);

    if (existing.pointers.size === 2) {
      existing.pinchDistance = pointerDistance(existing.pointers);
      existing.pinchScale = service.context.get("value");
      service.send({ type: "PINCH_START" });
    }

    return;
  }

  const session: PointerSession = {
    pointers: new Map([[event.pointerId, point]]),
    origin: point,
    last: point,
    pinchDistance: 0,
    pinchScale: 1,
    moved: false,
    pointerType: event.pointerType || "mouse",
    cleanup: () => {},
  };

  const onMove = (moveEvent: PointerEvent) => {
    if (!session.pointers.has(moveEvent.pointerId)) {
      return;
    }

    const movePoint = focalPoint(moveEvent, viewport);
    session.pointers.set(moveEvent.pointerId, movePoint);
    session.moved = session.moved || distance(session.origin, movePoint) > TAP_MOVE_TOLERANCE;

    if (session.pointers.size >= 2) {
      const spread = pointerDistance(session.pointers);

      if (session.pinchDistance > 0) {
        handlers.zoomTo((session.pinchScale * spread) / session.pinchDistance, pointerCenter(session.pointers));
      }

      return;
    }

    if (service.context.get("value") > 1) {
      service.send({
        type: "PAN_BY",
        dx: movePoint.x - session.last.x,
        dy: movePoint.y - session.last.y,
      });
    }

    session.last = movePoint;
  };

  const onUp = (upEvent: PointerEvent) => {
    session.pointers.delete(upEvent.pointerId);

    if (session.pointers.size === 1) {
      service.send({ type: "PINCH_END" });

      return;
    }

    if (session.pointers.size > 0) {
      return;
    }

    session.cleanup();
    sessions.delete(viewport);
    service.send({ type: "PAN_END" });

    if (!session.moved) {
      handleTap(viewport, session, handlers.toggleZoom);

      return;
    }

    emitSwipe(service, session);
  };

  session.cleanup = () => {
    viewport.removeEventListener("pointermove", onMove as EventListener);
    viewport.removeEventListener("pointerup", onUp as EventListener);
    viewport.removeEventListener("pointercancel", onUp as EventListener);
  };

  viewport.addEventListener("pointermove", onMove as EventListener);
  viewport.addEventListener("pointerup", onUp as EventListener);
  viewport.addEventListener("pointercancel", onUp as EventListener);
  capturePointer(viewport, event.pointerId);

  sessions.set(viewport, session);
  service.send({ type: "PAN_START" });
}

const taps = new WeakMap<Element, { at: number; point: Point }>();

/**
 * A mouse click zooms straight away, which is what the `zoom-in` cursor
 * promises. A finger has to tap twice, because a single tap is how a person
 * dismisses or steadies a fullscreen image and toggling on it would fire by
 * accident.
 */
function handleTap(viewport: Element, session: PointerSession, toggleZoom: (focal: Point) => void) {
  if (session.pointerType === "mouse") {
    toggleZoom(session.origin);

    return;
  }

  const now = Date.now();
  const previous = taps.get(viewport);
  const isDoubleTap =
    previous !== undefined &&
    now - previous.at < DOUBLE_TAP_MS &&
    distance(previous.point, session.origin) < DOUBLE_TAP_DISTANCE;

  if (isDoubleTap) {
    taps.delete(viewport);
    toggleZoom(session.origin);

    return;
  }

  taps.set(viewport, { at: now, point: session.origin });
}

/** `next` is the end edge, so a swipe reads the writing direction. */
function emitSwipe(service: Service<Schema>, session: PointerSession) {
  if (service.context.get("value") > 1) {
    return;
  }

  const threshold = Number(service.prop("swipeThreshold") ?? 0.15);
  const dx = session.last.x - session.origin.x;
  const dy = session.last.y - session.origin.y;

  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) {
    return;
  }

  const towardEnd = service.computed("dir") === "rtl" ? dx > 0 : dx < 0;

  service.prop("onSwipe")?.({ direction: towardEnd ? "next" : "previous" });
}

function handleKey(
  event: KeyLike,
  context: {
    zoomBy: (delta: number, focal?: Point) => void;
    reset: () => void;
    step: number;
    zoomed: boolean;
    send: Service<Schema>["send"];
  },
) {
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    context.zoomBy(context.step);

    return;
  }

  if (event.key === "-" || event.key === "_") {
    event.preventDefault();
    context.zoomBy(-context.step);

    return;
  }

  if (event.key === "0") {
    event.preventDefault();
    context.reset();

    return;
  }

  // Arrows pan a zoomed image. While it fits, they belong to whatever wraps
  // this surface, so the event is left alone.
  if (!context.zoomed) {
    return;
  }

  const pan = panKey(event.key);

  if (!pan) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  context.send({ type: "PAN_BY", dx: pan.dx, dy: pan.dy });
}

function panKey(key: string): { dx: number; dy: number } | null {
  const stepSize = 0.05;

  switch (key) {
    case "ArrowLeft":
      return { dx: stepSize, dy: 0 };
    case "ArrowRight":
      return { dx: -stepSize, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: stepSize };
    case "ArrowDown":
      return { dx: 0, dy: -stepSize };
    default:
      return null;
  }
}

/**
 * The pointer as a fraction of the viewport, measured from its centre, so every
 * number the machine holds stays resolution independent.
 */
function focalPoint(event: { clientX: number; clientY: number }, target: EventTarget | null): Point {
  if (!(target instanceof Element)) {
    return { x: 0, y: 0 };
  }

  const rect = target.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return { x: 0, y: 0 };
  }

  return {
    x: (event.clientX - rect.left) / rect.width - 0.5,
    y: (event.clientY - rect.top) / rect.height - 0.5,
  };
}

function pointerDistance(pointers: Map<number, Point>): number {
  const [first, second] = [...pointers.values()];

  return first && second ? distance(first, second) : 0;
}

function pointerCenter(pointers: Map<number, Point>): Point {
  const [first, second] = [...pointers.values()];

  if (!first || !second) {
    return first ?? { x: 0, y: 0 };
  }

  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function clampOffset(value: number, scale: number): number {
  const limit = Math.max(0, (scale - 1) / 2);

  return clamp(value, -limit, limit);
}
