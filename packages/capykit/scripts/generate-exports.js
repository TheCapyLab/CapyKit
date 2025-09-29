#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.join(packageRoot, "package.json");
const indexJsPath = path.join(packageRoot, "index.js");
const indexDtsPath = path.join(packageRoot, "index.d.ts");

console.log("🔄 Generating exports...");

// Find all component directories
function findComponentDirs() {
  const components = [];
  const items = fs.readdirSync(packageRoot, { withFileTypes: true });

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

    const componentPath = path.join(packageRoot, item.name);
    const indexJsExists = fs.existsSync(path.join(componentPath, "index.js"));
    const indexDtsExists = fs.existsSync(
      path.join(componentPath, "index.d.ts")
    );
    const vueFileExists = fs
      .readdirSync(componentPath)
      .some((file) => file.endsWith(".vue"));

    // Must have index files and at least one Vue file to be considered a component
    if (indexJsExists && indexDtsExists && vueFileExists) {
      // Get the component name from the Vue file (assume PascalCase)
      const vueFiles = fs
        .readdirSync(componentPath)
        .filter((file) => file.endsWith(".vue"));
      const componentName = vueFiles[0].replace(".vue", "");

      components.push({
        dirName: item.name,
        componentName: componentName,
        path: componentPath,
      });
    }
  }

  return components;
}

// Update package.json exports
function updatePackageJsonExports(components) {
  let packageJson;

  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    console.error("❌ Error reading package.json:", error.message);
    process.exit(1);
  }

  // Build exports object
  const exports = {
    ".": {
      types: "./index.d.ts",
      import: "./index.js",
      default: "./index.js",
    },
  };

  // Add each component export
  for (const component of components) {
    exports[`./${component.dirName}`] = {
      types: `./${component.dirName}/index.d.ts`,
      import: `./${component.dirName}/index.js`,
      default: `./${component.dirName}/index.js`,
    };
  }

  packageJson.exports = exports;

  try {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );
    console.log(
      `✅ Updated package.json exports for ${components.length} components`
    );
  } catch (error) {
    console.error("❌ Error writing package.json:", error.message);
    process.exit(1);
  }
}

// Update main index.js
function updateIndexJs(components) {
  let content = "";

  for (const component of components) {
    content += `export * from "./${component.dirName}/index.js";\n`;
  }

  try {
    fs.writeFileSync(indexJsPath, content);
    console.log(
      `✅ Updated index.js with ${components.length} component exports`
    );
  } catch (error) {
    console.error("❌ Error writing index.js:", error.message);
    process.exit(1);
  }
}

// Update main index.d.ts
function updateIndexDts(components) {
  let content = "";

  for (const component of components) {
    content += `export { default as ${component.componentName} } from "./${component.dirName}/index.js";\n`;
  }

  try {
    fs.writeFileSync(indexDtsPath, content);
    console.log(
      `✅ Updated index.d.ts with ${components.length} component exports`
    );
  } catch (error) {
    console.error("❌ Error writing index.d.ts:", error.message);
    process.exit(1);
  }
}

// Main execution
try {
  const components = findComponentDirs();

  if (components.length === 0) {
    console.log("⚠️  No components found to export");
    console.log(
      "Components must have: index.js, index.d.ts, and at least one .vue file"
    );
    process.exit(0);
  }

  console.log(`📦 Found ${components.length} components:`);
  components.forEach((comp) => {
    console.log(`   - ${comp.componentName} (./${comp.dirName}/)`);
  });

  updatePackageJsonExports(components);
  updateIndexJs(components);
  updateIndexDts(components);

  console.log("\n🎉 Exports generated successfully!");
  console.log("\n📝 Summary:");
  console.log(
    `   - Updated package.json with ${components.length} export paths`
  );
  console.log(`   - Updated index.js with re-exports`);
  console.log(`   - Updated index.d.ts with type exports`);
  console.log("\n💡 Available imports:");
  console.log(
    `   import { ${components
      .map((c) => c.componentName)
      .join(", ")} } from "capykit"`
  );
  components.forEach((comp) => {
    console.log(
      `   import { ${comp.componentName} } from "capykit/${comp.dirName}"`
    );
  });
} catch (error) {
  console.error("❌ Error generating exports:", error.message);
  process.exit(1);
}
