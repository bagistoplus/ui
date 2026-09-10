import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UIAccordionItem } from "./item";
import type { UIAccordion } from "./root";

const hosts: HTMLElement[] = [];
const styles: HTMLStyleElement[] = [];

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

function item(value: string, body = "Panel body"): string {
  return `
    <ui-accordion-item value="${value}">
      <ui-accordion-item-trigger delegate>
        <button>Trigger ${value}</button>
      </ui-accordion-item-trigger>
      <ui-accordion-item-content>
        <div>${body}</div>
      </ui-accordion-item-content>
    </ui-accordion-item>
  `;
}

const two = `<ui-accordion collapsible>${item("a")}${item("b")}</ui-accordion>`;
const three = `<ui-accordion collapsible>${item("a")}${item("b")}${item("c")}</ui-accordion>`;

function makeItem(value: string): UIAccordionItem {
  const template = document.createElement("template");

  template.innerHTML = item(value);

  return template.content.firstElementChild as UIAccordionItem;
}

const order = (host: ParentNode) =>
  [...host.querySelectorAll("ui-accordion-item")].map((el) => el.getAttribute("value"));

const triggers = (host: ParentNode) => [...host.querySelectorAll("button")];
const panels = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>("ui-accordion-item-content")];

function animate(duration = 300): void {
  const style = document.createElement("style");

  style.textContent = `
    ui-accordion[presence] [data-part="item-content"]:not([hidden]) { display: grid; overflow: hidden }
    ui-accordion[presence] [data-part="item-content"] > * { min-height: 0 }
    ui-accordion[presence] [data-part="item-content"][data-state="open"] { animation: test-open ${duration}ms linear }
    ui-accordion[presence] [data-part="item-content"][data-state="closed"] { animation: test-close ${duration}ms linear }
    @keyframes test-open { from { grid-template-rows: 0fr } to { grid-template-rows: 1fr } }
    @keyframes test-close { from { grid-template-rows: 1fr } to { grid-template-rows: 0fr } }
  `;

  document.head.append(style);
  styles.push(style);
}

function waitFor(predicate: () => boolean, timeout = 3000): Promise<void> {
  const deadline = performance.now() + timeout;

  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) {
        resolve();
        return;
      }

      if (performance.now() > deadline) {
        reject(new Error("timed out"));
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }

  for (const style of styles.splice(0)) {
    style.remove();
  }
});

describe("delegation", () => {
  it("puts Zag's trigger props on the button, not on the part element", async () => {
    const host = await mount(two);
    const [button] = triggers(host);
    const part = host.querySelector("ui-accordion-item-trigger")!;

    expect(button!.getAttribute("type")).toBe("button");
    expect(button!.getAttribute("aria-expanded")).toBe("false");
    expect(button!.getAttribute("aria-controls")).toBeTruthy();
    expect(button!.dataset.part).toBe("item-trigger");

    expect(part.getAttribute("aria-expanded")).toBeNull();
    expect(part.dataset.part).toBeUndefined();
  });

  it("puts a delegating root's props on its child, not on itself", async () => {
    const host = await mount(`
      <ui-accordion delegate collapsible>
        <ul id="authored">${item("a")}${item("b")}</ul>
      </ui-accordion>
    `);

    const root = host.querySelector<UIAccordion>("ui-accordion")!;
    const list = host.querySelector<HTMLElement>("ul")!;

    expect(list.dataset.scope).toBe("accordion");
    expect(list.dataset.part).toBe("root");
    expect(list.id).toBe("authored");

    expect(root.dataset.scope).toBeUndefined();
    expect(root.dataset.part).toBeUndefined();
  });

  it("keeps a delegating root working, items and all", async () => {
    const host = await mount(`
      <ui-accordion delegate collapsible>
        <ul>
          <li>${item("a")}</li>
          <li>${item("b")}</li>
        </ul>
      </ui-accordion>
    `);

    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[0]!);
    await frames();
    expect(root.api!.value).toEqual(["a"]);

    await userEvent.keyboard("{ArrowDown}");
    await frames();
    expect(document.activeElement).toBe(triggers(host)[1]);
  });

  it("puts a delegating item's props on its child", async () => {
    const host = await mount(`
      <ui-accordion collapsible>
        <ui-accordion-item delegate value="a">
          <li>
            <ui-accordion-item-trigger delegate><button>a</button></ui-accordion-item-trigger>
            <ui-accordion-item-content><div>body</div></ui-accordion-item-content>
          </li>
        </ui-accordion-item>
      </ui-accordion>
    `);

    const item_ = host.querySelector<HTMLElement>("ui-accordion-item")!;
    const li = host.querySelector<HTMLElement>("li")!;

    expect(li.dataset.part).toBe("item");
    expect(li.dataset.state).toBe("closed");
    expect(item_.dataset.part).toBeUndefined();

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(li.dataset.state).toBe("open");
  });

  it("puts a delegating content and indicator on their children", async () => {
    const host = await mount(`
      <ui-accordion collapsible>
        <ui-accordion-item value="a">
          <ui-accordion-item-trigger delegate>
            <button>a<ui-accordion-item-indicator delegate><i></i></ui-accordion-item-indicator></button>
          </ui-accordion-item-trigger>
          <ui-accordion-item-content delegate><section>body</section></ui-accordion-item-content>
        </ui-accordion-item>
      </ui-accordion>
    `);

    const section = host.querySelector<HTMLElement>("section")!;
    const icon = host.querySelector<HTMLElement>("i")!;

    expect(section.dataset.part).toBe("item-content");
    expect(section.hasAttribute("hidden")).toBe(true);
    expect(icon.dataset.part).toBe("item-indicator");

    expect(host.querySelector("ui-accordion-item-content")!.hasAttribute("hidden")).toBe(false);
  });

  it("puts content and indicator props on the elements themselves", async () => {
    const host = await mount(two);
    const content = host.querySelector<HTMLElement>("ui-accordion-item-content")!;
    const indicator = host.querySelector<HTMLElement>("ui-accordion-item-indicator");

    // Containers, not delegating parts: a class written here would work.
    expect(content.dataset.part).toBe("item-content");
    expect(content.dataset.state).toBe("closed");
    expect(content.hasAttribute("hidden")).toBe(true);

    if (indicator) {
      expect(indicator.dataset.part).toBe("item-indicator");
    }
  });

  it("wires a delegate target that appears after the part connected", async () => {
    const host = await mount(`
      <ui-accordion collapsible>
        <ui-accordion-item value="a">
          <ui-accordion-item-trigger delegate></ui-accordion-item-trigger>
        </ui-accordion-item>
      </ui-accordion>
    `);

    const part = host.querySelector("ui-accordion-item-trigger")!;
    expect(part.children.length).toBe(0);

    const button = document.createElement("button");
    part.append(button);
    await frames();

    expect(button.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("collapsed content", () => {
  it("is hidden and not focusable, and becomes focusable when opened", async () => {
    const host = await mount(
      `<ui-accordion collapsible>${item("a", '<a href="#x" id="deep">deep link</a>')}</ui-accordion>`,
    );

    const link = host.querySelector<HTMLAnchorElement>("#deep")!;
    const [panel] = panels(host);

    expect(panel!.hasAttribute("hidden")).toBe(true);

    link.focus();
    expect(document.activeElement).not.toBe(link);

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(panel!.hasAttribute("hidden")).toBe(false);

    link.focus();
    expect(document.activeElement).toBe(link);
  });
});

describe("attributes", () => {
  it("opens the item named by default-value", async () => {
    const host = await mount(`<ui-accordion collapsible default-value="b">${item("a")}${item("b")}</ui-accordion>`);

    expect(panels(host)[0]!.hasAttribute("hidden")).toBe(true);
    expect(panels(host)[1]!.hasAttribute("hidden")).toBe(false);
  });

  it("applies a changed attribute on the first edit and keeps its state", async () => {
    const host = await mount(two);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[1]!);
    await frames();
    expect(root.api!.value).toEqual(["b"]);

    root.setAttribute("multiple", "");
    await frames();

    // State survived the attribute change: no destroy, no re-init.
    expect(root.api!.value).toEqual(["b"]);

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(root.api!.value.sort()).toEqual(["a", "b"]);
  });
});

describe("identity", () => {
  it("keeps an id the consumer authored", async () => {
    const host = await mount(`<ui-accordion id="faq" collapsible>${item("a")}</ui-accordion>`);
    const root = host.querySelector<UIAccordion>("#faq");

    expect(root).not.toBeNull();
    expect(root!.id).toBe("faq");
    expect(triggers(host)[0]!.dataset.ownedby).toBe("faq");
  });

  it("generates an id when the consumer authored none", async () => {
    const host = await mount(two);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    expect(root.id).toMatch(/^accordion:/);
  });
});

describe("api", () => {
  it("exposes the live Zag api for imperative control", async () => {
    const host = await mount(two);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    root.api!.setValue(["a"]);
    await frames();

    expect(panels(host)[0]!.hasAttribute("hidden")).toBe(false);
    expect(triggers(host)[0]!.getAttribute("aria-expanded")).toBe("true");
  });

  it("emits a bubbling value-change event", async () => {
    const host = await mount(two);
    const seen: string[][] = [];

    host.addEventListener("ui-accordion:value-change", (event) => {
      seen.push((event as CustomEvent<{ value: string[] }>).detail.value);
    });

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(seen).toEqual([["a"]]);
  });
});

describe("lifecycle", () => {
  it("keeps its state when the element is moved", async () => {
    const host = await mount(two);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[1]!);
    await frames();
    expect(root.api!.value).toEqual(["b"]);

    const elsewhere = document.createElement("section");
    host.append(elsewhere);
    elsewhere.append(root);
    await frames();

    expect(root.api!.value).toEqual(["b"]);
    expect(panels(host)[1]!.hasAttribute("hidden")).toBe(false);
  });
});

describe("keyboard", () => {
  it("moves focus between triggers with the arrow keys", async () => {
    const host = await mount(two);
    const [first, second] = triggers(host);

    await userEvent.click(first!);
    await userEvent.keyboard("{ArrowDown}");
    await frames();

    expect(document.activeElement).toBe(second);
  });
});

describe("nesting", () => {
  it("keeps an inner accordion's triggers out of the outer one", async () => {
    const host = await mount(`
      <ui-accordion collapsible default-value="outer">
        <ui-accordion-item value="outer">
          <ui-accordion-item-trigger delegate><button id="outer-trigger">Outer</button></ui-accordion-item-trigger>
          <ui-accordion-item-content>
            <div>
              <ui-accordion collapsible>${item("inner")}</ui-accordion>
            </div>
          </ui-accordion-item-content>
        </ui-accordion-item>
      </ui-accordion>
    `);

    const outerRoot = host.querySelector<UIAccordion>("ui-accordion")!;
    const innerRoot = host.querySelectorAll<UIAccordion>("ui-accordion")[1]!;
    const innerButton = host.querySelector<HTMLButtonElement>("ui-accordion ui-accordion button")!;

    expect(innerButton.dataset.ownedby).toBe(innerRoot.id);
    expect(innerButton.dataset.ownedby).not.toBe(outerRoot.id);

    await userEvent.click(innerButton);
    await frames();

    expect(innerRoot.api!.value).toEqual(["inner"]);
    expect(outerRoot.api!.value).toEqual(["outer"]);
  });

  it("nests delegating roots through real lists", async () => {
    const host = await mount(`
      <ui-accordion delegate multiple>
        <ul id="outer-list">
          <li>
            <ui-accordion-item value="outer">
              <ui-accordion-item-trigger delegate><button>Outer</button></ui-accordion-item-trigger>
              <ui-accordion-item-content>
                <div><div>
                  <ui-accordion delegate multiple>
                    <ul id="inner-list">
                      <li>${item("inner")}</li>
                    </ul>
                  </ui-accordion>
                </div></div>
              </ui-accordion-item-content>
            </ui-accordion-item>
          </li>
        </ul>
      </ui-accordion>
    `);

    const [outerRoot, innerRoot] = [...host.querySelectorAll<UIAccordion>("ui-accordion")];
    const innerButton = host.querySelector<HTMLButtonElement>("#inner-list button")!;

    expect(host.querySelector<HTMLElement>("#outer-list")!.dataset.part).toBe("root");
    expect(innerButton.dataset.ownedby).toBe("inner-list");
    expect(innerButton.dataset.ownedby).not.toBe("outer-list");

    await userEvent.click(triggers(host)[0]!);
    await userEvent.click(innerButton);
    await frames();

    expect(outerRoot!.api!.value).toEqual(["outer"]);
    expect(innerRoot!.api!.value).toEqual(["inner"]);
  });
});

describe("presence", () => {
  it("is off by default, so a closed panel is hidden at once", async () => {
    const host = await mount(two);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    root.api!.setValue(["a"]);
    await frames();
    expect(panels(host)[0]!.hasAttribute("hidden")).toBe(false);

    root.api!.setValue([]);
    await frames();
    expect(panels(host)[0]!.hasAttribute("hidden")).toBe(true);
  });

  it("holds a delegated panel open through its exit animation", async () => {
    animate();

    const host = await mount(
      `<ui-accordion collapsible presence>
        <ui-accordion-item value="a">
          <ui-accordion-item-trigger delegate><button>Trigger a</button></ui-accordion-item-trigger>
          <ui-accordion-item-content delegate>
            <section><div>Panel body</div></section>
          </ui-accordion-item-content>
        </ui-accordion-item>
      </ui-accordion>`,
    );

    const part = host.querySelector<HTMLElement>("ui-accordion-item-content")!;
    const panel = host.querySelector<HTMLElement>("section")!;

    await userEvent.click(triggers(host)[0]!);
    await waitFor(() => !panel.hasAttribute("hidden") && panel.dataset.state === "open");

    await userEvent.click(triggers(host)[0]!);
    await frames();

    // The deferred `hidden` must land on the delegate target, and the panel
    // must still be mounted while the close animation runs.
    expect(panel.dataset.state).toBe("closed");
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(part.hasAttribute("hidden")).toBe(false);

    await waitFor(() => panel.hasAttribute("hidden"));
  });

  it("collapses past the padding when the grid row carries none of it", async () => {
    animate();

    // Padding on the row itself would set a floor the 0fr track cannot go
    // below, so it goes on a box inside the row. Without that, the close eases
    // down to the padding height, stalls there, and only `hidden` finishes the
    // job, which reads as a snap.
    const host = await mount(
      `<ui-accordion collapsible presence>
        <ui-accordion-item value="a">
          <ui-accordion-item-trigger delegate><button>Trigger a</button></ui-accordion-item-trigger>
          <ui-accordion-item-content>
            <div><div style="padding-bottom: 16px">Padded body</div></div>
          </ui-accordion-item-content>
        </ui-accordion-item>
      </ui-accordion>`,
    );

    const [panel] = panels(host);

    await userEvent.click(triggers(host)[0]!);
    await waitFor(() => panel!.getBoundingClientRect().height > 16);

    const heights: number[] = [];
    const sample = () => {
      if (panel!.hasAttribute("hidden")) {
        return;
      }

      heights.push(panel!.getBoundingClientRect().height);
      requestAnimationFrame(sample);
    };

    requestAnimationFrame(sample);
    await userEvent.click(triggers(host)[0]!);
    await waitFor(() => panel!.hasAttribute("hidden"));

    expect(Math.min(...heights)).toBeLessThan(4);
  });

  it("keeps a closing panel mounted for the animation, then hides it", async () => {
    animate();

    const host = await mount(
      `<ui-accordion collapsible presence>${item("a", '<a href="#x" id="deep">deep link</a>')}</ui-accordion>`,
    );

    const link = host.querySelector<HTMLAnchorElement>("#deep")!;
    const [panel] = panels(host);

    expect(panel!.hasAttribute("hidden")).toBe(true);

    await userEvent.click(triggers(host)[0]!);
    await frames();

    expect(panel!.hasAttribute("hidden")).toBe(false);
    link.focus();
    expect(document.activeElement).toBe(link);

    await userEvent.click(triggers(host)[0]!);
    await frames(4);

    // Still mounted while the exit animation runs. This is what presence buys.
    expect(panel!.getAttribute("data-state")).toBe("closed");
    expect(panel!.hasAttribute("hidden")).toBe(false);

    await waitFor(() => panel!.hasAttribute("hidden"));

    link.focus();
    expect(document.activeElement).not.toBe(link);
  });
});

// The four things the Visual editor does to a block's children. A morph reaches
// the DOM as exactly these operations.
describe("editor operations", () => {
  it("keeps state when a trigger's text changes", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[1]!);
    await frames();

    triggers(host)[1]!.textContent = "Renamed";
    await frames();

    expect(triggers(host)[1]!.textContent).toBe("Renamed");
    expect(root.api!.value).toEqual(["b"]);
    expect(panels(host)[1]!.hasAttribute("hidden")).toBe(false);

    // Still wired after the text node was replaced under it.
    await userEvent.click(triggers(host)[1]!);
    await frames();
    expect(root.api!.value).toEqual([]);
  });

  it("keeps state through a reorder and rewires the moved item", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[1]!);
    await frames();

    const last = [...host.querySelectorAll<UIAccordionItem>("ui-accordion-item")].at(-1)!;

    root.prepend(last);
    await frames();

    expect(order(host)).toEqual(["c", "a", "b"]);
    // State is keyed by value, not by position.
    expect(root.api!.value).toEqual(["b"]);

    // The moved item survived its disconnect and reconnect.
    await userEvent.click(triggers(host)[0]!);
    await frames();
    expect(root.api!.value).toEqual(["c"]);
  });

  it("wires an inserted item immediately", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[0]!);
    await frames();

    const fresh = makeItem("new");

    host.querySelector("ui-accordion-item")!.after(fresh);
    await frames();

    expect(order(host)).toEqual(["a", "new", "b", "c"]);
    expect(root.api!.value).toEqual(["a"]);

    await userEvent.click(triggers(host)[1]!);
    await frames();
    expect(root.api!.value).toEqual(["new"]);
  });

  it("keeps working after an item is removed", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[0]!);
    await frames();

    [...host.querySelectorAll<UIAccordionItem>("ui-accordion-item")].at(-1)!.remove();
    await frames();

    expect(order(host)).toEqual(["a", "b"]);
    expect(root.api!.value).toEqual(["a"]);

    await userEvent.click(triggers(host)[1]!);
    await frames();
    expect(root.api!.value).toEqual(["b"]);
  });

  it("leaves a removed item's value in the machine until something else opens", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;

    await userEvent.click(triggers(host)[2]!);
    await frames();
    expect(root.api!.value).toEqual(["c"]);

    [...host.querySelectorAll<UIAccordionItem>("ui-accordion-item")].at(-1)!.remove();
    await frames();

    // Zag owns a list of strings, not the list of items, so the value is stale.
    // Harmless, and it means an editor undo restores the open state too.
    expect(root.api!.value).toEqual(["c"]);

    await userEvent.click(triggers(host)[0]!);
    await frames();
    expect(root.api!.value).toEqual(["a"]);
  });

  it("follows DOM order for arrow keys after a reorder", async () => {
    const host = await mount(three);
    const root = host.querySelector<UIAccordion>("ui-accordion")!;
    const last = [...host.querySelectorAll<UIAccordionItem>("ui-accordion-item")].at(-1)!;

    root.prepend(last);
    await frames();

    await userEvent.click(triggers(host)[0]!);
    await userEvent.keyboard("{ArrowDown}");
    await frames();

    expect(document.activeElement).toBe(triggers(host)[1]);
  });
});

describe("property reflection", () => {
  it("reflects value and disabled assigned as properties", async () => {
    const host = await mount(`
      <ui-accordion collapsible>
        <ui-accordion-item>
          <ui-accordion-item-trigger delegate><button>a</button></ui-accordion-item-trigger>
          <ui-accordion-item-content><div>body</div></ui-accordion-item-content>
        </ui-accordion-item>
      </ui-accordion>
    `);

    const item = host.querySelector<any>("ui-accordion-item")!;

    // A framework decides between setAttribute and a property assignment with
    // `key in el`, so a getter with no setter silently drops the write.
    item.value = "a";
    await frames();

    expect(item.getAttribute("value")).toBe("a");
    expect(item.dataset.part).toBe("item");

    item.disabled = true;
    await frames();
    expect(item.hasAttribute("disabled")).toBe(true);
  });
});
