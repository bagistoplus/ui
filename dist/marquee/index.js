import { defineElement } from "../core/dom";
import { UIMarqueeContent, UIMarqueeEdge, UIMarqueeItem, UIMarqueeViewport } from "./parts";
import { UIMarquee } from "./root";
defineElement("ui-marquee", UIMarquee);
defineElement("ui-marquee-viewport", UIMarqueeViewport);
defineElement("ui-marquee-content", UIMarqueeContent);
defineElement("ui-marquee-item", UIMarqueeItem);
defineElement("ui-marquee-edge", UIMarqueeEdge);
export { UIMarquee, UIMarqueeContent, UIMarqueeEdge, UIMarqueeItem, UIMarqueeViewport };
//# sourceMappingURL=index.js.map