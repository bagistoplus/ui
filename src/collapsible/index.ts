import { defineElement } from "../core/dom";
import { UICollapsibleContent, UICollapsibleIndicator, UICollapsibleTrigger } from "./parts";
import { UICollapsible } from "./root";

defineElement("ui-collapsible", UICollapsible);
defineElement("ui-collapsible-trigger", UICollapsibleTrigger);
defineElement("ui-collapsible-indicator", UICollapsibleIndicator);
defineElement("ui-collapsible-content", UICollapsibleContent);

export { UICollapsible, UICollapsibleContent, UICollapsibleIndicator, UICollapsibleTrigger };

declare global {
  interface HTMLElementTagNameMap {
    "ui-collapsible": UICollapsible;
    "ui-collapsible-trigger": UICollapsibleTrigger;
    "ui-collapsible-indicator": UICollapsibleIndicator;
    "ui-collapsible-content": UICollapsibleContent;
  }
}
