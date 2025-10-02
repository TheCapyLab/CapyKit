#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(packageRoot, "src");

// Get composable name from command line argument
const composableName = process.argv[2];

if (!composableName) {
  console.error("Error: Composable name is required");
  console.log("Usage: node scripts/add-composable.js <composableName>");
  console.log("Example: node scripts/add-composable.js useCounter");
  process.exit(1);
}

// Validate composable name (should start with 'use' and be camelCase)
if (!/^use[A-Z][a-zA-Z0-9]*$/.test(composableName)) {
  console.error(
    "Error: Composable name must start with 'use' and be in camelCase (e.g., useCounter, useLocalStorage)"
  );
  process.exit(1);
}

const composableDirName = composableName;
const composableDir = path.join(srcRoot, composableDirName);

// Check if composable already exists
if (fs.existsSync(composableDir)) {
  console.error(
    `Error: Composable "${composableName}" already exists at ./${composableDirName}/`
  );
  process.exit(1);
}

console.log(`Creating composable: ${composableName}`);

// Create composable directory
fs.mkdirSync(composableDir, { recursive: true });

// Generate file contents
const composableTemplate = `import { ref, type Ref } from 'vue';

/**
 * ${composableName} composable
 * 
 * @returns An object containing the composable's reactive state and methods
 */
export function ${composableName}() {
  const state = ref<boolean>(false);

  const toggle = () => {
    state.value = !state.value;
  };

  const setState = (value: boolean) => {
    state.value = value;
  };

  return {
    state: state as Readonly<Ref<boolean>>,
    toggle,
    setState
  };
}

export type ${
  composableName.charAt(0).toUpperCase() + composableName.slice(1)
}Return = ReturnType<typeof ${composableName}>;
`;

const indexTs = `export * from './${composableName}';
`;

const indexDts = `export * from './${composableName}';
`;

const packageJson = `{
  "main": "./index.js",
  "module": "./index.js",
  "types": "./index.d.ts",
  "sideEffects": false
}
`;

// Write files
const files = [
  { name: `${composableName}.ts`, content: composableTemplate },
  { name: "index.ts", content: indexTs },
  { name: "index.d.ts", content: indexDts },
  { name: "package.json", content: packageJson },
];

try {
  files.forEach((file) => {
    const filePath = path.join(composableDir, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`Created: ${composableDirName}/${file.name}`);
  });

  console.log(`\nComposable "${composableName}" created successfully!`);
  console.log(`Location: ./${composableDirName}/`);

  // Automatically regenerate exports
  console.log(`\nRegenerating exports...`);
  try {
    const output = execSync("node scripts/generate-exports.js", {
      cwd: packageRoot,
      encoding: "utf-8",
    });
    console.log(output);
    console.log(`Exports regenerated successfully!`);
  } catch (error) {
    console.error("Error regenerating exports:", error.message);
    console.log("Please run manually: node scripts/generate-exports.js");
  }

  console.log(`\nNext steps:`);
  console.log(
    `1. Add your composable logic to ${composableDirName}/${composableName}.ts`
  );
  console.log(
    `2. Update the TypeScript types in ${composableDirName}/index.d.ts if needed`
  );
} catch (error) {
  console.error(`Error creating composable files:`, error.message);

  // Cleanup on error
  if (fs.existsSync(composableDir)) {
    fs.rmSync(composableDir, { recursive: true, force: true });
    console.log(`Cleaned up partially created composable directory`);
  }
  process.exit(1);
}
