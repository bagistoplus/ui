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
export declare const normalizeProps: import("@zag-js/types").NormalizeProps<import("@zag-js/types").PropTypes<{
    [x: string]: any;
}>>;
//# sourceMappingURL=normalize.d.ts.map