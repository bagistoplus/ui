import { UIMarqueeContent, UIMarqueeEdge, UIMarqueeItem, UIMarqueeViewport } from "./parts";
import { UIMarquee } from "./root";
export { UIMarquee, UIMarqueeContent, UIMarqueeEdge, UIMarqueeItem, UIMarqueeViewport };
export type { CloneDetails } from "./root";
declare global {
    interface HTMLElementTagNameMap {
        "ui-marquee": UIMarquee;
        "ui-marquee-viewport": UIMarqueeViewport;
        "ui-marquee-content": UIMarqueeContent;
        "ui-marquee-item": UIMarqueeItem;
        "ui-marquee-edge": UIMarqueeEdge;
    }
}
//# sourceMappingURL=index.d.ts.map