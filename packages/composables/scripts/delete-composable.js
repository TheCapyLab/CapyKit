#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(packageRoot, "src");

// Get composable name from command line argument
const composableInput = process.argv[2];

if (!composableInput) {
  console.error("Error: Composable name is required");
  console.log("Usage: node scripts/delete-composable.js <composableName>");
  console.log("Example: node scripts/delete-composable.js useCounter");
  process.exit(1);
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask for user confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(
        answer.toLowerCase().trim() === "y" ||
          answer.toLowerCase().trim() === "yes"
      );
    });
  });
}

// Find composable directory
function findComposableDir(input) {
  const composableDir = path.join(srcRoot, input);

  if (fs.existsSync(composableDir)) {
    return { dirName: input, path: composableDir };
  }

  return null;
}

// Get composable info
function getComposableInfo(composablePath) {
  const files = fs.readdirSync(composablePath);
  const tsFiles = files.filter(
    (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "index.d.ts"
  );
  const hasIndexTs = files.includes("index.ts");
  const hasIndexDts = files.includes("index.d.ts");
  const hasPackageJson = files.includes("package.json");

  let composableName = path.basename(composablePath); // fallback to directory name

  if (tsFiles.length > 0) {
    // Use the first TypeScript file name (without .ts extension) as composable name
    composableName = tsFiles[0].replace(".ts", "");
  }

  return {
    tsFiles,
    hasIndexTs,
    hasIndexDts,
    hasPackageJson,
    allFiles: files,
    composableName,
  };
}

// Main execution
async function main() {
  try {
    const composableInfo = findComposableDir(composableInput);

    if (!composableInfo) {
      console.error(`Error: Composable "${composableInput}" not found in src/`);
      console.log("\n📂 Available composables:");

      const items = fs.readdirSync(srcRoot, { withFileTypes: true });
      const composables = items
        .filter((item) => item.isDirectory() && !item.name.startsWith("."))
        .map((item) => item.name);

      if (composables.length > 0) {
        composables.forEach((comp) => console.log(`   - ${comp}`));
      } else {
        console.log("   (No composables found)");
      }

      rl.close();
      process.exit(1);
    }

    const { dirName, path: composablePath } = composableInfo;
    const info = getComposableInfo(composablePath);

    console.log(`\nComposable Information:`);
    console.log(`   Name: ${info.composableName}`);
    console.log(`   Directory: ./${dirName}/`);
    console.log(`   Files:`);
    info.allFiles.forEach((file) => {
      console.log(`     - ${file}`);
    });

    // Ask for confirmation
    const confirmed = await askConfirmation(
      `\nAre you sure you want to delete the composable "${info.composableName}"? This action cannot be undone. (y/N): `
    );

    if (!confirmed) {
      console.log("Deletion cancelled.");
      rl.close();
      return;
    }

    // Delete the composable directory
    console.log(`\nDeleting composable "${info.composableName}"...`);

    try {
      fs.rmSync(composablePath, { recursive: true, force: true });
      console.log(`Successfully deleted ./${dirName}/`);
    } catch (error) {
      console.error(`Error deleting directory:`, error.message);
      rl.close();
      process.exit(1);
    }

    // Regenerate exports
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

    console.log(`\nComposable "${info.composableName}" deleted successfully!`);
  } catch (error) {
    console.error("Unexpected error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
