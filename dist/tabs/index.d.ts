import { UITabsContent, UITabsIndicator, UITabsList, UITabsTrigger } from "./parts";
import { UITabs } from "./root";
export { UITabs, UITabsContent, UITabsIndicator, UITabsList, UITabsTrigger };
declare global {
    interface HTMLElementTagNameMap {
        "ui-tabs": UITabs;
        "ui-tabs-list": UITabsList;
        "ui-tabs-trigger": UITabsTrigger;
        "ui-tabs-content": UITabsContent;
        "ui-tabs-indicator": UITabsIndicator;
    }
}
//# sourceMappingURL=index.d.ts.map