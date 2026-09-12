import { userEvent } from "vitest/browser";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { CloneDetails, UIMarquee } from "./index";

const hosts: HTMLElement[] = [];

function frames(count = 4): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
}

/** A fixed width, so Zag's multiplier is real: 100px items in 400px. */
async function mount(html: string, width = 400): Promise<HTMLElement> {
  const host = document.createElement("div");
  host.style.width = `${width}px`;
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);

  await frames();

  return host;
}

function item(label: string, attrs = ""): string {
  return `<ui-marquee-item ${attrs} style="width:100px;height:20px">${label}</ui-marquee-item>`;
}

function items(count: number): string {
  return Array.from({ length: count }, (_, i) => item(`Item ${i + 1}`)).join("");
}

/** Attributes first, so a test's own value wins over the defaults here. */
function basic(attrs = "", count = 1, extra = ""): string {
  return `
    <ui-marquee ${attrs} auto-fill spacing="0px">
      <ui-marquee-viewport>
        <ui-marquee-content>${items(count)}</ui-marquee-content>
      </ui-marquee-viewport>
      ${extra}
    </ui-marquee>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIMarquee>("ui-marquee")!;
const contents = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>("ui-marquee-content")];
const source = (host: ParentNode) => contents(host)[0]!;
const clones = (host: ParentNode) => contents(host).slice(1);
const duration = (host: ParentNode) => root(host).style.getPropertyValue("--marquee-duration");

/** Somewhere for the pointer to rest, so a hover is always an enter. */
function park(): Promise<void> {
  return userEvent.hover(document.querySelector("#pointer-parking")!);
}

beforeAll(() => {
  const parking = document.createElement("div");

  parking.id = "pointer-parking";
  parking.style.cssText = "position:fixed;right:0;bottom:0;width:10px;height:10px";
  document.body.append(parking);
});

afterEach(async () => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }

  await park();
});

describe("anatomy", () => {
  it("puts Zag's parts on the right elements", async () => {
    const host = await mount(
      basic('translations-root="Partner logos"', 1, '<ui-marquee-edge side="end"></ui-marquee-edge>'),
    );
    const marquee = root(host);

    expect(marquee.getAttribute("data-scope")).toBe("marquee");
    expect(marquee.getAttribute("data-part")).toBe("root");
    expect(marquee.getAttribute("role")).toBe("region");
    expect(marquee.getAttribute("aria-label")).toBe("Partner logos");
    expect(host.querySelector("ui-marquee-viewport")!.getAttribute("data-part")).toBe("viewport");
    expect(source(host).getAttribute("data-part")).toBe("content");
    expect(source(host).getAttribute("data-index")).toBe("0");
    expect(host.querySelector("ui-marquee-item")!.getAttribute("data-part")).toBe("item");

    const edge = host.querySelector<HTMLElement>("ui-marquee-edge")!;

    expect(edge.getAttribute("data-part")).toBe("edge");
    expect(edge.getAttribute("data-side")).toBe("end");
    expect(edge.style.getPropertyValue("inset-inline-end")).toBe("0px");
  });

  it("gives an item the spacing margin and a vertical marquee a column", async () => {
    const host = await mount(basic('side="top" spacing="8px"'));

    expect(host.querySelector<HTMLElement>("ui-marquee-item")!.style.getPropertyValue("margin-block")).toBe(
      "calc(var(--marquee-spacing) / 2)",
    );
    expect(root(host).style.getPropertyValue("--marquee-spacing")).toBe("8px");
    expect(root(host).getAttribute("data-orientation")).toBe("vertical");
    expect(root(host).style.flexDirection).toBe("column");
    expect(source(host).style.flexDirection).toBe("column");
  });

  it("works with a delegated content", async () => {
    const host = await mount(`
      <ui-marquee auto-fill spacing="0px">
        <ui-marquee-viewport>
          <ui-marquee-content delegate><div id="track">${item("One")}</div></ui-marquee-content>
        </ui-marquee-viewport>
      </ui-marquee>
    `);

    expect(host.querySelector("#track")!.getAttribute("data-part")).toBe("content");
    expect(clones(host)).toHaveLength(4);
    expect(clones(host)[0]!.firstElementChild!.id).toBe("track-1");
    expect(clones(host)[0]!.firstElementChild!.getAttribute("data-clone")).toBe("");
  });
});

describe("copies", () => {
  it("clones the source once per extra content Zag asks for", async () => {
    const host = await mount(basic("", 1));

    expect(root(host).api!.contentCount).toBe(5);
    expect(clones(host)).toHaveLength(4);

    clones(host).forEach((clone, i) => {
      expect(clone.getAttribute("index")).toBe(String(i + 1));
      expect(clone.getAttribute("data-index")).toBe(String(i + 1));
      expect(clone.hasAttribute("data-clone")).toBe(true);
      expect(clone.getAttribute("aria-hidden")).toBe("true");
      expect(clone.getAttribute("role")).toBe("presentation");
      expect(clone.hasAttribute("inert")).toBe(true);
      expect(clone.querySelectorAll("ui-marquee-item")).toHaveLength(1);
      expect(clone.querySelector("ui-marquee-item")!.getAttribute("data-part")).toBe("item");
    });
  });

  it("makes fewer copies for a wider source, and one without auto-fill", async () => {
    expect(clones(await mount(basic("", 2)))).toHaveLength(2);
    // Zag always renders one copy: it is what follows the source into view.
    expect(clones(await mount(basic('auto-fill="false"', 1)))).toHaveLength(1);
  });

  it("strips every id inside a copy", async () => {
    const host = await mount(basic("", 0).replace("</ui-marquee-content>", `${item("One", 'id="logo"')}</ui-marquee-content>`));

    expect(source(host).querySelector("#logo")).not.toBeNull();

    for (const clone of clones(host)) {
      expect(clone.querySelector("[id]")).toBeNull();
    }
  });

  it("hands each copy to a listener before it is in the document", async () => {
    const seen: Array<{ index: number; connected: boolean; source: Element }> = [];
    const host = document.createElement("div");

    host.style.width = "400px";
    host.addEventListener("ui-marquee:clone", (event) => {
      const detail = (event as CustomEvent<CloneDetails>).detail;

      seen.push({ index: detail.index, connected: detail.clone.isConnected, source: detail.source });
      detail.clone.querySelector("ui-marquee-item")!.removeAttribute("data-editor");
    });
    host.innerHTML = basic("", 0).replace("</ui-marquee-content>", `${item("One", 'data-editor="1"')}</ui-marquee-content>`);
    document.body.append(host);
    hosts.push(host);
    await frames();

    expect(seen.map((entry) => entry.index)).toEqual([1, 2, 3, 4]);
    expect(seen.every((entry) => !entry.connected)).toBe(true);
    expect(seen.every((entry) => entry.source === source(host))).toBe(true);
    expect(source(host).querySelector("[data-editor]")).not.toBeNull();

    for (const clone of clones(host)) {
      expect(clone.querySelector("[data-editor]")).toBeNull();
    }
  });

  it("follows a change inside the source", async () => {
    const host = await mount(basic("", 1));

    source(host).insertAdjacentHTML("beforeend", item("Two"));
    await frames(8);

    expect(clones(host)).toHaveLength(root(host).api!.contentCount - 1);
    expect(clones(host).length).toBeGreaterThan(0);

    for (const clone of clones(host)) {
      expect(clone.querySelectorAll("ui-marquee-item")).toHaveLength(2);
    }

    source(host).querySelector("ui-marquee-item")!.textContent = "Changed";
    await frames();

    for (const clone of clones(host)) {
      expect(clone.querySelector("ui-marquee-item")!.textContent).toBe("Changed");
    }
  });

  it("stamps a copy again after something else removed it", async () => {
    const host = await mount(basic("", 1));

    clones(host)[1]!.remove();
    expect(clones(host)).toHaveLength(3);

    root(host).flush();

    expect(clones(host)).toHaveLength(4);
    expect(clones(host).map((clone) => clone.getAttribute("index"))).toEqual(["1", "2", "3", "4"]);
  });

  it("follows the root's width", async () => {
    const host = await mount(basic("", 1));

    expect(clones(host)).toHaveLength(4);

    host.style.width = "800px";
    await frames(8);

    expect(clones(host)).toHaveLength(8);

    host.style.width = "200px";
    await frames(8);

    expect(clones(host)).toHaveLength(2);
  });
});

describe("pausing", () => {
  it("pauses on a pointer over a copy and resumes when it leaves", async () => {
    const host = await mount(basic("pause-on-interaction", 1));
    const marquee = root(host);

    expect(marquee.hasAttribute("data-paused")).toBe(false);

    // `force`: an inert element fails Playwright's hit-target check, which is
    // the point. The pointer still lands on it, and the browser targets the
    // root beneath.
    await userEvent.hover(clones(host)[2]!, { force: true });

    expect(marquee.api!.paused).toBe(true);
    expect(marquee.hasAttribute("data-paused")).toBe(true);

    await park();

    expect(marquee.api!.paused).toBe(false);
    expect(marquee.hasAttribute("data-paused")).toBe(false);
  });

  it("holds `paused` against a hover until the attribute goes", async () => {
    const host = await mount(basic("paused pause-on-interaction", 1));
    const marquee = root(host);

    expect(marquee.api!.paused).toBe(true);

    await userEvent.hover(source(host), { force: true });
    await park();

    expect(marquee.api!.paused).toBe(true);
    expect(marquee.hasAttribute("data-paused")).toBe(true);

    marquee.removeAttribute("paused");
    marquee.api!.resume();
    await frames();

    expect(marquee.api!.paused).toBe(false);
    expect(marquee.hasAttribute("data-paused")).toBe(false);
  });

  it("starts paused with default-paused, and the api toggles it", async () => {
    const host = await mount(basic("default-paused", 1));
    const marquee = root(host);
    const changes: boolean[] = [];

    marquee.addEventListener("ui-marquee:pause-change", (event) => {
      changes.push((event as CustomEvent<{ paused: boolean }>).detail.paused);
    });

    expect(marquee.api!.paused).toBe(true);

    marquee.api!.resume();
    await frames(1);
    expect(marquee.hasAttribute("data-paused")).toBe(false);

    marquee.api!.togglePause();
    await frames(1);
    expect(marquee.hasAttribute("data-paused")).toBe(true);

    marquee.api!.pause();
    marquee.api!.resume();
    await frames(1);

    expect(changes).toEqual([false, true, false]);
  });
});

describe("attributes", () => {
  it("derives the duration from the speed and the copies", async () => {
    const host = await mount(basic('speed="50"', 1));

    // 100px of content, four copies, 50px per second.
    expect(duration(host)).toBe("8s");

    root(host).setAttribute("speed", "100");
    await frames();

    expect(duration(host)).toBe("4s");
  });

  it("reverses, and reads a delay and a loop count", async () => {
    const host = await mount(basic('reverse delay="2" loop-count="3"', 1));

    expect(source(host).hasAttribute("data-reverse")).toBe(true);
    expect(clones(host)[0]!.hasAttribute("data-reverse")).toBe(true);
    expect(root(host).style.getPropertyValue("--marquee-delay")).toBe("2s");
    expect(root(host).style.getPropertyValue("--marquee-loop-count")).toBe("3");
  });

  it("flips the travel in rtl", async () => {
    const ltr = await mount(basic("", 1));
    const rtl = await mount(basic('dir="rtl"', 1));

    expect(root(ltr).style.getPropertyValue("--marquee-translate")).toBe("-100%");
    expect(root(rtl).style.getPropertyValue("--marquee-translate")).toBe("100%");
    expect(root(rtl).getAttribute("dir")).toBe("rtl");
  });
});

describe("naming", () => {
  it("keeps authored ids on the root, the viewport and the source, and names the copies after the source", async () => {
    const host = await mount(`
      <ui-marquee id="ticker" auto-fill spacing="0px">
        <ui-marquee-viewport id="ticker-viewport">
          <ui-marquee-content id="ticker-track">${item("One")}</ui-marquee-content>
        </ui-marquee-viewport>
      </ui-marquee>
    `);

    expect(root(host).id).toBe("ticker");
    expect(host.querySelector("ui-marquee-viewport")!.id).toBe("ticker-viewport");
    expect(source(host).id).toBe("ticker-track");
    expect(clones(host).map((clone) => clone.id)).toEqual(["ticker-track-1", "ticker-track-2", "ticker-track-3", "ticker-track-4"]);
  });

  it("lets Zag name everything otherwise", async () => {
    const host = await mount(basic("", 1));

    expect(root(host).id).toMatch(/^marquee:/);
    expect(source(host).id).toMatch(/:content:0$/);
    expect(clones(host)[0]!.id).toMatch(/:content:1$/);
  });
});

describe("breakpoints", () => {
  /** A `matchMedia` whose width this test controls. */
  function fakeViewport(width: number) {
    const lists = new Map<number, { matches: boolean; listeners: Set<() => void> }>();
    const spy = vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
      const min = Number(/min-width: (\d+)px/.exec(query)?.[1] ?? 0);
      const entry = lists.get(min) ?? { matches: width >= min, listeners: new Set() };

      lists.set(min, entry);

      return {
        media: query,
        get matches() {
          return entry.matches;
        },
        addEventListener: (_type: string, fn: () => void) => entry.listeners.add(fn),
        removeEventListener: (_type: string, fn: () => void) => entry.listeners.delete(fn),
      } as unknown as MediaQueryList;
    });

    return {
      resize(next: number) {
        for (const [min, entry] of lists) {
          const matches = next >= min;

          if (matches !== entry.matches) {
            entry.matches = matches;
            entry.listeners.forEach((fn) => fn());
          }
        }
      },
      listeners: () => [...lists.values()].reduce((n, entry) => n + entry.listeners.size, 0),
      restore: () => spy.mockRestore(),
    };
  }

  it("measures the new axis after a side change", async () => {
    const viewport = fakeViewport(800);

    try {
      // 100px of content in 400px: four copies, 8s. Vertical, 20px of content
      // in 100px: five copies, 2s. The stale measurement would say 8s again.
      const host = await mount(basic('speed="50" side="top 640:start" default-paused style="height:100px"', 1));

      expect(duration(host)).toBe("8s");

      viewport.resize(320);
      await frames(6);

      expect(root(host).getAttribute("data-orientation")).toBe("vertical");
      expect(duration(host)).toBe("2s");
      expect(root(host).api!.paused).toBe(true);
      expect(clones(host)).toHaveLength(5);

      viewport.resize(800);
      await frames(6);

      expect(root(host).getAttribute("data-orientation")).toBe("horizontal");
      expect(duration(host)).toBe("8s");
    } finally {
      viewport.restore();
    }
  });

  it("reads the widest matching tier of speed, spacing and side, and follows the viewport", async () => {
    const viewport = fakeViewport(800);

    try {
      const host = await mount(basic('speed="50 640:100" spacing="0px 1024:16px" side="top 640:start"', 1));
      const marquee = root(host);

      expect(duration(host)).toBe("4s");
      expect(marquee.style.getPropertyValue("--marquee-spacing")).toBe("0px");
      expect(marquee.getAttribute("data-orientation")).toBe("horizontal");

      viewport.resize(1100);
      await frames(6);

      expect(marquee.style.getPropertyValue("--marquee-spacing")).toBe("16px");

      viewport.resize(320);
      await frames(6);

      expect(marquee.getAttribute("data-orientation")).toBe("vertical");
      expect(marquee.style.getPropertyValue("--marquee-spacing")).toBe("0px");

      host.remove();
      await Promise.resolve();

      expect(viewport.listeners()).toBe(0);
    } finally {
      viewport.restore();
    }
  });
});
