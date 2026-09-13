import { UIAccordionItem } from "./item";
import { UIAccordionItemContent, UIAccordionItemIndicator, UIAccordionItemTrigger } from "./parts";
import { UIAccordion } from "./root";
export { UIAccordion, UIAccordionItem, UIAccordionItemContent, UIAccordionItemIndicator, UIAccordionItemTrigger, };
declare global {
    interface HTMLElementTagNameMap {
        "ui-accordion": UIAccordion;
        "ui-accordion-item": UIAccordionItem;
        "ui-accordion-item-trigger": UIAccordionItemTrigger;
        "ui-accordion-item-content": UIAccordionItemContent;
        "ui-accordion-item-indicator": UIAccordionItemIndicator;
    }
}
//# sourceMappingURL=index.d.ts.map