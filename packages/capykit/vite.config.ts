import { createSharedConfig } from "../../vite.config.shared";

export default createSharedConfig({
  packageName: "capykit",
  entry: "src/index.ts",
  outputDir: "dist",
});
