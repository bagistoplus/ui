import { describe, expect, it } from "vitest";

import "../accordion/index";
import "../tabs/index";

/**
 * The rule: an attribute a consumer writes must never be shadowed by a class
 * property, unless that property reflects back to the attribute.
 *
 * A framework decides between `setAttribute` and a property assignment by
 * testing `key in el`. Declaring a getter is what makes the name a property,
 * so a getter with no setter means the framework writes to the getter and the
 * attribute is never set. It stays invisible while markup comes from server
 * HTML, and appears the moment anything renders these elements client side.
 *
 * TypeScript's `protected` does not help: it is erased, so a protected
 * accessor is an ordinary property at runtime.
 */
const ELEMENTS = [
  "ui-accordion",
  "ui-accordion-item",
  "ui-accordion-item-trigger",
  "ui-accordion-item-content",
  "ui-accordion-item-indicator",
  "ui-tabs",
  "ui-tabs-list",
  "ui-tabs-trigger",
  "ui-tabs-content",
  "ui-tabs-indicator",
];

/** Every attribute the package documents, plus the universal ones. */
const AUTHORED = [
  "delegate",
  "presence",
  "value",
  "disabled",
  "multiple",
  "collapsible",
  "orientation",
  "default-value",
  "activation-mode",
  "deselectable",
  "translations-list-label",
  "loop-focus",
  "composite",
];

/** Reflected on purpose, and covered by their own tests. */
const REFLECTED = new Set(["value", "disabled"]);

describe("attribute and property names", () => {
  for (const tag of ELEMENTS) {
    it(`<${tag}> shadows no authored attribute with a bare property`, () => {
      const el = document.createElement(tag);
      const shadowed = AUTHORED.filter((name) => name in el && !REFLECTED.has(name));

      expect(shadowed).toEqual([]);
    });
  }

  it("reflects the properties it does expose, so a framework write survives", () => {
    for (const tag of ELEMENTS) {
      const el = document.createElement(tag) as HTMLElement & Record<string, unknown>;

      if ("value" in el) {
        el.value = "probe";
        expect(el.getAttribute("value"), `${tag} value`).toBe("probe");
      }

      if ("disabled" in el) {
        el.disabled = true;
        expect(el.hasAttribute("disabled"), `${tag} disabled`).toBe(true);
      }
    }
  });
});
