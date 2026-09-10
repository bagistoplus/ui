import { afterEach, describe, expect, it } from "vitest";

import { applyProps, releaseProps } from "./props";

const scope = "test-scope";
const nodes: HTMLElement[] = [];

function mount(): HTMLElement {
  const el = document.createElement("div");

  document.body.append(el);
  nodes.push(el);

  return el;
}

afterEach(() => {
  for (const el of nodes.splice(0)) {
    releaseProps(el, scope);
    el.remove();
  }
});

describe("style props", () => {
  it("serializes an object, including custom properties", () => {
    const el = mount();

    applyProps(el, { style: { position: "absolute", "--left": "12px", transitionDuration: "150ms" } }, scope);

    expect(el.style.position).toBe("absolute");
    expect(el.style.getPropertyValue("--left")).toBe("12px");
    expect(el.style.transitionDuration).toBe("150ms");
  });

  it("does not stringify the object", () => {
    const el = mount();

    applyProps(el, { style: { position: "absolute" } }, scope);

    expect(el.getAttribute("style")).not.toContain("[object Object]");
  });

  it("drops a declaration once it leaves the object", () => {
    const el = mount();

    applyProps(el, { style: { "--left": "12px", "--top": "4px" } }, scope);
    applyProps(el, { style: { "--left": "20px" } }, scope);

    expect(el.style.getPropertyValue("--left")).toBe("20px");
    expect(el.style.getPropertyValue("--top")).toBe("");
  });

  it("restores the whole declaration after something strips it", () => {
    const el = mount();
    const style = { position: "absolute", "--width": "80px" };

    applyProps(el, { style }, scope);

    // What a morph does: the server never sent this attribute, so it goes.
    el.removeAttribute("style");

    applyProps(el, { style }, scope);

    expect(el.style.position).toBe("absolute");
    expect(el.style.getPropertyValue("--width")).toBe("80px");
  });

  it("leaves a string style alone", () => {
    const el = mount();

    applyProps(el, { style: "position: absolute" }, scope);

    expect(el.style.position).toBe("absolute");
  });
});
