#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const pkgPath = path.join(rootDir, "package.json");
const componentsDir = path.join(rootDir, "src/components");

function toKebabCase(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

async function main() {
  const pkgRaw = await fs.readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw);

  if (!pkg.exports) pkg.exports = {};

  // Keep main entries
  pkg.exports["."] = { import: "./dist/index.js", types: "./dist/index.d.ts" };
  pkg.exports["./plugin"] = { import: "./dist/plugin.js", types: "./dist/plugin.d.ts" };

  // Build a fresh list of components
  const componentNames = await fs.readdir(componentsDir);
  const newExports = {};

  for (const name of componentNames) {
    const stat = await fs.stat(path.join(componentsDir, name));
    if (stat.isDirectory()) {
      const kebabName = toKebabCase(name);
      newExports[`./${kebabName}`] = {
        import: `./dist/components/${name}/index.js`,
        types: `./dist/components/${name}/index.d.ts`
      };
    }
  }

  // Remove all old component exports first
  Object.keys(pkg.exports)
    .filter(key => key !== "." && key !== "./plugin")
    .forEach(key => delete pkg.exports[key]);

  // Add fresh component exports
  Object.assign(pkg.exports, newExports);

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("package.json exports updated with current components!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});