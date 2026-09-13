import { defineElement } from "../core/dom";
import { UITabsContent, UITabsIndicator, UITabsList, UITabsTrigger } from "./parts";
import { UITabs } from "./root";
defineElement("ui-tabs", UITabs);
defineElement("ui-tabs-list", UITabsList);
defineElement("ui-tabs-trigger", UITabsTrigger);
defineElement("ui-tabs-content", UITabsContent);
defineElement("ui-tabs-indicator", UITabsIndicator);
export { UITabs, UITabsContent, UITabsIndicator, UITabsList, UITabsTrigger };
//# sourceMappingURL=index.js.map