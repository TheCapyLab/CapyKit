import { defineConfig } from "vitepress";
import { getSidebarConfig } from "./utils/sidebar";

// Manually define available versions for now
// You can update this array when adding new versions
const versions = [
  { text: "v0.2", link: "/v0.2/" },
  { text: "v0.1.0", link: "/v0.1.0/" },
  { text: "latest", link: "/latest/" },
  { text: "beta-release", link: "/beta-release/" },
];

export default defineConfig({
  title: "CapyKit",
  description: "Vue UI library",
  base: "/",
  rewrites: {
    'versions/:version/(.*)': ':version/(.*)'
  },
  themeConfig: {
    nav: [
      { text: "GitHub", link: "https://github.com/capytec/capykit" }
    ],
    sidebar: getSidebarConfig(),
    outline: {
      level: [2, 3]
    }
  }
});