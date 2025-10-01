#!/usr/bin/env node

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

console.log("📦 Installing dependencies in all packages...");

// Get all package directories
const packagesDir = resolve(rootDir, "packages");
const packageDirs = fs.readdirSync(packagesDir).filter((dir) => {
  const packagePath = resolve(packagesDir, dir);
  return (
    fs.statSync(packagePath).isDirectory() &&
    fs.existsSync(resolve(packagePath, "package.json"))
  );
});

// Install in root first
console.log("🏠 Installing root dependencies...");
try {
  execSync("npm install", {
    cwd: rootDir,
    stdio: "inherit",
  });
  console.log("✅ Root dependencies installed");
} catch (error) {
  console.error("❌ Failed to install root dependencies:", error.message);
  process.exit(1);
}

// Install in each package
for (const packageDir of packageDirs) {
  const packagePath = resolve(packagesDir, packageDir);
  const packageJsonPath = resolve(packagePath, "package.json");

  console.log(`📦 Installing dependencies in ${packageDir}...`);

  try {
    // Read package.json to check if it has external dependencies
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const hasDependencies =
      packageJson.dependencies || packageJson.devDependencies;

    if (!hasDependencies) {
      console.log(`⏭️  No dependencies to install in ${packageDir}`);
      continue;
    }

    // Filter out local workspace dependencies for individual package installs
    const filteredDeps = {};
    const filteredDevDeps = {};

    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        if (!name.startsWith("@thecapylab/capykit")) {
          filteredDeps[name] = version;
        }
      }
    }

    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(
        packageJson.devDependencies
      )) {
        if (!name.startsWith("@thecapylab/capykit")) {
          filteredDevDeps[name] = version;
        }
      }
    }

    // Install external dependencies only
    if (Object.keys(filteredDeps).length > 0) {
      const depList = Object.entries(filteredDeps).map(
        ([name, version]) => `${name}@${version}`
      );
      execSync(`npm install ${depList.join(" ")}`, {
        cwd: packagePath,
        stdio: "inherit",
      });
    }

    if (Object.keys(filteredDevDeps).length > 0) {
      const devDepList = Object.entries(filteredDevDeps).map(
        ([name, version]) => `${name}@${version}`
      );
      execSync(`npm install --save-dev ${devDepList.join(" ")}`, {
        cwd: packagePath,
        stdio: "inherit",
      });
    }

    if (
      Object.keys(filteredDeps).length === 0 &&
      Object.keys(filteredDevDeps).length === 0
    ) {
      console.log(
        `⏭️  Only workspace dependencies in ${packageDir}, skipping npm install`
      );
    } else {
      console.log(`✅ External dependencies installed in ${packageDir}`);
    }
  } catch (error) {
    console.error(
      `❌ Failed to install dependencies in ${packageDir}:`,
      error.message
    );
    process.exit(1);
  }
}

console.log("🎉 All dependencies installed successfully!");
