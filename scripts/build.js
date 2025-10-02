#!/usr/bin/env node

import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

const packages = [
  { name: "capykit", path: "packages/capykit" },
  { name: "core", path: "packages/core" },
  { name: "composables", path: "packages/composables" },
];

function buildPackage(packageInfo) {
  const { name, path } = packageInfo;
  const packageDir = resolve(rootDir, path);

  console.log(`\n🔨 Building ${name}...`);

  try {
    // Run vite build in package directory
    execSync("npx vite build", {
      cwd: packageDir,
      stdio: "inherit",
    });

    // Generate dist/package.json
    const packageJsonPath = resolve(packageDir, "package.json");
    const distDir = resolve(packageDir, "dist");

    // Enhanced package.json generation
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Build exports object based on actual build output
    const exports = {
      ".": {
        types: "./index.d.ts",
        import: "./index.esm.js",
        require: "./index.cjs.js",
        default: "./index.esm.js",
      },
    };

    // Check for additional directories in dist
    if (fs.existsSync(distDir)) {
      const distItems = fs.readdirSync(distDir, { withFileTypes: true });
      for (const item of distItems) {
        if (item.isDirectory() && !item.name.startsWith("_")) {
          // Add export for each directory
          exports[`./${item.name}`] = {
            types: `./${item.name}/index.d.ts`,
            import: `./${item.name}/index.esm.js`,
            require: `./${item.name}/index.cjs.js`,
            default: `./${item.name}/index.esm.js`,
          };
        }
      }
    }

    const distPackageJson = {
      ...packageJson,
      main: "./index.cjs.js",
      module: "./index.esm.js",
      types: "./index.d.ts",
      exports,
      scripts: undefined,
      devDependencies: undefined,
    };

    fs.writeFileSync(
      resolve(distDir, "package.json"),
      JSON.stringify(distPackageJson, null, 2)
    );
    console.log(`Generated dist/package.json for ${name}`);

    console.log(`Built ${name} successfully`);
    return true;
  } catch (error) {
    console.error(`Failed to build ${name}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetPackage = args[0];

  if (targetPackage) {
    // Build specific package
    const packageInfo = packages.find((pkg) => pkg.name === targetPackage);
    if (!packageInfo) {
      console.error(
        `Package "${targetPackage}" not found. Available packages: ${packages
          .map((p) => p.name)
          .join(", ")}`
      );
      process.exit(1);
    }

    const success = buildPackage(packageInfo);
    process.exit(success ? 0 : 1);
  } else {
    // Build all packages
    console.log("Building all packages...");
    let allSucceeded = true;

    for (const packageInfo of packages) {
      const success = buildPackage(packageInfo);
      if (!success) {
        allSucceeded = false;
      }
    }

    if (allSucceeded) {
      console.log("\nAll packages built successfully!");
    } else {
      console.log("\n💥 Some packages failed to build");
      process.exit(1);
    }
  }
}

main();
