import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UICollapsible } from "./root";

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

/** The shape every consumer writes: a delegating trigger and a panel. */
function basic(attrs = "", body = `<p style="height: 200px; margin: 0">Panel body <a href="#">link</a></p>`): string {
  return `
    <ui-collapsible ${attrs}>
      <ui-collapsible-trigger delegate>
        <button>Toggle <ui-collapsible-indicator>v</ui-collapsible-indicator></button>
      </ui-collapsible-trigger>
      <ui-collapsible-content>${body}</ui-collapsible-content>
    </ui-collapsible>
  `;
}

const root = (host: ParentNode) => host.querySelector<UICollapsible>("ui-collapsible")!;
const trigger = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-collapsible-trigger button")!;
const content = (host: ParentNode) => host.querySelector<HTMLElement>("ui-collapsible-content")!;
const indicator = (host: ParentNode) => host.querySelector<HTMLElement>("ui-collapsible-indicator")!;

const isOpen = (host: ParentNode) => !content(host).hasAttribute("hidden");

function animate(duration = 300): void {
  const style = document.createElement("style");

  style.textContent = `
    ui-collapsible-content[data-state="open"] { animation: test-in ${duration}ms linear }
    ui-collapsible-content[data-state="closed"] { animation: test-out ${duration}ms linear }
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

describe("anatomy", () => {
  it("puts each part's props on the right element", async () => {
    const host = await mount(basic());
    const part = host.querySelector("ui-collapsible-trigger")!;

    expect(root(host).getAttribute("data-part")).toBe("root");
    expect(root(host).getAttribute("data-state")).toBe("closed");
    expect(trigger(host).getAttribute("data-part")).toBe("trigger");
    expect(trigger(host).getAttribute("type")).toBe("button");
    expect(part.hasAttribute("data-part")).toBe(false);
    expect(content(host).getAttribute("data-part")).toBe("content");
    expect(indicator(host).getAttribute("data-part")).toBe("indicator");
  });

  it("points the trigger at the content", async () => {
    const host = await mount(basic());

    expect(trigger(host).getAttribute("aria-controls")).toBe(content(host).id);
    expect(content(host).id).toContain(":content");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(`
      <ui-collapsible id="my-root">
        <ui-collapsible-trigger delegate><button id="my-trigger">Toggle</button></ui-collapsible-trigger>
        <ui-collapsible-content id="my-panel"><p>Body</p></ui-collapsible-content>
      </ui-collapsible>
    `);

    expect(root(host).id).toBe("my-root");
    expect(trigger(host).id).toBe("my-trigger");
    expect(content(host).id).toBe("my-panel");
    expect(trigger(host).getAttribute("aria-controls")).toBe("my-panel");

    // Zag finds the content by that name, or opening would never measure it.
    await userEvent.click(trigger(host));
    await waitFor(() => content(host).style.getPropertyValue("--height") !== "0px");
  });

  it("warns once for a trigger with no delegate", async () => {
    const warnings: unknown[] = [];
    const original = console.warn;

    console.warn = (...args: unknown[]) => warnings.push(args[0]);

    try {
      await mount(`
        <ui-collapsible>
          <ui-collapsible-trigger><button>Toggle</button></ui-collapsible-trigger>
          <ui-collapsible-content>Body</ui-collapsible-content>
        </ui-collapsible>
      `);
    } finally {
      console.warn = original;
    }

    expect(warnings.filter((text) => String(text).includes("ui-collapsible-trigger"))).toHaveLength(1);
  });
});

describe("opening and closing", () => {
  it("starts closed, with the panel hidden", async () => {
    const host = await mount(basic());

    expect(isOpen(host)).toBe(false);
    expect(getComputedStyle(content(host)).display).toBe("none");
    expect(trigger(host).getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on click and closes again", async () => {
    const host = await mount(basic());

    await userEvent.click(trigger(host));
    await waitFor(() => isOpen(host));

    expect(trigger(host).getAttribute("aria-expanded")).toBe("true");
    expect(root(host).getAttribute("data-state")).toBe("open");
    expect(indicator(host).getAttribute("data-state")).toBe("open");
    expect(getComputedStyle(content(host)).display).toBe("block");

    await userEvent.click(trigger(host));
    await waitFor(() => !isOpen(host));

    expect(trigger(host).getAttribute("aria-expanded")).toBe("false");
  });

  it("measures the content into --height", async () => {
    const host = await mount(basic());

    await userEvent.click(trigger(host));
    await waitFor(() => content(host).style.getPropertyValue("--height") === "200px");
  });

  it("opens on first paint with default-open", async () => {
    const host = await mount(basic("default-open"));

    expect(isOpen(host)).toBe(true);
    expect(trigger(host).getAttribute("aria-expanded")).toBe("true");
  });

  it("ignores a click while disabled", async () => {
    const host = await mount(basic("disabled"));

    expect(trigger(host).hasAttribute("data-disabled")).toBe(true);

    trigger(host).click();
    await frames();

    expect(isOpen(host)).toBe(false);
  });

  it("emits open-change as a bubbling event", async () => {
    const host = await mount(basic());
    const seen: unknown[] = [];

    host.addEventListener("ui-collapsible:open-change", (event) => seen.push((event as CustomEvent).detail));

    await userEvent.click(trigger(host));
    await waitFor(() => isOpen(host));

    expect(seen).toEqual([{ open: true }]);
  });

  it("drives the open state through el.api", async () => {
    const host = await mount(basic());

    root(host).api!.setOpen(true);
    await waitFor(() => isOpen(host));
    expect(root(host).api!.open).toBe(true);

    root(host).api!.setOpen(false);
    await waitFor(() => !isOpen(host));
    expect(root(host).api!.open).toBe(false);
  });
});

describe("controlled", () => {
  it("holds the attribute's state and still reports the click", async () => {
    const host = await mount(basic(`open="false"`));
    const seen: unknown[] = [];

    host.addEventListener("ui-collapsible:open-change", (event) => seen.push((event as CustomEvent).detail));

    await userEvent.click(trigger(host));
    await frames();

    expect(seen).toEqual([{ open: true }]);
    expect(isOpen(host)).toBe(false);
  });

  it("opens and closes when the attribute changes", async () => {
    const host = await mount(basic(`open="false"`));

    root(host).setAttribute("open", "");
    await waitFor(() => isOpen(host));

    root(host).setAttribute("open", "false");
    await waitFor(() => !isOpen(host));
  });

  it("closes and hands the state back when the attribute is removed", async () => {
    const host = await mount(basic("open"));

    expect(isOpen(host)).toBe(true);

    root(host).removeAttribute("open");
    await waitFor(() => !isOpen(host));

    // Uncontrolled again: a click opens it without anyone writing the attribute.
    await userEvent.click(trigger(host));
    await waitFor(() => isOpen(host));
  });
});

describe("collapsed size", () => {
  it("clips the closed panel instead of hiding it, and makes its links inert", async () => {
    const host = await mount(basic(`collapsed-height="60"`));
    const link = content(host).querySelector("a")!;

    // Closed, but with nothing hidden: the clip is what closes it.
    expect(root(host).getAttribute("data-state")).toBe("closed");
    expect(isOpen(host)).toBe(true);
    expect(content(host).hasAttribute("data-has-collapsed-size")).toBe(true);
    expect(content(host).style.maxHeight).toBe("60px");
    expect(content(host).style.overflow).toBe("hidden");
    expect(content(host).style.getPropertyValue("--collapsed-height")).toBe("60px");
    expect(content(host).getBoundingClientRect().height).toBe(60);
    expect(link.hasAttribute("inert")).toBe(true);
  });

  it("releases the clip and the inert links on open", async () => {
    const host = await mount(basic(`collapsed-height="60"`));
    const link = content(host).querySelector("a")!;

    await userEvent.click(trigger(host));
    await waitFor(() => content(host).style.maxHeight === "");

    expect(content(host).style.overflow).toBe("");
    expect(content(host).getBoundingClientRect().height).toBe(200);
    expect(link.hasAttribute("inert")).toBe(false);
  });

  it("passes a CSS length through as written", async () => {
    const host = await mount(basic(`collapsed-height="5rem"`));

    expect(content(host).style.maxHeight).toBe("5rem");
  });

  it("is exempt from the pre-upgrade guard, so the server can render the clip", () => {
    // The element is defined by now, so `:not(:defined)` can no longer match
    // here. The rule is checked by its text instead.
    const rule = [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .flatMap((rule) => ("cssRules" in rule ? [...(rule as CSSGroupingRule).cssRules] : [rule]))
      .find((rule) => rule.cssText.includes("ui-collapsible:not(:defined)"));

    expect(rule?.cssText).toContain(":not([default-open]):not([collapsed-height]):not([collapsed-width])");
  });

  it("takes over a clip the server rendered, and removes it on open", async () => {
    const host = await mount(
      basic(
        `collapsed-height="60"`,
        `<p style="height: 200px; margin: 0">Body</p>`,
      ).replace("<ui-collapsible-content>", `<ui-collapsible-content style="overflow:hidden;max-height:60px">`),
    );

    expect(content(host).style.maxHeight).toBe("60px");

    await userEvent.click(trigger(host));
    await waitFor(() => content(host).style.maxHeight === "");

    expect(content(host).style.overflow).toBe("");
    expect(content(host).getBoundingClientRect().height).toBe(200);
  });
});

describe("exit animation", () => {
  it("holds the panel visible until the animation ends, then reports it", async () => {
    animate(300);

    const host = await mount(basic("default-open"));
    let completed = 0;

    host.addEventListener("ui-collapsible:exit-complete", () => completed++);

    await userEvent.click(trigger(host));
    await frames(2);

    // Closing: the trigger already says closed, the panel is still there.
    expect(content(host).getAttribute("data-state")).toBe("closed");
    expect(isOpen(host)).toBe(true);
    expect(completed).toBe(0);

    await waitFor(() => !isOpen(host));
    expect(completed).toBe(1);
  });

  it("hides immediately when no animation is declared", async () => {
    const host = await mount(basic("default-open"));

    await userEvent.click(trigger(host));
    await frames(3);

    expect(isOpen(host)).toBe(false);
  });
});

describe("nested", () => {
  const nested = `
    <ui-collapsible id="outer" default-open>
      <ui-collapsible-trigger delegate><button id="outer-trigger">Outer</button></ui-collapsible-trigger>
      <ui-collapsible-content id="outer-panel">
        <ui-collapsible id="inner">
          <ui-collapsible-trigger delegate><button id="inner-trigger">Inner</button></ui-collapsible-trigger>
          <ui-collapsible-content id="inner-panel"><p>Inner body</p></ui-collapsible-content>
        </ui-collapsible>
      </ui-collapsible-content>
    </ui-collapsible>
  `;

  it("gives each part to its nearest root", async () => {
    const host = await mount(nested);
    const outerPanel = host.querySelector<HTMLElement>("#outer-panel")!;
    const innerPanel = host.querySelector<HTMLElement>("#inner-panel")!;

    expect(host.querySelector("#outer-trigger")!.getAttribute("aria-controls")).toBe("outer-panel");
    expect(host.querySelector("#inner-trigger")!.getAttribute("aria-controls")).toBe("inner-panel");

    await userEvent.click(host.querySelector<HTMLButtonElement>("#inner-trigger")!);
    await waitFor(() => !innerPanel.hasAttribute("hidden"));

    expect(outerPanel.hasAttribute("hidden")).toBe(false);

    await userEvent.click(host.querySelector<HTMLButtonElement>("#outer-trigger")!);
    await waitFor(() => outerPanel.hasAttribute("hidden"));

    // The inner one keeps its own state.
    expect(innerPanel.hasAttribute("hidden")).toBe(false);
  });
});
