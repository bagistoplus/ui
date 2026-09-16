import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "../dialog/index";
import "../popover/index";
import { defineElement, REPAIR_MARKER } from "./dom";

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

/**
 * What a DOM differ leaves behind: every attribute the server did not send is
 * gone, and the ones the consumer wrote stay. Zag's runtime state on the
 * element goes with it.
 */
function wipe(el: Element): void {
  for (const { name } of [...el.attributes]) {
    if (name === "id" || name === "class") {
      continue;
    }

    el.removeAttribute(name);
  }
}

function observedOf(ctor: CustomElementConstructor): readonly string[] {
  return (ctor as { observedAttributes?: readonly string[] }).observedAttributes ?? [];
}

function observed(tag: string): readonly string[] {
  return observedOf(customElements.get(tag)!);
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("observing the repair marker", () => {
  it("adds it to a class that declares nothing", () => {
    const ctor = class extends HTMLElement {};

    defineElement(`ui-test-bare-${crypto.randomUUID()}`, ctor);

    expect(observedOf(ctor)).toEqual([REPAIR_MARKER]);
  });

  it("keeps what the class declares for itself", () => {
    const ctor = class extends HTMLElement {
      static readonly observedAttributes = ["value", "disabled"];
    };

    defineElement(`ui-test-declared-${crypto.randomUUID()}`, ctor);

    expect(observedOf(ctor)).toEqual(["value", "disabled", REPAIR_MARKER]);
  });

  // A base class that has already been registered passes its augmented list
  // down to a subclass that declares none of its own.
  it("does not add it twice when it is inherited", () => {
    const base = class extends HTMLElement {
      static readonly observedAttributes = ["value"];
    };

    defineElement(`ui-test-base-${crypto.randomUUID()}`, base);

    const derived = class extends base {};

    defineElement(`ui-test-derived-${crypto.randomUUID()}`, derived);

    expect(observedOf(derived)).toEqual(["value", REPAIR_MARKER]);
  });

  it("covers the elements a consumer actually writes", () => {
    for (const tag of ["ui-dialog", "ui-dialog-backdrop", "ui-dialog-positioner", "ui-dialog-content", "ui-popover-content"]) {
      expect(observed(tag), tag).toContain(REPAIR_MARKER);
    }
  });
});

describe("repairing a wiped element", () => {
  it("puts back everything a differ stripped from a closed dialog", async () => {
    const host = await mount(`
      <ui-dialog top-layer>
        <ui-dialog-trigger delegate><button>Open</button></ui-dialog-trigger>
        <ui-dialog-backdrop id="backdrop"></ui-dialog-backdrop>
        <ui-dialog-positioner id="positioner">
          <ui-dialog-content id="content">Panel</ui-dialog-content>
        </ui-dialog-positioner>
      </ui-dialog>
    `);

    const backdrop = host.querySelector<HTMLElement>("ui-dialog-backdrop")!;
    const positioner = host.querySelector<HTMLElement>("ui-dialog-positioner")!;
    const content = host.querySelector<HTMLElement>("ui-dialog-content")!;

    expect(content.hasAttribute("hidden")).toBe(true);

    wipe(backdrop);
    wipe(positioner);
    wipe(content);

    expect(content.hasAttribute("hidden")).toBe(false);

    await frames();

    expect(content.getAttribute(REPAIR_MARKER)).toBe("dialog");
    expect(content.getAttribute("data-part")).toBe("content");
    expect(content.getAttribute("data-state")).toBe("closed");
    expect(content.hasAttribute("hidden")).toBe(true);

    expect(backdrop.hasAttribute("hidden")).toBe(true);

    // `popover` is Zag's too, and without it the positioner can never be
    // promoted into the top layer again.
    expect(positioner.getAttribute("popover")).toBe("manual");
  });

  it("leaves an open dialog open", async () => {
    const host = await mount(`
      <ui-dialog default-open>
        <ui-dialog-positioner><ui-dialog-content id="content">Panel</ui-dialog-content></ui-dialog-positioner>
      </ui-dialog>
    `);

    const content = host.querySelector<HTMLElement>("ui-dialog-content")!;

    expect(content.hasAttribute("hidden")).toBe(false);

    wipe(content);
    await frames();

    expect(content.getAttribute("data-state")).toBe("open");
    expect(content.hasAttribute("hidden")).toBe(false);
  });

  it("still closes on the close trigger after a wipe", async () => {
    const host = await mount(`
      <ui-dialog default-open>
        <ui-dialog-positioner>
          <ui-dialog-content id="content">
            <ui-dialog-close-trigger delegate><button>Close</button></ui-dialog-close-trigger>
          </ui-dialog-content>
        </ui-dialog-positioner>
      </ui-dialog>
    `);

    const content = host.querySelector<HTMLElement>("ui-dialog-content")!;

    wipe(content);
    await frames();

    host.querySelector<HTMLButtonElement>("ui-dialog-close-trigger button")!.click();
    await frames();

    expect(content.hasAttribute("hidden")).toBe(true);
  });

  it("repairs a popover the same way", async () => {
    const host = await mount(`
      <ui-popover>
        <ui-popover-trigger delegate><button>Open</button></ui-popover-trigger>
        <ui-popover-positioner><ui-popover-content id="content">Panel</ui-popover-content></ui-popover-positioner>
      </ui-popover>
    `);

    const content = host.querySelector<HTMLElement>("ui-popover-content")!;

    wipe(content);
    await frames();

    expect(content.getAttribute(REPAIR_MARKER)).toBe("popover");
    expect(content.hasAttribute("hidden")).toBe(true);
  });
});
