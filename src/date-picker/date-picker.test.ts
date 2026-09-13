import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UIDatePicker } from "./root";

const hosts: HTMLElement[] = [];

function frames(count = 3): Promise<void> {
  return new Promise((resolve) => {
    let left = count;
    const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  });
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

async function mount(html: string): Promise<HTMLElement> {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  hosts.push(host);

  await frames();

  return host;
}

const TEMPLATES = `
  <template data-slot="table"><table class="grid"></table></template>
  <template data-slot="row"><tr class="row"></tr></template>
  <template data-slot="header"><th class="head"></th></template>
  <template data-slot="cell"><td class="cell"><div class="day"><span class="badge">*</span></div></td></template>
`;

function view(name: string, templates = false): string {
  return `
    <ui-date-picker-view view="${name}">
      <ui-date-picker-view-control>
        <ui-date-picker-prev-trigger delegate><button>Prev</button></ui-date-picker-prev-trigger>
        <ui-date-picker-view-trigger delegate>
          <button><ui-date-picker-range-text></ui-date-picker-range-text></button>
        </ui-date-picker-view-trigger>
        <ui-date-picker-next-trigger delegate><button>Next</button></ui-date-picker-next-trigger>
      </ui-date-picker-view-control>
      <ui-date-picker-table ${name === "day" ? "" : 'columns="4" format="short"'}>
        ${templates ? TEMPLATES : ""}
      </ui-date-picker-table>
    </ui-date-picker-view>
  `;
}

interface Options {
  range?: boolean;
  views?: boolean;
  templates?: boolean;
  extra?: string;
}

function picker(attrs = "", options: Options = {}): string {
  const locale = attrs.includes("locale=") ? "" : 'locale="en-US"';

  return `
    <ui-date-picker default-focused-value="2026-03-01" ${locale} ${attrs}>
      <ui-date-picker-label delegate><label>Date</label></ui-date-picker-label>
      <ui-date-picker-control>
        <ui-date-picker-input delegate><input /></ui-date-picker-input>
        ${options.range ? '<ui-date-picker-input index="1" delegate><input /></ui-date-picker-input>' : ""}
        <ui-date-picker-trigger delegate><button>Open</button></ui-date-picker-trigger>
        <ui-date-picker-clear-trigger delegate><button>Clear</button></ui-date-picker-clear-trigger>
      </ui-date-picker-control>
      <ui-date-picker-positioner>
        <ui-date-picker-content>
          ${view("day", options.templates)}
          ${options.views ? view("month") + view("year") : ""}
          ${options.extra ?? ""}
        </ui-date-picker-content>
      </ui-date-picker-positioner>
    </ui-date-picker>
  `;
}

const root = (host: ParentNode) => host.querySelector<UIDatePicker>("ui-date-picker")!;
const api = (host: ParentNode) => root(host).api!;
const content = (host: ParentNode) => host.querySelector<HTMLElement>("ui-date-picker-content")!;
const inputs = (host: ParentNode) => Array.from(host.querySelectorAll<HTMLInputElement>("ui-date-picker-input input"));
const input = (host: ParentNode, index = 0) => inputs(host)[index]!;
const button = (host: ParentNode, part: string) => host.querySelector<HTMLButtonElement>(`ui-date-picker-${part} button`)!;
const table = (host: ParentNode, name = "day") =>
  host.querySelector<HTMLTableElement>(`ui-date-picker-view[view="${name}"] table`)!;
const rangeText = (host: ParentNode, name = "day") =>
  host.querySelector<HTMLElement>(`ui-date-picker-view[view="${name}"] ui-date-picker-range-text`)!;
const triggers = (host: ParentNode, name = "day") =>
  Array.from(host.querySelectorAll<HTMLElement>(`[data-part="table-cell-trigger"][data-view="${name}"]`));

function dayCell(host: ParentNode, day: number): HTMLElement {
  return triggers(host).find(
    (cell) => cell.textContent?.replace("*", "").trim() === String(day) && !cell.hasAttribute("data-outside-range"),
  )!;
}

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-date-picker:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

function escape(host: ParentNode): void {
  content(host).dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("date picker anatomy", () => {
  it("renders Zag's parts on the authored elements", async () => {
    const host = await mount(picker());

    expect(root(host).getAttribute("data-scope")).toBe("date-picker");
    expect(root(host).getAttribute("data-part")).toBe("root");
    expect(host.querySelector("ui-date-picker-label label")!.getAttribute("data-part")).toBe("label");
    expect(host.querySelector("ui-date-picker-label label")!.getAttribute("for")).toBe(input(host).id);
    expect(host.querySelector("ui-date-picker-control")!.getAttribute("data-part")).toBe("control");
    expect(input(host).getAttribute("data-part")).toBe("input");
    expect(button(host, "trigger").getAttribute("data-part")).toBe("trigger");
    expect(button(host, "trigger").getAttribute("aria-haspopup")).toBe("grid");
    expect(button(host, "clear-trigger").getAttribute("data-part")).toBe("clear-trigger");
    expect(host.querySelector("ui-date-picker-positioner")!.getAttribute("data-part")).toBe("positioner");
    expect(content(host).getAttribute("data-part")).toBe("content");
    expect(content(host).getAttribute("role")).toBe("application");
    expect(host.querySelector("ui-date-picker-view")!.getAttribute("data-part")).toBe("view");
    expect(host.querySelector("ui-date-picker-view-control")!.getAttribute("data-part")).toBe("view-control");
    expect(button(host, "view-trigger").getAttribute("data-part")).toBe("view-trigger");
    expect(button(host, "prev-trigger").getAttribute("data-part")).toBe("prev-trigger");
    expect(button(host, "next-trigger").getAttribute("data-part")).toBe("next-trigger");
    expect(rangeText(host).getAttribute("data-part")).toBe("range-text");
    expect(rangeText(host).textContent).toBe("March 2026");
  });

  it("writes the grid parts the consumer cannot", async () => {
    const host = await mount(picker());
    const grid = table(host);

    expect(grid.getAttribute("data-part")).toBe("table");
    expect(grid.getAttribute("role")).toBe("grid");
    expect(grid.getAttribute("data-view")).toBe("day");

    const head = grid.querySelector("ui-date-picker-table-head[delegate] > thead")!;
    const body = grid.querySelector("ui-date-picker-table-body[delegate] > tbody")!;

    expect(head.getAttribute("data-part")).toBe("table-head");
    expect(body.getAttribute("data-part")).toBe("table-body");
    expect(head.querySelectorAll("ui-date-picker-table-row[delegate] > tr[data-part='table-row']")).toHaveLength(1);
    expect(head.querySelectorAll("ui-date-picker-table-header[delegate] > th[data-part='table-header']")).toHaveLength(7);
    expect(body.querySelectorAll("ui-date-picker-table-row[delegate] > tr[data-part='table-row']")).toHaveLength(5);
    expect(body.querySelectorAll("ui-date-picker-table-cell[delegate] > td[data-part='table-cell']")).toHaveLength(35);

    const cell = dayCell(host, 17);

    expect(cell.getAttribute("data-part")).toBe("table-cell-trigger");
    expect(cell.getAttribute("role")).toBe("button");
    expect(cell.getAttribute("data-value")).toBe("2026-03-17");
    expect(cell.parentElement!.localName).toBe("ui-date-picker-table-cell-trigger");
    expect(cell.closest("td")!.getAttribute("role")).toBe("gridcell");
    expect(cell.closest("td")!.getAttribute("data-value")).toBe("2026-03-17");
    expect(cell.closest("ui-date-picker-table-cell")!.getAttribute("value")).toBe("2026-03-17");
    expect(head.querySelector("th")!.getAttribute("aria-label")).toBe("Sunday");
    expect(head.querySelector("th")!.textContent).toBe("S");
  });

  it("stamps the grid from the templates", async () => {
    const host = await mount(picker("", { templates: true }));
    const grid = table(host);

    expect(grid.className).toBe("grid");
    expect(grid.querySelector("tr")!.className).toBe("row");
    expect(grid.querySelector("th")!.className).toBe("head");
    expect(grid.querySelector("td")!.className).toBe("cell");
    expect(dayCell(host, 17).className).toBe("day");
    expect(dayCell(host, 17).querySelector(".badge")!.textContent).toBe("*");
    expect(dayCell(host, 17).textContent).toBe("*17");
    expect(host.querySelectorAll("ui-date-picker-table template")).toHaveLength(4);
  });

  it("reads a template a framework built through createElement", async () => {
    const host = await mount(picker());
    const table = host.querySelector<HTMLElement>("ui-date-picker-table")!;
    const template = document.createElement("template");
    const td = document.createElement("td");

    // Vue's client render puts a template's children in the element itself,
    // not in its content fragment.
    template.dataset.slot = "cell";
    td.className = "framework-cell";
    td.append(document.createElement("span"));
    template.append(td);
    table.prepend(template);
    table.querySelector("table")!.remove();
    await frames();

    expect(template.content.childElementCount).toBe(0);
    expect(dayCell(host, 17).closest("td")!.className).toBe("framework-cell");
    expect(dayCell(host, 17).localName).toBe("span");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(`
      <ui-date-picker id="when" default-focused-value="2026-03-01">
        <ui-date-picker-control>
          <ui-date-picker-input delegate><input id="when-input" /></ui-date-picker-input>
        </ui-date-picker-control>
        <ui-date-picker-positioner>
          <ui-date-picker-content id="when-content">
            <ui-date-picker-view view="day">
              <ui-date-picker-prev-trigger delegate><button id="when-prev">Prev</button></ui-date-picker-prev-trigger>
              <ui-date-picker-table></ui-date-picker-table>
            </ui-date-picker-view>
          </ui-date-picker-content>
        </ui-date-picker-positioner>
      </ui-date-picker>
    `);

    expect(root(host).id).toBe("when");
    expect(input(host).id).toBe("when-input");
    expect(content(host).id).toBe("when-content");
    expect(button(host, "prev-trigger").id).toBe("when-prev");
    expect(button(host, "prev-trigger").getAttribute("data-part")).toBe("prev-trigger");
  });

  it("warns once for a trigger without delegate", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const host = await mount(
        picker("", { extra: "<ui-date-picker-preset-trigger value='thisMonth'>Month</ui-date-picker-preset-trigger>" }),
      );

      root(host).flush();

      const warnings = warn.mock.calls.filter(([message]) => String(message).includes("<ui-date-picker-preset-trigger>"));

      expect(warnings).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });

  it("drops a date it cannot parse, with one warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const host = await mount(picker('min="tomorrow"'));

      root(host).flush();
      root(host).flush();

      expect(dayCell(host, 2).hasAttribute("data-disabled")).toBe(false);
      expect(warn.mock.calls.filter(([message]) => String(message).includes("tomorrow"))).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });
});

describe("date picker calendar", () => {
  it("renders a month in the locale's own weekday order", async () => {
    const american = await mount(picker());
    const british = await mount(picker('locale="en-GB"'));

    expect(Array.from(table(american).querySelectorAll("th")).map((th) => th.textContent)).toEqual([
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
    ]);
    expect(table(british).querySelector("th")!.getAttribute("aria-label")).toBe("Monday");
  });

  it("marks closed weekdays and closed days unavailable", async () => {
    const host = await mount(picker('unavailable-weekdays="0" unavailable-dates="2026-03-12"'));

    expect(dayCell(host, 8).hasAttribute("data-unavailable")).toBe(true);
    expect(dayCell(host, 12).hasAttribute("data-unavailable")).toBe(true);
    expect(dayCell(host, 11).hasAttribute("data-unavailable")).toBe(false);

    button(host, "trigger").click();
    await frames();

    dayCell(host, 12).click();
    await frames();

    expect(api(host).value).toEqual([]);
    expect(api(host).open).toBe(true);
  });

  it("takes a rule of its own through the property", async () => {
    const host = await mount(picker('unavailable-weekdays="0"'));

    root(host).isDateUnavailable = (date) => date.day === 20;
    await frames();

    expect(dayCell(host, 20).hasAttribute("data-unavailable")).toBe(true);
    expect(dayCell(host, 8).hasAttribute("data-unavailable")).toBe(false);

    root(host).isDateUnavailable = null;
    await frames();

    expect(dayCell(host, 8).hasAttribute("data-unavailable")).toBe(true);
  });

  it("disables what falls outside min and max", async () => {
    const host = await mount(picker('min="2026-03-10" max="2026-03-20"'));

    expect(dayCell(host, 9).hasAttribute("data-disabled")).toBe(true);
    expect(dayCell(host, 21).hasAttribute("data-disabled")).toBe(true);
    expect(dayCell(host, 10).hasAttribute("data-disabled")).toBe(false);
  });

  it("emits the chosen day and closes", async () => {
    const host = await mount(picker());
    const changes = listen(host, "value-change") as Array<{ value: { toString(): string }[]; valueAsString: string[] }>;

    button(host, "trigger").click();
    await frames();

    expect(api(host).open).toBe(true);
    expect(content(host).hidden).toBe(false);

    dayCell(host, 17).click();
    await frames();

    expect(changes.map((change) => change.value[0]!.toString())).toEqual(["2026-03-17"]);
    expect(changes[0]!.valueAsString).toEqual(["03/17/2026"]);
    expect(input(host).value).toBe("03/17/2026");
    expect(api(host).open).toBe(false);
    expect(content(host).hidden).toBe(true);
    expect(dayCell(host, 17).hasAttribute("data-selected")).toBe(true);
  });

  it("shows the clear trigger once something is selected, and clears", async () => {
    const host = await mount(picker());

    expect(button(host, "clear-trigger").hidden).toBe(true);

    button(host, "trigger").click();
    await frames();

    dayCell(host, 17).click();
    await frames();

    expect(button(host, "clear-trigger").hidden).toBe(false);

    button(host, "clear-trigger").click();
    await frames();

    expect(api(host).value).toEqual([]);
    expect(input(host).value).toBe("");
  });

  it("fills both fields from a default range", async () => {
    const host = await mount(picker('selection-mode="range" default-value="2026-03-17,2026-03-20"', { range: true }));

    expect(inputs(host).map((field) => field.value)).toEqual(["03/17/2026", "03/20/2026"]);
    expect(dayCell(host, 18).hasAttribute("data-in-range")).toBe(true);
    expect(rangeText(host).textContent).toBe("March 2026");
  });

  it("takes a span across two fields on one calendar", async () => {
    const host = await mount(picker('selection-mode="range"', { range: true }));
    const changes = listen(host, "value-change") as Array<{ value: { toString(): string }[] }>;

    button(host, "trigger").click();
    await frames();

    dayCell(host, 17).click();
    await frames();

    expect(api(host).open).toBe(true);

    dayCell(host, 20).click();
    await frames();

    expect(changes.map((change) => change.value.map(String))).toEqual([["2026-03-17"], ["2026-03-17", "2026-03-20"]]);
    expect(api(host).open).toBe(false);
    expect(dayCell(host, 18).hasAttribute("data-in-range")).toBe(true);
    expect(dayCell(host, 22).hasAttribute("data-in-range")).toBe(false);
  });

  it("keeps the two ends in order whichever is clicked first", async () => {
    const host = await mount(picker('selection-mode="range"', { range: true }));

    button(host, "trigger").click();
    await frames();

    dayCell(host, 20).click();
    await frames();

    dayCell(host, 17).click();
    await frames();

    expect(api(host).value.map(String)).toEqual(["2026-03-17", "2026-03-20"]);
  });
});

describe("date picker opening", () => {
  it("opens from the trigger and closes on escape", async () => {
    const host = await mount(picker());
    const opens = listen(host, "open-change") as Array<{ open: boolean }>;

    expect(content(host).hidden).toBe(true);

    button(host, "trigger").click();
    await frames();

    expect(api(host).open).toBe(true);
    expect(content(host).hidden).toBe(false);

    escape(host);
    await frames();

    expect(api(host).open).toBe(false);
    expect(opens.map((detail) => detail.open)).toEqual([true, false]);
  });

  it("does not open on focus by default", async () => {
    const host = await mount(picker());

    input(host).focus();
    await frames();

    expect(api(host).open).toBe(false);
  });

  it("opens as soon as the field is reached under open-on-focus", async () => {
    const host = await mount(picker("open-on-focus open-on-click"));

    input(host).focus();
    await frames();

    expect(api(host).open).toBe(true);
  });

  it("stays closed once the shopper is done with it", async () => {
    const host = await mount(picker("open-on-focus open-on-click"));

    input(host).focus();
    await frames();

    dayCell(host, 17).click();
    await frames();

    // Closing returns focus to the field, which must not reopen what the
    // shopper just answered.
    expect(api(host).open).toBe(false);
    expect(document.activeElement).toBe(input(host));

    // A click reopens it, which is the only way back in once the field already
    // holds the focus.
    input(host).click();
    await frames();

    expect(api(host).open).toBe(true);
  });

  it("stays closed when escape gives the field its focus back", async () => {
    const host = await mount(picker("open-on-focus"));

    input(host).focus();
    await frames();

    escape(host);
    await frames();

    expect(api(host).open).toBe(false);
  });

  it("renders inline with the calendar always visible", async () => {
    const host = await mount(picker("inline"));

    expect(content(host).hidden).toBe(false);
    expect(content(host).hasAttribute("data-inline")).toBe(true);
    expect(api(host).open).toBe(true);
  });
});

describe("date picker navigation", () => {
  it("moves the cells to the next month in place", async () => {
    const host = await mount(picker());
    const before = Array.from(table(host).querySelectorAll("td"));
    const ranges = listen(host, "visible-range-change");

    button(host, "next-trigger").click();
    await frames();

    expect(rangeText(host).textContent).toBe("April 2026");
    expect(Array.from(table(host).querySelectorAll("td"))).toEqual(before);
    expect(dayCell(host, 1).getAttribute("data-value")).toBe("2026-04-01");
    expect(ranges.length).toBeGreaterThan(0);

    api(host).goToNext();
    await frames();

    expect(rangeText(host).textContent).toBe("May 2026");
    expect(table(host).querySelectorAll("tbody tr")).toHaveLength(6);
    expect(table(host).querySelectorAll("td")).toHaveLength(42);
  });

  it("switches through the three views", async () => {
    const host = await mount(picker("", { views: true }));
    const day = host.querySelector<HTMLElement>('ui-date-picker-view[view="day"]')!;
    const month = host.querySelector<HTMLElement>('ui-date-picker-view[view="month"]')!;
    const year = host.querySelector<HTMLElement>('ui-date-picker-view[view="year"]')!;
    const views = listen(host, "view-change") as Array<{ view: string }>;

    expect(day.hidden).toBe(false);
    expect(month.hidden).toBe(true);
    expect(year.hidden).toBe(true);

    button(host, "trigger").click();
    await frames();

    button(host, "view-trigger").click();
    await frames();

    expect(day.hidden).toBe(true);
    expect(month.hidden).toBe(false);
    expect(triggers(host, "month").map((cell) => cell.textContent)).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]);
    expect(table(host, "month").querySelectorAll("tr")).toHaveLength(3);
    expect(rangeText(host, "month").textContent).toBe("2026");

    host.querySelector<HTMLButtonElement>('ui-date-picker-view[view="month"] ui-date-picker-view-trigger button')!.click();
    await frames();

    expect(year.hidden).toBe(false);
    expect(triggers(host, "year").map((cell) => cell.textContent)).toContain("2026");
    expect(views.map((detail) => detail.view)).toEqual(["month", "year"]);

    triggers(host, "year").find((cell) => cell.textContent === "2027")!.click();
    await frames();

    expect(month.hidden).toBe(false);

    triggers(host, "month").find((cell) => cell.textContent === "Jun")!.click();
    await frames();

    expect(day.hidden).toBe(false);
    expect(rangeText(host).textContent).toBe("June 2027");
  });

  it("fills the month and year selects and follows a change", async () => {
    const host = await mount(
      picker("", {
        extra: `
          <ui-date-picker-month-select delegate><select></select></ui-date-picker-month-select>
          <ui-date-picker-year-select delegate><select></select></ui-date-picker-year-select>
        `,
      }),
    );
    const month = host.querySelector<HTMLSelectElement>("ui-date-picker-month-select select")!;
    const year = host.querySelector<HTMLSelectElement>("ui-date-picker-year-select select")!;

    expect(month.getAttribute("data-part")).toBe("month-select");
    expect(month.options).toHaveLength(12);
    expect(month.options[0]!.textContent).toBe("January");
    expect(month.value).toBe("3");
    expect(year.value).toBe("2026");

    month.value = "6";
    month.dispatchEvent(new Event("input", { bubbles: true }));
    await frames();

    expect(rangeText(host).textContent).toBe("June 2026");
    expect(month.value).toBe("6");
  });

  it("selects a range from a preset trigger", async () => {
    const host = await mount(
      picker('selection-mode="range"', {
        range: true,
        extra: `
          <ui-date-picker-preset-trigger value="last7Days" delegate><button>Week</button></ui-date-picker-preset-trigger>
          <ui-date-picker-preset-trigger value="2026-03-10,2026-03-14" delegate><button>Fixed</button></ui-date-picker-preset-trigger>
        `,
      }),
    );
    const [week, fixed] = Array.from(host.querySelectorAll<HTMLButtonElement>("ui-date-picker-preset-trigger button"));

    expect(week!.getAttribute("data-part")).toBe("preset-trigger");

    fixed!.click();
    await frames();

    expect(api(host).value.map(String)).toEqual(["2026-03-10", "2026-03-14"]);

    week!.click();
    await frames();

    expect(api(host).value).toHaveLength(2);
    expect(api(host).value.map(String)).not.toEqual(["2026-03-10", "2026-03-14"]);
  });

  it("adds the week number column", async () => {
    const host = await mount(picker("show-week-numbers"));
    const grid = table(host);

    expect(grid.querySelectorAll("th")).toHaveLength(8);
    expect(grid.querySelector("th")!.getAttribute("data-type")).toBe("week-number");

    const first = grid.querySelector("tbody td")!;

    expect(first.getAttribute("data-type")).toBe("week-number");
    expect(first.getAttribute("role")).toBe("rowheader");
    expect(first.textContent).toMatch(/^\d+$/);
    expect(first.querySelector("ui-date-picker-table-cell-trigger")).toBeNull();
    expect(grid.querySelectorAll("tbody tr")[0]!.querySelectorAll("td")).toHaveLength(8);
  });

  it("stamps the grid again after the table is removed", async () => {
    const host = await mount(picker("", { templates: true }));
    const before = table(host);

    before.remove();
    await waitFor(() => table(host) !== null && table(host) !== before);
    await frames();

    expect(table(host).className).toBe("grid");
    expect(table(host).getAttribute("role")).toBe("grid");
    expect(table(host).querySelectorAll("td")).toHaveLength(35);
    expect(dayCell(host, 17).getAttribute("data-value")).toBe("2026-03-17");
    expect(host.querySelectorAll("ui-date-picker-table template")).toHaveLength(4);
  });
});
