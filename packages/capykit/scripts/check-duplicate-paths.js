#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------
// 1. Run npm ls in any folder with package.json
// -----------------
function checkDuplicatePackages(dir) {
  console.log(`\n🔍 Checking duplicate packages in: ${dir}`);

  if (!existsSync(path.join(dir, "package.json"))) {
    console.log("⚠️ No package.json found, skipping.");
    return;
  }

  try {
    const result = execSync("npm ls --all --json", {
      cwd: dir,
      stdio: ["pipe", "pipe", "ignore"],
    }).toString();
    const parsed = JSON.parse(result);

    const seen = {};

    function traverse(deps) {
      for (const [name, pkg] of Object.entries(deps || {})) {
        if (!pkg.version) continue;
        if (!seen[name]) seen[name] = new Set();
        seen[name].add(pkg.version);
        if (pkg.dependencies) traverse(pkg.dependencies);
      }
    }

    traverse(parsed.dependencies);

    const duplicates = Object.entries(seen).filter(
      ([_, versions]) => versions.size > 1
    );
    if (duplicates.length === 0) {
      console.log("✅ No duplicate packages found.");
    } else {
      console.log("⚠️ Found duplicate packages:");
      duplicates.forEach(([name, versions]) => {
        console.log(` - ${name}: [${Array.from(versions).join(", ")}]`);
      });
    }
  } catch (err) {
    console.error("❌ Failed to run `npm ls` in", dir);
  }
}

// -----------------
// 2. Scan for tsconfig.json files
// -----------------
function checkTsConfigPaths(dir) {
  const tsconfigPath = path.join(dir, "tsconfig.json");
  if (!existsSync(tsconfigPath)) return;

  console.log(`\n🔍 Checking path aliases in: ${tsconfigPath}`);

  const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8"));

  if (!tsconfig.compilerOptions || !tsconfig.compilerOptions.paths) {
    console.log("✅ No custom path aliases found.");
    return;
  }

  const paths = tsconfig.compilerOptions.paths;
  const conflicts = [];

  for (const [alias, targets] of Object.entries(paths)) {
    for (const target of targets) {
      if (target.includes("node_modules")) {
        conflicts.push(`${alias} → ${target} (conflicts with node_modules)`);
      }

      const aliasName = alias.replace("/*", "");
      const nodeModulesDir = path.resolve(dir, "node_modules", aliasName);
      if (existsSync(nodeModulesDir)) {
        conflicts.push(
          `${alias} overlaps with installed package "${aliasName}"`
        );
      }
    }
  }

  if (conflicts.length === 0) {
    console.log("✅ No conflicting path aliases found.");
  } else {
    console.log("⚠️ Found conflicting path aliases:");
    conflicts.forEach((c) => console.log(` - ${c}`));
  }
}

// -----------------
// 3. Walk all subdirectories for package.json / tsconfig.json
// -----------------
function walk(dir, callback) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      callback(fullPath);
      walk(fullPath, callback);
    }
  }
}

// -----------------
// Run checks
// -----------------
console.log("🚀 Scanning project...\n");

walk(process.cwd(), (dir) => {
  if (existsSync(path.join(dir, "package.json"))) {
    checkDuplicatePackages(dir);
  }
  if (existsSync(path.join(dir, "tsconfig.json"))) {
    checkTsConfigPaths(dir);
  }
});
