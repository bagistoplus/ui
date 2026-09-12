import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UICarousel } from "./root";

const hosts: HTMLElement[] = [];

function frames(count = 4): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
}

/** A fixed width, so Zag measures real snap points. */
async function mount(html: string): Promise<HTMLElement> {
  const host = document.createElement("div");
  host.style.width = "400px";
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);

  await frames();

  return host;
}

function item(label: string, attrs = ""): string {
  return `<ui-carousel-item ${attrs} style="height:40px">${label}</ui-carousel-item>`;
}

function items(count: number): string {
  return Array.from({ length: count }, (_, i) => item(`Slide ${i + 1}`)).join("");
}

function basic(attrs = "", slides = 3, extra = ""): string {
  return `
    <ui-carousel ${attrs}>
      <ui-carousel-item-group>${items(slides)}</ui-carousel-item-group>
      <ui-carousel-prev-trigger delegate><button>Prev</button></ui-carousel-prev-trigger>
      <ui-carousel-next-trigger delegate><button>Next</button></ui-carousel-next-trigger>
      ${extra}
    </ui-carousel>
  `;
}

const DOTS = `
  <ui-carousel-indicator-group id="dots">
    <template><ui-carousel-indicator delegate><button class="dot"></button></ui-carousel-indicator></template>
  </ui-carousel-indicator-group>
`;

const root = (host: ParentNode) => host.querySelector<UICarousel>("ui-carousel")!;
const slides = (host: ParentNode) => [...host.querySelectorAll<HTMLElement>("ui-carousel-item")];
const prev = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-carousel-prev-trigger > button")!;
const next = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-carousel-next-trigger > button")!;
const dots = (host: ParentNode) => [...host.querySelectorAll<HTMLButtonElement>("button.dot")];
const pageVar = (host: ParentNode) => root(host).style.getPropertyValue("--page");
const countVar = (host: ParentNode) => root(host).style.getPropertyValue("--page-count");

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("anatomy", () => {
  it("puts each part's props on the right element", async () => {
    const host = await mount(
      basic(
        "",
        3,
        `
        <ui-carousel-control><span>controls</span></ui-carousel-control>
        <ui-carousel-autoplay-trigger delegate><button>Play</button></ui-carousel-autoplay-trigger>
        <ui-carousel-progress-text></ui-carousel-progress-text>
        ${DOTS}
      `,
      ),
    );
    const carousel = root(host);
    const group = host.querySelector<HTMLElement>("ui-carousel-item-group")!;

    expect(carousel.dataset.part).toBe("root");
    expect(carousel.getAttribute("role")).toBe("region");
    expect(carousel.getAttribute("aria-roledescription")).toBe("carousel");
    expect(group.dataset.part).toBe("item-group");
    expect(group.style.display).toBe("grid");
    expect(slides(host)[0]!.dataset.part).toBe("item");
    expect(slides(host)[0]!.getAttribute("role")).toBe("group");
    expect(host.querySelector<HTMLElement>("ui-carousel-control")!.dataset.part).toBe("control");
    expect(prev(host).dataset.part).toBe("prev-trigger");
    expect(next(host).dataset.part).toBe("next-trigger");
    expect(prev(host).getAttribute("aria-controls")).toBe(group.id);
    expect(host.querySelector<HTMLElement>("ui-carousel-autoplay-trigger > button")!.dataset.part).toBe(
      "autoplay-trigger",
    );
    expect(host.querySelector<HTMLElement>("ui-carousel-indicator-group")!.dataset.part).toBe("indicator-group");
    expect(dots(host)[0]!.dataset.part).toBe("indicator");
    expect(host.querySelector<HTMLElement>("ui-carousel-progress-text")!.dataset.part).toBe("progress-text");
  });

  it("is a box, and delegated hosts are not", async () => {
    const host = await mount(basic());

    expect(getComputedStyle(root(host)).display).toBe("block");
    expect(getComputedStyle(host.querySelector("ui-carousel-item-group")!).gridAutoFlow).toBe("column");
    expect(getComputedStyle(host.querySelector("ui-carousel-prev-trigger")!).display).toBe("contents");
  });
});

describe("counting and numbering", () => {
  it("counts the items and numbers them in DOM order", async () => {
    const host = await mount(basic());

    expect(slides(host).map((slide) => slide.dataset.index)).toEqual(["0", "1", "2"]);
    expect(root(host).api!.pageSnapPoints).toHaveLength(3);
    expect(countVar(host)).toBe("3");
    expect(slides(host)[0]!.getAttribute("aria-label")).toBe("1 of 3");
  });

  it("takes slide-count and index from the consumer when written", async () => {
    const host = await mount(`
      <ui-carousel slide-count="2">
        <ui-carousel-item-group>
          ${item("b", 'index="1"')}${item("a", 'index="0"')}
        </ui-carousel-item-group>
      </ui-carousel>
    `);

    expect(slides(host).map((slide) => slide.dataset.index)).toEqual(["1", "0"]);
    expect(slides(host)[0]!.getAttribute("aria-label")).toBe("2 of 2");
  });

  it("does not count a hidden item, and follows the attribute when it toggles", async () => {
    const host = await mount(`
      <ui-carousel>
        <ui-carousel-item-group>
          ${item("a")}${item("b", "hidden")}${item("c")}
        </ui-carousel-item-group>
      </ui-carousel>
    `);
    const [a, b, c] = slides(host);

    expect(a!.dataset.index).toBe("0");
    expect(b!.dataset.index).toBeUndefined();
    expect(c!.dataset.index).toBe("1");
    expect(countVar(host)).toBe("2");
    expect(getComputedStyle(b!).display).toBe("none");

    b!.hidden = false;
    await frames();

    expect(b!.dataset.index).toBe("1");
    expect(c!.dataset.index).toBe("2");
    expect(countVar(host)).toBe("3");
  });

  it("renumbers after an insertion, and the new item is observed", async () => {
    const host = await mount(basic());
    const before = root(host).api;
    const group = host.querySelector("ui-carousel-item-group")!;

    group.insertAdjacentHTML("afterbegin", item("new"));
    await frames(8);

    expect(slides(host).map((slide) => slide.dataset.index)).toEqual(["0", "1", "2", "3"]);
    expect(root(host).api).not.toBe(before);
    expect(countVar(host)).toBe("4");
    // The new machine's intersection observer sees the item at page 0.
    expect(slides(host)[0]!.hasAttribute("data-inview")).toBe(true);
  });

  it("clamps the page when the current item is removed", async () => {
    const host = await mount(basic());

    root(host).api!.scrollTo(2, true);
    await frames();
    expect(pageVar(host)).toBe("2");

    slides(host)[2]!.remove();
    await frames(8);

    expect(countVar(host)).toBe("2");
    expect(root(host).api!.page).toBe(1);
  });

  it("keeps the page across the restart an insertion causes", async () => {
    const host = await mount(basic());

    root(host).api!.scrollTo(1, true);
    await frames();

    host.querySelector("ui-carousel-item-group")!.insertAdjacentHTML("beforeend", item("last"));
    await frames(8);

    expect(root(host).api!.page).toBe(1);
    expect(pageVar(host)).toBe("1");
  });
});

describe("paging", () => {
  it("moves with the triggers and disables them at the ends", async () => {
    const host = await mount(basic());

    expect(prev(host).disabled).toBe(true);
    expect(next(host).disabled).toBe(false);

    await userEvent.click(next(host));
    await frames();

    expect(root(host).api!.page).toBe(1);
    expect(pageVar(host)).toBe("1");
    expect(prev(host).disabled).toBe(false);

    await userEvent.click(next(host));
    await frames();

    expect(next(host).disabled).toBe(true);
  });

  it("never disables the triggers with loop", async () => {
    const host = await mount(basic("loop"));

    expect(prev(host).disabled).toBe(false);

    root(host).api!.scrollTo(2, true);
    await frames();

    expect(next(host).disabled).toBe(false);
  });

  it("emits page-change with Zag's details", async () => {
    const host = await mount(basic());
    const pages: number[] = [];

    root(host).addEventListener("ui-carousel:page-change", (event) => {
      pages.push((event as CustomEvent<{ page: number }>).detail.page);
    });

    await userEvent.click(next(host));
    await frames();
    root(host).api!.scrollToIndex(0, true);
    await frames();

    expect(pages).toEqual([1, 0]);
  });

  it("pages with the arrow keys on the indicator group", async () => {
    const host = await mount(basic("", 3, DOTS));

    dots(host)[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    await frames();

    expect(root(host).api!.page).toBe(1);
    expect(dots(host)[1]!.hasAttribute("data-current")).toBe(true);

    await userEvent.keyboard("{End}");
    await frames();

    expect(root(host).api!.page).toBe(2);
  });
});

describe("mouse drag", () => {
  /** A press, a move of a few pixels, a release, as the pointer events Zag listens for. */
  async function drag(group: HTMLElement, distance: number): Promise<void> {
    group.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0, clientX: 100, clientY: 20 }));
    await frames(1);

    for (let moved = 0; moved < distance; moved++) {
      document.dispatchEvent(
        new PointerEvent("pointermove", { bubbles: true, clientX: 100 - moved, clientY: 20, movementX: -1 }),
      );
      await frames(1);
    }

    document.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 100 - distance, clientY: 20 }));
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  it("turns snapping off for the drag, so a short drag does not change the page", async () => {
    const host = await mount(basic("allow-mouse-drag"));
    const group = host.querySelector<HTMLElement>("ui-carousel-item-group")!;
    let snapDuringDrag = "";

    group.addEventListener("pointermove", () => {}, { once: true });
    root(host).addEventListener("ui-carousel:drag-status-change", (event) => {
      if ((event as CustomEvent<{ type: string }>).detail.type === "dragging") {
        snapDuringDrag = group.style.scrollSnapType;
      }
    });

    await drag(group, 3);

    expect(snapDuringDrag).toBe("none");
    expect(root(host).api!.page).toBe(0);
    expect(group.scrollLeft).toBe(0);
    expect(group.style.scrollSnapType).toBe("x mandatory");
  });
});

describe("indicators", () => {
  it("stamps one clone per page from the template, and re-stamps when the page count changes", async () => {
    const host = await mount(basic("", 4, DOTS));

    expect(dots(host)).toHaveLength(4);
    expect(dots(host).map((dot) => dot.dataset.index)).toEqual(["0", "1", "2", "3"]);
    expect(dots(host)[0]!.hasAttribute("data-current")).toBe(true);
    expect(dots(host)[0]!.getAttribute("aria-label")).toBe("Go to slide 1");

    root(host).setAttribute("slides-per-page", "2");
    await frames(6);

    expect(dots(host)).toHaveLength(2);
  });

  it("stamps again after something else removed the clones", async () => {
    const host = await mount(basic("", 3, DOTS));

    expect(dots(host)).toHaveLength(3);

    for (const dot of dots(host)) {
      dot.parentElement!.remove();
    }

    expect(dots(host)).toHaveLength(0);

    root(host).flush();
    await frames();

    expect(dots(host)).toHaveLength(3);
    expect(dots(host).map((dot) => dot.id)).toEqual(["dots-0", "dots-1", "dots-2"]);
  });

  it("names the clones after the group's id, and leaves authored indicators alone", async () => {
    const host = await mount(
      basic(
        "",
        3,
        `
        ${DOTS}
        <ui-carousel-indicator-group id="thumbs">
          <ui-carousel-indicator delegate><button id="thumb-a">a</button></ui-carousel-indicator>
          <ui-carousel-indicator delegate><button id="thumb-b">b</button></ui-carousel-indicator>
          <ui-carousel-indicator delegate><button id="thumb-c">c</button></ui-carousel-indicator>
        </ui-carousel-indicator-group>
      `,
      ),
    );
    const thumbs = [...host.querySelectorAll<HTMLButtonElement>("#thumbs button")];

    expect(dots(host).map((dot) => dot.id)).toEqual(["dots-0", "dots-1", "dots-2"]);
    expect(thumbs.map((thumb) => thumb.id)).toEqual(["thumb-a", "thumb-b", "thumb-c"]);
    expect(thumbs.map((thumb) => thumb.dataset.index)).toEqual(["0", "1", "2"]);
    expect(thumbs[0]!.hasAttribute("data-current")).toBe(true);

    await userEvent.click(thumbs[2]!);
    await frames();

    expect(root(host).api!.page).toBe(2);
    expect(dots(host)[2]!.hasAttribute("data-current")).toBe(true);
  });

  it("skips a hidden indicator when numbering", async () => {
    const host = await mount(
      basic(
        "",
        2,
        `
        <ui-carousel-indicator-group>
          <ui-carousel-indicator delegate hidden><button id="gone">x</button></ui-carousel-indicator>
          <ui-carousel-indicator delegate><button id="first">a</button></ui-carousel-indicator>
          <ui-carousel-indicator delegate><button id="second">b</button></ui-carousel-indicator>
        </ui-carousel-indicator-group>
      `,
      ),
    );

    expect(host.querySelector<HTMLElement>("#gone")!.dataset.index).toBeUndefined();
    expect(host.querySelector<HTMLElement>("#first")!.dataset.index).toBe("0");
    expect(host.querySelector<HTMLElement>("#second")!.dataset.index).toBe("1");
  });
});

describe("what the root adds", () => {
  it("reports the autoplay state on the root and the trigger", async () => {
    const host = await mount(
      basic(
        "autoplay autoplay-delay='60000'",
        3,
        `<ui-carousel-autoplay-trigger delegate><button>Play</button></ui-carousel-autoplay-trigger>`,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>("ui-carousel-autoplay-trigger > button")!;

    expect(root(host).dataset.autoplayState).toBe("playing");
    expect(trigger.hasAttribute("data-pressed")).toBe(true);
    expect(trigger.getAttribute("aria-label")).toBe("Stop slide rotation");

    await userEvent.click(trigger);
    await frames();

    expect(root(host).dataset.autoplayState).toBe("paused");
    expect(trigger.hasAttribute("data-pressed")).toBe(false);
  });

  it("writes the progress text and keeps it current", async () => {
    const host = await mount(
      basic("", 3, `<ui-carousel-progress-text delegate><span>server text</span></ui-carousel-progress-text>`),
    );
    const text = host.querySelector<HTMLElement>("ui-carousel-progress-text > span")!;

    expect(text.textContent).toBe("1 / 3");

    await userEvent.click(next(host));
    await frames();

    expect(text.textContent).toBe("2 / 3");
  });
});

describe("translations", () => {
  it("fills the placeholders, one based", async () => {
    const host = await mount(
      basic(
        `translations-item="Photo {index} of {count}" translations-indicator="Photo {index}" translations-progress-text="{page} of {totalPages}" translations-next-trigger="Later" translations-prev-trigger="Earlier"`,
        3,
        `${DOTS}<ui-carousel-progress-text></ui-carousel-progress-text>`,
      ),
    );

    expect(slides(host)[1]!.getAttribute("aria-label")).toBe("Photo 2 of 3");
    expect(dots(host)[1]!.getAttribute("aria-label")).toBe("Photo 2");
    expect(host.querySelector("ui-carousel-progress-text")!.textContent).toBe("1 of 3");
    expect(next(host).getAttribute("aria-label")).toBe("Later");
    expect(prev(host).getAttribute("aria-label")).toBe("Earlier");
  });
});

describe("naming the parts", () => {
  it("keeps every authored id", async () => {
    const host = await mount(`
      <ui-carousel id="mine">
        <ui-carousel-item-group id="mine-group">
          ${item("a", 'id="mine-0"')}${item("b", 'id="mine-1"')}
        </ui-carousel-item-group>
        <ui-carousel-prev-trigger delegate><button id="mine-prev">Prev</button></ui-carousel-prev-trigger>
        <ui-carousel-next-trigger delegate><button id="mine-next">Next</button></ui-carousel-next-trigger>
        <ui-carousel-indicator-group id="mine-dots">
          <template><ui-carousel-indicator delegate><button class="dot"></button></ui-carousel-indicator></template>
        </ui-carousel-indicator-group>
      </ui-carousel>
    `);

    expect(root(host).id).toBe("mine");
    expect(host.querySelector("ui-carousel-item-group")!.id).toBe("mine-group");
    expect(slides(host).map((slide) => slide.id)).toEqual(["mine-0", "mine-1"]);
    expect(prev(host).id).toBe("mine-prev");
    expect(next(host).id).toBe("mine-next");
    expect(next(host).getAttribute("aria-controls")).toBe("mine-group");
    expect(host.querySelector("ui-carousel-indicator-group")!.id).toBe("mine-dots");
    expect(dots(host).map((dot) => dot.id)).toEqual(["mine-dots-0", "mine-dots-1"]);
  });

  it("gives two indicator groups on one carousel no shared id", async () => {
    const host = await mount(basic("", 2, `${DOTS}${DOTS.replace('id="dots"', 'id="more"')}`));
    const ids = dots(host).map((dot) => dot.id);

    expect(ids).toEqual(["dots-0", "dots-1", "more-0", "more-1"]);
    expect(new Set(ids).size).toBe(4);
  });
});

describe("direction", () => {
  it("passes dir to Zag", async () => {
    const host = await mount(`<div dir="rtl">${basic()}</div>`);

    expect(root(host).getAttribute("dir")).toBe("rtl");
    expect(host.querySelector("ui-carousel-item-group")!.getAttribute("dir")).toBe("rtl");
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

  it("reads the widest matching tier and follows the viewport", async () => {
    const viewport = fakeViewport(800);

    try {
      const host = await mount(basic('slides-per-page="1 640:2 1024:3" spacing="4px 1024:16px"', 6));
      const carousel = root(host);

      expect(carousel.style.getPropertyValue("--slides-per-page")).toBe("2");
      expect(carousel.style.getPropertyValue("--slide-spacing")).toBe("4px");
      expect(carousel.api!.pageSnapPoints).toHaveLength(3);

      viewport.resize(1100);
      await frames(6);

      expect(carousel.style.getPropertyValue("--slides-per-page")).toBe("3");
      expect(carousel.style.getPropertyValue("--slide-spacing")).toBe("16px");
      expect(carousel.api!.pageSnapPoints).toHaveLength(2);

      viewport.resize(320);
      await frames(6);

      expect(carousel.style.getPropertyValue("--slides-per-page")).toBe("1");
      expect(carousel.api!.pageSnapPoints).toHaveLength(6);

      host.remove();
      await Promise.resolve();

      expect(viewport.listeners()).toBe(0);
    } finally {
      viewport.restore();
    }
  });
});
