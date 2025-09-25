#!/usr/bin/env node
/**
 * Usage: node scripts/delete-component.js RibbonMenu
 * Deletes a component folder and updates exports.
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, "src/components");

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Please provide a component name to delete, e.g., `node delete-component.js RibbonMenu`");
    process.exit(1);
  }

  const componentName = args[0];
  const componentFolder = path.join(componentsDir, componentName);

  try {
    await fs.access(componentFolder);

    await fs.rm(componentFolder, { recursive: true, force: true });
    console.log(`Component "${componentName}" deleted from src/components`);
  } catch (err) {
    console.error(`Component "${componentName}" does not exist`);
    process.exit(1);
  }

  await new Promise((resolve, reject) => {
    exec("node scripts/generate-exports.js", (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });

  console.log(`Exports updated after deleting "${componentName}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});