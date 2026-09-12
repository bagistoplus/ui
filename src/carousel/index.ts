import { defineElement } from "../core/dom";
import {
  UICarouselAutoplayTrigger,
  UICarouselControl,
  UICarouselIndicator,
  UICarouselIndicatorGroup,
  UICarouselItem,
  UICarouselItemGroup,
  UICarouselNextTrigger,
  UICarouselPrevTrigger,
  UICarouselProgressText,
} from "./parts";
import { UICarousel } from "./root";

defineElement("ui-carousel", UICarousel);
defineElement("ui-carousel-item-group", UICarouselItemGroup);
defineElement("ui-carousel-item", UICarouselItem);
defineElement("ui-carousel-control", UICarouselControl);
defineElement("ui-carousel-prev-trigger", UICarouselPrevTrigger);
defineElement("ui-carousel-next-trigger", UICarouselNextTrigger);
defineElement("ui-carousel-autoplay-trigger", UICarouselAutoplayTrigger);
defineElement("ui-carousel-indicator-group", UICarouselIndicatorGroup);
defineElement("ui-carousel-indicator", UICarouselIndicator);
defineElement("ui-carousel-progress-text", UICarouselProgressText);

export {
  UICarousel,
  UICarouselAutoplayTrigger,
  UICarouselControl,
  UICarouselIndicator,
  UICarouselIndicatorGroup,
  UICarouselItem,
  UICarouselItemGroup,
  UICarouselNextTrigger,
  UICarouselPrevTrigger,
  UICarouselProgressText,
};

declare global {
  interface HTMLElementTagNameMap {
    "ui-carousel": UICarousel;
    "ui-carousel-item-group": UICarouselItemGroup;
    "ui-carousel-item": UICarouselItem;
    "ui-carousel-control": UICarouselControl;
    "ui-carousel-prev-trigger": UICarouselPrevTrigger;
    "ui-carousel-next-trigger": UICarouselNextTrigger;
    "ui-carousel-autoplay-trigger": UICarouselAutoplayTrigger;
    "ui-carousel-indicator-group": UICarouselIndicatorGroup;
    "ui-carousel-indicator": UICarouselIndicator;
    "ui-carousel-progress-text": UICarouselProgressText;
  }
}
