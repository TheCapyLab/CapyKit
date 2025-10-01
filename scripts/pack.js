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

function packPackage(packageInfo) {
  const { name, path } = packageInfo;
  const packageDir = resolve(rootDir, path);
  const distDir = resolve(packageDir, "dist");

  if (!fs.existsSync(distDir)) {
    console.error(`❌ No dist directory found for ${name}. Run build first.`);
    return null;
  }

  console.log(`📦 Packing ${name}...`);

  try {
    // Run npm pack in the dist directory
    const output = execSync("npm pack", {
      cwd: distDir,
      encoding: "utf-8",
    }).trim();

    const tarballName = output.split("\\n").pop();
    const tarballPath = resolve(distDir, tarballName);

    console.log(`✅ Packed ${name}: ${tarballName}`);
    return tarballPath;
  } catch (error) {
    console.error(`❌ Failed to pack ${name}:`, error.message);
    return null;
  }
}

function collectArtifacts(tarballPaths) {
  const artifactsDir = resolve(rootDir, "artifacts");

  // Create artifacts directory
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  console.log(`\n📂 Collecting artifacts in ${artifactsDir}...`);

  for (const tarballPath of tarballPaths) {
    if (tarballPath) {
      const fileName = tarballPath.split(/[\\\\\\/]/).pop();
      const destPath = resolve(artifactsDir, fileName);

      fs.copyFileSync(tarballPath, destPath);
      console.log(`📋 Copied ${fileName}`);

      // Remove the original tarball from the package dist directory
      try {
        fs.unlinkSync(tarballPath);
        console.log(`🗑️  Removed ${fileName} from package dist`);
      } catch (error) {
        console.warn(`⚠️  Could not remove ${tarballPath}: ${error.message}`);
      }
    }
  }

  console.log(`\n✨ Artifacts collected and package dist directories cleaned`);
}

function main() {
  const args = process.argv.slice(2);
  const targetPackage = args[0];
  const collectFlag = args.includes("--collect");

  let tarballPaths = [];

  if (targetPackage && targetPackage !== "--collect") {
    // Pack specific package
    const packageInfo = packages.find((pkg) => pkg.name === targetPackage);
    if (!packageInfo) {
      console.error(
        `❌ Package "${targetPackage}" not found. Available packages: ${packages
          .map((p) => p.name)
          .join(", ")}`
      );
      process.exit(1);
    }

    const tarballPath = packPackage(packageInfo);
    if (tarballPath) {
      tarballPaths.push(tarballPath);
    }
  } else {
    // Pack all packages
    console.log("📦 Packing all packages...");

    for (const packageInfo of packages) {
      const tarballPath = packPackage(packageInfo);
      if (tarballPath) {
        tarballPaths.push(tarballPath);
      }
    }
  }

  // Always collect artifacts and clean up dist directories
  if (tarballPaths.length > 0) {
    collectArtifacts(tarballPaths);
  }

  const successCount = tarballPaths.filter(Boolean).length;
  const totalCount =
    targetPackage && targetPackage !== "--collect" ? 1 : packages.length;

  if (successCount === totalCount) {
    console.log(`\\n🎉 Successfully packed ${successCount} package(s)!`);
  } else {
    console.log(`\\n⚠️  Packed ${successCount}/${totalCount} packages`);
    process.exit(1);
  }
}

main();
