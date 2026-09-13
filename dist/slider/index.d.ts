import { UISliderControl, UISliderDraggingIndicator, UISliderHiddenInput, UISliderLabel, UISliderMarker, UISliderMarkerGroup, UISliderRange, UISliderThumb, UISliderTrack, UISliderValueText } from "./parts";
import { UISlider } from "./root";
export { UISlider, UISliderControl, UISliderDraggingIndicator, UISliderHiddenInput, UISliderLabel, UISliderMarker, UISliderMarkerGroup, UISliderRange, UISliderThumb, UISliderTrack, UISliderValueText, };
export type { ValueText } from "./root";
declare global {
    interface HTMLElementTagNameMap {
        "ui-slider": UISlider;
        "ui-slider-label": UISliderLabel;
        "ui-slider-control": UISliderControl;
        "ui-slider-track": UISliderTrack;
        "ui-slider-range": UISliderRange;
        "ui-slider-thumb": UISliderThumb;
        "ui-slider-hidden-input": UISliderHiddenInput;
        "ui-slider-value-text": UISliderValueText;
        "ui-slider-marker-group": UISliderMarkerGroup;
        "ui-slider-marker": UISliderMarker;
        "ui-slider-dragging-indicator": UISliderDraggingIndicator;
    }
}
//# sourceMappingURL=index.d.ts.map