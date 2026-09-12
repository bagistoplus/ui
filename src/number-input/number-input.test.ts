import { userEvent } from "vitest/browser";
import { afterEach, describe, expect, it } from "vitest";

import "../../ui.css";
import "./index";
import type { UINumberInput } from "./root";

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

function basic(attrs = 'default-value="2" min="1" max="5"', inner = ""): string {
  return `
    <ui-number-input ${attrs}>
      <ui-number-input-label delegate><label>Quantity</label></ui-number-input-label>
      <ui-number-input-control>
        <ui-number-input-decrement-trigger delegate><button>-</button></ui-number-input-decrement-trigger>
        <ui-number-input-input delegate><input ${inner}></ui-number-input-input>
        <ui-number-input-increment-trigger delegate><button>+</button></ui-number-input-increment-trigger>
      </ui-number-input-control>
      <ui-number-input-value-text></ui-number-input-value-text>
    </ui-number-input>
  `;
}

const root = (host: ParentNode) => host.querySelector<UINumberInput>("ui-number-input")!;
const input = (host: ParentNode) => host.querySelector<HTMLInputElement>("input")!;
const label = (host: ParentNode) => host.querySelector<HTMLLabelElement>("label")!;
const decrement = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-number-input-decrement-trigger button")!;
const increment = (host: ParentNode) => host.querySelector<HTMLButtonElement>("ui-number-input-increment-trigger button")!;

function listen(host: ParentNode, name: string): unknown[] {
  const details: unknown[] = [];
  root(host).addEventListener(`ui-number-input:${name}`, (event) => details.push((event as CustomEvent).detail));

  return details;
}

async function type(host: ParentNode, text: string): Promise<void> {
  const el = input(host);
  el.focus();
  await frames(1);
  await userEvent.clear(el);
  await userEvent.type(el, text);
  await frames();
}

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host.remove();
  }
});

describe("anatomy", () => {
  it("puts each part's props on the right element", async () => {
    const host = await mount(basic());
    const control = host.querySelector<HTMLElement>("ui-number-input-control")!;
    const valueText = host.querySelector<HTMLElement>("ui-number-input-value-text")!;

    expect(root(host).dataset.scope).toBe("number-input");
    expect(root(host).dataset.part).toBe("root");
    expect(control.dataset.part).toBe("control");
    expect(control.getAttribute("role")).toBe("group");
    expect(valueText.dataset.part).toBe("value-text");
    expect(label(host).dataset.part).toBe("label");
    expect(input(host).dataset.part).toBe("input");
    expect(decrement(host).dataset.part).toBe("decrement-trigger");
    expect(increment(host).dataset.part).toBe("increment-trigger");

    expect(host.querySelector("ui-number-input-input")!.hasAttribute("data-part")).toBe(false);
    expect(host.querySelector("ui-number-input-label")!.hasAttribute("data-part")).toBe(false);
  });

  it("makes the input a spinbutton with its bounds and labels it", async () => {
    const host = await mount(basic());

    expect(input(host).getAttribute("role")).toBe("spinbutton");
    expect(input(host).getAttribute("aria-valuemin")).toBe("1");
    expect(input(host).getAttribute("aria-valuemax")).toBe("5");
    expect(input(host).getAttribute("aria-valuenow")).toBe("2");
    expect(input(host).value).toBe("2");
    expect(label(host).htmlFor).toBe(input(host).id);
    expect(increment(host).getAttribute("type")).toBe("button");
    expect(decrement(host).getAttribute("type")).toBe("button");
  });

  it("names the inner input for its form", async () => {
    const host = await mount(basic('default-value="2" name="quantity" form="order" required readonly input-mode="numeric"'));
    const el = input(host);

    expect(el.getAttribute("name")).toBe("quantity");
    expect(el.getAttribute("form")).toBe("order");
    expect(el.getAttribute("type")).toBe("text");
    expect(el.getAttribute("inputmode")).toBe("numeric");
    expect(el.getAttribute("autocomplete")).toBe("off");
    expect(el.required).toBe(true);
    expect(el.readOnly).toBe(true);
  });

  it("submits the value with a form", async () => {
    const host = await mount(`<form>${basic('default-value="3" name="quantity"')}</form>`);
    const data = new FormData(host.querySelector("form")!);

    expect(data.get("quantity")).toBe("3");
  });
});

describe("stepping", () => {
  it("steps through the triggers and disables one at its bound", async () => {
    const host = await mount(basic('default-value="4" min="1" max="5"'));

    await userEvent.click(increment(host));
    await frames();

    expect(input(host).value).toBe("5");
    expect(root(host).api?.valueAsNumber).toBe(5);
    expect(increment(host).disabled).toBe(true);
    expect(decrement(host).disabled).toBe(false);

    await userEvent.click(decrement(host));
    await frames();

    expect(input(host).value).toBe("4");
    expect(increment(host).disabled).toBe(false);
  });

  it("steps by the step through the api", async () => {
    const host = await mount(basic('default-value="2" step="2"'));

    root(host).api?.increment();
    await frames();
    expect(input(host).value).toBe("4");

    root(host).api?.decrement();
    root(host).api?.decrement();
    await frames();
    expect(input(host).value).toBe("0");

    root(host).api?.setValue(7);
    await frames();
    expect(input(host).value).toBe("7");
  });

  it("clamps a typed value on blur", async () => {
    const host = await mount(basic('default-value="2" min="1" max="5"'));

    await type(host, "9");
    await userEvent.keyboard("{Enter}");
    await frames();

    expect(input(host).value).toBe("9");

    input(host).blur();
    await frames();

    expect(input(host).value).toBe("5");
  });
});

describe("events", () => {
  it("emits a change for every keystroke and a commit on Enter", async () => {
    const host = await mount(basic('default-value="2"'));
    const changes = listen(host, "value-change");
    const commits = listen(host, "value-commit");

    await type(host, "34");

    expect(changes.map((detail) => (detail as { value: string }).value)).toEqual(["", "3", "34"]);
    expect(commits).toEqual([]);

    await userEvent.keyboard("{Enter}");
    await frames();

    expect(commits).toEqual([{ value: "34", valueAsNumber: 34 }]);
  });

  it("keeps a separator while it is being typed", async () => {
    const host = await mount(basic('default-value="2"'));

    await type(host, "1.5");

    expect(input(host).value).toBe("1.5");
    expect(root(host).api?.valueAsNumber).toBe(1.5);
  });

  it("commits on blur", async () => {
    const host = await mount(basic('default-value="2"'));
    const commits = listen(host, "value-commit");

    await type(host, "8");
    input(host).blur();
    await frames();

    expect(commits).toEqual([{ value: "8", valueAsNumber: 8 }]);
  });

  it("reports an out-of-range value when overflow is allowed", async () => {
    const host = await mount(basic('default-value="2" min="1" max="5" allow-overflow'));
    const invalid = listen(host, "value-invalid");

    await type(host, "9");
    input(host).blur();
    await frames();

    expect(invalid).toEqual([{ value: "9", valueAsNumber: 9, reason: "rangeOverflow" }]);
    expect(input(host).value).toBe("9");
    expect(input(host).getAttribute("aria-invalid")).toBe("true");
    expect(root(host).dataset.invalid).toBe("");
  });

  it("reports focus and blur", async () => {
    const host = await mount(basic());
    const focus = listen(host, "focus-change");

    input(host).focus();
    await frames();
    input(host).blur();
    await frames();

    expect(focus.map((detail) => (detail as { focused: boolean }).focused)).toEqual([true, false]);
    expect(root(host).hasAttribute("data-focus")).toBe(false);
  });
});

describe("control", () => {
  it("holds the value the consumer writes", async () => {
    const host = await mount(basic('value="2" min="1" max="5"'));
    const changes = listen(host, "value-change");

    await userEvent.click(increment(host));
    await frames();

    expect(changes).toEqual([{ value: "3", valueAsNumber: 3 }]);
    expect(input(host).value).toBe("2");

    root(host).setAttribute("value", "4");
    await frames();

    expect(input(host).value).toBe("4");
    expect(root(host).api?.valueAsNumber).toBe(4);
  });

  it("disables everything with the root, or with a fieldset around it", async () => {
    const host = await mount(basic('default-value="2" disabled'));

    expect(input(host).disabled).toBe(true);
    expect(increment(host).disabled).toBe(true);
    expect(decrement(host).disabled).toBe(true);
    expect(root(host).dataset.disabled).toBe("");
    expect(label(host).dataset.disabled).toBe("");

    root(host).removeAttribute("disabled");
    await frames();
    expect(input(host).disabled).toBe(false);

    const fenced = await mount(`<fieldset disabled>${basic()}</fieldset>`);

    expect(input(fenced).disabled).toBe(true);
    expect(increment(fenced).disabled).toBe(true);
  });

  it("locks the triggers while read-only", async () => {
    const host = await mount(basic('default-value="2" readonly'));

    expect(increment(host).disabled).toBe(true);
    expect(decrement(host).disabled).toBe(true);
    expect(input(host).disabled).toBe(false);
  });
});

describe("formatting", () => {
  it("rounds to the fraction digits", async () => {
    const host = await mount(basic('default-value="2" maximum-fraction-digits="0"'));

    root(host).api?.setValue(2.7);
    await frames();

    expect(input(host).value).toBe("3");
    expect(input(host).hasAttribute("pattern")).toBe(false);

    // The parser refuses the separator, so a typed fraction never lands.
    await type(host, "2.7");

    expect(input(host).value).toBe("27");
  });

  it("groups only once a format attribute says so", async () => {
    const raw = await mount(basic('default-value="1000"'));
    const grouped = await mount(basic('default-value="1000" use-grouping'));
    const plain = await mount(basic('default-value="1000" use-grouping="false" maximum-fraction-digits="0"'));

    expect(input(raw).value).toBe("1000");
    expect(input(grouped).value).toBe("1,000");
    expect(input(plain).value).toBe("1000");
  });

  it("pads to the minimum fraction digits", async () => {
    const host = await mount(basic('default-value="2" minimum-fraction-digits="2"'));

    expect(input(host).value).toBe("2.00");
  });

  it("keeps Zag's pattern on an unformatted input", async () => {
    const host = await mount(basic('default-value="2"'));

    expect(input(host).getAttribute("pattern")).toBe("-?[0-9]*(.[0-9]+)?");
  });
});

describe("locale", () => {
  it("parses and formats in the language of the page", async () => {
    const host = await mount(`<div lang="de">${basic('default-value="1000" maximum-fraction-digits="2"')}</div>`);

    expect(input(host).value).toBe("1.000");

    await type(host, "1,5");
    await userEvent.keyboard("{Enter}");
    await frames();

    expect(root(host).api?.valueAsNumber).toBe(1.5);
    expect(input(host).value).toBe("1,5");
  });

  it("lets the locale attribute win over the page", async () => {
    const host = await mount(
      `<div lang="de">${basic('default-value="1000" locale="en-US" maximum-fraction-digits="2"')}</div>`,
    );

    expect(input(host).value).toBe("1,000");
  });

  it("flips with the nearest dir", async () => {
    const host = await mount(`<div dir="rtl">${basic()}</div>`);

    expect(root(host).getAttribute("dir")).toBe("rtl");
    expect(input(host).getAttribute("dir")).toBe("rtl");
  });
});

describe("naming", () => {
  it("labels the triggers from the translations", async () => {
    const host = await mount(
      basic('default-value="2" translations-increment-label="Add one" translations-decrement-label="Remove one"'),
    );

    expect(increment(host).getAttribute("aria-label")).toBe("Add one");
    expect(decrement(host).getAttribute("aria-label")).toBe("Remove one");
  });

  it("keeps the ids the consumer wrote", async () => {
    const host = await mount(`
      <ui-number-input id="qty" default-value="1">
        <ui-number-input-label delegate><label id="qty-label">Quantity</label></ui-number-input-label>
        <ui-number-input-control>
          <ui-number-input-decrement-trigger delegate><button id="qty-down">-</button></ui-number-input-decrement-trigger>
          <ui-number-input-input delegate><input id="qty-field"></ui-number-input-input>
          <ui-number-input-increment-trigger delegate><button id="qty-up">+</button></ui-number-input-increment-trigger>
        </ui-number-input-control>
      </ui-number-input>
    `);

    expect(root(host).id).toBe("qty");
    expect(label(host).id).toBe("qty-label");
    expect(input(host).id).toBe("qty-field");
    expect(decrement(host).id).toBe("qty-down");
    expect(increment(host).id).toBe("qty-up");
    expect(label(host).htmlFor).toBe("qty-field");
  });

  it("leaves an aria-label written on the input alone", async () => {
    const host = await mount(basic('default-value="2"', 'aria-label="Guests"'));

    expect(input(host).getAttribute("aria-label")).toBe("Guests");
  });
});
