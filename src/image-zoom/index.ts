import { defineElement } from "../core/dom";
import {
  UIImageZoomDecrementTrigger,
  UIImageZoomImage,
  UIImageZoomIncrementTrigger,
  UIImageZoomResetTrigger,
  UIImageZoomViewport,
} from "./parts";
import { UIImageZoom } from "./root";

defineElement("ui-image-zoom", UIImageZoom);
defineElement("ui-image-zoom-viewport", UIImageZoomViewport);
defineElement("ui-image-zoom-image", UIImageZoomImage);
defineElement("ui-image-zoom-increment-trigger", UIImageZoomIncrementTrigger);
defineElement("ui-image-zoom-decrement-trigger", UIImageZoomDecrementTrigger);
defineElement("ui-image-zoom-reset-trigger", UIImageZoomResetTrigger);

export {
  UIImageZoom,
  UIImageZoomDecrementTrigger,
  UIImageZoomImage,
  UIImageZoomIncrementTrigger,
  UIImageZoomResetTrigger,
  UIImageZoomViewport,
};
export type { Api, Direction, Props, SwipeDetails, SwipeDirection, ValueChangeDetails } from "./machine";

declare global {
  interface HTMLElementTagNameMap {
    "ui-image-zoom": UIImageZoom;
    "ui-image-zoom-viewport": UIImageZoomViewport;
    "ui-image-zoom-image": UIImageZoomImage;
    "ui-image-zoom-increment-trigger": UIImageZoomIncrementTrigger;
    "ui-image-zoom-decrement-trigger": UIImageZoomDecrementTrigger;
    "ui-image-zoom-reset-trigger": UIImageZoomResetTrigger;
  }
}
