import { UIMenuArrow, UIMenuArrowTip, UIMenuContent, UIMenuIndicator, UIMenuItem, UIMenuItemGroup, UIMenuItemGroupLabel, UIMenuItemIndicator, UIMenuItemText, UIMenuPositioner, UIMenuSeparator, UIMenuTrigger } from "./parts";
import { UIMenu } from "./root";
export { UIMenu, UIMenuArrow, UIMenuArrowTip, UIMenuContent, UIMenuIndicator, UIMenuItem, UIMenuItemGroup, UIMenuItemGroupLabel, UIMenuItemIndicator, UIMenuItemText, UIMenuPositioner, UIMenuSeparator, UIMenuTrigger, };
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
//# sourceMappingURL=index.d.ts.map