import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UIMenuContent, UIMenuItem } from "./parts";
import type { UIMenu } from "./root";

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
 * Layout, not decoration. A panel with no size sits over its trigger and
 * Playwright then refuses to click the button it covers. Bounding the panel and
 * leaving room around the host is what makes every click reach its target.
 */
function layout(): void {
  if (harness) {
    return;
  }

  harness = document.createElement("style");
  harness.textContent = `
    ui-menu-content { box-sizing: border-box; width: 160px; background: #fff; border: 1px solid #ccc }
    ui-menu-item, ui-menu-item[delegate] > a { display: block; padding: 4px 8px }
    ui-menu-item[data-highlighted], ui-menu-item[delegate] > a[data-highlighted] { background: #eee }
    .animated[data-state="closed"] { animation: menu-out 100ms linear }
    @keyframes menu-out { from { opacity: 1 } to { opacity: 0 } }
  `;

  document.head.append(harness);
}

function host(html: string): HTMLElement {
  layout();

  const el = document.createElement("div");
  el.style.padding = "200px 0 400px";
  el.innerHTML = html;
  document.body.append(el);
  hosts.push(el);

  return el;
}

async function mount(html: string): Promise<HTMLElement> {
  const el = host(html);

  await frames();

  return el;
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

function basic(attrs = "", items = ""): string {
  return `
    <ui-menu ${attrs}>
      <ui-menu-trigger delegate>
        <button>Open</button>
      </ui-menu-trigger>
      <ui-menu-positioner>
        <ui-menu-content>
          ${
            items ||
            `
            <ui-menu-item value="new">New tab</ui-menu-item>
            <ui-menu-item value="window">New window</ui-menu-item>
            <ui-menu-item value="print">Print</ui-menu-item>
          `
          }
        </ui-menu-content>
      </ui-menu-positioner>
    </ui-menu>
  `;
}

function nested(): string {
  return `
    <ui-menu>
      <ui-menu-trigger delegate><button>File</button></ui-menu-trigger>
      <ui-menu-positioner>
        <ui-menu-content>
          <ui-menu-item value="new">New</ui-menu-item>
          <ui-menu class="share">
            <ui-menu-trigger delegate><button>Share</button></ui-menu-trigger>
            <ui-menu-positioner>
              <ui-menu-content>
                <ui-menu-item value="mail">Mail</ui-menu-item>
                <ui-menu class="more">
                  <ui-menu-trigger delegate><button>More</button></ui-menu-trigger>
                  <ui-menu-positioner>
                    <ui-menu-content>
                      <ui-menu-item value="deep">Deep</ui-menu-item>
                    </ui-menu-content>
                  </ui-menu-positioner>
                </ui-menu>
              </ui-menu-content>
            </ui-menu-positioner>
          </ui-menu>
          <ui-menu class="export">
            <ui-menu-trigger delegate><button>Export</button></ui-menu-trigger>
            <ui-menu-positioner>
              <ui-menu-content>
                <ui-menu-item value="pdf">PDF</ui-menu-item>
              </ui-menu-content>
            </ui-menu-positioner>
          </ui-menu>
          <ui-menu-item value="print">Print</ui-menu-item>
        </ui-menu-content>
      </ui-menu-positioner>
    </ui-menu>
  `;
}

const root = (scope: ParentNode) => scope.querySelector<UIMenu>("ui-menu")!;
const trigger = (scope: ParentNode) => scope.querySelector<HTMLButtonElement>("ui-menu-trigger > button")!;
const content = (scope: ParentNode) => scope.querySelector<UIMenuContent>("ui-menu-content")!;
const items = (scope: ParentNode) => [...scope.querySelectorAll<UIMenuItem>("ui-menu-item")];
const isOpen = (scope: ParentNode) => content(scope).dataset.state === "open" && !content(scope).hidden;

function sub(scope: ParentNode, name: string) {
  const menu = scope.querySelector<UIMenu>(`ui-menu.${name}`)!;

  return {
    menu,
    trigger: menu.querySelector<HTMLButtonElement>(":scope > ui-menu-trigger > button")!,
    content: menu.querySelector<UIMenuContent>(":scope > ui-menu-positioner > ui-menu-content")!,
  };
}

afterEach(() => {
  for (const el of hosts.splice(0)) {
    el.remove();
  }

  vi.restoreAllMocks();
});

describe("anatomy", () => {
  it("binds the parts", async () => {
    const h = await mount(basic());

    expect(root(h).dataset.scope).toBe("menu");
    expect(root(h).dataset.part).toBeUndefined();

    expect(trigger(h).dataset.part).toBe("trigger");
    expect(trigger(h).getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger(h).getAttribute("aria-expanded")).toBe("false");

    expect(h.querySelector("ui-menu-positioner")!.getAttribute("data-part")).toBe("positioner");
    expect(content(h).getAttribute("role")).toBe("menu");
    expect(content(h).hidden).toBe(true);
    expect(content(h).dataset.state).toBe("closed");

    for (const item of items(h)) {
      expect(item.getAttribute("role")).toBe("menuitem");
      expect(item.dataset.part).toBe("item");
      expect(item.dataset.ownedby).toBe(content(h).id);
    }
  });

  it("warns when the trigger is a container", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await mount(`
      <ui-menu>
        <ui-menu-trigger>Open</ui-menu-trigger>
        <ui-menu-positioner><ui-menu-content><ui-menu-item value="a">A</ui-menu-item></ui-menu-content></ui-menu-positioner>
      </ui-menu>
    `);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("delegate");
  });

  it("renders nothing for an item without a value", async () => {
    const h = await mount(basic("", `<ui-menu-item>Nameless</ui-menu-item>`));

    expect(items(h)[0]!.dataset.part).toBeUndefined();
  });
});

describe("open and close", () => {
  it("toggles from the trigger", async () => {
    const h = await mount(basic());

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    expect(trigger(h).getAttribute("aria-expanded")).toBe("true");

    await userEvent.click(trigger(h));
    await waitFor(() => content(h).hidden);
    expect(trigger(h).getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on Escape", async () => {
    const h = await mount(basic());

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => content(h).hidden);
  });

  it("closes on a click outside", async () => {
    const h = await mount(`<button id="outside">Elsewhere</button>${basic()}`);

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));

    await userEvent.click(h.querySelector("#outside")!);
    await waitFor(() => content(h).hidden);
  });

  it("opens on first render with default-open", async () => {
    const h = await mount(basic("default-open"));

    expect(isOpen(h)).toBe(true);
  });

  it("honours show() called before the first frame", async () => {
    const h = host(basic());

    root(h).show();
    await frames();

    expect(isOpen(h)).toBe(true);
  });

  it("closes through hide()", async () => {
    const h = await mount(basic("default-open"));

    root(h).hide();
    await waitFor(() => content(h).hidden);
  });

  it("emits open-change", async () => {
    const h = await mount(basic());
    const seen: boolean[] = [];

    root(h).addEventListener("ui-menu:open-change", (event) => {
      seen.push((event as CustomEvent<{ open: boolean }>).detail.open);
    });

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => content(h).hidden);

    expect(seen).toEqual([true, false]);
  });
});

describe("keyboard", () => {
  it("highlights with the arrows and reports through aria-activedescendant", async () => {
    const h = await mount(basic());

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => items(h)[0]!.hasAttribute("data-highlighted"));
    expect(content(h).getAttribute("aria-activedescendant")).toBe(items(h)[0]!.id);

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => items(h)[1]!.hasAttribute("data-highlighted"));
    expect(items(h)[0]!.hasAttribute("data-highlighted")).toBe(false);
  });

  it("selects with Enter and closes", async () => {
    const h = await mount(basic());
    const selected: string[] = [];

    root(h).addEventListener("ui-menu:select", (event) => {
      selected.push((event as CustomEvent<{ value: string }>).detail.value);
    });

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    await waitFor(() => content(h).hidden);
    expect(selected).toEqual(["window"]);
  });

  it("stays open after a selection with close-on-select=false", async () => {
    const h = await mount(basic('close-on-select="false"'));

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await frames();

    expect(isOpen(h)).toBe(true);
  });

  it("types ahead", async () => {
    const h = await mount(basic());

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("p");

    await waitFor(() => items(h)[2]!.hasAttribute("data-highlighted"));
  });
});

describe("links", () => {
  it("makes a delegated link the item", async () => {
    const h = await mount(
      basic(
        "",
        `
        <ui-menu-item value="docs" delegate><a href="#docs">Docs</a></ui-menu-item>
        <ui-menu-item value="print">Print</ui-menu-item>
      `,
      ),
    );
    const link = h.querySelector<HTMLAnchorElement>("a")!;
    const selected: string[] = [];

    root(h).addEventListener("ui-menu:select", (event) => {
      selected.push((event as CustomEvent<{ value: string }>).detail.value);
    });

    expect(link.getAttribute("role")).toBe("menuitem");
    expect(link.dataset.part).toBe("item");
    expect(items(h)[0]!.dataset.part).toBeUndefined();

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.click(link);

    await waitFor(() => content(h).hidden);
    expect(selected).toEqual(["docs"]);
  });
});

describe("positioning", () => {
  it("reads the positioning attributes", async () => {
    const h = await mount(basic('positioning-placement="top-start"'));

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await waitFor(() => content(h).dataset.placement === "top-start");

    const positioner = h.querySelector<HTMLElement>("ui-menu-positioner")!;

    expect(positioner.style.getPropertyValue("--x")).not.toBe("");
  });
});

describe("presence", () => {
  it("holds the content through its exit animation", async () => {
    const h = await mount(basic('default-open'));

    content(h).classList.add("animated");
    root(h).hide();
    await frames(1);

    expect(content(h).dataset.state).toBe("closed");
    expect(content(h).hidden).toBe(false);

    await waitFor(() => content(h).hidden);
  });

  it("hides at once with presence=false", async () => {
    const h = await mount(basic("default-open"));

    content(h).classList.add("animated");
    content(h).setAttribute("presence", "false");
    await frames();

    root(h).hide();
    await frames(1);

    expect(content(h).hidden).toBe(true);
  });
});

describe("identity", () => {
  it("keeps the ids the consumer authored", async () => {
    const h = await mount(`
      <ui-menu>
        <ui-menu-trigger delegate><button id="t">Open</button></ui-menu-trigger>
        <ui-menu-positioner id="p">
          <ui-menu-content id="c">
            <ui-menu-arrow id="a"><ui-menu-arrow-tip></ui-menu-arrow-tip></ui-menu-arrow>
            <ui-menu-item value="x">X</ui-menu-item>
          </ui-menu-content>
        </ui-menu-positioner>
      </ui-menu>
    `);

    expect(trigger(h).id).toBe("t");
    expect(h.querySelector("ui-menu-positioner")!.id).toBe("p");
    expect(content(h).id).toBe("c");
    expect(h.querySelector("ui-menu-arrow")!.id).toBe("a");
    expect(trigger(h).getAttribute("aria-controls")).toBe("c");
    expect(content(h).getAttribute("aria-labelledby")).toBe("t");
  });

  it("keeps an aria-label written on the content", async () => {
    const h = await mount(basic("", `<ui-menu-item value="x">X</ui-menu-item>`).replace("<ui-menu-content>", '<ui-menu-content aria-label="Actions">'));

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));

    expect(content(h).getAttribute("aria-label")).toBe("Actions");
  });

  it("names groups by their label and marks the separator", async () => {
    const h = await mount(
      basic(
        "",
        `
        <ui-menu-item-group value="files">
          <ui-menu-item-group-label>Files</ui-menu-item-group-label>
          <ui-menu-item value="new"><ui-menu-item-text>New</ui-menu-item-text><ui-menu-item-indicator>*</ui-menu-item-indicator></ui-menu-item>
        </ui-menu-item-group>
        <ui-menu-separator></ui-menu-separator>
        <ui-menu-item value="print">Print</ui-menu-item>
      `,
      ),
    );
    const group = h.querySelector<HTMLElement>("ui-menu-item-group")!;
    const label = h.querySelector<HTMLElement>("ui-menu-item-group-label")!;

    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(label.dataset.part).toBe("item-group-label");
    expect(h.querySelector("ui-menu-separator")!.getAttribute("role")).toBe("separator");
    expect(h.querySelector("ui-menu-item-text")!.getAttribute("data-part")).toBe("item-text");
    expect(h.querySelector("ui-menu-item-indicator")!.getAttribute("data-part")).toBe("item-indicator");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() => h.querySelector("ui-menu-item-text")!.hasAttribute("data-highlighted"));
  });
});

describe("nested", () => {
  it("turns a submenu's trigger into a trigger item of the parent", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");

    await waitFor(() => share.trigger.dataset.part === "trigger-item");

    expect(share.trigger.getAttribute("role")).toBe("menuitem");
    expect(share.trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(share.trigger.dataset.ownedby).toBe(content(h).id);
    expect(share.trigger.getAttribute("aria-controls")).toBe(share.content.id);
  });

  it("opens a submenu to the side on hover", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.hover(share.trigger);

    await waitFor(() => share.content.dataset.state === "open" && !share.content.hidden);
    await waitFor(() => (share.content.dataset.placement ?? "").startsWith("right"));
  });

  it("re-renders the trigger item on the parent's tick", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    await waitFor(() => share.trigger.hasAttribute("data-highlighted"));
  });

  it("opens the highlighted submenu with ArrowRight and closes it with ArrowLeft", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");

    await waitFor(() => share.content.dataset.state === "open" && !share.content.hidden);
    await waitFor(() => share.content.querySelector("ui-menu-item")!.hasAttribute("data-highlighted"));

    await userEvent.keyboard("{ArrowLeft}");

    await waitFor(() => share.content.hidden);
    expect(isOpen(h)).toBe(true);
  });

  it("closes the whole tree on Escape", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
    await waitFor(() => share.content.dataset.state === "open");

    await userEvent.keyboard("{Escape}");

    await waitFor(() => share.content.hidden);
    await waitFor(() => content(h).hidden);
  });

  it("nests three levels", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");
    const more = sub(h, "more");

    await waitFor(() => more.trigger.dataset.part === "trigger-item");
    expect(more.trigger.dataset.ownedby).toBe(share.content.id);

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.hover(share.trigger);
    await waitFor(() => share.content.dataset.state === "open" && !share.content.hidden);
    await userEvent.hover(more.trigger);

    await waitFor(() => more.content.dataset.state === "open" && !more.content.hidden);
  });

  it("closes a sibling submenu when another opens", async () => {
    const h = await mount(nested());
    const share = sub(h, "share");
    const exportMenu = sub(h, "export");

    await userEvent.click(trigger(h));
    await waitFor(() => isOpen(h));
    await userEvent.hover(share.trigger);
    await waitFor(() => share.content.dataset.state === "open" && !share.content.hidden);
    await userEvent.hover(exportMenu.trigger);

    await waitFor(() => exportMenu.content.dataset.state === "open" && !exportMenu.content.hidden);
    await waitFor(() => share.content.hidden);
  });
});
