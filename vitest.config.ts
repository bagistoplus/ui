import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// CI uses Playwright's pinned Chromium. Locally, `UI_BROWSER_CHANNEL=chrome`
// runs against an installed Chrome instead, which skips a 180MB download.
const channel = process.env.UI_BROWSER_CHANNEL;

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(channel ? { launchOptions: { channel } } : {}),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
