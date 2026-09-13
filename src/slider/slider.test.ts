import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UISlider } from "./root";

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

/** A 16px thumb, so Zag's inset is 8px on each side of the control. */
const THUMB_STYLE = "width: 16px; height: 16px";
const INSET = 8;

function thumb(attrs = "", inner = ""): string {
  return `
    <ui-slider-thumb ${attrs} style="${THUMB_STYLE}">
      <ui-slider-hidden-input delegate><input></ui-slider-hidden-input>
      ${inner}
    </ui-slider-thumb>
  `;
}

/** A control pinned at 400px wide, so a fraction of it is a known value. */
function basic(attrs = 'default-value="20"', thumbs = thumb(), extra = ""): string {
  return `
    <ui-slider ${attrs}>
      <ui-slider-label delegate><label>Volume</label></ui-slider-label>
      <ui-slider-value-text></ui-slider-value-text>
      <ui-slider-control style="width: 400px; height: 16px">
        <ui-slider-track style="height: 4px">
          <ui-slider-range style="height: 4px"></ui-slider-range>
        </ui-slider-track>
        ${thumbs}
      </ui-slider-control>
      ${extra}
    </ui-slider>
  `;
}

const root = (host: ParentNode) => host.querySelector<UISlider>("ui-slider")!;
const control = (host: ParentNode) => host.querySelector<HTMLElement>("ui-slider-control")!;
const thumbs = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>("ui-slider-thumb")];
const thumbAt = (host: ParentNode, index = 0) => thumbs(host)[index]!;
const inputAt = (host: ParentNode, index = 0) => host.querySelectorAll<HTMLInputElement>("input")[index]!;
const api = (host: ParentNode) => root(host).api!;
const valueAt = (host: ParentNode, index = 0) => Number(thumbAt(host, index).getAttribute("aria-valuenow"));
const property = (host: ParentNode, name: string) => root(host).style.getPropertyValue(name);

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-slider:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

/** A pointer event at a fraction of the control's travel, which excludes the thumb's inset. */
function pointer(host: ParentNode, type: string, fraction: number, init: PointerEventInit = {}): PointerEvent {
  const rect = control(host).getBoundingClientRect();

  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    button: 0,
    buttons: type === "pointerup" ? 0 : 1,
    clientX: rect.left + INSET + (rect.width - INSET * 2) * fraction,
    clientY: rect.top + rect.height / 2,
    ...init,
  });
}

async function press(host: ParentNode, fraction: number, init: PointerEventInit = {}): Promise<void> {
  control(host).dispatchEvent(pointer(host, "pointerdown", fraction, init));
  await frames(1);
}

/** A press on the thumb itself, at its centre, which is how a drag starts. */
async function pressThumb(host: ParentNode, index = 0): Promise<void> {
  const rect = thumbAt(host, index).getBoundingClientRect();

  thumbAt(host, index).dispatchEvent(
    pointer(host, "pointerdown", 0, { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }),
  );
  await frames(1);
}

/** Zag tracks the move and the release on the document, not on the control. */
async function move(host: ParentNode, fraction: number): Promise<void> {
  document.dispatchEvent(pointer(host, "pointermove", fraction));
  await frames(1);
}

async function release(host: ParentNode, fraction: number): Promise<void> {
  document.dispatchEvent(pointer(host, "pointerup", fraction));
  await frames();
}

async function key(host: ParentNode, index: number, keys: string): Promise<void> {
  thumbAt(host, index).focus();
  await frames(1);
  await userEvent.keyboard(keys);
  await frames();
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
  vi.restoreAllMocks();
});

describe("anatomy", () => {
  it("puts each part's props on the right element", async () => {
    const host = await mount(
      basic(
        'default-value="20"',
        thumb("", "<ui-slider-dragging-indicator></ui-slider-dragging-indicator>"),
        '<ui-slider-marker-group><ui-slider-marker value="50"></ui-slider-marker></ui-slider-marker-group>',
      ),
    );
    const part = (name: string) => host.querySelector<HTMLElement>(`ui-slider-${name}`)!;

    expect(root(host).dataset.scope).toBe("slider");
    expect(root(host).dataset.part).toBe("root");
    expect(part("label").querySelector("label")!.dataset.part).toBe("label");
    expect(part("control").dataset.part).toBe("control");
    expect(part("track").dataset.part).toBe("track");
    expect(part("range").dataset.part).toBe("range");
    expect(part("thumb").dataset.part).toBe("thumb");
    expect(part("value-text").dataset.part).toBe("value-text");
    expect(part("marker-group").dataset.part).toBe("marker-group");
    expect(part("marker").dataset.part).toBe("marker");
    expect(part("dragging-indicator").dataset.part).toBe("dragging-indicator");

    expect(thumbAt(host).getAttribute("role")).toBe("slider");
    expect(thumbAt(host).getAttribute("aria-valuemin")).toBe("0");
    expect(thumbAt(host).getAttribute("aria-valuemax")).toBe("100");
    expect(thumbAt(host).getAttribute("aria-valuenow")).toBe("20");
    expect(thumbAt(host).getAttribute("aria-orientation")).toBe("horizontal");
    expect(thumbAt(host).getAttribute("tabindex")).toBe("0");

    expect(inputAt(host).type).toBe("text");
    expect(inputAt(host).hidden).toBe(true);
    expect(inputAt(host).value).toBe("20");
    expect(host.querySelector("label")!.getAttribute("for")).toBe(inputAt(host).id);
    expect(control(host).style.touchAction).toBe("none");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(
      basic(
        'id="volume" default-value="20"',
        thumb('id="volume-thumb"'),
        '<ui-slider-marker-group><ui-slider-marker id="volume-mid" value="50"></ui-slider-marker></ui-slider-marker-group>',
      ).replace("<ui-slider-control ", '<ui-slider-control id="volume-control" '),
    );

    expect(root(host).id).toBe("volume");
    expect(control(host).id).toBe("volume-control");
    expect(thumbAt(host).id).toBe("volume-thumb");
    expect(host.querySelector("ui-slider-marker")!.id).toBe("volume-mid");
    expect(host.querySelector("label")!.getAttribute("for")).toBe(inputAt(host).id);
  });

  it("warns once for a label or a hidden input without delegate", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = await mount(
      basic(
        'default-value="20"',
        `<ui-slider-thumb style="${THUMB_STYLE}"><ui-slider-hidden-input></ui-slider-hidden-input></ui-slider-thumb>`,
      ).replace("<ui-slider-label delegate><label>Volume</label></ui-slider-label>", "<ui-slider-label>Volume</ui-slider-label>"),
    );

    api(host).setValue([30]);
    await frames();

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining("<ui-slider-label> needs the `delegate` attribute and a <label> child"),
      expect.stringContaining("<ui-slider-hidden-input> needs the `delegate` attribute and an <input> child"),
    ]);
  });
});

describe("index", () => {
  it("numbers the thumbs by document order", async () => {
    const host = await mount(basic('default-value="20,80"', thumb() + thumb()));

    expect(thumbAt(host, 0).dataset.index).toBe("0");
    expect(thumbAt(host, 1).dataset.index).toBe("1");
    expect(valueAt(host, 0)).toBe(20);
    expect(valueAt(host, 1)).toBe(80);
  });

  it("lets a written index override the order", async () => {
    const host = await mount(basic('default-value="20,80"', thumb('index="1"') + thumb()));

    expect(thumbAt(host, 0).dataset.index).toBe("1");
    expect(valueAt(host, 0)).toBe(80);
    expect(thumbAt(host, 1).dataset.index).toBe("0");
    expect(valueAt(host, 1)).toBe(20);
  });

  it("gives a hidden input and a dragging indicator inside a thumb that thumb's index", async () => {
    const host = await mount(
      basic('default-value="20,80"', thumb() + thumb("", "<ui-slider-dragging-indicator></ui-slider-dragging-indicator>")),
    );
    const indicator = host.querySelector<HTMLElement>("ui-slider-dragging-indicator")!;

    expect(inputAt(host, 1).value).toBe("80");
    expect(indicator.style.insetInlineStart).toBe("var(--slider-thumb-offset-1)");
  });

  it("takes a written index for a hidden input outside a thumb", async () => {
    const host = await mount(
      basic(
        'default-value="20,80"',
        `<ui-slider-thumb style="${THUMB_STYLE}"></ui-slider-thumb><ui-slider-thumb style="${THUMB_STYLE}"></ui-slider-thumb>`,
        '<ui-slider-hidden-input delegate index="1"><input></ui-slider-hidden-input>',
      ),
    );

    expect(inputAt(host, 0).value).toBe("80");
  });
});

describe("properties", () => {
  it("reflects a property write to the attribute", async () => {
    const host = await mount(
      basic(
        'default-value="20,80"',
        thumb() + thumb(),
        '<ui-slider-marker-group><ui-slider-marker></ui-slider-marker></ui-slider-marker-group>' +
          "<ui-slider-hidden-input delegate><input></ui-slider-hidden-input>",
      ),
    );
    const marker = host.querySelector<HTMLElement & { value: number | undefined }>("ui-slider-marker")!;
    const outside = host.querySelector<HTMLElement & { index: number | undefined }>("ui-slider > ui-slider-hidden-input")!;
    const second = thumbAt(host, 1) as HTMLElement & { name: string | undefined };

    marker.value = 50;
    outside.index = 1;
    second.name = "max";
    await frames();

    expect(marker.getAttribute("value")).toBe("50");
    expect(marker.dataset.state).toBe("at-value");
    expect(outside.querySelector("input")!.value).toBe("80");
    expect(inputAt(host, 1).name).toBe("max");
  });
});

describe("value", () => {
  it("starts at default-value and fills the range between the thumbs", async () => {
    const host = await mount(basic('default-value="20,80"', thumb() + thumb()));

    expect(api(host).value).toEqual([20, 80]);
    expect(property(host, "--slider-range-start")).toBe("20%");
    expect(property(host, "--slider-range-end")).toBe("20%");
  });

  it("holds a controlled value and still reports the change", async () => {
    const host = await mount(basic('value="30"'));
    const changes = listen(host, "value-change");

    await press(host, 0.5);
    await release(host, 0.5);

    expect(valueAt(host)).toBe(30);
    expect(changes).toEqual([{ value: [50] }]);
  });

  it("moves through the api", async () => {
    const host = await mount(basic('default-value="20,80"', thumb() + thumb()));

    api(host).setValue([10, 90]);
    await frames();
    expect(api(host).value).toEqual([10, 90]);

    api(host).setThumbValue(1, 50);
    await frames();
    expect(api(host).value).toEqual([10, 50]);
    expect(inputAt(host, 1).value).toBe("50");
  });

  it("names the hidden inputs for the form", async () => {
    const pair = await mount(basic('name="price" default-value="20,80"', thumb() + thumb('name="max"')));
    const single = await mount(basic('name="price" default-value="20"'));

    expect(inputAt(pair, 0).name).toBe("price[]");
    expect(inputAt(pair, 1).name).toBe("max");
    expect(inputAt(single).name).toBe("price");
  });
});

describe("pointer", () => {
  it("moves the thumb to a press on the control", async () => {
    const host = await mount(basic());
    const changes = listen(host, "value-change");
    const ends = listen(host, "value-change-end");

    await press(host, 0.25);
    await release(host, 0.25);

    expect(valueAt(host)).toBe(25);
    expect(changes).toEqual([{ value: [25] }]);
    expect(ends).toEqual([{ value: [25] }]);
  });

  it("moves the nearer thumb", async () => {
    const host = await mount(basic('default-value="20,80"', thumb() + thumb()));

    await press(host, 0.9);
    await release(host, 0.9);

    expect(api(host).value).toEqual([20, 90]);
  });

  it("follows a drag from the thumb", async () => {
    const host = await mount(basic());
    const ends = listen(host, "value-change-end");

    await pressThumb(host);
    await move(host, 0.6);

    expect(valueAt(host)).toBe(60);
    expect(root(host).dataset.dragging).toBe("");
    expect(thumbAt(host).dataset.dragging).toBe("");

    await release(host, 0.6);

    expect(root(host).dataset.dragging).toBeUndefined();
    expect(ends).toEqual([{ value: [60] }]);
  });

  it("ignores a press with a modifier key", async () => {
    const host = await mount(basic());
    const changes = listen(host, "value-change");

    await press(host, 0.5, { ctrlKey: true });
    await release(host, 0.5);

    expect(valueAt(host)).toBe(20);
    expect(changes).toEqual([]);
  });

  it("refuses the press while disabled or readonly", async () => {
    const disabled = await mount(basic('default-value="20" disabled'));
    const readonly = await mount(basic('default-value="20" readonly'));

    await press(disabled, 0.5);
    await release(disabled, 0.5);
    await press(readonly, 0.5);
    await release(readonly, 0.5);

    expect(valueAt(disabled)).toBe(20);
    expect(root(disabled).dataset.disabled).toBe("");
    expect(thumbAt(disabled).hasAttribute("tabindex")).toBe(false);
    expect(valueAt(readonly)).toBe(20);
    expect(thumbAt(readonly).getAttribute("tabindex")).toBe("0");
  });
});

describe("keyboard", () => {
  it("steps with the arrows, and by large-step with shift or the page keys", async () => {
    const host = await mount(basic('default-value="20" step="1" large-step="5"'));

    await key(host, 0, "{ArrowRight}");
    expect(valueAt(host)).toBe(21);

    await key(host, 0, "{ArrowLeft}");
    expect(valueAt(host)).toBe(20);

    await key(host, 0, "{Shift>}{ArrowRight}{/Shift}");
    expect(valueAt(host)).toBe(25);

    await key(host, 0, "{PageUp}");
    expect(valueAt(host)).toBe(30);

    await key(host, 0, "{PageDown}");
    expect(valueAt(host)).toBe(25);
  });

  it("goes to the thumb's own bounds with home and end", async () => {
    const host = await mount(basic('default-value="20,80"', thumb() + thumb()));

    await key(host, 0, "{End}");
    expect(api(host).value).toEqual([80, 80]);

    await key(host, 0, "{Home}");
    expect(api(host).value).toEqual([0, 80]);

    await key(host, 1, "{End}");
    expect(api(host).value).toEqual([0, 100]);
  });

  it("uses the vertical arrows only when vertical", async () => {
    const horizontal = await mount(basic());
    const vertical = await mount(basic('default-value="20" orientation="vertical"'));

    await key(horizontal, 0, "{ArrowUp}");
    expect(valueAt(horizontal)).toBe(20);

    await key(vertical, 0, "{ArrowUp}");
    expect(valueAt(vertical)).toBe(21);
  });

  it("flips the horizontal arrows under rtl", async () => {
    const host = await mount(basic('default-value="20" dir="rtl"'));

    await key(host, 0, "{ArrowLeft}");
    expect(valueAt(host)).toBe(21);
  });

  it("ends a change per key press", async () => {
    const host = await mount(basic());
    const ends = listen(host, "value-change-end");

    await key(host, 0, "{ArrowRight}{ArrowRight}");

    expect(ends).toEqual([{ value: [21] }, { value: [22] }]);
  });
});

describe("thumbs together", () => {
  it("keeps min-steps-between-thumbs", async () => {
    const host = await mount(basic('default-value="20,80" step="5" min-steps-between-thumbs="2"', thumb() + thumb()));

    await key(host, 0, "{End}");

    expect(api(host).value).toEqual([70, 80]);
  });

  it("swaps the thumbs when told to", async () => {
    const host = await mount(basic('default-value="20,80" thumb-collision-behavior="swap"', thumb() + thumb()));

    await pressThumb(host, 0);
    await move(host, 0.9);
    await release(host, 0.9);

    expect(api(host).value).toEqual([80, 90]);
  });
});

describe("measurement", () => {
  it("measures the thumb and shows it", async () => {
    const host = await mount(basic());

    expect(thumbAt(host).style.visibility).toBe("visible");
    expect(property(host, "--slider-thumb-width")).toBe("16px");
    expect(property(host, "--slider-thumb-offset-0")).toContain("calc(");
  });

  it("takes thumb-width and thumb-height instead of measuring", async () => {
    const host = await mount(basic('default-value="20" thumb-width="20" thumb-height="20"'));

    expect(thumbAt(host).style.visibility).toBe("visible");
    expect(property(host, "--slider-thumb-width")).toBe("20px");
  });

  it("places a centred thumb at the bare percent", async () => {
    const host = await mount(basic('default-value="20" thumb-alignment="center"'));

    expect(property(host, "--slider-thumb-offset-0")).toBe("20%");
    expect(thumbAt(host).style.insetInlineStart).toBe("var(--slider-thumb-offset-0)");
  });
});

describe("markers and range", () => {
  it("states where each marker sits against the value", async () => {
    const host = await mount(
      basic(
        'default-value="50"',
        thumb(),
        `<ui-slider-marker-group>
          <ui-slider-marker value="0"></ui-slider-marker>
          <ui-slider-marker value="50"></ui-slider-marker>
          <ui-slider-marker value="100"></ui-slider-marker>
        </ui-slider-marker-group>`,
      ),
    );
    const states = [...host.querySelectorAll<HTMLElement>("ui-slider-marker")].map((marker) => marker.dataset.state);

    expect(states).toEqual(["under-value", "at-value", "over-value"]);
  });

  it("fills from the middle with origin center", async () => {
    const host = await mount(basic('default-value="25" origin="center"'));

    expect(property(host, "--slider-range-start")).toBe("25%");
    expect(property(host, "--slider-range-end")).toBe("50%");
  });
});

describe("accessible name", () => {
  it("keeps an aria-label written on the thumb", async () => {
    const host = await mount(basic('default-value="20"', thumb('aria-label="Minimum"')));

    expect(thumbAt(host).getAttribute("aria-label")).toBe("Minimum");
    expect(thumbAt(host).hasAttribute("aria-labelledby")).toBe(false);
  });

  it("keeps an aria-label written on the delegate child", async () => {
    const host = await mount(
      basic(
        'default-value="20"',
        `<ui-slider-thumb delegate><div aria-label="Minimum" style="${THUMB_STYLE}"></div></ui-slider-thumb>`,
      ),
    );
    const target = host.querySelector<HTMLElement>("ui-slider-thumb > div")!;

    expect(target.getAttribute("role")).toBe("slider");
    expect(target.getAttribute("aria-label")).toBe("Minimum");
    expect(target.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("keeps an aria-labelledby written on the thumb", async () => {
    const host = await mount(basic('default-value="20"', thumb('aria-labelledby="custom"')));

    expect(thumbAt(host).getAttribute("aria-labelledby")).toBe("custom");
  });

  it("names a thumb by the label part otherwise", async () => {
    const host = await mount(basic());

    expect(thumbAt(host).getAttribute("aria-labelledby")).toBe(host.querySelector("label")!.id);
  });
});

describe("getAriaValueText", () => {
  it("reads the value through the function", async () => {
    const host = await mount(basic());

    root(host).getAriaValueText = ({ value }) => `${value} percent`;
    await frames();
    expect(thumbAt(host).getAttribute("aria-valuetext")).toBe("20 percent");

    await key(host, 0, "{ArrowRight}");
    expect(thumbAt(host).getAttribute("aria-valuetext")).toBe("21 percent");
  });
});

describe("events", () => {
  it("reports the focused thumb", async () => {
    const host = await mount(basic());
    const focus = listen(host, "focus-change");

    thumbAt(host).focus();
    await frames();
    thumbAt(host).blur();
    await frames();

    expect(focus).toEqual([
      { focusedIndex: 0, value: [20] },
      { focusedIndex: -1, value: [20] },
    ]);
  });

  it("reports every move and one end per drag", async () => {
    const host = await mount(basic());
    const changes = listen(host, "value-change");
    const ends = listen(host, "value-change-end");

    await pressThumb(host);
    await move(host, 0.3);
    await move(host, 0.4);
    await move(host, 0.5);
    await release(host, 0.5);

    expect(changes.map((detail) => (detail as { value: number[] }).value)).toEqual([[30], [40], [50]]);
    expect(ends).toEqual([{ value: [50] }]);
  });

  it("shows the dragging indicator while its thumb drags", async () => {
    const host = await mount(basic('default-value="20"', thumb("", "<ui-slider-dragging-indicator></ui-slider-dragging-indicator>")));
    const indicator = host.querySelector<HTMLElement>("ui-slider-dragging-indicator")!;

    expect(indicator.hidden).toBe(true);
    expect(indicator.dataset.state).toBe("closed");

    await pressThumb(host);
    await move(host, 0.4);

    expect(indicator.hidden).toBe(false);
    expect(indicator.dataset.state).toBe("open");

    await release(host, 0.4);

    expect(indicator.hidden).toBe(true);
  });
});
