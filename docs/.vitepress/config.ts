import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "@bagistoplus/ui",
  description: "Headless custom elements built on Zag. No shadow DOM, no framework.",
  appearance: true,

  // The ADR is a decision record, not a page. It keeps living in docs/.
  srcExclude: ["adr/**", "guide/architecture.md"],

  vite: {
    plugins: [tailwindcss() as any],
  },

  vue: {
    template: {
      compilerOptions: {
        // Without this Vue tries to resolve <ui-accordion> as a component and
        // every demo warns. The reference site never hits this: it documents
        // an Alpine plugin, so its demos are ordinary HTML.
        isCustomElement: (tag: string) => tag.startsWith("ui-"),
      },
    },
  },

  themeConfig: {
    logo: "/logo.svg",

    nav: [
      { text: "Docs", link: "/guide/introduction" },
      { text: "Components", link: "/components/accordion" },
      { text: "GitHub", link: "https://github.com/bagistoplus/ui" },
    ],

    sidebar: [
      {
        text: "Docs",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Getting Started", link: "/guide/installation" },
          { text: "Usage", link: "/guide/usage" },
          { text: "Styling", link: "/guide/styling" },
        ],
      },
      {
        text: "Components",
        items: [
          { text: "Accordion", link: "/components/accordion" },
          { text: "Carousel", link: "/components/carousel" },
          { text: "Dialog", link: "/components/dialog" },
          { text: "Menu", link: "/components/menu" },
          { text: "Navigation Menu", link: "/components/navigation-menu" },
          { text: "Popover", link: "/components/popover" },
          { text: "Tabs", link: "/components/tabs" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/bagistoplus/ui" }],

    footer: {
      message: "Built on Zag.js",
      copyright: "MIT License",
    },

    search: {
      provider: "local",
    },
  },

  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
});
