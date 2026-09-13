import { defineElement } from "../core/dom";
import { UICarouselAutoplayTrigger, UICarouselControl, UICarouselIndicator, UICarouselIndicatorGroup, UICarouselItem, UICarouselItemGroup, UICarouselNextTrigger, UICarouselPrevTrigger, UICarouselProgressText, } from "./parts";
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
export { UICarousel, UICarouselAutoplayTrigger, UICarouselControl, UICarouselIndicator, UICarouselIndicatorGroup, UICarouselItem, UICarouselItemGroup, UICarouselNextTrigger, UICarouselPrevTrigger, UICarouselProgressText, };
//# sourceMappingURL=index.js.map