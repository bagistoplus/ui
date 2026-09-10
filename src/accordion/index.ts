import { defineElement } from "../core/dom.js";
import { UIAccordionItem } from "./item.js";
import { UIAccordionItemContent, UIAccordionItemIndicator, UIAccordionItemTrigger } from "./parts.js";
import { UIAccordion } from "./root.js";

defineElement("ui-accordion", UIAccordion);
defineElement("ui-accordion-item", UIAccordionItem);
defineElement("ui-accordion-item-trigger", UIAccordionItemTrigger);
defineElement("ui-accordion-item-content", UIAccordionItemContent);
defineElement("ui-accordion-item-indicator", UIAccordionItemIndicator);

export {
  UIAccordion,
  UIAccordionItem,
  UIAccordionItemContent,
  UIAccordionItemIndicator,
  UIAccordionItemTrigger,
};

declare global {
  interface HTMLElementTagNameMap {
    "ui-accordion": UIAccordion;
    "ui-accordion-item": UIAccordionItem;
    "ui-accordion-item-trigger": UIAccordionItemTrigger;
    "ui-accordion-item-content": UIAccordionItemContent;
    "ui-accordion-item-indicator": UIAccordionItemIndicator;
  }
}
