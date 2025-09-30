import { createSharedConfig } from "../../vite.config.shared";

export default createSharedConfig({
  packageName: "capykitcomposables",
  entry: "src/index.ts",
  outputDir: "dist",
});
