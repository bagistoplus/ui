import { UICarouselAutoplayTrigger, UICarouselControl, UICarouselIndicator, UICarouselIndicatorGroup, UICarouselItem, UICarouselItemGroup, UICarouselNextTrigger, UICarouselPrevTrigger, UICarouselProgressText } from "./parts";
import { UICarousel } from "./root";
export { UICarousel, UICarouselAutoplayTrigger, UICarouselControl, UICarouselIndicator, UICarouselIndicatorGroup, UICarouselItem, UICarouselItemGroup, UICarouselNextTrigger, UICarouselPrevTrigger, UICarouselProgressText, };
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
//# sourceMappingURL=index.d.ts.map