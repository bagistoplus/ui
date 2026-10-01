import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UIRating } from "./root";

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

/** A 20px item, so a point at a fraction of it is a known half. */
function items(count = 5, attrs = ""): string {
  return `<ui-rating-item ${attrs} style="width: 20px; height: 20px"></ui-rating-item>`.repeat(count);
}

function basic(attrs = 'default-value="3"', inner = items()): string {
  return `
    <ui-rating ${attrs}>
      <ui-rating-label delegate><label>Rating</label></ui-rating-label>
      <ui-rating-control style="display: flex">${inner}</ui-rating-control>
      <ui-rating-hidden-input delegate><input></ui-rating-hidden-input>
    </ui-rating>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIRating>("ui-rating")!;
const control = (host: ParentNode) => host.querySelector<HTMLElement>("ui-rating-control")!;
const itemAt = (host: ParentNode, index: number) => host.querySelectorAll<HTMLElement>("ui-rating-item")[index]!;
const input = (host: ParentNode) => host.querySelector<HTMLInputElement>("input")!;
const api = (host: ParentNode) => root(host).api!;
const fills = (host: ParentNode) =>
  [...host.querySelectorAll<HTMLElement>("ui-rating-item")].map((item) => item.style.getPropertyValue("--rating-item-fill"));

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-rating:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

/** A pointer move at a fraction of an item's width. The control hears it too, which is what starts a hover. */
async function hover(host: ParentNode, index: number, fraction: number): Promise<void> {
  const rect = itemAt(host, index).getBoundingClientRect();
  const init: PointerEventInit = {
    bubbles: true,
    pointerType: "mouse",
    clientX: rect.left + rect.width * fraction,
    clientY: rect.top + rect.height / 2,
  };

  itemAt(host, index).dispatchEvent(new PointerEvent("pointermove", init));
  await frames(1);
  itemAt(host, index).dispatchEvent(new PointerEvent("pointermove", init));
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
    const host = await mount(basic());

    expect(root(host).dataset.scope).toBe("rating-group");
    expect(root(host).dataset.part).toBe("root");
    expect(control(host).getAttribute("role")).toBe("radiogroup");
    expect(control(host).getAttribute("aria-labelledby")).toBe(host.querySelector("label")!.id);
    expect(host.querySelector("label")!.htmlFor).toBe(input(host).id);
    expect(itemAt(host, 0).getAttribute("role")).toBe("radio");
    expect(itemAt(host, 0).dataset.part).toBe("item");
  });

  it("numbers the items from 1 by document order, and counts them", async () => {
    const host = await mount(basic('default-value="1"', items(3)));

    expect([0, 1, 2].map((index) => itemAt(host, index).getAttribute("aria-posinset"))).toEqual(["1", "2", "3"]);
    expect(itemAt(host, 0).getAttribute("aria-setsize")).toBe("3");
    expect(api(host).count).toBe(3);
  });

  it("recounts when an item is added", async () => {
    const host = await mount(basic('default-value="1"', items(3)));

    control(host).insertAdjacentHTML("beforeend", items(1));
    await frames();

    expect(api(host).count).toBe(4);
    expect(itemAt(host, 3).getAttribute("aria-posinset")).toBe("4");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(
      basic('id="stars" default-value="1"', `<ui-rating-item id="first"></ui-rating-item>${items(4)}`).replace(
        "<label>",
        '<label id="stars-label">',
      ),
    );

    expect(root(host).id).toBe("stars");
    expect(itemAt(host, 0).id).toBe("first");
    expect(control(host).getAttribute("aria-labelledby")).toBe("stars-label");
  });

  it("warns once for a label or a hidden input without delegate", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const host = await mount(`
      <ui-rating default-value="1">
        <ui-rating-label>Rating</ui-rating-label>
        <ui-rating-control>${items()}</ui-rating-control>
        <ui-rating-hidden-input></ui-rating-hidden-input>
      </ui-rating>
    `);

    api(host).setValue(2);
    await frames();

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      expect.stringContaining("<ui-rating-label> needs the `delegate` attribute and a <label> child"),
      expect.stringContaining("<ui-rating-hidden-input> needs the `delegate` attribute and an <input> child"),
    ]);
  });
});

describe("value", () => {
  it("starts at default-value and checks that item", async () => {
    const host = await mount(basic());

    expect(api(host).value).toBe(3);
    expect(itemAt(host, 2).getAttribute("aria-checked")).toBe("true");
    expect(itemAt(host, 2).tabIndex).toBe(0);
    expect(itemAt(host, 3).hasAttribute("data-highlighted")).toBe(false);
  });

  it("sets the value on a click, and reports it", async () => {
    const host = await mount(basic());
    const changes = listen(host, "value-change");

    itemAt(host, 4).click();
    await frames();

    expect(api(host).value).toBe(5);
    expect(changes).toEqual([{ value: 5 }]);
    expect(input(host).value).toBe("5");
  });

  it("names the hidden input for the form", async () => {
    const host = await mount(basic('default-value="4" name="stars" required'));
    const form = document.createElement("form");

    form.append(root(host));
    host.append(form);
    await frames();

    expect(input(host).name).toBe("stars");
    expect(input(host).required).toBe(true);
    expect(new FormData(form).get("stars")).toBe("4");
  });

  it("holds a controlled value and still reports the change", async () => {
    const host = await mount(basic('value="2"'));
    const changes = listen(host, "value-change");

    itemAt(host, 3).click();
    await frames();

    expect(changes).toEqual([{ value: 4 }]);
    expect(api(host).value).toBe(2);

    root(host).setAttribute("value", "4");
    await frames();

    expect(api(host).value).toBe(4);
  });

  it("steps with the arrow keys", async () => {
    const host = await mount(basic());

    itemAt(host, 2).focus();
    await frames(1);
    await userEvent.keyboard("{ArrowRight}");
    await frames();

    expect(api(host).value).toBe(4);
    expect(document.activeElement).toBe(itemAt(host, 3));
  });

  it("refuses a click while readonly, and stays focusable", async () => {
    const host = await mount(basic('default-value="3" readonly'));

    itemAt(host, 4).click();
    await frames();

    expect(api(host).value).toBe(3);
    expect(itemAt(host, 2).tabIndex).toBe(0);
    expect(control(host).getAttribute("aria-readonly")).toBe("true");
  });
});

describe("fill", () => {
  it("fills each item by how much of it the value covers", async () => {
    const host = await mount(basic());

    expect(fills(host)).toEqual(["1", "1", "1", "0", "0"]);
  });

  it("follows the hovered value, half an item at a time with allow-half", async () => {
    const host = await mount(basic('default-value="1" allow-half'));
    const hovers = listen(host, "hover-change");

    await hover(host, 3, 0.25);

    expect(api(host).hoveredValue).toBe(3.5);
    expect(hovers).toContainEqual({ hoveredValue: 3.5 });
    expect(itemAt(host, 3).hasAttribute("data-half")).toBe(true);
    expect(fills(host)).toEqual(["1", "1", "1", "0.5", "0"]);
  });

  it("keeps a fractional value and fills part of an item", async () => {
    const host = await mount(basic('value="4.3" static'));

    expect(api(host).value).toBe(4.3);
    expect(fills(host)).toEqual(["1", "1", "1", "1", "0.3"]);
  });
});

describe("static", () => {
  it("is an image of its value, and its items are hidden", async () => {
    const host = await mount(basic('value="4.3" static'));

    expect(control(host).getAttribute("role")).toBe("img");
    expect(control(host).getAttribute("aria-label")).toBe("Rated 4.3 out of 5");
    expect(control(host).hasAttribute("aria-labelledby")).toBe(false);
    expect(itemAt(host, 4).getAttribute("aria-hidden")).toBe("true");
    expect(itemAt(host, 4).hasAttribute("role")).toBe(false);
    expect(itemAt(host, 4).hasAttribute("tabindex")).toBe(false);
    expect(itemAt(host, 4).hasAttribute("aria-checked")).toBe(false);
  });

  it("answers neither a click nor a hover", async () => {
    const host = await mount(basic('default-value="2" static allow-half'));

    await hover(host, 3, 0.75);
    itemAt(host, 3).click();
    await frames();

    expect(api(host).value).toBe(2);
    expect(api(host).hovering).toBe(false);
  });

  it("formats the value for the page's language", async () => {
    const host = await mount(`<div lang="de">${basic('value="4.25" static')}</div>`);

    expect(control(host).getAttribute("aria-label")).toBe("Rated 4,3 out of 5");
  });

  it("goes back to a radio group when static is removed", async () => {
    const host = await mount(basic('default-value="3" static'));

    root(host).removeAttribute("static");
    await frames();

    expect(control(host).getAttribute("role")).toBe("radiogroup");
    expect(control(host).hasAttribute("aria-label")).toBe(false);
    expect(itemAt(host, 2).getAttribute("role")).toBe("radio");
    expect(itemAt(host, 2).hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("accessible name", () => {
  it("labels each item and a static control through getRatingValueText", async () => {
    const host = await mount(basic());

    root(host).getRatingValueText = ({ value, count }) => `${value} of ${count}`;
    await frames();

    expect(itemAt(host, 1).getAttribute("aria-label")).toBe("2 of 5");

    root(host).setAttribute("static", "");
    await frames();

    expect(control(host).getAttribute("aria-label")).toBe("3 of 5");

    root(host).getRatingValueText = null;
    await frames();

    expect(control(host).getAttribute("aria-label")).toBe("Rated 3 out of 5");
  });

  it("keeps Zag's item label by default", async () => {
    const host = await mount(basic());

    expect(itemAt(host, 1).getAttribute("aria-label")).toBe("2 stars");
  });

  it("keeps an aria-label written on a static control", async () => {
    const host = await mount(
      basic('value="4.3" static').replace("<ui-rating-control", '<ui-rating-control aria-label="Bewertet mit 4,3"'),
    );

    expect(control(host).getAttribute("aria-label")).toBe("Bewertet mit 4,3");
  });

  it("keeps an aria-label written on an item", async () => {
    const host = await mount(basic('default-value="1"', `<ui-rating-item aria-label="Poor"></ui-rating-item>${items(4)}`));

    expect(itemAt(host, 0).getAttribute("aria-label")).toBe("Poor");
    expect(itemAt(host, 1).getAttribute("aria-label")).toBe("2 stars");
  });
});
