import { afterEach, describe, expect, it, vi } from "vitest";

import "../../ui.css";
import "./index";
import type { UITimer } from "./root";

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

function unit(type: string): string {
  return `
    <ui-timer-item type="${type}">
      <ui-timer-item-value></ui-timer-item-value>
      <ui-timer-item-label>${type}</ui-timer-item-label>
    </ui-timer-item>
  `;
}

function basic(attrs = 'countdown start-ms="3600000" auto-start', extra = ""): string {
  return `
    <ui-timer ${attrs}>
      <ui-timer-area>
        ${unit("days")}
        <ui-timer-separator>:</ui-timer-separator>
        ${unit("hours")}
        <ui-timer-separator>:</ui-timer-separator>
        ${unit("minutes")}
        <ui-timer-separator>:</ui-timer-separator>
        ${unit("seconds")}
      </ui-timer-area>
      <ui-timer-control>
        <ui-timer-action-trigger action="start" delegate><button>Start</button></ui-timer-action-trigger>
        <ui-timer-action-trigger action="pause" delegate><button>Pause</button></ui-timer-action-trigger>
        <ui-timer-action-trigger action="resume" delegate><button>Resume</button></ui-timer-action-trigger>
        <ui-timer-action-trigger action="reset" delegate><button>Reset</button></ui-timer-action-trigger>
      </ui-timer-control>
      ${extra}
    </ui-timer>
  `;
}

const root = (host: ParentNode) => host.querySelector<UITimer>("ui-timer")!;
const area = (host: ParentNode) => host.querySelector<HTMLElement>("ui-timer-area")!;
const item = (host: ParentNode, type: string) => host.querySelector<HTMLElement>(`ui-timer-item[type="${type}"]`)!;
const value = (host: ParentNode, type: string) =>
  host.querySelector<HTMLElement>(`ui-timer-item[type="${type}"] ui-timer-item-value`)!;
const trigger = (host: ParentNode, action: string) =>
  host.querySelector<HTMLButtonElement>(`ui-timer-action-trigger[action="${action}"] button`)!;

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-timer:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("timer anatomy", () => {
  it("renders Zag's parts and ARIA", async () => {
    const host = await mount(basic());

    expect(root(host).getAttribute("data-scope")).toBe("timer");
    expect(root(host).getAttribute("data-part")).toBe("root");
    expect(root(host).id).toMatch(/^timer:/);

    expect(area(host).getAttribute("data-part")).toBe("area");
    expect(area(host).getAttribute("role")).toBe("timer");
    expect(area(host).getAttribute("aria-atomic")).toBe("true");
    expect(area(host).id).toMatch(/^timer:.*:area$/);

    expect(host.querySelector("ui-timer-control")!.getAttribute("data-part")).toBe("control");
    expect(host.querySelector("ui-timer-separator")!.getAttribute("data-part")).toBe("separator");
    expect(host.querySelector("ui-timer-separator")!.getAttribute("aria-hidden")).toBe("true");

    expect(item(host, "hours").getAttribute("data-part")).toBe("item");
    expect(item(host, "hours").getAttribute("data-type")).toBe("hours");
    expect(item(host, "hours").style.getPropertyValue("--value")).toBe("1");
    expect(value(host, "hours").getAttribute("data-part")).toBe("item-value");
    expect(value(host, "hours").getAttribute("data-type")).toBe("hours");
    expect(host.querySelector('ui-timer-item[type="hours"] ui-timer-item-label')!.getAttribute("data-part")).toBe(
      "item-label",
    );

    expect(trigger(host, "start").getAttribute("data-part")).toBe("action-trigger");
    expect(trigger(host, "start").type).toBe("button");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(`
      <ui-timer id="sale" countdown start-ms="1000">
        <ui-timer-area id="sale-area"></ui-timer-area>
      </ui-timer>
    `);

    expect(root(host).id).toBe("sale");
    expect(area(host).id).toBe("sale-area");
  });

  it("renders nothing for an unknown type or action", async () => {
    const host = await mount(
      basic(
        'countdown start-ms="3600000"',
        `
          ${unit("weeks")}
          <ui-timer-action-trigger action="explode" delegate><button>Boom</button></ui-timer-action-trigger>
        `,
      ),
    );

    expect(item(host, "weeks").hasAttribute("data-part")).toBe(false);
    expect(value(host, "weeks").textContent).toBe("");
    expect(trigger(host, "explode").hasAttribute("data-part")).toBe(false);
  });

  it("warns once for an action trigger without delegate", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const host = await mount(
        basic('countdown start-ms="3600000"', '<ui-timer-action-trigger action="start">Start</ui-timer-action-trigger>'),
      );

      root(host).flush();

      const warnings = warn.mock.calls.filter(([message]) => String(message).includes("<ui-timer-action-trigger>"));

      expect(warnings).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });
});

describe("timer values", () => {
  it("counts down from start-ms and writes each value", async () => {
    const host = await mount(basic());

    expect(value(host, "days").textContent).toBe("00");
    expect(value(host, "hours").textContent).toBe("01");
    expect(value(host, "minutes").textContent).toBe("00");
    expect(value(host, "seconds").textContent).toBe("00");
    expect(area(host).getAttribute("aria-label")).toBe("0 days 01:00:00");
    expect(root(host).api!.running).toBe(true);
  });

  it("follows the ticks", async () => {
    const host = await mount(basic('countdown start-ms="2000" auto-start interval="50"'));

    expect(value(host, "seconds").textContent).toBe("02");

    await waitFor(() => value(host, "seconds").textContent === "01");

    expect(item(host, "seconds").style.getPropertyValue("--value")).toBe("1");
  });

  it("emits tick and complete", async () => {
    const host = await mount(basic('countdown start-ms="150" interval="50"'));
    const ticks = listen(host, "tick");
    const completes = listen(host, "complete");

    root(host).api!.start();

    await waitFor(() => completes.length > 0);
    await frames(6);

    expect(completes).toEqual([{}]);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toMatchObject({
      value: expect.any(Number),
      time: expect.objectContaining({ seconds: expect.any(Number) }),
      formattedTime: expect.objectContaining({ seconds: expect.any(String) }),
    });
    expect(root(host).api!.running).toBe(false);
    expect(value(host, "seconds").textContent).toBe("00");
  });

  it("counts up to target-ms as a stopwatch", async () => {
    const host = await mount(basic('target-ms="150" auto-start interval="50"'));
    const completes = listen(host, "complete");

    await waitFor(() => completes.length > 0);

    expect(root(host).api!.running).toBe(false);
    expect(root(host).api!.time.milliseconds).toBe(150);
  });

  it("restarts when start-ms changes", async () => {
    const host = await mount(basic());

    root(host).setAttribute("start-ms", "7200000");
    await frames(2);

    expect(value(host, "hours").textContent).toBe("02");
    expect(area(host).getAttribute("aria-label")).toBe("0 days 02:00:00");
    expect(root(host).api!.running).toBe(true);
  });

  it("fills the area label from the raw numbers", async () => {
    const host = await mount(
      basic(
        'countdown start-ms="3600000" auto-start translations-area-label="{days}d {hours}h {minutes}m {seconds}s {other}"',
      ),
    );

    expect(area(host).getAttribute("aria-label")).toBe("0d 1h 0m 0s {other}");
  });
});

describe("timer control", () => {
  it("starts idle without auto-start and runs from the api", async () => {
    const host = await mount(basic('countdown start-ms="3600000"'));
    const api = () => root(host).api!;

    expect(api().running).toBe(false);
    expect(api().paused).toBe(false);

    api().start();
    await frames(1);
    expect(api().running).toBe(true);

    api().pause();
    await frames(1);
    expect(api().paused).toBe(true);
    expect(api().running).toBe(false);

    api().resume();
    await frames(1);
    expect(api().running).toBe(true);
  });

  it("hides each action trigger by state and sends its action", async () => {
    const host = await mount(basic('countdown start-ms="3600000"'));

    expect(trigger(host, "start").hidden).toBe(false);
    expect(trigger(host, "pause").hidden).toBe(true);
    expect(trigger(host, "resume").hidden).toBe(true);
    expect(trigger(host, "reset").hidden).toBe(true);

    trigger(host, "start").click();
    await frames(1);

    expect(root(host).api!.running).toBe(true);
    expect(trigger(host, "start").hidden).toBe(true);
    expect(trigger(host, "pause").hidden).toBe(false);
    expect(trigger(host, "reset").hidden).toBe(false);

    trigger(host, "pause").click();
    await frames(1);

    expect(root(host).api!.paused).toBe(true);
    expect(trigger(host, "pause").hidden).toBe(true);
    expect(trigger(host, "resume").hidden).toBe(false);

    trigger(host, "resume").click();
    await frames(1);

    expect(root(host).api!.running).toBe(true);
  });
});
