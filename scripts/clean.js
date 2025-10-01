#!/usr/bin/env node

import { rmSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Clean script for CapyKit project
 * Easily extendable structure for additional cleanup tasks
 */

// Define cleanup tasks - easily extendable
const cleanupTasks = [
  {
    name: "Remove packs directory",
    description: "Removes the /artifacts directory and all its contents",
    path: "artifacts",
    action: "removeDirectory",
    enabled: true,
  },
  // Add more cleanup tasks here as needed:
  // {
  //   name: 'Remove node_modules',
  //   description: 'Removes node_modules directory',
  //   path: 'node_modules',
  //   action: 'removeDirectory',
  //   enabled: false // Set to true to enable
  // },
  // {
  //   name: 'Remove build artifacts',
  //   description: 'Removes dist/build directories',
  //   paths: ['dist', 'build'],
  //   action: 'removeMultipleDirectories',
  //   enabled: false
  // }
];

// Cleanup actions
const actions = {
  removeDirectory: (path) => {
    const fullPath = resolve(process.cwd(), path);
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });
      return { success: true, message: `Removed: ${path}` };
    } else {
      return { success: true, message: `Not found (skipped): ${path}` };
    }
  },

  removeMultipleDirectories: (paths) => {
    const results = [];
    for (const path of paths) {
      const result = actions.removeDirectory(path);
      results.push(result);
    }
    return {
      success: true,
      message: results.map((r) => r.message).join(", "),
    };
  },

  // Add more action types here as needed:
  // removeFiles: (patterns) => { ... },
  // clearCache: () => { ... },
  // etc.
};

function runCleanup() {
  console.log("🧹 Starting cleanup process...\n");

  let totalTasks = 0;
  let completedTasks = 0;
  let skippedTasks = 0;

  // Filter enabled tasks
  const enabledTasks = cleanupTasks.filter((task) => task.enabled);

  if (enabledTasks.length === 0) {
    console.log("No cleanup tasks are enabled");
    console.log(
      "Enable tasks in scripts/clean.js to perform cleanup operations"
    );
    return;
  }

  console.log(`Found ${enabledTasks.length} cleanup tasks to run:\n`);

  // Execute each cleanup task
  for (const task of enabledTasks) {
    totalTasks++;
    console.log(`${task.name}`);
    console.log(`   ${task.description}`);

    try {
      const action = actions[task.action];
      if (!action) {
        console.log(`Unknown action: ${task.action}`);
        continue;
      }

      // Execute the action with appropriate parameters
      let result;
      if (task.paths) {
        result = action(task.paths);
      } else if (task.path) {
        result = action(task.path);
      } else {
        result = action();
      }

      if (result.success) {
        console.log(`${result.message}`);
        completedTasks++;
      } else {
        console.log(`${result.message || "Task failed"}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }

    console.log(""); // Empty line for readability
  }

  // Show disabled tasks for reference
  const disabledTasks = cleanupTasks.filter((task) => !task.enabled);
  if (disabledTasks.length > 0) {
    console.log(
      `${disabledTasks.length} additional cleanup tasks available (disabled):`
    );
    disabledTasks.forEach((task) => {
      console.log(`   - ${task.name}: ${task.description}`);
    });
    console.log("   Enable them in scripts/clean.js to use\n");
  }

  // Summary
  console.log("Cleanup completed!");
  console.log(
    `Summary: ${completedTasks}/${totalTasks} tasks completed, ${skippedTasks} skipped`
  );

  if (completedTasks < totalTasks) {
    console.log(
      "Some cleanup tasks failed. Check the output above for details."
    );
    process.exit(1);
  }
}

// Export for potential programmatic use
export { cleanupTasks, actions, runCleanup };

// Run cleanup if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("clean.js")
) {
  runCleanup();
}
