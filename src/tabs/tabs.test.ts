import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UITabs } from "./root";

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

function tab(value: string, label = value): string {
  return `
    <ui-tabs-trigger delegate value="${value}">
      <button>${label}</button>
    </ui-tabs-trigger>
  `;
}

function panel(value: string, body = `Panel ${value}`): string {
  return `<ui-tabs-content value="${value}"><div>${body}</div></ui-tabs-content>`;
}

function basic(attrs = 'default-value="a"'): string {
  return `
    <ui-tabs ${attrs}>
      <ui-tabs-list>${tab("a")}${tab("b")}${tab("c")}</ui-tabs-list>
      ${panel("a")}${panel("b")}${panel("c")}
    </ui-tabs>
  `;
}

const root = (host: ParentNode) => host.querySelector<UITabs>("ui-tabs")!;
const triggers = (host: ParentNode) => [...host.querySelectorAll("button")];
const panels = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>("ui-tabs-content")];

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("anatomy", () => {
  it("puts each part's props on the right element", async () => {
    const host = await mount(basic());
    const list = host.querySelector<HTMLElement>("ui-tabs-list")!;
    const [button] = triggers(host);
    const [first] = panels(host);

    expect(root(host).dataset.part).toBe("root");
    expect(list.getAttribute("role")).toBe("tablist");
    expect(list.dataset.part).toBe("list");

    expect(button!.getAttribute("role")).toBe("tab");
    expect(button!.getAttribute("type")).toBe("button");
    expect(button!.getAttribute("aria-selected")).toBe("true");
    expect(button!.dataset.part).toBe("trigger");

    expect(first!.getAttribute("role")).toBe("tabpanel");
    expect(first!.getAttribute("aria-labelledby")).toBe(button!.id);
  });

  it("hides every panel but the selected one", async () => {
    const host = await mount(basic());
    const [a, b, c] = panels(host);

    expect(a!.hasAttribute("hidden")).toBe(false);
    expect(b!.hasAttribute("hidden")).toBe(true);
    expect(c!.hasAttribute("hidden")).toBe(true);
  });

  it("keeps a hidden panel's links out of the tab order", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list>${tab("a")}${tab("b")}</ui-tabs-list>
        ${panel("a")}
        <ui-tabs-content value="b"><a href="#x" id="deep">deep</a></ui-tabs-content>
      </ui-tabs>
    `);

    const link = host.querySelector<HTMLAnchorElement>("#deep")!;

    link.focus();
    expect(document.activeElement).not.toBe(link);
  });

  it("skips a trigger with no value rather than rendering a broken one", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list>
          ${tab("a")}
          <ui-tabs-trigger delegate><button id="orphan">orphan</button></ui-tabs-trigger>
        </ui-tabs-list>
        ${panel("a")}
      </ui-tabs>
    `);

    const orphan = host.querySelector<HTMLElement>("#orphan")!;

    expect(orphan.dataset.part).toBeUndefined();
    expect(orphan.getAttribute("role")).toBeNull();
  });
});

describe("selection", () => {
  it("switches panels on click", async () => {
    const host = await mount(basic());

    await userEvent.click(triggers(host)[1]!);
    await frames();

    expect(root(host).api!.value).toBe("b");
    expect(panels(host)[0]!.hasAttribute("hidden")).toBe(true);
    expect(panels(host)[1]!.hasAttribute("hidden")).toBe(false);
  });

  it("drives selection through the api", async () => {
    const host = await mount(basic());

    root(host).api!.setValue("c");
    await frames();

    expect(panels(host)[2]!.hasAttribute("hidden")).toBe(false);
  });

  it("emits a namespaced value-change event", async () => {
    const host = await mount(basic());
    const seen: string[] = [];

    root(host).addEventListener("ui-tabs:value-change", (event) => {
      seen.push((event as CustomEvent).detail.value);
    });

    await userEvent.click(triggers(host)[1]!);
    await frames();

    expect(seen).toEqual(["b"]);
  });

  it("clears the value on a re-click only when deselectable", async () => {
    const plain = await mount(basic());
    await userEvent.click(triggers(plain)[0]!);
    await frames();
    expect(root(plain).api!.value).toBe("a");

    const host = await mount(basic('default-value="a" deselectable'));
    await userEvent.click(triggers(host)[0]!);
    await frames();
    expect(root(host).api!.value).toBeNull();
  });
});

describe("keyboard", () => {
  it("moves with the arrows and wraps, and jumps with Home and End", async () => {
    const host = await mount(basic());

    await userEvent.click(triggers(host)[0]!);
    await userEvent.keyboard("{ArrowRight}");
    await frames();
    expect(root(host).api!.value).toBe("b");

    await userEvent.keyboard("{End}");
    await frames();
    expect(root(host).api!.value).toBe("c");

    await userEvent.keyboard("{ArrowRight}");
    await frames();
    expect(root(host).api!.value).toBe("a");

    await userEvent.keyboard("{ArrowLeft}");
    await frames();
    expect(root(host).api!.value).toBe("c");

    await userEvent.keyboard("{Home}");
    await frames();
    expect(root(host).api!.value).toBe("a");
  });

  it("uses the vertical axis when the orientation says so", async () => {
    const host = await mount(basic('default-value="a" orientation="vertical"'));

    await userEvent.click(triggers(host)[0]!);
    await userEvent.keyboard("{ArrowRight}");
    await frames();
    expect(root(host).api!.value).toBe("a");

    await userEvent.keyboard("{ArrowDown}");
    await frames();
    expect(root(host).api!.value).toBe("b");
  });

  it("moves focus without selecting when activation is manual", async () => {
    const host = await mount(basic('default-value="a" activation-mode="manual"'));

    await userEvent.click(triggers(host)[0]!);
    await userEvent.keyboard("{ArrowRight}");
    await frames();

    expect(document.activeElement).toBe(triggers(host)[1]);
    expect(root(host).api!.value).toBe("a");

    await userEvent.keyboard("{Enter}");
    await frames();
    expect(root(host).api!.value).toBe("b");
  });

  it("skips a disabled trigger", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list>
          ${tab("a")}
          <ui-tabs-trigger delegate value="b" disabled><button>b</button></ui-tabs-trigger>
          ${tab("c")}
        </ui-tabs-list>
        ${panel("a")}${panel("b")}${panel("c")}
      </ui-tabs>
    `);

    await userEvent.click(triggers(host)[0]!);
    await userEvent.keyboard("{ArrowRight}");
    await frames();

    expect(root(host).api!.value).toBe("c");
  });
});

describe("delegate", () => {
  it("puts a delegating root's props on its child", async () => {
    const host = await mount(`
      <ui-tabs delegate default-value="a">
        <section id="authored">
          <ui-tabs-list>${tab("a")}</ui-tabs-list>
          ${panel("a")}
        </section>
      </ui-tabs>
    `);

    const section = host.querySelector<HTMLElement>("#authored")!;

    expect(section.dataset.part).toBe("root");
    expect(root(host).dataset.part).toBeUndefined();
  });

  it("delegates the list, the content and the indicator", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list delegate>
          <ul>${tab("a")}</ul>
        </ui-tabs-list>
        <ui-tabs-content delegate value="a"><section>body</section></ui-tabs-content>
        <ui-tabs-indicator delegate><i></i></ui-tabs-indicator>
      </ui-tabs>
    `);

    expect(host.querySelector<HTMLElement>("ul")!.getAttribute("role")).toBe("tablist");
    expect(host.querySelector<HTMLElement>("section")!.getAttribute("role")).toBe("tabpanel");
    expect(host.querySelector<HTMLElement>("i")!.dataset.part).toBe("indicator");
  });
});

describe("list label", () => {
  it("names the tablist, which a plain aria-label cannot do", async () => {
    const host = await mount(`
      <ui-tabs default-value="a" list-label="Product details">
        <ui-tabs-list aria-label="stripped by zag">${tab("a")}</ui-tabs-list>
        ${panel("a")}
      </ui-tabs>
    `);

    expect(host.querySelector("ui-tabs-list")!.getAttribute("aria-label")).toBe("Product details");
  });

  it("leaves aria-labelledby alone, since Zag never writes that key", async () => {
    const host = await mount(`
      <h2 id="heading">Details</h2>
      <ui-tabs default-value="a">
        <ui-tabs-list aria-labelledby="heading">${tab("a")}</ui-tabs-list>
        ${panel("a")}
      </ui-tabs>
    `);

    expect(host.querySelector("ui-tabs-list")!.getAttribute("aria-labelledby")).toBe("heading");
  });
});

describe("indicator", () => {
  it("writes the measured rect out as custom properties", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list style="position: relative">
          ${tab("a", "Short")}${tab("b", "A much longer label")}
          <ui-tabs-indicator></ui-tabs-indicator>
        </ui-tabs-list>
        ${panel("a")}${panel("b")}
      </ui-tabs>
    `);

    const indicator = host.querySelector<HTMLElement>("ui-tabs-indicator")!;

    // Proves the style object is serialized rather than stringified.
    expect(indicator.getAttribute("style")).not.toContain("[object Object]");
    expect(indicator.style.position).toBe("absolute");

    // Measured on the first paint, with no interaction. Zag does this in a
    // machine entry action, so it only works because the machine starts after
    // the first render rather than in `connectedCallback`.
    const width = indicator.style.getPropertyValue("--width");
    expect(width).toMatch(/^\d/);
    expect(indicator.hasAttribute("hidden")).toBe(false);

    await userEvent.click(triggers(host)[1]!);
    await frames(6);

    expect(indicator.style.getPropertyValue("--width")).not.toBe(width);
  });

  it("tracks a trigger resizing, with no selection change first", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list style="position: relative">
          ${tab("a", "Short")}${tab("b", "Other")}
          <ui-tabs-indicator></ui-tabs-indicator>
        </ui-tabs-list>
        ${panel("a")}${panel("b")}
      </ui-tabs>
    `);

    const indicator = host.querySelector<HTMLElement>("ui-tabs-indicator")!;
    const before = indicator.style.getPropertyValue("--width");

    // The ResizeObserver is installed by the same entry action that measures.
    // If that action bailed, this never updates.
    triggers(host)[0]!.textContent = "A very much longer label than before";
    await frames(10);

    expect(indicator.style.getPropertyValue("--width")).not.toBe(before);
  });
});

describe("runtime changes", () => {
  it("adopts a trigger appended after mount", async () => {
    const host = await mount(basic());
    const list = host.querySelector("ui-tabs-list")!;

    list.insertAdjacentHTML("beforeend", tab("d"));
    host.querySelector("ui-tabs")!.insertAdjacentHTML("beforeend", panel("d"));
    await frames();

    const added = triggers(host).at(-1)!;
    expect(added.getAttribute("role")).toBe("tab");

    await userEvent.click(added);
    await frames();
    expect(root(host).api!.value).toBe("d");
  });

  it("survives a trigger being reordered by a move", async () => {
    const host = await mount(basic());
    const list = host.querySelector("ui-tabs-list")!;
    const last = list.lastElementChild!;

    list.prepend(last);
    await frames();

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(root(host).api!.value).toBe("c");
  });

  it("stops driving a removed trigger", async () => {
    const host = await mount(basic());
    const list = host.querySelector("ui-tabs-list")!;

    list.lastElementChild!.remove();
    await frames();

    expect(triggers(host)).toHaveLength(2);
    expect(root(host).api!.value).toBe("a");
  });
});

describe("nesting", () => {
  it("keeps an inner tabs' triggers out of the outer one", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list>${tab("a")}${tab("b")}</ui-tabs-list>
        <ui-tabs-content value="a">
          <ui-tabs default-value="x">
            <ui-tabs-list>${tab("x")}${tab("y")}</ui-tabs-list>
            ${panel("x")}${panel("y")}
          </ui-tabs>
        </ui-tabs-content>
        ${panel("b")}
      </ui-tabs>
    `);

    const [outer, inner] = [...host.querySelectorAll<UITabs>("ui-tabs")];
    const innerButton = inner!.querySelectorAll("button")[1]!;

    await userEvent.click(innerButton);
    await frames();

    expect(inner!.api!.value).toBe("y");
    expect(outer!.api!.value).toBe("a");
  });
});

describe("property reflection", () => {
  it("reflects a value assigned as a property, the way a framework renders it", async () => {
    const host = await mount(`
      <ui-tabs default-value="a">
        <ui-tabs-list>
          <ui-tabs-trigger delegate><button>a</button></ui-tabs-trigger>
        </ui-tabs-list>
        <ui-tabs-content></ui-tabs-content>
      </ui-tabs>
    `);

    const trigger = host.querySelector<any>("ui-tabs-trigger")!;
    const content = host.querySelector<any>("ui-tabs-content")!;

    // Vue tests `key in el` and assigns the property rather than calling
    // setAttribute. Without a setter this write is lost and the part renders
    // nothing, which is invisible until a client-side route change.
    trigger.value = "a";
    content.value = "a";
    await frames();

    expect(trigger.getAttribute("value")).toBe("a");
    expect(content.getAttribute("value")).toBe("a");
    expect(triggers(host)[0]!.getAttribute("role")).toBe("tab");
    expect(content.hasAttribute("hidden")).toBe(false);
  });

  it("reflects disabled, which a framework sends as a boolean", async () => {
    const host = await mount(basic());
    const trigger = host.querySelector<any>("ui-tabs-trigger")!;

    trigger.disabled = true;
    await frames();
    expect(trigger.hasAttribute("disabled")).toBe(true);

    trigger.disabled = false;
    await frames();
    expect(trigger.hasAttribute("disabled")).toBe(false);
  });
});
