import { createNormalizer } from "@zag-js/types";

const propMap: Record<string, string> = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
};

/**
 * SVG attributes whose casing is part of the name, and the two DOM properties
 * that are written as properties and so keep theirs.
 *
 * Vanilla's normalizer maps `defaultValue` to `value`. That is wrong for a
 * text field a machine only seeds: `value` written on every render replaces
 * what the user is typing with the machine's formatted number, and `1,` loses
 * its separator before the `5` arrives. `defaultValue` is what Zag means, and
 * the browser already gives it the right semantics: it seeds the field and
 * stops mattering once the field is dirty.
 */
const CASE_SENSITIVE = new Set(["viewBox", "preserveAspectRatio", "defaultValue", "defaultChecked"]);

/**
 * Ours rather than the one from `@zag-js/vanilla`, for exactly one reason.
 *
 * Vanilla's normalizer runs a `toStyleString` that flattens a style object into a
 * CSS declaration string. `applyProps` then has no choice but to write it as a
 * whole `style` attribute, which replaces every declaration on the element,
 * including the ones the component does not own.
 *
 * That is not hypothetical. `@zag-js/popper` writes `--x`, `--y`, `--z-index` and
 * `--transform-origin` onto a positioner imperatively after floating-ui measures,
 * and the style object Zag returns refers to them through `var()` rather than
 * containing them. Flattening and writing the attribute deletes them one frame
 * later, the `transform` becomes invalid at computed-value time and resolves to
 * `none`, and the panel lands at its containing block's origin.
 *
 * So the object survives, and `applyProps` applies it one declaration at a time.
 * Everything else here matches vanilla's behaviour: the same prop renames, the
 * same lowercasing, the same dropping of `undefined`.
 */
export const normalizeProps = createNormalizer((props: Record<string, any>) => {
  const result: Record<string, any> = {};

  for (const [rawKey, value] of Object.entries(props)) {
    if (value === undefined) {
      continue;
    }

    const key = propMap[rawKey] ?? rawKey;

    if (key === "style") {
      result.style = value;
      continue;
    }

    result[CASE_SENSITIVE.has(key) ? key : key.toLowerCase()] = value;
  }

  return result;
});
