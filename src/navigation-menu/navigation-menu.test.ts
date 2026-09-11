import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UINavigationMenu } from "./root";

const hosts: HTMLElement[] = [];

let harness: HTMLStyleElement | undefined;

function frames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
}

/**
 * Layout, not decoration. Panels are positioned out of the flow so a hover on
 * one trigger never lands on another's panel, and every element has a size
 * Playwright can hit.
 */
function layout(): void {
  if (harness) {
    return;
  }

  // Where the pointer parks between tests. Hover fires `pointerenter` only when
  // the pointer moves onto the element, and a test that ends with the pointer
  // over a trigger would leave the next test's trigger, mounted at the same
  // place, already hovered.
  const parking = document.createElement("div");
  parking.id = "pointer-parking";
  parking.style.cssText = "position: fixed; top: 0; left: 0; width: 12px; height: 12px";
  document.body.append(parking);

  harness = document.createElement("style");
  harness.textContent = `
    ui-navigation-menu-list > ul { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0 }
    ui-navigation-menu-item { position: relative }
    ui-navigation-menu-item > ui-navigation-menu-content { position: absolute; top: 100%; left: 0 }
    ui-navigation-menu-content { box-sizing: border-box; width: 200px; padding: 8px; background: #fff; border: 1px solid #ccc }
    ui-navigation-menu-content a { display: block; padding: 4px }
    ui-navigation-menu-viewport-positioner { position: absolute; top: 100%; left: 0; transform: translateX(var(--viewport-x)) }
    ui-navigation-menu-viewport { position: relative; width: var(--viewport-width); height: var(--viewport-height); overflow: hidden }
    ui-navigation-menu-viewport > ui-navigation-menu-content { position: absolute; top: 0; left: 0 }
    .animated[data-state="closed"] { animation: nav-out 80ms linear }
    @keyframes nav-out { from { opacity: 1 } to { opacity: 0 } }
  `;

  document.head.append(harness);
}

async function mount(html: string): Promise<HTMLElement> {
  layout();

  const host = document.createElement("div");
  host.style.padding = "40px 40px 400px";
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);

  await userEvent.hover(document.querySelector("#pointer-parking")!);
  await frames();

  return host;
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

/**
 * The nested shape: each content inside its item. The bar mixes triggers and
 * link items, and the link items are written in both shapes on purpose: the
 * delegated one is the documented recipe, the plain one is the control.
 */
function nested(attrs = ""): string {
  return `
    <ui-navigation-menu ${attrs}>
      <ui-navigation-menu-list>
        <ul>
          <li>
            <ui-navigation-menu-item value="products">
              <ui-navigation-menu-trigger delegate><button>Products</button></ui-navigation-menu-trigger>
              <ui-navigation-menu-content value="products">
                <ui-navigation-menu-link delegate><a href="#all">All products</a></ui-navigation-menu-link>
                <ui-navigation-menu-link delegate><a href="#new">New in</a></ui-navigation-menu-link>
              </ui-navigation-menu-content>
            </ui-navigation-menu-item>
          </li>
          <li>
            <ui-navigation-menu-item value="about" delegate>
              <ui-navigation-menu-link delegate><a href="#about">About</a></ui-navigation-menu-link>
            </ui-navigation-menu-item>
          </li>
          <li>
            <ui-navigation-menu-item value="plain">
              <ui-navigation-menu-link delegate><a href="#plain">Plain</a></ui-navigation-menu-link>
            </ui-navigation-menu-item>
          </li>
          <li>
            <ui-navigation-menu-item value="company">
              <ui-navigation-menu-trigger delegate><button>Company</button></ui-navigation-menu-trigger>
              <ui-navigation-menu-content value="company">
                <ui-navigation-menu-link delegate><a href="#team">Team</a></ui-navigation-menu-link>
              </ui-navigation-menu-content>
            </ui-navigation-menu-item>
          </li>
        </ul>
      </ui-navigation-menu-list>
    </ui-navigation-menu>
  `;
}

/** The viewport shape: one shared surface, every content inside it. */
function viewport(attrs = "", contentAttrs = "presence"): string {
  const item = (value: string) => `
    <li>
      <ui-navigation-menu-item value="${value}">
        <ui-navigation-menu-trigger delegate><button>${value}</button></ui-navigation-menu-trigger>
        <ui-navigation-menu-trigger-proxy></ui-navigation-menu-trigger-proxy>
        <ui-navigation-menu-viewport-proxy></ui-navigation-menu-viewport-proxy>
      </ui-navigation-menu-item>
    </li>
  `;

  return `
    <ui-navigation-menu ${attrs}>
      <ui-navigation-menu-list><ul>${item("a")}${item("b")}</ul></ui-navigation-menu-list>
      <ui-navigation-menu-viewport-positioner align="start">
        <ui-navigation-menu-viewport align="start" class="animated">
          <ui-navigation-menu-content value="a" ${contentAttrs} class="animated">
            <ui-navigation-menu-link delegate><a href="#a1">A one</a></ui-navigation-menu-link>
            <ui-navigation-menu-link delegate><a href="#a2">A two</a></ui-navigation-menu-link>
          </ui-navigation-menu-content>
          <ui-navigation-menu-content value="b" ${contentAttrs} class="animated">
            <ui-navigation-menu-link delegate><a href="#b1">B one</a></ui-navigation-menu-link>
          </ui-navigation-menu-content>
        </ui-navigation-menu-viewport>
      </ui-navigation-menu-viewport-positioner>
    </ui-navigation-menu>
  `;
}

const root = (scope: ParentNode) => scope.querySelector<UINavigationMenu>("ui-navigation-menu")!;
const trigger = (scope: ParentNode, label: string) =>
  [...scope.querySelectorAll<HTMLButtonElement>("ui-navigation-menu-trigger > button")].find((b) => b.textContent === label)!;
const content = (scope: ParentNode, value: string) =>
  scope.querySelector<HTMLElement>(`ui-navigation-menu-content[value="${value}"]`)!;
const link = (scope: ParentNode, label: string) =>
  [...scope.querySelectorAll<HTMLAnchorElement>("a")].find((a) => a.textContent === label)!;
const isOpen = (el: HTMLElement) => el.dataset.state === "open" && !el.hidden;

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }

  vi.restoreAllMocks();
});

describe("anatomy", () => {
  it("binds the parts", async () => {
    const host = await mount(nested('translations-root-label="Main"'));

    expect(root(host).dataset.scope).toBe("navigation-menu");
    expect(root(host).dataset.part).toBe("root");
    expect(root(host).getAttribute("aria-label")).toBe("Main");

    const list = host.querySelector<HTMLElement>("ui-navigation-menu-list")!;
    expect(list.dataset.part).toBe("list");
    expect(list.style.position).toBe("relative");

    const item = host.querySelector<HTMLElement>('ui-navigation-menu-item[value="products"]')!;
    expect(item.dataset.part).toBe("item");
    expect(item.dataset.state).toBe("closed");

    const products = trigger(host, "Products");
    expect(products.dataset.part).toBe("trigger");
    expect(products.getAttribute("aria-expanded")).toBe("false");
    expect(products.getAttribute("aria-controls")).toBe(content(host, "products").id);

    expect(content(host, "products").hidden).toBe(true);
    expect(content(host, "products").dataset.state).toBe("closed");
    expect(content(host, "products").getAttribute("aria-labelledby")).toBe(products.id);

    const all = link(host, "All products");
    expect(all.dataset.part).toBe("link");
    expect(all.dataset.value).toBe("products");
    expect(all.dataset.ownedby).toBe(content(host, "products").id);
  });

  it("puts the item props on the link wrapper when the item delegates", async () => {
    const host = await mount(nested());
    const about = link(host, "About");

    // The documented shape for a link that is the whole item: the `<a>` is a
    // direct child of the element carrying `data-part="item"`, which is what
    // Zag's `[data-part=item] > [data-part=link]` selector needs.
    expect(about.dataset.part).toBe("link");
    expect(about.parentElement!.dataset.part).toBe("item");
    expect(about.parentElement!.dataset.value).toBe("about");
  });

  it("warns when the trigger or a link is a container", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await mount(`
      <ui-navigation-menu>
        <ui-navigation-menu-list><ul><li>
          <ui-navigation-menu-item value="x">
            <ui-navigation-menu-trigger>X</ui-navigation-menu-trigger>
            <ui-navigation-menu-content><ui-navigation-menu-link>Y</ui-navigation-menu-link></ui-navigation-menu-content>
          </ui-navigation-menu-item>
        </li></ul></ui-navigation-menu-list>
      </ui-navigation-menu>
    `);

    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe("open and close", () => {
  it("toggles from the trigger", async () => {
    const host = await mount(nested());
    const panel = content(host, "products");

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => isOpen(panel));
    expect(trigger(host, "Products").getAttribute("aria-expanded")).toBe("true");
    expect(host.querySelector<HTMLElement>('ui-navigation-menu-item[value="products"]')!.dataset.state).toBe("open");

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => panel.hidden);
  });

  it("opens on hover after open-delay and closes after close-delay", async () => {
    const host = await mount(nested('open-delay="40" close-delay="40"'));
    const panel = content(host, "products");

    await userEvent.hover(trigger(host, "Products"));
    await waitFor(() => isOpen(panel));

    await userEvent.unhover(trigger(host, "Products"));
    await waitFor(() => panel.hidden);
  });

  it("switches between items on hover", async () => {
    const host = await mount(nested('open-delay="10"'));

    await userEvent.hover(trigger(host, "Products"));
    await waitFor(() => isOpen(content(host, "products")));

    await userEvent.hover(trigger(host, "Company"));
    await waitFor(() => isOpen(content(host, "company")));
    await waitFor(() => content(host, "products").hidden);
  });

  it("honours the two trigger disable attributes", async () => {
    const host = await mount(nested('disable-hover-trigger open-delay="10"'));

    await userEvent.hover(trigger(host, "Products"));
    await frames(8);
    expect(content(host, "products").hidden).toBe(true);

    const clickless = await mount(nested("disable-click-trigger"));
    await userEvent.click(trigger(clickless, "Products"));
    await frames(4);
    expect(content(clickless, "products").hidden).toBe(true);

    // `disable-pointer-leave-close` is passed through but has nothing to
    // show for itself: it guards the viewport's own pointer leave only, and
    // Zag's trigger and content leave handlers always start the close timer.
  });

  it("closes on Escape and on a click outside", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${nested()}`);
    const panel = content(host, "products");

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => isOpen(panel));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => panel.hidden);

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => isOpen(panel));
    await userEvent.click(host.querySelector("#elsewhere")!);
    await waitFor(() => panel.hidden);
  });

  it("closes when a link in the panel is clicked", async () => {
    const host = await mount(nested());
    const panel = content(host, "products");

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => isOpen(panel));
    await userEvent.click(link(host, "All products"));
    await waitFor(() => panel.hidden);
  });

  it("opens with default-value and through the api, and reports value-change", async () => {
    const host = await mount(nested('default-value="company"'));
    const seen: string[] = [];

    expect(isOpen(content(host, "company"))).toBe(true);

    root(host).addEventListener("ui-navigation-menu:value-change", (event) => {
      seen.push((event as CustomEvent<{ value: string }>).detail.value);
    });

    root(host).api!.setValue("products");
    await waitFor(() => isOpen(content(host, "products")));
    expect(root(host).api!.value).toBe("products");

    root(host).api!.setValue("");
    await waitFor(() => content(host, "products").hidden);
    expect(seen).toEqual(["products", ""]);
  });
});

describe("keyboard", () => {
  it("moves along the bar with the arrows, reaching a delegated link item and skipping a plain one", async () => {
    const host = await mount(nested());

    trigger(host, "Products").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(link(host, "About"));

    // "Plain" is written as `<ui-navigation-menu-item>` around the link wrapper,
    // so its `<a>` is a grandchild of the item element and Zag's direct-child
    // selector does not see it. This is the reason the docs recommend
    // `delegate` on a link item, and the assertion that the recipe is needed.
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(trigger(host, "Company"));

    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(link(host, "About"));
  });

  it("enters an open panel with ArrowDown and tabs between its links", async () => {
    const host = await mount(nested());

    await userEvent.click(trigger(host, "Products"));
    await waitFor(() => isOpen(content(host, "products")));

    trigger(host, "Products").focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => document.activeElement === link(host, "All products"));

    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(link(host, "New in"));
  });

  it("marks the current link", async () => {
    const host = await mount(nested().replace("<ui-navigation-menu-link delegate><a href=\"#about\">", '<ui-navigation-menu-link delegate current><a href="#about">'));
    const about = link(host, "About");

    expect(about.getAttribute("aria-current")).toBe("page");
    expect(about.hasAttribute("data-current")).toBe(true);
  });
});

describe("presence", () => {
  it("is opt in on a content and holds it through its exit animation", async () => {
    const host = await mount(nested('default-value="products"'));
    const panel = content(host, "products");

    panel.classList.add("animated");
    root(host).api!.setValue("");
    await frames(1);
    expect(panel.hidden).toBe(true);

    const animated = await mount(nested('default-value="products"').replace('<ui-navigation-menu-content value="products">', '<ui-navigation-menu-content value="products" presence class="animated">'));
    const held = content(animated, "products");

    root(animated).api!.setValue("");
    await frames(1);
    expect(held.dataset.state).toBe("closed");
    expect(held.hidden).toBe(false);

    await waitFor(() => held.hidden);
  });
});

describe("identity", () => {
  it("keeps the ids the consumer authored", async () => {
    const host = await mount(`
      <ui-navigation-menu id="nav">
        <ui-navigation-menu-list id="bar"><ul><li>
          <ui-navigation-menu-item value="x" id="item-x">
            <ui-navigation-menu-trigger delegate><button id="trigger-x">X</button></ui-navigation-menu-trigger>
            <ui-navigation-menu-content id="content-x"><ui-navigation-menu-link delegate><a href="#y">Y</a></ui-navigation-menu-link></ui-navigation-menu-content>
          </ui-navigation-menu-item>
        </li><li>
          <ui-navigation-menu-item value="z">
            <ui-navigation-menu-trigger delegate><button>Z</button></ui-navigation-menu-trigger>
            <ui-navigation-menu-content><ui-navigation-menu-link delegate><a href="#w">W</a></ui-navigation-menu-link></ui-navigation-menu-content>
          </ui-navigation-menu-item>
        </li></ul></ui-navigation-menu-list>
      </ui-navigation-menu>
    `);

    expect(root(host).id).toBe("nav");
    expect(host.querySelector("ui-navigation-menu-list")!.id).toBe("bar");
    expect(host.querySelector('ui-navigation-menu-item[value="x"]')!.id).toBe("item-x");
    expect(trigger(host, "X").id).toBe("trigger-x");
    expect(host.querySelector("#content-x")).not.toBeNull();
    expect(trigger(host, "X").getAttribute("aria-controls")).toBe("content-x");
    expect(link(host, "Y").dataset.ownedby).toBe("content-x");

    // A sibling without one keeps Zag's names.
    expect(trigger(host, "Z").id).toMatch(/^nav-menu:.*:trigger:z$/);
  });
});

describe("viewport", () => {
  it("sizes and positions the shared surface under the active trigger", async () => {
    const host = await mount(viewport());
    const surface = host.querySelector<HTMLElement>("ui-navigation-menu-viewport")!;

    expect(surface.dataset.part).toBe("viewport");
    expect(surface.hidden).toBe(true);
    expect(surface.getAttribute("data-align")).toBe("start");

    await userEvent.click(trigger(host, "a"));
    await waitFor(() => isOpen(surface));
    await waitFor(() => surface.style.getPropertyValue("--viewport-width") !== "");

    expect(surface.style.getPropertyValue("--viewport-height")).not.toBe("");
    expect(surface.style.getPropertyValue("--viewport-x")).not.toBe("");
    expect(root(host).style.getPropertyValue("--trigger-width")).not.toBe("");
    expect(isOpen(content(host, "a"))).toBe(true);
    expect(content(host, "b").hidden).toBe(true);
  });

  it("keeps the previous content through the switch and marks the motion", async () => {
    const host = await mount(viewport());

    await userEvent.click(trigger(host, "a"));
    await waitFor(() => isOpen(content(host, "a")));

    // A click, not `setValue`: Zag records `previousValue` on the interaction
    // paths only, and the motion attribute is derived from it.
    await userEvent.click(trigger(host, "b"));
    await waitFor(() => isOpen(content(host, "b")));

    const previous = content(host, "a");
    expect(previous.dataset.state).toBe("closed");
    expect(previous.hidden).toBe(false);
    expect(previous.dataset.motion).toBe("to-start");
    expect(content(host, "b").dataset.motion).toBe("from-end");

    await waitFor(() => previous.hidden);
  });

  it("holds the viewport through the last content's exit, and drops it at once with presence=false", async () => {
    const host = await mount(viewport());
    const surface = host.querySelector<HTMLElement>("ui-navigation-menu-viewport")!;

    await userEvent.click(trigger(host, "a"));
    await waitFor(() => isOpen(surface));

    root(host).api!.setValue("");
    await frames(1);
    expect(surface.dataset.state).toBe("closed");
    expect(surface.hidden).toBe(false);
    await waitFor(() => surface.hidden);

    const abrupt = await mount(viewport().replace('<ui-navigation-menu-viewport align="start" class="animated">', '<ui-navigation-menu-viewport align="start" presence="false" class="animated">'));
    const plain = abrupt.querySelector<HTMLElement>("ui-navigation-menu-viewport")!;

    await userEvent.click(trigger(abrupt, "a"));
    await waitFor(() => isOpen(plain));
    root(abrupt).api!.setValue("");
    await frames(1);
    expect(plain.hidden).toBe(true);
  });

  it("wires the proxies to the active item", async () => {
    const host = await mount(viewport());
    const itemA = host.querySelector<HTMLElement>('ui-navigation-menu-item[value="a"]')!;
    const triggerProxy = itemA.querySelector<HTMLElement>("ui-navigation-menu-trigger-proxy")!;
    const viewportProxy = itemA.querySelector<HTMLElement>("ui-navigation-menu-viewport-proxy")!;

    expect(triggerProxy.hasAttribute("data-trigger-proxy")).toBe(true);
    expect(triggerProxy.hidden).toBe(true);
    expect(viewportProxy.hidden).toBe(true);

    await userEvent.click(trigger(host, "a"));
    await waitFor(() => isOpen(content(host, "a")));

    expect(triggerProxy.hidden).toBe(false);
    expect(viewportProxy.hidden).toBe(false);
    expect(viewportProxy.getAttribute("aria-owns")).toBe(content(host, "a").id);

    // Tab from the trigger lands on the proxy, and Zag moves focus into the
    // content from there, wherever the viewport put it in the DOM.
    trigger(host, "a").focus();
    await userEvent.keyboard("{Tab}");
    await waitFor(() => document.activeElement === link(host, "A one"));
  });

  it("keeps an authored viewport id", async () => {
    const host = await mount(viewport().replace('<ui-navigation-menu-viewport align="start"', '<ui-navigation-menu-viewport id="surface" align="start"'));

    expect(host.querySelector("ui-navigation-menu-viewport")!.id).toBe("surface");
  });
});
