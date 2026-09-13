import { defineElement } from "../core/dom";
import { UIAccordionItem } from "./item";
import { UIAccordionItemContent, UIAccordionItemIndicator, UIAccordionItemTrigger } from "./parts";
import { UIAccordion } from "./root";
defineElement("ui-accordion", UIAccordion);
defineElement("ui-accordion-item", UIAccordionItem);
defineElement("ui-accordion-item-trigger", UIAccordionItemTrigger);
defineElement("ui-accordion-item-content", UIAccordionItemContent);
defineElement("ui-accordion-item-indicator", UIAccordionItemIndicator);
export { UIAccordion, UIAccordionItem, UIAccordionItemContent, UIAccordionItemIndicator, UIAccordionItemTrigger, };
//# sourceMappingURL=index.js.map