import { describe, expect, it } from "vitest";

import { boolAttribute } from "./dom";

/**
 * The rule every boolean attribute in the package follows. `undefined` is not a
 * third value for the machine, it is the absence of an opinion: the caller omits
 * the prop and Zag applies its own default, which is `true` for about half of
 * them.
 */
describe("boolAttribute", () => {
  const read = (value: string) => {
    const el = document.createElement("div");

    el.setAttribute("flag", value);

    return boolAttribute(el, "flag");
  };

  it("returns undefined when the attribute is absent", () => {
    expect(boolAttribute(document.createElement("div"), "flag")).toBeUndefined();
  });

  it("returns true when present with no value", () => {
    expect(read("")).toBe(true);
  });

  it("returns false only for the literal string", () => {
    expect(read("false")).toBe(false);
    expect(read("true")).toBe(true);
    expect(read("0")).toBe(true);
    expect(read("False")).toBe(true);
  });
});
