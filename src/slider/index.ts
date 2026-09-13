import { defineElement } from "../core/dom";
import {
  UISliderControl,
  UISliderDraggingIndicator,
  UISliderHiddenInput,
  UISliderLabel,
  UISliderMarker,
  UISliderMarkerGroup,
  UISliderRange,
  UISliderThumb,
  UISliderTrack,
  UISliderValueText,
} from "./parts";
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

export {
  UISlider,
  UISliderControl,
  UISliderDraggingIndicator,
  UISliderHiddenInput,
  UISliderLabel,
  UISliderMarker,
  UISliderMarkerGroup,
  UISliderRange,
  UISliderThumb,
  UISliderTrack,
  UISliderValueText,
};

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
