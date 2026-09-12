import { describe, expect, it } from "vitest";

import { numberOf, parseTiers } from "./tiers";

describe("parseTiers", () => {
  it("reads a value without tiers as the base", () => {
    expect(parseTiers("3")).toEqual([{ width: 0, value: "3" }]);
  });

  it("reads a base and widths, sorted by width", () => {
    expect(parseTiers("1024:4 1 640:2")).toEqual([
      { width: 0, value: "1" },
      { width: 640, value: "2" },
      { width: 1024, value: "4" },
    ]);
  });

  it("drops a token whose width is not a number", () => {
    expect(parseTiers("1 md:2")).toEqual([{ width: 0, value: "1" }]);
  });

  it("keeps a value with a colon after the width", () => {
    expect(parseTiers("0px 640:1rem")).toEqual([
      { width: 0, value: "0px" },
      { width: 640, value: "1rem" },
    ]);
  });

  it("is empty for null, empty and whitespace", () => {
    expect(parseTiers(null)).toEqual([]);
    expect(parseTiers("")).toEqual([]);
    expect(parseTiers("   ")).toEqual([]);
  });
});

describe("numberOf", () => {
  it("parses a numeric tier and rejects the rest", () => {
    expect(numberOf("2.5")).toBe(2.5);
    expect(numberOf("auto")).toBeUndefined();
    expect(numberOf("")).toBeUndefined();
    expect(numberOf(undefined)).toBeUndefined();
  });
});
