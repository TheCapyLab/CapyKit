import { createSharedConfig } from "../../vite.config.shared";

export default createSharedConfig({
  packageName: "capykitcore",
  entry: "src/index.ts",
  outputDir: "dist",
});
