import { defineElement } from "../core/dom";
import {
  UIMenuArrow,
  UIMenuArrowTip,
  UIMenuContent,
  UIMenuIndicator,
  UIMenuItem,
  UIMenuItemGroup,
  UIMenuItemGroupLabel,
  UIMenuItemIndicator,
  UIMenuItemText,
  UIMenuPositioner,
  UIMenuSeparator,
  UIMenuTrigger,
} from "./parts";
import { UIMenu } from "./root";

defineElement("ui-menu", UIMenu);
defineElement("ui-menu-trigger", UIMenuTrigger);
defineElement("ui-menu-indicator", UIMenuIndicator);
defineElement("ui-menu-positioner", UIMenuPositioner);
defineElement("ui-menu-content", UIMenuContent);
defineElement("ui-menu-arrow", UIMenuArrow);
defineElement("ui-menu-arrow-tip", UIMenuArrowTip);
defineElement("ui-menu-item", UIMenuItem);
defineElement("ui-menu-item-text", UIMenuItemText);
defineElement("ui-menu-item-indicator", UIMenuItemIndicator);
defineElement("ui-menu-item-group", UIMenuItemGroup);
defineElement("ui-menu-item-group-label", UIMenuItemGroupLabel);
defineElement("ui-menu-separator", UIMenuSeparator);

export {
  UIMenu,
  UIMenuArrow,
  UIMenuArrowTip,
  UIMenuContent,
  UIMenuIndicator,
  UIMenuItem,
  UIMenuItemGroup,
  UIMenuItemGroupLabel,
  UIMenuItemIndicator,
  UIMenuItemText,
  UIMenuPositioner,
  UIMenuSeparator,
  UIMenuTrigger,
};

declare global {
  interface HTMLElementTagNameMap {
    "ui-menu": UIMenu;
    "ui-menu-trigger": UIMenuTrigger;
    "ui-menu-indicator": UIMenuIndicator;
    "ui-menu-positioner": UIMenuPositioner;
    "ui-menu-content": UIMenuContent;
    "ui-menu-arrow": UIMenuArrow;
    "ui-menu-arrow-tip": UIMenuArrowTip;
    "ui-menu-item": UIMenuItem;
    "ui-menu-item-text": UIMenuItemText;
    "ui-menu-item-indicator": UIMenuItemIndicator;
    "ui-menu-item-group": UIMenuItemGroup;
    "ui-menu-item-group-label": UIMenuItemGroupLabel;
    "ui-menu-separator": UIMenuSeparator;
  }
}
