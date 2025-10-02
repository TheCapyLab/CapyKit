#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(packageRoot, "src");
const packageJsonPath = path.join(packageRoot, "package.json");
const indexTsPath = path.join(srcRoot, "index.ts");

console.log("Generating exports...");

// Find all composable directories
function findComposableDirs() {
  const composables = [];
  const items = fs.readdirSync(srcRoot, { withFileTypes: true });

  for (const item of items) {
    // Skip non-directories and excluded folders
    if (
      !item.isDirectory() ||
      ["scripts", "node_modules", ".git", ".vscode", "dist", "build"].includes(
        item.name
      ) ||
      item.name.startsWith(".")
    ) {
      continue;
    }

    const composablePath = path.join(srcRoot, item.name);
    const indexTsExists = fs.existsSync(path.join(composablePath, "index.ts"));
    const tsFileExists = fs
      .readdirSync(composablePath)
      .some(
        (file) =>
          file.endsWith(".ts") && file !== "index.ts" && file !== "index.d.ts"
      );

    // Must have index.ts and at least one TypeScript file to be considered a composable
    if (indexTsExists && tsFileExists) {
      // Get the composable name from the TypeScript file (assume starts with 'use')
      const tsFiles = fs
        .readdirSync(composablePath)
        .filter(
          (file) =>
            file.endsWith(".ts") && file !== "index.ts" && file !== "index.d.ts"
        );

      let composableName = item.name; // fallback to directory name

      if (tsFiles.length > 0) {
        // Use the first TypeScript file name (without .ts extension) as composable name
        composableName = tsFiles[0].replace(".ts", "");
      }

      composables.push({
        dirName: item.name,
        composableName: composableName,
        path: composablePath,
      });
    }
  }

  return composables;
}

// Update package.json exports
function updatePackageJsonExports(composables) {
  let packageJson;

  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    console.error("Error reading package.json:", error.message);
    process.exit(1);
  }

  // Build exports object
  const exports = {
    ".": {
      types: "./index.d.ts",
      import: "./index.esm.js",
      require: "./index.cjs.js",
      default: "./index.esm.js",
    },
  };

  // Add each composable export for tree shaking
  for (const composable of composables) {
    exports[`./${composable.dirName}`] = {
      types: `./${composable.dirName}/index.d.ts`,
      import: `./${composable.dirName}/index.esm.js`,
      require: `./${composable.dirName}/index.cjs.js`,
      default: `./${composable.dirName}/index.esm.js`,
    };
  }

  packageJson.exports = exports;

  try {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );
    console.log(
      `Updated package.json exports for ${composables.length} composables`
    );
  } catch (error) {
    console.error("Error writing package.json:", error.message);
    process.exit(1);
  }
}

// Update main index.ts
function updateIndexTs(composables) {
  let content = "";

  for (const composable of composables) {
    content += `export * from './${composable.dirName}';\n`;
  }

  try {
    fs.writeFileSync(indexTsPath, content);
    console.log(
      `Updated index.ts with ${composables.length} composable exports`
    );
  } catch (error) {
    console.error("Error writing index.ts:", error.message);
    process.exit(1);
  }
}

// Main execution
try {
  const composables = findComposableDirs();

  if (composables.length === 0) {
    console.log("No composables found to export");
    console.log("Composables must have: index.ts and at least one .ts file");

    // Still update files with empty content
    fs.writeFileSync(indexTsPath, "");

    // Update package.json with minimal exports
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.exports = {
      ".": {
        types: "./index.d.ts",
        import: "./index.esm.js",
        require: "./index.cjs.js",
        default: "./index.esm.js",
      },
    };
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );

    process.exit(0);
  }

  console.log(`Found ${composables.length} composables:`);
  composables.forEach((comp) => {
    console.log(`   - ${comp.composableName} (./${comp.dirName}/)`);
  });

  updatePackageJsonExports(composables);
  updateIndexTs(composables);

  console.log("\nExports generated successfully!");
  console.log("\nSummary:");
  console.log(
    `   - Updated package.json with ${composables.length} export paths`
  );
  console.log(`   - Updated index.ts with re-exports`);
  console.log("\nAvailable imports:");
  console.log(
    `   import { ${composables
      .map((c) => c.composableName)
      .join(", ")} } from "@thecapylab/capykitcomposables"`
  );
  composables.forEach((comp) => {
    console.log(
      `   import { ${comp.composableName} } from "@thecapylab/capykitcomposables/${comp.dirName}"`
    );
  });
} catch (error) {
  console.error("Error generating exports:", error.message);
  process.exit(1);
}
