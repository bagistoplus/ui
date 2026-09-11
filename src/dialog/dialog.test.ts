import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UIDialogContent } from "./parts";
import type { UIDialog } from "./root";

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

/** The shape every consumer writes: a delegating trigger, a backdrop and a panel. */
function basic(attrs = "", body = "Panel body"): string {
  return `
    <ui-dialog ${attrs}>
      <ui-dialog-trigger delegate>
        <button>Open</button>
      </ui-dialog-trigger>
      <ui-dialog-backdrop></ui-dialog-backdrop>
      <ui-dialog-positioner>
        <ui-dialog-content>
          <ui-dialog-title>Title</ui-dialog-title>
          <ui-dialog-description>Description</ui-dialog-description>
          <div>${body}</div>
          <ui-dialog-close-trigger delegate>
            <button>Close</button>
          </ui-dialog-close-trigger>
        </ui-dialog-content>
      </ui-dialog-positioner>
    </ui-dialog>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIDialog>("ui-dialog")!;
const trigger = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-dialog-trigger button")!;
const closeTrigger = (host: ParentNode) =>
  host.querySelector<HTMLButtonElement>("ui-dialog-close-trigger button")!;
const backdrop = (host: ParentNode) => host.querySelector<HTMLElement>("ui-dialog-backdrop")!;
const positioner = (host: ParentNode) => host.querySelector<HTMLElement>("ui-dialog-positioner")!;
const content = (host: ParentNode) => host.querySelector<UIDialogContent>("ui-dialog-content")!;

const isOpen = (host: ParentNode) => !content(host).hasAttribute("hidden");
const inTopLayer = (el: Element) => el.matches(":popover-open");

/**
 * A modal dialog makes the body `pointer-events: none` through Zag's
 * dismissable layer, so the hit target under an outside button is `<html>` and
 * Playwright's actionability check refuses the click. `force` skips that check
 * and dispatches at the coordinates, which is what a real pointer does.
 */
async function clickOutside(host: ParentNode): Promise<void> {
  await userEvent.click(host.querySelector<HTMLButtonElement>("#elsewhere")!, { force: true });
}

async function open(host: ParentNode): Promise<void> {
  await userEvent.click(trigger(host));
  await waitFor(() => isOpen(host));
  await frames();
}

function style(css: string): void {
  const el = document.createElement("style");

  el.textContent = css;
  document.head.append(el);
  styles.push(el);
}

function animate(duration = 300): void {
  style(`
    ui-dialog-backdrop[data-state="open"], ui-dialog-content[data-state="open"] { animation: test-in ${duration}ms linear }
    ui-dialog-backdrop[data-state="closed"], ui-dialog-content[data-state="closed"] { animation: test-out ${duration}ms linear }
    @keyframes test-in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes test-out { from { opacity: 1 } to { opacity: 0 } }
  `);
}

/** What a consumer's utilities give a modal: a full screen dim layer under a centred panel. */
function overlay(): void {
  style(`
    ui-dialog-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5) }
    ui-dialog-positioner { position: fixed; inset: 0; display: grid; place-items: center }
    ui-dialog-content { width: 160px; height: 80px; background: #fff }
  `);
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }

  for (const el of styles.splice(0)) {
    el.remove();
  }
});

describe("the root has no anatomy part", () => {
  it("carries the scope and nothing else", async () => {
    const host = await mount(basic());
    const el = root(host);

    expect(el.getAttribute("data-scope")).toBe("dialog");
    expect(el.hasAttribute("data-part")).toBe(false);
  });

  it("keeps an authored id, because Zag never writes one here", async () => {
    const host = await mount(basic(`id="my-dialog"`));

    expect(root(host).id).toBe("my-dialog");
  });
});

/**
 * Zag names every element it binds, and a DOM differ keys on `id`. morphdom treats
 * a keyed live node against an unkeyed incoming one as incompatible and replaces
 * it outright. Keeping the authored name is what lets the keys match.
 */
describe("authored ids on the parts", () => {
  const named = `
    <ui-dialog>
      <ui-dialog-trigger delegate><button id="my-trigger">Open</button></ui-dialog-trigger>
      <ui-dialog-backdrop id="my-backdrop"></ui-dialog-backdrop>
      <ui-dialog-positioner id="my-positioner">
        <ui-dialog-content id="my-panel">
          <ui-dialog-title id="my-title">Title</ui-dialog-title>
          <ui-dialog-description id="my-desc">Description</ui-dialog-description>
          <ui-dialog-close-trigger delegate><button id="my-close">Close</button></ui-dialog-close-trigger>
        </ui-dialog-content>
      </ui-dialog-positioner>
    </ui-dialog>
  `;

  it("keeps every authored name instead of generating one", async () => {
    const host = await mount(named);

    await open(host);

    expect(trigger(host).id).toBe("my-trigger");
    expect(backdrop(host).id).toBe("my-backdrop");
    expect(positioner(host).id).toBe("my-positioner");
    expect(content(host).id).toBe("my-panel");
    expect(host.querySelector("ui-dialog-title")!.id).toBe("my-title");
    expect(host.querySelector("ui-dialog-description")!.id).toBe("my-desc");
    // With `delegate` the id belongs on the child, because the child is the
    // element Zag names.
    expect(closeTrigger(host).id).toBe("my-close");
    expect(host.querySelector("ui-dialog-close-trigger")!.hasAttribute("id")).toBe(false);
  });

  it("still lets Zag find the parts it named", async () => {
    const host = await mount(named);

    await open(host);
    await waitFor(() => content(host).getAttribute("aria-labelledby") === "my-title");

    // The label proves `checkRenderedElements` found the title by its authored
    // id, and the pair proves the trigger reached the machine.
    expect(content(host).getAttribute("aria-describedby")).toBe("my-desc");
    expect(trigger(host).getAttribute("aria-controls")).toBe("my-panel");

    await userEvent.click(closeTrigger(host));
    await waitFor(() => !isOpen(host));
  });

  it("ignores an authored name on a trigger that has a value", async () => {
    const host = await mount(`
      <ui-dialog>
        <ui-dialog-trigger delegate value="a"><button id="ignored">A</button></ui-dialog-trigger>
        <ui-dialog-positioner><ui-dialog-content>Body</ui-dialog-content></ui-dialog-positioner>
      </ui-dialog>
    `);

    expect(trigger(host).id).toContain(":trigger:a");
  });

  it("generates a name for any part that authored none", async () => {
    const host = await mount(basic());

    expect(backdrop(host).id).toContain(":backdrop");
    expect(positioner(host).id).toContain(":positioner");
    expect(content(host).id).toContain(":content");
  });
});

describe("delegation", () => {
  it("puts Zag's trigger props on the button, not on the part element", async () => {
    const host = await mount(basic());
    const part = host.querySelector("ui-dialog-trigger")!;

    expect(trigger(host).getAttribute("data-part")).toBe("trigger");
    expect(trigger(host).getAttribute("aria-haspopup")).toBe("dialog");
    expect(part.hasAttribute("data-part")).toBe(false);
  });

  it("takes props on the element itself without delegate", async () => {
    const host = await mount(basic());

    expect(backdrop(host).getAttribute("data-part")).toBe("backdrop");
    expect(positioner(host).getAttribute("data-part")).toBe("positioner");
    expect(content(host).getAttribute("data-part")).toBe("content");
    expect(host.querySelector("ui-dialog-title")!.getAttribute("data-part")).toBe("title");
  });

  it("warns once for a trigger and a close trigger with no delegate", async () => {
    const warnings: unknown[] = [];
    const original = console.warn;

    console.warn = (...args: unknown[]) => warnings.push(args[0]);

    try {
      await mount(`
        <ui-dialog>
          <ui-dialog-trigger><button>Open</button></ui-dialog-trigger>
          <ui-dialog-positioner>
            <ui-dialog-content>
              <ui-dialog-close-trigger><button>Close</button></ui-dialog-close-trigger>
            </ui-dialog-content>
          </ui-dialog-positioner>
        </ui-dialog>
      `);
    } finally {
      console.warn = original;
    }

    expect(warnings.filter((text) => String(text).includes("ui-dialog-trigger"))).toHaveLength(1);
    expect(warnings.filter((text) => String(text).includes("ui-dialog-close-trigger"))).toHaveLength(1);
  });
});

describe("opening and closing", () => {
  it("starts closed, with the panel and the backdrop out of the tab order", async () => {
    const host = await mount(basic());

    expect(isOpen(host)).toBe(false);
    expect(backdrop(host).hasAttribute("hidden")).toBe(true);
    expect(trigger(host).getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on click and closes again", async () => {
    const host = await mount(basic());

    await open(host);
    expect(trigger(host).getAttribute("aria-expanded")).toBe("true");
    expect(backdrop(host).hasAttribute("hidden")).toBe(false);
    expect(content(host).getAttribute("role")).toBe("dialog");

    await userEvent.click(closeTrigger(host));
    await waitFor(() => !isOpen(host));
  });

  it("closes on Escape", async () => {
    const host = await mount(basic());

    await open(host);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => !isOpen(host));
  });

  it("closes on a click outside", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${basic()}`);

    await open(host);
    await clickOutside(host);
    await waitFor(() => !isOpen(host));
  });

  it("opens on first paint with default-open", async () => {
    const host = await mount(basic("default-open"));

    expect(isOpen(host)).toBe(true);
  });

  it("names the panel from the title and description it can see", async () => {
    const host = await mount(basic());

    await open(host);

    const panel = content(host);

    expect(panel.getAttribute("aria-labelledby")).toBe(host.querySelector("ui-dialog-title")!.id);
    expect(panel.getAttribute("aria-describedby")).toBe(host.querySelector("ui-dialog-description")!.id);
  });

  it("emits open-change as a bubbling event", async () => {
    const host = await mount(basic());
    const seen: boolean[] = [];

    document.addEventListener("ui-dialog:open-change", (event) => {
      seen.push((event as CustomEvent<{ open: boolean }>).detail.open);
    });

    await open(host);
    await userEvent.click(closeTrigger(host));
    await waitFor(() => !isOpen(host));

    expect(seen).toEqual([true, false]);
  });
});

describe("a boolean attribute that says false", () => {
  it("keeps the dialog open on an outside click", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${basic(`close-on-interact-outside="false"`)}`);

    await open(host);
    await clickOutside(host);
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });

  it("keeps the dialog open on Escape", async () => {
    const host = await mount(basic(`close-on-escape="false"`));

    await open(host);
    await userEvent.keyboard("{Escape}");
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });

  it("takes effect when the attribute changes, without a rebuild", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${basic()}`);

    await open(host);
    root(host).setAttribute("close-on-interact-outside", "false");
    await frames();

    await clickOutside(host);
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });
});

/**
 * Unlike popover, a dialog is modal unless told otherwise, and Zag derives the
 * focus trap, the scroll lock and outside dismissal from that one prop.
 */
describe("modal by default", () => {
  it("locks body scroll while open and releases it after", async () => {
    const host = await mount(basic());

    await open(host);
    await waitFor(() => document.body.hasAttribute("data-scroll-lock"));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => !document.body.hasAttribute("data-scroll-lock"));
  });

  it("hides everything outside the panel from assistive technology", async () => {
    const host = await mount(`<div id="sibling">Outside</div>${basic()}`);

    await open(host);
    await waitFor(() => host.querySelector("#sibling")!.getAttribute("aria-hidden") === "true");

    expect(content(host).getAttribute("aria-modal")).toBe("true");
  });

  it("moves focus into the panel and returns it to the trigger", async () => {
    const host = await mount(basic());

    await open(host);
    await waitFor(() => content(host).contains(document.activeElement));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => document.activeElement === trigger(host));
  });

  it("does none of that with modal set to false", async () => {
    const host = await mount(`<div id="sibling">Outside</div>${basic(`modal="false"`)}`);

    await open(host);
    await frames(4);

    expect(document.body.hasAttribute("data-scroll-lock")).toBe(false);
    expect(host.querySelector("#sibling")!.hasAttribute("aria-hidden")).toBe(false);
    expect(content(host).getAttribute("aria-modal")).toBe("false");
    expect(positioner(host).style.pointerEvents).toBe("none");
  });
});

describe("content-role", () => {
  it("puts the role on the content, not on the host", async () => {
    const host = await mount(basic(`content-role="alertdialog"`));

    await open(host);

    expect(content(host).getAttribute("role")).toBe("alertdialog");
    expect(root(host).hasAttribute("role")).toBe(false);
  });

  it("makes an alertdialog ignore outside clicks and focus its close trigger", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${basic(`content-role="alertdialog"`)}`);

    await open(host);
    await waitFor(() => document.activeElement === closeTrigger(host));

    await clickOutside(host);
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });
});

describe("initial-focus", () => {
  it("focuses the selected element rather than the first tabbable one", async () => {
    const host = await mount(
      basic(`initial-focus="#second"`, `<input id="first" /><input id="second" />`),
    );

    await open(host);
    await waitFor(() => document.activeElement === host.querySelector("#second"));
  });
});

describe("naming the panel yourself", () => {
  it("keeps an authored aria-label across renders when there is no title", async () => {
    const host = await mount(`
      <ui-dialog>
        <ui-dialog-trigger delegate><button>Open</button></ui-dialog-trigger>
        <ui-dialog-positioner>
          <ui-dialog-content aria-label="Newsletter offer">Body</ui-dialog-content>
        </ui-dialog-positioner>
      </ui-dialog>
    `);

    await open(host);
    root(host).setAttribute("close-on-escape", "false");
    await frames();

    expect(content(host).getAttribute("aria-label")).toBe("Newsletter offer");
    expect(content(host).hasAttribute("aria-labelledby")).toBe(false);
  });
});

describe("presence", () => {
  it("holds the backdrop and the panel through their exit animations", async () => {
    animate();

    const host = await mount(basic());

    await open(host);
    await userEvent.click(closeTrigger(host));
    await frames();

    // Zag has closed, so `data-state` has flipped on both, but `hidden` waits.
    expect(content(host).getAttribute("data-state")).toBe("closed");
    expect(content(host).hasAttribute("hidden")).toBe(false);
    expect(backdrop(host).getAttribute("data-state")).toBe("closed");
    expect(backdrop(host).hasAttribute("hidden")).toBe(false);

    await waitFor(() => content(host).hasAttribute("hidden") && backdrop(host).hasAttribute("hidden"));
  });

  it("turns off per part", async () => {
    animate();

    const host = await mount(basic().replace("<ui-dialog-backdrop>", `<ui-dialog-backdrop presence="false">`));

    await open(host);
    await userEvent.click(closeTrigger(host));
    await frames(2);

    expect(backdrop(host).hasAttribute("hidden")).toBe(true);
    expect(content(host).hasAttribute("hidden")).toBe(false);

    await waitFor(() => content(host).hasAttribute("hidden"));
  });

  it("hides immediately when no animation is declared", async () => {
    const host = await mount(basic());

    await open(host);
    await userEvent.click(closeTrigger(host));
    await frames(2);

    expect(content(host).hasAttribute("hidden")).toBe(true);
    expect(backdrop(host).hasAttribute("hidden")).toBe(true);
  });
});

describe("show() and hide()", () => {
  it("drive the open state after upgrade", async () => {
    const host = await mount(basic());

    root(host).show();
    await waitFor(() => isOpen(host));

    root(host).hide();
    await waitFor(() => !isOpen(host));
  });

  /**
   * `el.api` is undefined until the first frame after upgrade, and a reactive
   * framework's first effect runs before that. The intent becomes the initial
   * state instead of being lost.
   */
  it("apply a call made before the first frame", async () => {
    const host = document.createElement("div");

    host.innerHTML = basic();
    document.body.append(host);
    hosts.push(host);

    expect(root(host).api).toBeUndefined();
    root(host).show();

    await frames();

    expect(isOpen(host)).toBe(true);
  });

  it("let hide() win over default-open before the first frame", async () => {
    const host = document.createElement("div");

    host.innerHTML = basic("default-open");
    document.body.append(host);
    hosts.push(host);

    root(host).hide();

    await frames();

    expect(isOpen(host)).toBe(false);
  });
});

describe("top-layer", () => {
  it("stays out of the top layer without the attribute", async () => {
    overlay();

    const host = await mount(basic());

    await open(host);

    expect(backdrop(host).hasAttribute("popover")).toBe(false);
    expect(inTopLayer(positioner(host))).toBe(false);
  });

  it("promotes the backdrop and the positioner while open", async () => {
    overlay();

    const host = await mount(basic("top-layer"));

    expect(backdrop(host).getAttribute("popover")).toBe("manual");
    expect(positioner(host).getAttribute("popover")).toBe("manual");
    expect(inTopLayer(positioner(host))).toBe(false);

    await open(host);
    await waitFor(() => inTopLayer(positioner(host)) && inTopLayer(backdrop(host)));

    // The focus trap must still find the panel: promotion happens on the same
    // render that unhides it, before Zag's frame runs.
    await waitFor(() => content(host).contains(document.activeElement));

    await userEvent.click(closeTrigger(host));
    await waitFor(() => !inTopLayer(positioner(host)) && !inTopLayer(backdrop(host)));
  });

  /**
   * Entry order is paint order in the top layer. The backdrop is written AFTER
   * the positioner here, so in normal flow it would paint over the panel; the
   * root promoting it first is what puts the panel on top regardless.
   */
  it("paints the panel above the backdrop whatever the markup order", async () => {
    overlay();

    const host = await mount(`
      <ui-dialog top-layer>
        <ui-dialog-trigger delegate><button>Open</button></ui-dialog-trigger>
        <ui-dialog-positioner>
          <ui-dialog-content>Body</ui-dialog-content>
        </ui-dialog-positioner>
        <ui-dialog-backdrop></ui-dialog-backdrop>
      </ui-dialog>
    `);

    await open(host);
    await waitFor(() => inTopLayer(positioner(host)));

    const rect = content(host).getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

    expect(content(host).contains(hit)).toBe(true);
  });

  it("leaves the top layer only after the exit animations have ended", async () => {
    overlay();
    animate();

    const host = await mount(basic("top-layer"));

    await open(host);
    await waitFor(() => inTopLayer(positioner(host)));

    await userEvent.click(closeTrigger(host));
    await frames();

    expect(content(host).getAttribute("data-state")).toBe("closed");
    expect(inTopLayer(positioner(host))).toBe(true);
    expect(inTopLayer(backdrop(host))).toBe(true);

    await waitFor(() => content(host).hasAttribute("hidden"));
    await waitFor(() => !inTopLayer(positioner(host)) && !inTopLayer(backdrop(host)));
  });

  /**
   * What a DOM differ does: the server never sent `popover`, so it goes, and
   * the browser drops the element out of the top layer with it. Writing the
   * attribute back is not enough on its own; the next render is what
   * re-promotes it.
   */
  it("is re-entered by a render after a differ strips the attribute", async () => {
    overlay();

    const host = await mount(basic("top-layer"));

    await open(host);
    await waitFor(() => inTopLayer(positioner(host)));

    positioner(host).removeAttribute("popover");
    expect(inTopLayer(positioner(host))).toBe(false);

    root(host).scheduleRender();
    await waitFor(() => inTopLayer(positioner(host)));
  });

  it("drops out when the attribute is removed while open", async () => {
    overlay();

    const host = await mount(basic("top-layer"));

    await open(host);
    await waitFor(() => inTopLayer(positioner(host)));

    root(host).removeAttribute("top-layer");
    await waitFor(() => !inTopLayer(positioner(host)) && !backdrop(host).hasAttribute("popover"));

    expect(isOpen(host)).toBe(true);
  });
});

describe("several triggers", () => {
  const shared = `
    <ui-dialog default-trigger-value="a">
      <ui-dialog-trigger delegate value="a"><button>A</button></ui-dialog-trigger>
      <ui-dialog-trigger delegate value="b"><button>B</button></ui-dialog-trigger>
      <ui-dialog-positioner>
        <ui-dialog-content><div>Panel body</div></ui-dialog-content>
      </ui-dialog-positioner>
    </ui-dialog>
  `;

  const buttons = (host: ParentNode) => [...host.querySelectorAll<HTMLButtonElement>("button")];

  it("marks the current trigger and reports a switch", async () => {
    const host = await mount(shared);
    const [a, b] = buttons(host) as [HTMLButtonElement, HTMLButtonElement];
    const values: (string | null)[] = [];

    root(host).addEventListener("ui-dialog:trigger-value-change", (event) => {
      values.push((event as CustomEvent<{ value: string | null }>).detail.value);
    });

    expect(a.getAttribute("data-current")).toBe("");
    expect(b.hasAttribute("data-current")).toBe(false);

    await userEvent.click(b);
    await waitFor(() => isOpen(host));
    await waitFor(() => b.getAttribute("data-current") === "");

    expect(a.hasAttribute("data-current")).toBe(false);
    expect(values).toEqual(["b"]);
    expect(a.id).not.toBe(b.id);
  });
});

describe("two dialogs on one page", () => {
  it("keeps them independent", async () => {
    const host = await mount(`${basic("", "First")}${basic("", "Second")}`);
    const [first, second] = [...host.querySelectorAll<UIDialog>("ui-dialog")] as [UIDialog, UIDialog];
    const panelOf = (el: UIDialog) => el.querySelector<HTMLElement>("ui-dialog-content")!;

    await userEvent.click(first.querySelector("button")!);
    await waitFor(() => !panelOf(first).hasAttribute("hidden"));

    expect(panelOf(second).hasAttribute("hidden")).toBe(true);
    expect(panelOf(first).id).not.toBe(panelOf(second).id);
  });
});

describe("el.api", () => {
  it("is the live Zag api", async () => {
    const host = await mount(basic());

    expect(root(host).api!.open).toBe(false);

    root(host).api!.setOpen(true);
    await waitFor(() => isOpen(host));

    expect(root(host).api!.open).toBe(true);
  });
});
