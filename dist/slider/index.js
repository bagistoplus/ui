import { defineElement } from "../core/dom";
import { UISliderControl, UISliderDraggingIndicator, UISliderHiddenInput, UISliderLabel, UISliderMarker, UISliderMarkerGroup, UISliderRange, UISliderThumb, UISliderTrack, UISliderValueText, } from "./parts";
import { UISlider } from "./root";
defineElement("ui-slider", UISlider);
defineElement("ui-slider-label", UISliderLabel);
defineElement("ui-slider-control", UISliderControl);
defineElement("ui-slider-track", UISliderTrack);
defineElement("ui-slider-range", UISliderRange);
defineElement("ui-slider-thumb", UISliderThumb);
defineElement("ui-slider-hidden-input", UISliderHiddenInput);
defineElement("ui-slider-value-text", UISliderValueText);
defineElement("ui-slider-marker-group", UISliderMarkerGroup);
defineElement("ui-slider-marker", UISliderMarker);
defineElement("ui-slider-dragging-indicator", UISliderDraggingIndicator);
export { UISlider, UISliderControl, UISliderDraggingIndicator, UISliderHiddenInput, UISliderLabel, UISliderMarker, UISliderMarkerGroup, UISliderRange, UISliderThumb, UISliderTrack, UISliderValueText, };
//# sourceMappingURL=index.js.map