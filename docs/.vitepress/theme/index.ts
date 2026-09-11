import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

// ui.css first: it declares `@layer ui`, and the browser orders layers by first
// appearance. Declared before Tailwind's layers, its display defaults lose to
// every utility, which is the documented contract.
import "../../../ui.css";
import "./custom.css";

import ComponentExample from "./components/ComponentExample.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: any }) {
    app.component("ComponentExample", ComponentExample);

    // `customElements.define` runs at module scope, so importing this during
    // the static build would throw `customElements is not defined`.
    if (!import.meta.env.SSR) {
      import("../../../src/accordion/index");
      import("../../../src/popover/index");
      import("../../../src/tabs/index");
    }
  },
} satisfies Theme;
