import * as slider from "@zag-js/slider";
import { VanillaMachine } from "@zag-js/vanilla";
import { ZagRootElement } from "../core/root";
import { SLIDER_ROOT } from "./brands";
import type { UISliderThumb } from "./parts";
export type ValueText = (details: slider.ValueTextDetails) => string;
/**
 * A slider's configuration is Zag's props, kebab-cased. The value is a list,
 * one number per thumb, written as a comma list: `value` is the controlled
 * list and `default-value` the initial one, so the machine owns the value
 * unless the consumer writes `value`. It is read from `el.api.value` and
 * moved through `api.setValue()` and `api.setThumbValue()`.
 *
 * The thumbs are numbered by their document order among the root's thumbs,
 * unless one writes `index`. Zag's `aria-label` and `aria-labelledby` arrays
 * are not attributes here: a thumb keeps the one the consumer wrote on it.
 */
export declare class UISlider extends ZagRootElement<slider.Props, slider.Api> {
    #private;
    static readonly observedAttributes: string[];
    get [SLIDER_ROOT](): true;
    /**
     * The text a thumb reads out for its value, `aria-valuetext`. A function,
     * so a property rather than an attribute; set back to `null`, the thumb
     * reads the bare number again.
     */
    get getAriaValueText(): ValueText | null;
    set getAriaValueText(next: ValueText | null | undefined);
    protected get componentName(): string;
    protected get valueKeyedIds(): readonly string[];
    protected createMachine(props: () => slider.Props): VanillaMachine<any>;
    protected connect(machine: VanillaMachine<any>): slider.Api;
    protected machineProps(): slider.Props;
    registerThumb(thumb: UISliderThumb): void;
    unregisterThumb(thumb: UISliderThumb): void;
    /** A thumb wrote or dropped `index`, so the others may shift. */
    thumbsChanged(): void;
    /** The index Zag is told for this thumb: the written one, or its place among the others. */
    indexOf(thumb: UISliderThumb): number | undefined;
}
//# sourceMappingURL=root.d.ts.map