import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UIImageZoom } from "./root";

const hosts: HTMLElement[] = [];

function frames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
}

async function mount(html: string): Promise<HTMLElement> {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);

  await frames();

  return host;
}

/** A fixed square viewport, so a point is a known fraction of it. */
function basic(attrs = "", inner = ""): string {
  return `
    <ui-image-zoom ${attrs}>
      <ui-image-zoom-viewport style="width: 400px; height: 400px">
        <ui-image-zoom-image delegate><img alt="" style="width: 400px; height: 400px"></ui-image-zoom-image>
        ${inner}
      </ui-image-zoom-viewport>
      <ui-image-zoom-decrement-trigger delegate><button>Out</button></ui-image-zoom-decrement-trigger>
      <ui-image-zoom-increment-trigger delegate><button>In</button></ui-image-zoom-increment-trigger>
      <ui-image-zoom-reset-trigger delegate><button>Reset</button></ui-image-zoom-reset-trigger>
    </ui-image-zoom>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIImageZoom>("ui-image-zoom")!;
const viewport = (host: ParentNode) => host.querySelector<HTMLElement>("ui-image-zoom-viewport")!;
const image = (host: ParentNode) => host.querySelector<HTMLImageElement>("ui-image-zoom-image img")!;
const trigger = (host: ParentNode, name: string) =>
  host.querySelector<HTMLButtonElement>(`ui-image-zoom-${name}-trigger button`)!;
const api = (host: ParentNode) => root(host).api!;

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-image-zoom:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

/** The scale the image renders at, read back from its transform. */
function scaleOf(host: ParentNode): number {
  const match = /scale\(([\d.]+)\)/.exec(image(host).style.transform);

  return match ? Number(match[1]) : Number.NaN;
}

interface Pointer {
  x?: number;
  y?: number;
  id?: number;
  kind?: string;
}

/** A pointer event at a fraction of the viewport's box. Synthetic: the machine reads `clientX`/`clientY`. */
function pointer(host: ParentNode, type: string, at: Pointer = {}): PointerEvent {
  const rect = viewport(host).getBoundingClientRect();

  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: at.id ?? 1,
    pointerType: at.kind ?? "mouse",
    isPrimary: (at.id ?? 1) === 1,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: rect.left + rect.width * (at.x ?? 0.5),
    clientY: rect.top + rect.height * (at.y ?? 0.5),
  });
}

async function press(host: ParentNode, at: Pointer = {}, target: Element = viewport(host)): Promise<void> {
  target.dispatchEvent(pointer(host, "pointerdown", at));
  await frames(1);
}

async function move(host: ParentNode, at: Pointer): Promise<void> {
  viewport(host).dispatchEvent(pointer(host, "pointermove", at));
  await frames(1);
}

async function release(host: ParentNode, at: Pointer = {}): Promise<void> {
  viewport(host).dispatchEvent(pointer(host, "pointerup", at));
  await frames(1);
}

async function click(host: ParentNode, at: Pointer = {}): Promise<void> {
  await press(host, at);
  await release(host, at);
}

async function tap(host: ParentNode, at: Pointer = {}): Promise<void> {
  await click(host, { ...at, kind: "touch" });
}

async function key(host: ParentNode, name: string): Promise<void> {
  viewport(host).focus();
  await userEvent.keyboard(name.length === 1 ? name : `{${name}}`);
  await frames(1);
}

async function wheel(host: ParentNode, deltaY: number, ctrlKey: boolean): Promise<WheelEvent> {
  const rect = viewport(host).getBoundingClientRect();
  const event = new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    ctrlKey,
    deltaY,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  });

  viewport(host).dispatchEvent(event);
  await frames(1);

  return event;
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("anatomy", () => {
  it("marks every part and names the root and the viewport", async () => {
    const host = await mount(basic());

    expect(root(host).dataset.scope).toBe("image-zoom");
    expect(root(host).dataset.part).toBe("root");
    expect(root(host).id).toMatch(/^image-zoom:/);
    expect(viewport(host).dataset.part).toBe("viewport");
    expect(viewport(host).id).toMatch(/^image-zoom:.*:viewport$/);
    expect(viewport(host).getAttribute("tabindex")).toBe("0");
    expect(image(host).dataset.part).toBe("image");
    expect(image(host).getAttribute("draggable")).toBe("false");
    expect(trigger(host, "increment").dataset.part).toBe("increment-trigger");
    expect(trigger(host, "decrement").dataset.part).toBe("decrement-trigger");
    expect(trigger(host, "reset").dataset.part).toBe("reset-trigger");
    expect(trigger(host, "increment").type).toBe("button");
    expect(root(host).hasAttribute("data-zoomed")).toBe(false);
  });

  it("keeps authored ids on the root and the viewport", async () => {
    const host = await mount(`
      <ui-image-zoom id="zoom">
        <ui-image-zoom-viewport id="zoom-viewport" style="width: 400px; height: 400px">
          <ui-image-zoom-image delegate><img alt=""></ui-image-zoom-image>
        </ui-image-zoom-viewport>
      </ui-image-zoom>
    `);

    expect(root(host).id).toBe("zoom");
    expect(viewport(host).id).toBe("zoom-viewport");
  });

  it("warns once for a trigger without delegate", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const host = await mount(
        basic("", "<ui-image-zoom-increment-trigger>In</ui-image-zoom-increment-trigger>"),
      );

      root(host).flush();

      const warnings = warn.mock.calls.filter(([message]) =>
        String(message).includes("<ui-image-zoom-increment-trigger>"),
      );

      expect(warnings).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });
});

describe("zoom level", () => {
  it("starts unzoomed and cannot go below one", async () => {
    const host = await mount(basic());

    expect(api(host).value).toBe(1);
    expect(api(host).zoomed).toBe(false);
    expect(api(host).canDecrement).toBe(false);
    expect(scaleOf(host)).toBe(1);

    api(host).decrement();
    await frames(1);

    expect(api(host).value).toBe(1);
  });

  it("stops at the maximum", async () => {
    const host = await mount(basic('max="2" step="1"'));

    api(host).increment();
    await frames(1);
    expect(api(host).value).toBe(2);
    expect(scaleOf(host)).toBe(2);

    api(host).increment();
    await frames(1);
    expect(api(host).value).toBe(2);
    expect(api(host).canIncrement).toBe(false);
  });

  it("resets the scale and the offset together", async () => {
    const host = await mount(basic('step="1"'));

    api(host).increment();
    await key(host, "ArrowRight");
    expect(api(host).offsetX).not.toBe(0);

    api(host).reset();
    await frames(1);

    expect(api(host).value).toBe(1);
    expect(api(host).offsetX).toBe(0);
    expect(api(host).offsetY).toBe(0);
    expect(image(host).style.transform).toBe("translate(0%, 0%) scale(1)");
  });

  it("refuses every gesture while disabled and marks the root", async () => {
    const host = await mount(basic('disabled step="1"'));

    expect(root(host).hasAttribute("data-disabled")).toBe(true);
    expect(viewport(host).getAttribute("tabindex")).toBe("-1");
    expect(trigger(host, "increment").disabled).toBe(true);

    api(host).increment();
    await click(host);
    await key(host, "+");

    expect(api(host).value).toBe(1);
  });
});

describe("value", () => {
  it("starts at default-value and marks the root zoomed", async () => {
    const host = await mount(basic('default-value="2"'));

    expect(api(host).value).toBe(2);
    expect(scaleOf(host)).toBe(2);
    expect(root(host).hasAttribute("data-zoomed")).toBe(true);
    expect(viewport(host).hasAttribute("data-zoomed")).toBe(true);
  });

  it("holds a controlled value against an increment, and still reports it", async () => {
    const host = await mount(basic('value="2"'));
    const details = listen(host, "value-change");

    api(host).increment();
    await frames(1);

    expect(api(host).value).toBe(2);
    expect(details).toEqual([{ value: 2.5 }]);

    root(host).setAttribute("value", "3");
    await frames();

    expect(scaleOf(host)).toBe(3);
  });

  it("moves through the api and emits once per change", async () => {
    const host = await mount(basic());
    const details = listen(host, "value-change");

    api(host).setValue(3);
    await frames(1);
    api(host).setValue(3);
    await frames(1);

    expect(scaleOf(host)).toBe(3);
    expect(details).toEqual([{ value: 3 }]);
  });
});

describe("panning", () => {
  it("keeps the image inside its own bounds", async () => {
    const host = await mount(basic('step="1"'));

    api(host).increment();
    await frames(1);

    // Far more than the overflow a scale of 2 allows, which is a quarter.
    for (let index = 0; index < 20; index += 1) {
      await key(host, "ArrowRight");
    }

    expect(api(host).offsetX).toBeCloseTo(-0.5, 5);
    expect(image(host).style.transform).toBe("translate(-50%, 0%) scale(2)");
  });

  it("ignores a drag while the image still fits", async () => {
    const host = await mount(basic());

    await press(host, { x: 0.5 });
    await move(host, { x: 0.4 });

    expect(api(host).offsetX).toBe(0);

    await release(host, { x: 0.4 });
  });

  it("moves the image once zoomed", async () => {
    const host = await mount(basic('step="1"'));

    api(host).increment();
    await frames(1);

    await press(host, { x: 0.5 });
    expect(root(host).hasAttribute("data-panning")).toBe(true);
    expect(viewport(host).style.cursor).toBe("grabbing");

    await move(host, { x: 0.6 });
    expect(api(host).offsetX).toBeCloseTo(0.1, 5);

    await release(host, { x: 0.6 });
    expect(root(host).hasAttribute("data-panning")).toBe(false);
    expect(viewport(host).style.cursor).toBe("grab");
  });
});

describe("swipe", () => {
  it("reports a horizontal drag while the image fits", async () => {
    const host = await mount(basic());
    const swipes = listen(host, "swipe");

    await press(host, { x: 0.8 });
    await move(host, { x: 0.2 });
    await release(host, { x: 0.2 });

    expect(swipes).toEqual([{ direction: "next" }]);
  });

  it("reads a drag the other way as the previous item", async () => {
    const host = await mount(basic());
    const swipes = listen(host, "swipe");

    await press(host, { x: 0.2 });
    await move(host, { x: 0.8 });
    await release(host, { x: 0.8 });

    expect(swipes).toEqual([{ direction: "previous" }]);
  });

  it("flips in rtl, where the next item sits on the left", async () => {
    const host = await mount(`<div dir="rtl">${basic()}</div>`);
    const swipes = listen(host, "swipe");

    expect(root(host).getAttribute("dir")).toBe("rtl");

    await press(host, { x: 0.8 });
    await move(host, { x: 0.2 });
    await release(host, { x: 0.2 });

    expect(swipes).toEqual([{ direction: "previous" }]);
  });

  it("pans instead of swiping once zoomed", async () => {
    const host = await mount(basic('step="1"'));
    const swipes = listen(host, "swipe");

    api(host).increment();
    await frames(1);

    await press(host, { x: 0.8 });
    await move(host, { x: 0.2 });
    await release(host, { x: 0.2 });

    expect(swipes).toEqual([]);
    expect(api(host).offsetX).toBeLessThan(0);
  });

  it("ignores a drag that is mostly vertical", async () => {
    const host = await mount(basic());
    const swipes = listen(host, "swipe");

    await press(host, { x: 0.5, y: 0.1 });
    await move(host, { x: 0.4, y: 0.9 });
    await release(host, { x: 0.4, y: 0.9 });

    expect(swipes).toEqual([]);
  });
});

describe("tapping", () => {
  it("zooms on a mouse click, which is what the cursor promises", async () => {
    const host = await mount(basic('double-tap-scale="3"'));

    expect(viewport(host).style.cursor).toBe("zoom-in");

    await click(host);
    expect(api(host).value).toBe(3);

    await click(host);
    expect(api(host).value).toBe(1);
  });

  it("makes a finger tap twice, so a stray tap does not zoom", async () => {
    const host = await mount(basic('double-tap-scale="3"'));

    await tap(host);
    expect(api(host).value).toBe(1);

    await tap(host);
    expect(api(host).value).toBe(3);
  });

  it("does not zoom on a click that dragged", async () => {
    const host = await mount(basic('double-tap-scale="3"'));

    await press(host, { x: 0.5 });
    await move(host, { x: 0.6 });
    await release(host, { x: 0.6 });

    expect(api(host).value).toBe(1);
  });

  it("still zooms when the pointer only wobbled", async () => {
    const host = await mount(basic('double-tap-scale="3"'));

    await press(host, { x: 0.5 });
    await move(host, { x: 0.503 });
    await release(host, { x: 0.503 });

    expect(api(host).value).toBe(3);
  });

  it("leaves a press on interactive content to that control", async () => {
    const host = await mount(basic("", '<button class="inside">Open</button>'));
    const inside = host.querySelector(".inside")!;

    await press(host, { x: 0.5 }, inside);
    expect(root(host).hasAttribute("data-panning")).toBe(false);

    await release(host, { x: 0.5 });
    expect(api(host).value).toBe(1);
  });
});

describe("keyboard", () => {
  it("zooms and resets", async () => {
    const host = await mount(basic('step="0.5"'));

    await key(host, "+");
    expect(api(host).value).toBe(1.5);

    await key(host, "-");
    expect(api(host).value).toBe(1);

    await key(host, "+");
    await key(host, "0");
    expect(api(host).value).toBe(1);
  });

  it("leaves the arrows alone while the image fits, so a wrapper can navigate", async () => {
    const host = await mount(basic());
    const seen: boolean[] = [];
    host.addEventListener("keydown", (event) => seen.push(event.defaultPrevented));

    await key(host, "ArrowRight");

    expect(seen).toEqual([false]);
    expect(api(host).offsetX).toBe(0);
  });

  it("stops a pan arrow travelling, so a wrapper does not also change item", async () => {
    const host = await mount(basic('step="1"'));
    const seen: boolean[] = [];
    host.addEventListener("keydown", (event) => seen.push(event.defaultPrevented));

    api(host).increment();
    await key(host, "ArrowRight");

    expect(seen).toEqual([]);
    expect(api(host).offsetX).toBeCloseTo(-0.05, 5);
  });
});

describe("touch ownership", () => {
  it("claims the touch before the browser can, even unzoomed", async () => {
    const host = await mount(basic());

    // A browser decides at touch down, so waiting until the scale is above
    // one loses the two finger pinch that would take it there.
    expect(viewport(host).style.touchAction).toBe("none");
    expect(viewport(host).style.overflow).toBe("hidden");
  });
});

describe("pinch", () => {
  it("scales by the change in distance between two pointers", async () => {
    const host = await mount(basic('max="4"'));

    await press(host, { x: 0.4, id: 1, kind: "touch" });
    await press(host, { x: 0.6, id: 2, kind: "touch" });
    await move(host, { x: 0.2, id: 1, kind: "touch" });
    await move(host, { x: 0.8, id: 2, kind: "touch" });

    // The pointers moved from a fifth of the viewport apart to three fifths.
    expect(api(host).value).toBeCloseTo(3, 5);

    await release(host, { x: 0.2, id: 1, kind: "touch" });
    await release(host, { x: 0.8, id: 2, kind: "touch" });

    expect(api(host).value).toBeCloseTo(3, 5);
    expect(root(host).hasAttribute("data-panning")).toBe(false);
  });
});

describe("wheel", () => {
  it("zooms with ctrl and the wheel, and leaves a plain wheel to the page", async () => {
    const host = await mount(basic('step="0.5"'));

    const plain = await wheel(host, -100, false);
    expect(plain.defaultPrevented).toBe(false);
    expect(api(host).value).toBe(1);

    const pinch = await wheel(host, -100, true);
    expect(pinch.defaultPrevented).toBe(true);
    expect(api(host).value).toBe(1.5);

    await wheel(host, 100, true);
    expect(api(host).value).toBe(1);
  });
});

describe("triggers", () => {
  it("enable and disable with the scale and move it", async () => {
    const host = await mount(basic('max="2" step="1"'));

    expect(trigger(host, "decrement").disabled).toBe(true);
    expect(trigger(host, "reset").disabled).toBe(true);
    expect(trigger(host, "increment").disabled).toBe(false);

    trigger(host, "increment").click();
    await frames(1);

    expect(api(host).value).toBe(2);
    expect(trigger(host, "increment").disabled).toBe(true);
    expect(trigger(host, "decrement").disabled).toBe(false);
    expect(trigger(host, "reset").disabled).toBe(false);

    trigger(host, "decrement").click();
    await frames(1);
    expect(api(host).value).toBe(1);

    trigger(host, "increment").click();
    await frames(1);
    trigger(host, "reset").click();
    await frames(1);
    expect(api(host).value).toBe(1);
  });

  it("take their labels from the translations", async () => {
    const host = await mount(
      basic(
        'translations-increment-trigger="Zoom in" translations-decrement-trigger="Zoom out" translations-reset-trigger="Reset zoom"',
      ),
    );

    expect(trigger(host, "increment").getAttribute("aria-label")).toBe("Zoom in");
    expect(trigger(host, "decrement").getAttribute("aria-label")).toBe("Zoom out");
    expect(trigger(host, "reset").getAttribute("aria-label")).toBe("Reset zoom");
  });

  it("carry no label without translations", async () => {
    const host = await mount(basic());

    expect(trigger(host, "increment").hasAttribute("aria-label")).toBe(false);
  });
});
