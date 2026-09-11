import { describe, expect, it } from "vitest";

import { normalizeProps } from "./normalize";

/**
 * The one behaviour that makes this ours rather than `@zag-js/vanilla`'s.
 *
 * Vanilla flattens a style object into a CSS string, which leaves `applyProps` no
 * option but to write a whole `style` attribute and wipe the declarations that
 * floating-ui writes imperatively. Keeping the object is what lets them be applied
 * one at a time.
 */
describe("normalizeProps", () => {
  const normalize = (props: Record<string, unknown>) => normalizeProps.element(props) as Record<string, unknown>;

  it("keeps a style object an object", () => {
    const style = { position: "absolute", "--x": "8px" };

    expect(normalize({ style }).style).toEqual(style);
  });

  it("lowercases the keys Zag sends in camelCase", () => {
    expect(normalize({ tabIndex: -1 })).toHaveProperty("tabindex", -1);
  });

  it("keeps the SVG attributes whose casing is part of the name", () => {
    expect(normalize({ viewBox: "0 0 1 1" })).toHaveProperty("viewBox", "0 0 1 1");
  });

  it("renames the props Zag names after React", () => {
    const result = normalize({ className: "a", htmlFor: "b" });

    expect(result).toHaveProperty("class", "a");
    expect(result).toHaveProperty("for", "b");
  });

  it("drops undefined, so an absent prop never becomes an attribute", () => {
    expect(Object.keys(normalize({ present: 1, absent: undefined }))).toEqual(["present"]);
  });
});
