#!/usr/bin/env node
/**
 * List all components in src/components and their package.json exports
 */

import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, "src/components");
const pkgPath = path.join(rootDir, "package.json");

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

async function main() {
  console.log("Listing CapyKit components...\n");

  let folders = [];
  try {
    folders = await fs.readdir(componentsDir);
  } catch (err) {
    console.error("Could not read src/components:", err);
    process.exit(1);
  }

  const components = [];
  for (const folder of folders) {
    const stat = await fs.stat(path.join(componentsDir, folder));
    if (stat.isDirectory()) {
      components.push(folder);
    }
  }

  if (components.length === 0) {
    console.log("No components found in src/components.");
  } else {
    console.log("Components in src/components:");
    components.forEach((c) => console.log(`- ${c} (import: "capykit/${toKebabCase(c)}")`));
  }

  try {
    const pkgRaw = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw);

    const exportKeys = Object.keys(pkg.exports || {}).filter(
      (k) => k !== "." && k !== "./plugin"
    );

    if (exportKeys.length > 0) {
      console.log("\nExports in package.json:");
      exportKeys.forEach((k) => console.log(`- ${k} -> ${pkg.exports[k].import}`));
    }
  } catch (err) {
    console.warn("Could not read package.json exports:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});