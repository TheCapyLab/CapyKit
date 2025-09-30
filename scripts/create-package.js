#!/usr/bin/env node

import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

function createPackage(packageName) {
  const packageDir = resolve(rootDir, "packages", packageName);

  // Check if package already exists
  if (fs.existsSync(packageDir)) {
    console.error(
      `❌ Package "${packageName}" already exists at ${packageDir}`
    );
    process.exit(1);
  }

  console.log(`🆕 Creating package "${packageName}"...`);

  // Create package directory structure
  fs.mkdirSync(packageDir, { recursive: true });
  fs.mkdirSync(resolve(packageDir, "src"), { recursive: true });
  fs.mkdirSync(resolve(packageDir, "scripts"), { recursive: true });

  // Create package.json
  const packageJson = {
    name: `@thecapylab/${packageName}`,
    version: "0.1.0",
    type: "module",
    main: "./index.cjs.js",
    module: "./index.esm.js",
    types: "./index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        import: "./index.esm.js",
        require: "./index.cjs.js",
        default: "./index.esm.js",
      },
    },
    scripts: {
      build: "vite build",
    },
    author: "TheCapyLab",
    license: "MIT",
    description: `${packageName} package for CapyKit`,
    dependencies: {},
  };

  fs.writeFileSync(
    resolve(packageDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create .npmignore
  const npmignore = `# Source files
/src
/scripts
/tests
/test

# Build tools
vite.config.ts
tsconfig.json

# Development
*.log
.DS_Store
node_modules/
`;

  fs.writeFileSync(resolve(packageDir, ".npmignore"), npmignore);

  // Create src/index.ts
  const indexTs = `// ${packageName} exports
export {}`;

  fs.writeFileSync(resolve(packageDir, "src", "index.ts"), indexTs);

  // Create vite.config.ts
  const viteConfig = `import { createSharedConfig } from '../../vite.config.shared'

export default createSharedConfig({
  packageName: '${packageName}',
  entry: 'src/index.ts',
  outputDir: 'dist'
})`;

  fs.writeFileSync(resolve(packageDir, "vite.config.ts"), viteConfig);

  // Update workspace file
  updateWorkspaceFile(packageName);

  // Update build script to include new package
  updateBuildScript(packageName);

  // Update pack script to include new package
  updatePackScript(packageName);

  // Update root package.json scripts
  updateRootPackageJson(packageName);

  // Update GitHub Actions workflow
  updateGitHubWorkflow(packageName);

  // Update workspace tasks
  updateWorkspaceTasks(packageName);

  console.log(`✅ Package "${packageName}" created successfully!`);
  console.log(`📁 Location: ${packageDir}`);
  console.log(`🔧 Run "npm run build:${packageName}" to build this package`);
  console.log(`📦 Run "npm run pack:${packageName}" to pack this package`);
}

function updateWorkspaceFile(packageName) {
  const workspaceFile = resolve(rootDir, "capykit.code-workspace");

  try {
    const workspaceContent = fs.readFileSync(workspaceFile, "utf-8");

    // Strip single-line comments for JSON parsing
    const jsonContent = workspaceContent.replace(/\/\/.*$/gm, "");
    const workspace = JSON.parse(jsonContent);

    // Check if package folder already exists
    const packagePath = `./packages/${packageName}`;
    const existingFolder = workspace.folders.find(
      (folder) => folder.path === packagePath
    );

    if (!existingFolder) {
      // Add new folder with a proper name
      const packageDisplayName =
        packageName.charAt(0).toUpperCase() + packageName.slice(1);
      workspace.folders.push({
        name: packageDisplayName,
        path: packagePath,
      });

      // Write back with proper formatting, preserving comments
      const updatedContent = workspaceContent.replace(
        /"folders":\s*\[([\s\S]*?)\]/,
        (match, foldersContent) => {
          const newFolderEntry = `    { "name": "${packageDisplayName}", "path": "${packagePath}" }`;
          return `"folders": [${foldersContent.trim()},\n${newFolderEntry}\n  ]`;
        }
      );

      fs.writeFileSync(workspaceFile, updatedContent);
      console.log(`📝 Updated workspace file`);
    } else {
      console.log(`📝 Package folder already exists in workspace`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not update workspace file: ${error.message}`);
  }
}

function updateBuildScript(packageName) {
  const buildScriptPath = resolve(__dirname, "build.js");

  try {
    let buildScript = fs.readFileSync(buildScriptPath, "utf-8");

    // Check if package already exists
    if (
      buildScript.includes(`name: '${packageName}'`) ||
      buildScript.includes(`name: "${packageName}"`)
    ) {
      console.log(`🔧 Package already exists in build script`);
      return;
    }

    // Find the packages array and add new package before the closing bracket
    const packagesRegex = /(const packages = \[[\s\S]*?)\n?\];/;
    const match = buildScript.match(packagesRegex);

    if (match) {
      const existingContent = match[1];
      const newPackageEntry = `  { name: "${packageName}", path: "packages/${packageName}" }`;

      // Check if we need to add a comma (if there are existing entries)
      const needsComma = existingContent.trim().endsWith("}");
      const comma = needsComma ? "," : "";

      const updatedPackages = `${existingContent}${comma}\n${newPackageEntry}\n];`;
      buildScript = buildScript.replace(packagesRegex, updatedPackages);

      fs.writeFileSync(buildScriptPath, buildScript);
      console.log(`🔧 Updated build script`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not update build script: ${error.message}`);
  }
}

function updatePackScript(packageName) {
  const packScriptPath = resolve(__dirname, "pack.js");

  try {
    let packScript = fs.readFileSync(packScriptPath, "utf-8");

    // Check if package already exists
    if (
      packScript.includes(`name: '${packageName}'`) ||
      packScript.includes(`name: "${packageName}"`)
    ) {
      console.log(`📦 Package already exists in pack script`);
      return;
    }

    // Find the packages array and add new package before the closing bracket
    const packagesRegex = /(const packages = \[[\s\S]*?)\n?\];/;
    const match = packScript.match(packagesRegex);

    if (match) {
      const existingContent = match[1];
      const newPackageEntry = `  { name: "${packageName}", path: "packages/${packageName}" }`;

      // Check if we need to add a comma (if there are existing entries)
      const needsComma = existingContent.trim().endsWith("}");
      const comma = needsComma ? "," : "";

      const updatedPackages = `${existingContent}${comma}\n${newPackageEntry}\n];`;
      packScript = packScript.replace(packagesRegex, updatedPackages);

      fs.writeFileSync(packScriptPath, packScript);
      console.log(`📦 Updated pack script`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not update pack script: ${error.message}`);
  }
}

function updateRootPackageJson(packageName) {
  const packageJsonPath = resolve(rootDir, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Add build and pack scripts for the new package
    packageJson.scripts[
      `build:${packageName}`
    ] = `node scripts/build.js ${packageName}`;
    packageJson.scripts[
      `pack:${packageName}`
    ] = `node scripts/pack.js ${packageName}`;

    // Replace dev:packs with pack:all if it exists
    if (packageJson.scripts["dev:packs"]) {
      delete packageJson.scripts["dev:packs"];
      if (!packageJson.scripts["pack:all"]) {
        packageJson.scripts["pack:all"] = "node scripts/pack.js --collect";
      }
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`📝 Updated root package.json scripts`);
  } catch (error) {
    console.warn(`⚠️  Could not update root package.json: ${error.message}`);
  }
}

function updateGitHubWorkflow(packageName) {
  const workflowPath = resolve(rootDir, ".github", "workflows", "publish.yml");

  try {
    let workflow = fs.readFileSync(workflowPath, "utf-8");

    // Check if package already exists in options
    if (workflow.includes(`"${packageName}"`)) {
      console.log(`🚀 Package already exists in GitHub workflow`);
      return;
    }

    // Add package to workflow_dispatch options - find the options section and insert properly
    const lines = workflow.split("\n");
    let insertIndex = -1;
    let inOptionsSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "options:") {
        inOptionsSection = true;
      } else if (
        inOptionsSection &&
        line.trim() === "" &&
        lines[i + 1] &&
        !lines[i + 1].trim().startsWith("-")
      ) {
        // Found the end of options section (empty line before jobs or other section)
        insertIndex = i;
        break;
      }
    }

    if (insertIndex !== -1) {
      lines.splice(insertIndex, 0, `          - "${packageName}"`);
      workflow = lines.join("\n");
    }

    // Add package to matrix strategy with proper comma handling
    const matrixRegex = /(package:\s*\[)([^\]]*)\]/;
    const matrixMatch = workflow.match(matrixRegex);

    if (matrixMatch) {
      const currentPackages = matrixMatch[2].trim();
      const separator = currentPackages ? ", " : "";
      const updatedMatrix = `${matrixMatch[1]}${currentPackages}${separator}${packageName}]`;
      workflow = workflow.replace(matrixRegex, updatedMatrix);
    }

    fs.writeFileSync(workflowPath, workflow);
    console.log(`🚀 Updated GitHub Actions workflow`);
  } catch (error) {
    console.warn(`⚠️  Could not update GitHub workflow: ${error.message}`);
  }
}

function updateWorkspaceTasks(packageName) {
  const workspaceFile = resolve(rootDir, "capykit.code-workspace");

  try {
    let workspaceContent = fs.readFileSync(workspaceFile, "utf-8");

    // Check if tasks for this package already exist
    if (workspaceContent.includes(`🔨 Build ${packageName}`)) {
      console.log(`🛠️  Package tasks already exist in workspace`);
      return;
    }

    // Remove comments for parsing, but preserve original format
    const cleanContent = workspaceContent.replace(
      /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
      ""
    );

    let workspace;
    try {
      workspace = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn(`⚠️  Could not parse workspace file: ${parseError.message}`);
      return;
    }

    // Create build task for the new package
    const buildTask = {
      label: `🔨 Build ${packageName}`,
      type: "shell",
      command: "npm",
      args: ["run", `build:${packageName}`],
      group: "build",
      options: {
        cwd: "${workspaceFolder:Root}",
      },
      presentation: {
        echo: true,
        reveal: "silent",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: [],
    };

    // Create pack task for the new package
    const packTask = {
      label: `📦 Pack ${packageName}`,
      type: "shell",
      command: "npm",
      args: ["run", `pack:${packageName}`],
      group: "build",
      options: {
        cwd: "${workspaceFolder:Root}",
      },
      presentation: {
        echo: true,
        reveal: "silent",
        focus: false,
        panel: "shared",
        showReuseMessage: true,
        clear: false,
      },
      problemMatcher: [],
    };

    // Add tasks to workspace
    workspace.tasks.tasks.push(buildTask, packTask);

    // Convert back to JSON with proper formatting
    const updatedContent = JSON.stringify(workspace, null, 2);

    // Restore comments if they existed
    const hasComments =
      workspaceContent.includes("/*") || workspaceContent.includes("//");
    const finalContent = hasComments
      ? `// VS Code Workspace Configuration\n${updatedContent}`
      : updatedContent;

    fs.writeFileSync(workspaceFile, finalContent);
    console.log(`🛠️  Added workspace tasks for ${packageName}`);
  } catch (error) {
    console.warn(`⚠️  Could not update workspace tasks: ${error.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const packageName = args[0];

  if (!packageName) {
    console.error("❌ Please provide a package name");
    console.log("Usage: node scripts/create-package.js <package-name>");
    process.exit(1);
  }

  // Validate package name
  if (!/^[a-z][a-z0-9-]*$/.test(packageName)) {
    console.error(
      "❌ Package name must start with a letter and contain only lowercase letters, numbers, and hyphens"
    );
    process.exit(1);
  }

  createPackage(packageName);
}

main();
