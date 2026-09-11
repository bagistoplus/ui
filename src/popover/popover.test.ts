import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UIPopoverContent } from "./parts";
import type { UIPopover } from "./root";

const hosts: HTMLElement[] = [];
const styles: HTMLStyleElement[] = [];

let harness: HTMLStyleElement | undefined;

function frames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
}

/**
 * Layout, not decoration.
 *
 * A panel with no size is `min-width: max-content` and as tall as its content, so
 * `bottom` placement flips or shifts it straight over the trigger and Playwright
 * then refuses to click the button it covers. Bounding the panel and leaving room
 * below is what makes a second click on the trigger reach the trigger.
 */
function layout(): void {
  if (harness) {
    return;
  }

  harness = document.createElement("style");
  harness.textContent = `
    ui-popover-content { box-sizing: border-box; width: 140px; height: 36px; overflow: hidden; background: #fff }
  `;

  document.head.append(harness);
}

async function mount(html: string): Promise<HTMLElement> {
  layout();

  const host = document.createElement("div");
  host.style.padding = "60px 0 320px";
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

/** The shape every consumer writes: a delegating trigger and a positioned panel. */
function basic(attrs = "", body = "Panel body"): string {
  return `
    <ui-popover ${attrs}>
      <ui-popover-trigger delegate>
        <button>Open</button>
      </ui-popover-trigger>
      <ui-popover-positioner>
        <ui-popover-content>
          <ui-popover-title>Title</ui-popover-title>
          <ui-popover-description>Description</ui-popover-description>
          <div>${body}</div>
          <ui-popover-close-trigger delegate>
            <button>Close</button>
          </ui-popover-close-trigger>
        </ui-popover-content>
      </ui-popover-positioner>
    </ui-popover>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIPopover>("ui-popover")!;
const trigger = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-popover-trigger button")!;
const closeTrigger = (host: ParentNode) =>
  host.querySelector<HTMLButtonElement>("ui-popover-close-trigger button")!;
const positioner = (host: ParentNode) => host.querySelector<HTMLElement>("ui-popover-positioner")!;
const content = (host: ParentNode) => host.querySelector<UIPopoverContent>("ui-popover-content")!;

const isOpen = (host: ParentNode) => !content(host).hasAttribute("hidden");

async function open(host: ParentNode): Promise<void> {
  await userEvent.click(trigger(host));
  await waitFor(() => isOpen(host));
  await frames();
}

function animate(duration = 300): void {
  const style = document.createElement("style");

  style.textContent = `
    ui-popover-content[data-state="open"] { animation: test-in ${duration}ms linear }
    ui-popover-content[data-state="closed"] { animation: test-out ${duration}ms linear }
    @keyframes test-in { from { opacity: 0 } to { opacity: 1 } }
    @keyframes test-out { from { opacity: 1 } to { opacity: 0 } }
  `;

  document.head.append(style);
  styles.push(style);
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }

  for (const style of styles.splice(0)) {
    style.remove();
  }
});

describe("the root has no anatomy part", () => {
  it("carries the scope and nothing else", async () => {
    const host = await mount(basic());
    const el = root(host);

    expect(el.getAttribute("data-scope")).toBe("popover");
    expect(el.hasAttribute("data-part")).toBe(false);
  });

  it("keeps an authored id, because Zag never writes one here", async () => {
    const host = await mount(basic(`id="my-popover"`));

    expect(root(host).id).toBe("my-popover");
  });
});

/**
 * Zag names every element it binds, and a DOM differ keys on `id`. morphdom treats
 * a keyed live node against an unkeyed incoming one as incompatible and replaces
 * it outright, taking the machine state, the listeners and anything written
 * imperatively with it. Keeping the authored name is what lets the keys match.
 */
describe("authored ids on the parts", () => {
  const named = `
    <ui-popover>
      <ui-popover-trigger delegate><button>Open</button></ui-popover-trigger>
      <ui-popover-positioner id="my-popper">
        <ui-popover-content id="my-panel">
          <ui-popover-title id="my-title">Title</ui-popover-title>
          <ui-popover-description id="my-desc">Description</ui-popover-description>
          <ui-popover-close-trigger delegate><button id="my-close">Close</button></ui-popover-close-trigger>
        </ui-popover-content>
      </ui-popover-positioner>
    </ui-popover>
  `;

  it("keeps every authored name instead of generating one", async () => {
    const host = await mount(named);

    await open(host);

    expect(positioner(host).id).toBe("my-popper");
    expect(content(host).id).toBe("my-panel");
    expect(host.querySelector("ui-popover-title")!.id).toBe("my-title");
    expect(host.querySelector("ui-popover-description")!.id).toBe("my-desc");
    // With `delegate` the id belongs on the child, because the child is the
    // element Zag names.
    expect(closeTrigger(host).id).toBe("my-close");
    expect(host.querySelector("ui-popover-close-trigger")!.hasAttribute("id")).toBe(false);
  });

  it("still lets Zag find the parts it named", async () => {
    const host = await mount(named);

    await open(host);
    await waitFor(() => positioner(host).style.getPropertyValue("--x") !== "");

    // Positioning proves `getPositionerEl` resolved, and the label proves
    // `checkRenderedElements` found the title by its authored id.
    expect(content(host).getAttribute("aria-labelledby")).toBe("my-title");
    expect(content(host).getAttribute("aria-describedby")).toBe("my-desc");

    await userEvent.click(closeTrigger(host));
    await waitFor(() => !isOpen(host));
  });

  it("generates a name for any part that authored none", async () => {
    const host = await mount(basic());

    expect(positioner(host).id).toContain(":popper");
    expect(content(host).id).toContain(":content");
  });
});

describe("delegation", () => {
  it("puts Zag's trigger props on the button, not on the part element", async () => {
    const host = await mount(basic());
    const part = host.querySelector("ui-popover-trigger")!;

    expect(trigger(host).getAttribute("data-part")).toBe("trigger");
    expect(trigger(host).getAttribute("aria-haspopup")).toBe("dialog");
    expect(part.hasAttribute("data-part")).toBe(false);
  });

  it("takes props on the element itself without delegate", async () => {
    const host = await mount(basic());

    expect(positioner(host).getAttribute("data-part")).toBe("positioner");
    expect(content(host).getAttribute("data-part")).toBe("content");
    expect(host.querySelector("ui-popover-title")!.getAttribute("data-part")).toBe("title");
  });

  it("warns once for a trigger with no delegate", async () => {
    const warnings: unknown[] = [];
    const original = console.warn;

    console.warn = (...args: unknown[]) => warnings.push(args[0]);

    try {
      await mount(`
        <ui-popover>
          <ui-popover-trigger><button>Open</button></ui-popover-trigger>
          <ui-popover-positioner><ui-popover-content>Body</ui-popover-content></ui-popover-positioner>
        </ui-popover>
      `);
    } finally {
      console.warn = original;
    }

    expect(warnings.filter((text) => String(text).includes("ui-popover-trigger"))).toHaveLength(1);
  });
});

describe("opening and closing", () => {
  it("starts closed, with the panel out of the tab order", async () => {
    const host = await mount(basic());

    expect(isOpen(host)).toBe(false);
    expect(trigger(host).getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on click and closes again", async () => {
    const host = await mount(basic());

    await open(host);
    expect(trigger(host).getAttribute("aria-expanded")).toBe("true");

    await userEvent.click(trigger(host));
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
    await userEvent.click(host.querySelector<HTMLButtonElement>("#elsewhere")!);
    await waitFor(() => !isOpen(host));
  });

  it("closes from the close trigger", async () => {
    const host = await mount(basic());

    await open(host);
    await userEvent.click(closeTrigger(host));
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

    expect(panel.getAttribute("aria-labelledby")).toBe(host.querySelector("ui-popover-title")!.id);
    expect(panel.getAttribute("aria-describedby")).toBe(host.querySelector("ui-popover-description")!.id);
  });

  it("emits open-change as a bubbling event", async () => {
    const host = await mount(basic());
    const seen: boolean[] = [];

    document.addEventListener("ui-popover:open-change", (event) => {
      seen.push((event as CustomEvent<{ open: boolean }>).detail.open);
    });

    await open(host);
    await userEvent.click(trigger(host));
    await waitFor(() => !isOpen(host));

    expect(seen).toEqual([true, false]);
  });
});

/**
 * The tri-state boolean rule's first real consumer. Every one of these props
 * defaults to `true` in Zag, so presence alone could never turn them off.
 */
describe("a boolean attribute that says false", () => {
  it("keeps the popover open on an outside click", async () => {
    const host = await mount(`<button id="elsewhere">Elsewhere</button>${basic(`close-on-interact-outside="false"`)}`);

    await open(host);
    await userEvent.click(host.querySelector<HTMLButtonElement>("#elsewhere")!);
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });

  it("keeps the popover open on Escape", async () => {
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

    await userEvent.click(host.querySelector<HTMLButtonElement>("#elsewhere")!);
    await frames(6);

    expect(isOpen(host)).toBe(true);
  });
});

/**
 * The reason `applyProps` stopped writing the `style` attribute.
 *
 * `getPositionerProps().style` is a template: the `transform` reads `var(--x)`
 * and `var(--y)`, and `@zag-js/popper` writes those two values imperatively once
 * floating-ui has measured. Writing the whole attribute deleted them, which made
 * the transform invalid and dropped the panel at the containing block's origin.
 */
describe("positioning", () => {
  it("keeps floating-ui's coordinates across later renders", async () => {
    const host = await mount(basic(`positioning-placement="bottom-end" positioning-gutter="8"`));

    await open(host);
    await waitFor(() => positioner(host).style.getPropertyValue("--x") !== "");

    const x = positioner(host).style.getPropertyValue("--x");
    const y = positioner(host).style.getPropertyValue("--y");

    // Anything that wakes the subscription and schedules another render.
    root(host).setAttribute("positioning-overflow-padding", "12");
    await frames(4);

    expect(positioner(host).style.getPropertyValue("--x")).toBe(x);
    expect(positioner(host).style.getPropertyValue("--y")).toBe(y);
    expect(positioner(host).style.transform).toContain("var(--x)");
  });

  it("reads the placement back onto the trigger and the panel", async () => {
    const host = await mount(basic(`positioning-placement="top-start"`));

    await open(host);
    await waitFor(() => content(host).getAttribute("data-placement") !== null);

    expect(content(host).getAttribute("data-side")).toBe("top");
    expect(trigger(host).getAttribute("data-side")).toBe("top");
  });

  it("puts the panel below the trigger, not at the origin", async () => {
    const host = await mount(basic(`positioning-placement="bottom" positioning-gutter="8"`));

    await open(host);
    await waitFor(() => positioner(host).style.getPropertyValue("--x") !== "");

    const triggerRect = trigger(host).getBoundingClientRect();
    const panelRect = content(host).getBoundingClientRect();

    expect(panelRect.top).toBeGreaterThan(triggerRect.top);
  });

  it("keeps a consumer's own inline style on the root", async () => {
    const host = await mount(basic(`style="position: relative; left: 10px"`));

    await open(host);

    expect(root(host).style.left).toBe("10px");
  });

  it("takes a fixed strategy", async () => {
    const host = await mount(basic(`positioning-strategy="fixed"`));

    await open(host);

    expect(positioner(host).style.position).toBe("fixed");
  });

  it("coerces a numeric attribute and ignores a bad one", async () => {
    const host = await mount(basic(`positioning-gutter="nonsense"`));

    await open(host);
    await waitFor(() => positioner(host).style.getPropertyValue("--y") !== "");

    // `NaN` would have reached floating-ui and produced no coordinates at all.
    expect(positioner(host).style.getPropertyValue("--y")).not.toContain("NaN");
  });
});

/**
 * The same imperative-style hazard as the positioner, on a second element:
 * floating-ui's arrow middleware writes `top` and `left` straight onto it.
 */
describe("the arrow", () => {
  const withArrow = `
    <ui-popover positioning-placement="bottom">
      <ui-popover-trigger delegate><button>Open</button></ui-popover-trigger>
      <ui-popover-positioner>
        <ui-popover-content>
          <ui-popover-arrow><ui-popover-arrow-tip></ui-popover-arrow-tip></ui-popover-arrow>
          <div>Panel body</div>
        </ui-popover-content>
      </ui-popover-positioner>
    </ui-popover>
  `;

  it("keeps the offsets floating-ui wrote across later renders", async () => {
    const host = await mount(withArrow);
    const arrow = () => host.querySelector<HTMLElement>("ui-popover-arrow")!;

    await open(host);
    await waitFor(() => arrow().style.left !== "" || arrow().style.top !== "");

    const left = arrow().style.left;

    root(host).setAttribute("positioning-overflow-padding", "12");
    await frames(4);

    expect(arrow().style.left).toBe(left);
    expect(arrow().style.position).toBe("absolute");
  });
});

describe("presence", () => {
  it("holds the panel mounted through the exit animation", async () => {
    animate();

    const host = await mount(basic());

    await open(host);
    await userEvent.click(trigger(host));
    await frames();

    // Zag has closed, so `data-state` has flipped, but `hidden` is deferred.
    expect(content(host).getAttribute("data-state")).toBe("closed");
    expect(content(host).hasAttribute("hidden")).toBe(false);

    await waitFor(() => content(host).hasAttribute("hidden"));
  });

  it("hides immediately when the consumer turns it off", async () => {
    animate();

    const host = await mount(basic().replace("<ui-popover-content>", `<ui-popover-content presence="false">`));

    await open(host);
    await userEvent.click(trigger(host));
    await frames(2);

    expect(content(host).hasAttribute("hidden")).toBe(true);
  });

  it("hides immediately when no animation is declared", async () => {
    const host = await mount(basic());

    await open(host);
    await userEvent.click(trigger(host));
    await frames(2);

    expect(content(host).hasAttribute("hidden")).toBe(true);
  });
});

describe("modal", () => {
  it("locks body scroll while open and releases it after", async () => {
    const host = await mount(basic("modal"));

    await open(host);
    await waitFor(() => document.body.hasAttribute("data-scroll-lock"));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => !document.body.hasAttribute("data-scroll-lock"));
  });

  it("hides everything outside the panel from assistive technology", async () => {
    const host = await mount(`<div id="sibling">Outside</div>${basic("modal")}`);

    await open(host);
    await waitFor(() => host.querySelector("#sibling")!.getAttribute("aria-hidden") === "true");
  });

  it("marks the panel as modal", async () => {
    const host = await mount(basic("modal"));

    await open(host);

    expect(content(host).getAttribute("aria-modal")).toBe("true");
  });

  it("does not lock scroll when it is not modal", async () => {
    const host = await mount(basic());

    await open(host);
    await frames(4);

    expect(document.body.hasAttribute("data-scroll-lock")).toBe(false);
  });
});

describe("several triggers", () => {
  const shared = `
    <ui-popover default-trigger-value="a">
      <ui-popover-trigger delegate value="a"><button>A</button></ui-popover-trigger>
      <ui-popover-trigger delegate value="b"><button>B</button></ui-popover-trigger>
      <ui-popover-positioner>
        <ui-popover-content><div>Panel body</div></ui-popover-content>
      </ui-popover-positioner>
    </ui-popover>
  `;

  const buttons = (host: ParentNode) => [...host.querySelectorAll<HTMLButtonElement>("button")];

  it("marks the current trigger and switches between them", async () => {
    const host = await mount(shared);
    const [a, b] = buttons(host) as [HTMLButtonElement, HTMLButtonElement];

    expect(a.getAttribute("data-current")).toBe("");
    expect(b.hasAttribute("data-current")).toBe(false);

    await userEvent.click(a);
    await waitFor(() => isOpen(host));

    await userEvent.click(b);
    await waitFor(() => b.getAttribute("data-current") === "");

    expect(isOpen(host)).toBe(true);
    expect(a.hasAttribute("data-current")).toBe(false);
  });

  it("gives each trigger its own id", async () => {
    const host = await mount(shared);
    const [a, b] = buttons(host) as [HTMLButtonElement, HTMLButtonElement];

    expect(a.id).not.toBe(b.id);
    expect(a.id).toContain(":trigger:a");
  });
});

describe("two popovers on one page", () => {
  it("keeps them independent", async () => {
    const host = await mount(`${basic("", "First")}${basic("", "Second")}`);
    const [first, second] = [...host.querySelectorAll<UIPopover>("ui-popover")] as [UIPopover, UIPopover];
    const panelOf = (el: UIPopover) => el.querySelector<HTMLElement>("ui-popover-content")!;

    await userEvent.click(first.querySelector("button")!);
    await waitFor(() => !panelOf(first).hasAttribute("hidden"));

    expect(panelOf(second).hasAttribute("hidden")).toBe(true);
    expect(panelOf(first).id).not.toBe(panelOf(second).id);
  });
});

describe("el.api", () => {
  it("drives the open state imperatively", async () => {
    const host = await mount(basic());

    root(host).api!.setOpen(true);
    await waitFor(() => isOpen(host));

    root(host).api!.setOpen(false);
    await waitFor(() => !isOpen(host));
  });

  it("repositions on demand, which is the repair after a differ strips the style", async () => {
    const host = await mount(basic(`positioning-placement="bottom" positioning-gutter="8"`));

    await open(host);
    await waitFor(() => positioner(host).style.getPropertyValue("--x") !== "");

    // What a morph does: the server never sent this attribute, so it goes.
    positioner(host).removeAttribute("style");

    root(host).api!.reposition();
    await waitFor(() => positioner(host).style.getPropertyValue("--x") !== "");

    expect(positioner(host).style.position).toBe("absolute");
  });
});
