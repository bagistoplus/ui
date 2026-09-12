import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UIBeforeAfter } from "./root";

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

/** A fixed box, so a point is a known percentage of it. */
function basic(attrs = "", inner = ""): string {
  return `
    <ui-before-after ${attrs} style="width: 400px; height: 200px">
      <ui-before-after-before>${inner}<span>Before</span></ui-before-after-before>
      <ui-before-after-after><span>After</span></ui-before-after-after>
      <ui-before-after-separator></ui-before-after-separator>
      <ui-before-after-handle></ui-before-after-handle>
    </ui-before-after>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIBeforeAfter>("ui-before-after")!;
const before = (host: ParentNode) => host.querySelector<HTMLElement>("ui-before-after-before")!;
const after = (host: ParentNode) => host.querySelector<HTMLElement>("ui-before-after-after")!;
const separator = (host: ParentNode) => host.querySelector<HTMLElement>("ui-before-after-separator")!;
const handle = (host: ParentNode) => host.querySelector<HTMLElement>("ui-before-after-handle")!;
const now = (host: ParentNode) => Number(handle(host).getAttribute("aria-valuenow"));

function listen(host: ParentNode): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener("ui-before-after:value-change", (event) => details.push((event as CustomEvent).detail));

  return details;
}

interface Percent {
  x?: number;
  y?: number;
}

/** A pointer event at a fraction of the root's box. Synthetic: the machine reads `clientX`/`clientY`. */
function pointer(host: ParentNode, type: string, percent: Percent = {}): PointerEvent {
  const rect = root(host).getBoundingClientRect();

  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: rect.left + rect.width * (percent.x ?? 0.5),
    clientY: rect.top + rect.height * (percent.y ?? 0.5),
  });
}

async function press(host: ParentNode, target: Element, percent: Percent = {}): Promise<void> {
  target.dispatchEvent(pointer(host, "pointerdown", percent));
  await frames(1);
}

async function move(host: ParentNode, percent: Percent): Promise<void> {
  document.dispatchEvent(pointer(host, "pointermove", percent));
  await frames(1);
}

async function release(host: ParentNode, percent: Percent = {}): Promise<void> {
  document.dispatchEvent(pointer(host, "pointerup", percent));
  await frames(1);
}

async function key(host: ParentNode, name: string): Promise<void> {
  handle(host).focus();
  await userEvent.keyboard(`{${name}}`);
  await frames(1);
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("anatomy", () => {
  it("marks every part and names the root and the handle", async () => {
    const host = await mount(basic());

    expect(root(host).dataset.scope).toBe("before-after");
    expect(root(host).dataset.part).toBe("root");
    expect(before(host).dataset.part).toBe("before");
    expect(after(host).dataset.part).toBe("after");
    expect(separator(host).dataset.part).toBe("separator");
    expect(handle(host).dataset.part).toBe("handle");
    expect(root(host).id).not.toBe("");
    expect(handle(host).id).not.toBe("");
    expect(root(host).dataset.orientation).toBe("horizontal");
  });

  it("exposes the handle as a slider", async () => {
    const host = await mount(basic());

    expect(handle(host).getAttribute("role")).toBe("slider");
    expect(handle(host).getAttribute("tabindex")).toBe("0");
    expect(handle(host).getAttribute("aria-valuemin")).toBe("0");
    expect(handle(host).getAttribute("aria-valuemax")).toBe("100");
    expect(handle(host).getAttribute("aria-valuenow")).toBe("50");
    expect(handle(host).getAttribute("aria-orientation")).toBe("horizontal");
    expect(separator(host).getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps authored ids on the root and the handle", async () => {
    const host = await mount(`
      <ui-before-after id="compare" style="width: 400px; height: 200px">
        <ui-before-after-before></ui-before-after-before>
        <ui-before-after-after></ui-before-after-after>
        <ui-before-after-handle id="knob"></ui-before-after-handle>
      </ui-before-after>
    `);

    expect(root(host).id).toBe("compare");
    expect(handle(host).id).toBe("knob");

    await press(host, root(host), { x: 0.8 });

    expect(document.activeElement).toBe(handle(host));
  });
});

describe("position", () => {
  it("starts at the default value and clips both slots there", async () => {
    const host = await mount(basic('default-value="30"'));

    expect(now(host)).toBe(30);
    expect(before(host).style.clipPath).toBe("inset(0px 70% 0px 0px)");
    expect(after(host).style.clipPath).toBe("inset(0px 0px 0px 30%)");
    expect(separator(host).style.left).toBe("30%");
    expect(handle(host).style.left).toBe("30%");
  });

  it("starts at fifty without a default", async () => {
    const host = await mount(basic());

    expect(now(host)).toBe(50);
  });

  it("clips top to bottom when vertical", async () => {
    const host = await mount(basic('orientation="vertical" default-value="30"'));

    expect(root(host).dataset.orientation).toBe("vertical");
    expect(before(host).style.clipPath).toBe("inset(0px 0px 70%)");
    expect(after(host).style.clipPath).toBe("inset(30% 0px 0px)");
    expect(handle(host).style.top).toBe("30%");
  });

  it("follows a changed controlled value", async () => {
    const host = await mount(basic('value="40"'));

    expect(now(host)).toBe(40);

    root(host).setAttribute("value", "60");
    await frames();

    expect(now(host)).toBe(60);
  });

  it("holds a controlled value against a key press, and still reports it", async () => {
    const host = await mount(basic('value="40"'));
    const details = listen(host);

    await key(host, "ArrowRight");

    expect(now(host)).toBe(40);
    expect(details).toEqual([{ value: 41 }]);
  });

  it("renders a controlled value outside the range at the nearest edge", async () => {
    const host = await mount(basic('value="150"'));

    expect(now(host)).toBe(100);
    expect(before(host).style.clipPath).toBe("inset(0px 0% 0px 0px)");
  });
});

describe("keyboard", () => {
  it("moves by one with the arrows", async () => {
    const host = await mount(basic());

    await key(host, "ArrowRight");
    expect(now(host)).toBe(51);

    await key(host, "ArrowLeft");
    expect(now(host)).toBe(50);
  });

  it("inverts the arrows in rtl", async () => {
    const host = await mount(`<div dir="rtl">${basic()}</div>`);

    expect(root(host).getAttribute("dir")).toBe("rtl");

    await key(host, "ArrowLeft");
    expect(now(host)).toBe(51);
    expect(handle(host).style.left).toBe("49%");

    await key(host, "ArrowRight");
    expect(now(host)).toBe(50);
  });

  it("uses the vertical arrows when vertical", async () => {
    const host = await mount(basic('orientation="vertical"'));

    await key(host, "ArrowDown");
    expect(now(host)).toBe(51);

    await key(host, "ArrowUp");
    expect(now(host)).toBe(50);

    await key(host, "ArrowRight");
    expect(now(host)).toBe(50);
  });

  it("jumps with Home, End, PageUp and PageDown", async () => {
    const host = await mount(basic());

    await key(host, "PageUp");
    expect(now(host)).toBe(60);

    await key(host, "PageDown");
    expect(now(host)).toBe(50);

    await key(host, "Home");
    expect(now(host)).toBe(0);

    await key(host, "End");
    expect(now(host)).toBe(100);
  });
});

describe("pointer", () => {
  it("moves to a press on the surface and focuses the handle", async () => {
    const host = await mount(basic());

    await press(host, root(host), { x: 0.8 });

    expect(now(host)).toBe(80);
    expect(document.activeElement).toBe(handle(host));
  });

  it("ignores a press that starts on interactive content", async () => {
    const host = await mount(basic("", "<button>Open</button>"));

    await press(host, host.querySelector("button")!, { x: 0.8 });

    expect(now(host)).toBe(50);
  });

  it("drags from the handle", async () => {
    const host = await mount(basic());

    await press(host, handle(host), { x: 0.5 });
    expect(root(host).hasAttribute("data-dragging")).toBe(true);
    expect(root(host).api?.dragging).toBe(true);

    await move(host, { x: 0.9 });
    expect(now(host)).toBe(90);

    await release(host, { x: 0.9 });
    expect(root(host).hasAttribute("data-dragging")).toBe(false);
    expect(now(host)).toBe(90);
  });

  it("snaps to the step", async () => {
    const host = await mount(basic('step="10"'));

    await press(host, root(host), { x: 0.84 });

    expect(now(host)).toBe(80);
  });
});

describe("events and api", () => {
  it("emits value-change once per change", async () => {
    const host = await mount(basic());
    const details = listen(host);

    await press(host, root(host), { x: 0.8 });
    await press(host, root(host), { x: 0.8 });

    expect(details).toEqual([{ value: 80 }]);
    expect(root(host).api?.value).toBe(80);
  });

  it("moves through the api", async () => {
    const host = await mount(basic());

    root(host).api?.setValue(25);
    await frames(1);

    expect(now(host)).toBe(25);
  });
});

describe("disabled", () => {
  it("marks the root and the handle and ignores input", async () => {
    const host = await mount(basic("disabled"));

    expect(root(host).hasAttribute("data-disabled")).toBe(true);
    expect(handle(host).getAttribute("aria-disabled")).toBe("true");
    expect(handle(host).getAttribute("tabindex")).toBe("-1");

    await key(host, "ArrowRight");
    await press(host, root(host), { x: 0.8 });
    await press(host, handle(host), { x: 0.8 });

    expect(now(host)).toBe(50);
    expect(root(host).hasAttribute("data-dragging")).toBe(false);
  });
});

describe("translations", () => {
  it("labels the handle and fills the value text", async () => {
    const host = await mount(basic('translations-handle="Reveal" translations-value-text="{value} percent before"'));

    expect(handle(host).getAttribute("aria-label")).toBe("Reveal");
    expect(handle(host).getAttribute("aria-valuetext")).toBe("50 percent before");
  });

  it("announces a percentage without a template", async () => {
    const host = await mount(basic());

    expect(handle(host).hasAttribute("aria-label")).toBe(false);
    expect(handle(host).getAttribute("aria-valuetext")).toBe("50 percent");
  });
});
