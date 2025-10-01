#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(packageRoot, "src");

// Get component name from command line argument
const componentName = process.argv[2];

if (!componentName) {
  console.error("Error: Component name is required");
  console.log("Usage: node scripts/create-component.js <ComponentName>");
  console.log("Example: node scripts/create-component.js Card");
  process.exit(1);
}

// Validate component name (PascalCase)
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error(
    "Error: Component name must be in PascalCase (e.g., Button, MyCard, DatePicker)"
  );
  process.exit(1);
}

const componentDirName = componentName.toLowerCase();
const componentDir = path.join(srcRoot, componentDirName);

// Check if component already exists
if (fs.existsSync(componentDir)) {
  console.error(
    `Error: Component "${componentName}" already exists at ./${componentDirName}/`
  );
  process.exit(1);
}

console.log(`🚀 Creating component: ${componentName}`);

// Create component directory
fs.mkdirSync(componentDir, { recursive: true });

// Generate file contents
const vueTemplate = `<template>
  <div class="ck-${componentDirName}">I am a ${componentName}</div>
</template>

<script setup lang="ts"></script>

<style scoped>
.ck-${componentDirName} {
  /* TODO: add styles */
}
</style>
`;

const indexJs = `export { default as ${componentName} } from "./${componentName}.vue";
`;

const indexDts = `import { Component } from "@thecapylab/capykitcore";

export interface ${componentName}Props {}
export interface ${componentName}Emits {}
export interface ${componentName}Slots {}
export interface ${componentName}Functions {}

declare const ${componentName}: Component<
  ${componentName}Props,
  ${componentName}Emits,
  ${componentName}Slots,
  ${componentName}Functions
>;

declare module "vue" {
  export interface GlobalComponents {
    ${componentName}: typeof ${componentName};
  }
}

export { ${componentName} };
`;

const packageJson = `{
  "main": "./index.js",
  "module": "./index.js",
  "types": "./index.d.ts",
  "sideEffects": [
    "*.vue"
  ]
}
`;

// Write files
const files = [
  { name: `${componentName}.vue`, content: vueTemplate },
  { name: "index.js", content: indexJs },
  { name: "index.d.ts", content: indexDts },
  { name: "package.json", content: packageJson },
];

try {
  files.forEach((file) => {
    const filePath = path.join(componentDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`Created: ${componentDirName}/${file.name}`);
  });

  console.log(`\nComponent "${componentName}" created successfully!`);
  console.log(`Location: ./${componentDirName}/`);

  // Automatically regenerate exports
  console.log(`\n🔄 Regenerating exports...`);
  try {
    const output = execSync("node scripts/generate-exports.js", {
      cwd: packageRoot,
      encoding: "utf-8",
    });
    console.log(output);
    console.log(`✅ Exports regenerated successfully!`);
  } catch (error) {
    console.error("❌ Error regenerating exports:", error.message);
    console.log("💡 Please run manually: node scripts/generate-exports.js");
  }

  console.log(`\nNext steps:`);
  console.log(
    `1. Add your component logic to ${componentDirName}/${componentName}.vue`
  );
  console.log(
    `2. Update the TypeScript interfaces in ${componentDirName}/index.d.ts`
  );
} catch (error) {
  console.error(`Error creating component files:`, error.message);

  // Cleanup on error
  if (fs.existsSync(componentDir)) {
    fs.rmSync(componentDir, { recursive: true, force: true });
    console.log(`Cleaned up partially created component directory`);
  }
  process.exit(1);
}
