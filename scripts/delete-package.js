#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

function showUsage() {
  console.log(`
🗑️  Delete Package Script

Usage: node scripts/delete-package.js <package-name>

This script will:
  📁 Remove the package directory
  📝 Update VS Code workspace file
  🔧 Remove from build script
  📦 Remove from pack script
  📝 Remove scripts from root package.json
  🚀 Remove from GitHub Actions workflow
  🛠️  Remove from workspace tasks

Example:
  node scripts/delete-package.js my-package
`);
}

function validatePackageName(packageName) {
  if (!packageName) {
    console.error("❌ Package name is required");
    showUsage();
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(packageName)) {
    console.error(
      "❌ Package name must contain only lowercase letters, numbers, and hyphens"
    );
    process.exit(1);
  }

  return packageName;
}

function checkPackageExists(packageName) {
  const packageDir = resolve(rootDir, "packages", packageName);

  if (!fs.existsSync(packageDir)) {
    console.error(`❌ Package "${packageName}" does not exist`);
    process.exit(1);
  }

  return packageDir;
}

function deletePackageDirectory(packageDir, packageName) {
  try {
    fs.rmSync(packageDir, { recursive: true, force: true });
    console.log(`📁 Deleted package directory: ${packageName}`);
  } catch (error) {
    console.warn(`⚠️  Could not delete package directory: ${error.message}`);
  }
}

function updateWorkspaceFile(packageName) {
  const workspaceFile = resolve(rootDir, "capykit.code-workspace");

  try {
    let workspaceContent = fs.readFileSync(workspaceFile, "utf-8");

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

    // Remove the package folder from workspace
    const packagePath = `packages/${packageName}`;
    workspace.folders = workspace.folders.filter(
      (folder) => !folder.path.includes(packagePath)
    );

    // Convert back to JSON with proper formatting
    const updatedContent = JSON.stringify(workspace, null, 2);

    // Restore comments if they existed
    const hasComments =
      workspaceContent.includes("/*") || workspaceContent.includes("//");
    const finalContent = hasComments
      ? `// VS Code Workspace Configuration\n${updatedContent}`
      : updatedContent;

    fs.writeFileSync(workspaceFile, finalContent);
    console.log(`📝 Updated workspace file`);
  } catch (error) {
    console.warn(`⚠️  Could not update workspace file: ${error.message}`);
  }
}

function updateBuildScript(packageName) {
  const buildScriptPath = resolve(__dirname, "build.js");

  try {
    let buildScript = fs.readFileSync(buildScriptPath, "utf-8");

    // Check if package exists in build script
    if (
      !buildScript.includes(`name: '${packageName}'`) &&
      !buildScript.includes(`name: "${packageName}"`)
    ) {
      console.log(`🔧 Package not found in build script`);
      return;
    }

    // Remove the package entry and any trailing comma
    const packageRegex = new RegExp(
      `\\s*,?\\s*{\\s*name:\\s*["']${packageName}["'],\\s*path:\\s*["']packages/${packageName}["']\\s*}\\s*,?`,
      "g"
    );
    buildScript = buildScript.replace(packageRegex, "");

    // Clean up any double commas or trailing commas
    buildScript = buildScript.replace(/,\s*,/g, ",");
    buildScript = buildScript.replace(/,(\s*\])/g, "$1");

    fs.writeFileSync(buildScriptPath, buildScript);
    console.log(`🔧 Updated build script`);
  } catch (error) {
    console.warn(`⚠️  Could not update build script: ${error.message}`);
  }
}

function updatePackScript(packageName) {
  const packScriptPath = resolve(__dirname, "pack.js");

  try {
    let packScript = fs.readFileSync(packScriptPath, "utf-8");

    // Check if package exists in pack script
    if (
      !packScript.includes(`name: '${packageName}'`) &&
      !packScript.includes(`name: "${packageName}"`)
    ) {
      console.log(`📦 Package not found in pack script`);
      return;
    }

    // Remove the package entry and any trailing comma
    const packageRegex = new RegExp(
      `\\s*,?\\s*{\\s*name:\\s*["']${packageName}["'],\\s*path:\\s*["']packages/${packageName}["']\\s*}\\s*,?`,
      "g"
    );
    packScript = packScript.replace(packageRegex, "");

    // Clean up any double commas or trailing commas
    packScript = packScript.replace(/,\s*,/g, ",");
    packScript = packScript.replace(/,(\s*\])/g, "$1");

    fs.writeFileSync(packScriptPath, packScript);
    console.log(`📦 Updated pack script`);
  } catch (error) {
    console.warn(`⚠️  Could not update pack script: ${error.message}`);
  }
}

function updateRootPackageJson(packageName) {
  const packageJsonPath = resolve(rootDir, "package.json");

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    // Remove build and pack scripts for the package
    delete packageJson.scripts[`build:${packageName}`];
    delete packageJson.scripts[`pack:${packageName}`];

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );
    console.log(`📝 Updated root package.json scripts`);
  } catch (error) {
    console.warn(`⚠️  Could not update root package.json: ${error.message}`);
  }
}

function updateGitHubWorkflow(packageName) {
  const workflowPath = resolve(rootDir, ".github", "workflows", "publish.yml");

  try {
    let workflow = fs.readFileSync(workflowPath, "utf-8");

    // Check if package exists in workflow
    if (!workflow.includes(`"${packageName}"`)) {
      console.log(`🚀 Package not found in GitHub workflow`);
      return;
    }

    // Remove package from workflow_dispatch options - find the exact line and remove it
    const lines = workflow.split("\n");
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      return !(trimmed === `- "${packageName}"`);
    });
    workflow = filteredLines.join("\n");

    // Remove package from matrix strategy with proper comma handling
    const matrixRegex = /(package:\s*\[)([^\]]*)\]/;
    const matrixMatch = workflow.match(matrixRegex);

    if (matrixMatch) {
      let packages = matrixMatch[2]
        .split(",")
        .map((pkg) => pkg.trim())
        .filter(
          (pkg) => pkg && pkg !== packageName && pkg !== `"${packageName}"`
        );

      // Ensure proper formatting
      const formattedPackages = packages.join(", ");
      const updatedMatrix = `${matrixMatch[1]}${formattedPackages}]`;
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

    // Check if tasks for this package exist
    if (
      !workspaceContent.includes(`🔨 Build ${packageName}`) &&
      !workspaceContent.includes(`📦 Pack ${packageName}`)
    ) {
      console.log(`🛠️  No package tasks found in workspace`);
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

    // Remove build and pack tasks for this package
    workspace.tasks.tasks = workspace.tasks.tasks.filter(
      (task) =>
        !task.label.includes(`Build ${packageName}`) &&
        !task.label.includes(`Pack ${packageName}`)
    );

    // Convert back to JSON with proper formatting
    const updatedContent = JSON.stringify(workspace, null, 2);

    // Restore comments if they existed
    const hasComments =
      workspaceContent.includes("/*") || workspaceContent.includes("//");
    const finalContent = hasComments
      ? `// VS Code Workspace Configuration\n${updatedContent}`
      : updatedContent;

    fs.writeFileSync(workspaceFile, finalContent);
    console.log(`🛠️  Removed workspace tasks for ${packageName}`);
  } catch (error) {
    console.warn(`⚠️  Could not update workspace tasks: ${error.message}`);
  }
}

function cleanupArtifacts(packageName) {
  try {
    // Remove any generated packs
    const packsDir = resolve(rootDir, "packs");
    if (fs.existsSync(packsDir)) {
      const packFiles = fs.readdirSync(packsDir);
      const packagePacks = packFiles.filter(
        (file) => file.includes(packageName) && file.endsWith(".tgz")
      );

      packagePacks.forEach((packFile) => {
        const packPath = resolve(packsDir, packFile);
        fs.unlinkSync(packPath);
        console.log(`🗑️  Removed pack file: ${packFile}`);
      });
    }

    // Remove any artifacts
    const artifactsDir = resolve(rootDir, "artifacts");
    if (fs.existsSync(artifactsDir)) {
      const artifactFiles = fs.readdirSync(artifactsDir);
      const packageArtifacts = artifactFiles.filter(
        (file) => file.includes(packageName) && file.endsWith(".tgz")
      );

      packageArtifacts.forEach((artifactFile) => {
        const artifactPath = resolve(artifactsDir, artifactFile);
        fs.unlinkSync(artifactPath);
        console.log(`🗑️  Removed artifact: ${artifactFile}`);
      });
    }
  } catch (error) {
    console.warn(`⚠️  Could not clean up artifacts: ${error.message}`);
  }
}

function main() {
  const packageName = process.argv[2];

  console.log("🗑️  Delete Package Script Starting...");
  console.log("📋 Arguments:", process.argv.slice(2));

  if (!packageName) {
    showUsage();
    process.exit(1);
  }

  const validatedName = validatePackageName(packageName);
  const packageDir = checkPackageExists(validatedName);

  console.log(`🗑️  Deleting package "${validatedName}"...`);

  // Perform all cleanup operations
  deletePackageDirectory(packageDir, validatedName);
  updateWorkspaceFile(validatedName);
  updateBuildScript(validatedName);
  updatePackScript(validatedName);
  updateRootPackageJson(validatedName);
  updateGitHubWorkflow(validatedName);
  updateWorkspaceTasks(validatedName);
  cleanupArtifacts(validatedName);

  console.log(`✅ Package "${validatedName}" deleted successfully!`);
  console.log(`🧹 All references and artifacts have been cleaned up`);
}

// Check if this script is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
