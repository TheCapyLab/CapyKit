import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import VersionSwitcher from "./components/VersionSwitcher.vue";

const theme: Theme = {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("VersionSwitcher", VersionSwitcher);
  }
};

export default theme;