#!/usr/bin/env node
/**
 * Usage: node scripts/add-component.js Button
 * Generates a new component folder with boilerplate and updates exports.
 * Will not overwrite if the component already exists.
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, "src/components");

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide a component name, e.g., `node add-component.js Button`");
    process.exit(1);
  }

  const componentName = args[0];
  const componentFolder = path.join(componentsDir, componentName);

  try {
    await fs.access(componentFolder);
    console.error(`Component "${componentName}" already exists. Aborting.`);
    process.exit(1);
  } catch {
    // Folder does not exist, proceed
  }

  await fs.mkdir(componentFolder, { recursive: true });

  const vueTemplate = `<template>
  <div class="ck-${toKebabCase(componentName)}">
    <!-- TODO: implement ${componentName} -->
  </div>
</template>

<script setup lang="ts">
defineProps({});
</script>

<style scoped>
.ck-${toKebabCase(componentName)} {
  /* TODO: add styles */
}
</style>
`;

  await fs.writeFile(path.join(componentFolder, `${componentName}.vue`), vueTemplate);

  // 4️⃣ Create index.ts for tree-shaking
  const indexTemplate = `import ${componentName} from "./${componentName}.vue";
export default ${componentName};
export { ${componentName} };
`;

  await fs.writeFile(path.join(componentFolder, "index.ts"), indexTemplate);

  console.log(`Component "${componentName}" created!`);

  await new Promise((resolve, reject) => {
    exec("node scripts/generate-exports.js", (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        reject(err);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });

  console.log(`Exports updated for "${componentName}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});