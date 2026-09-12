import { defineElement } from "../core/dom";
import { UIMarqueeContent, UIMarqueeEdge, UIMarqueeItem, UIMarqueeViewport } from "./parts";
import { UIMarquee } from "./root";

defineElement("ui-marquee", UIMarquee);
defineElement("ui-marquee-viewport", UIMarqueeViewport);
defineElement("ui-marquee-content", UIMarqueeContent);
defineElement("ui-marquee-item", UIMarqueeItem);
defineElement("ui-marquee-edge", UIMarqueeEdge);

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
