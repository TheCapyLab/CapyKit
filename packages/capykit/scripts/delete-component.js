#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

// Get component name from command line argument
const componentInput = process.argv[2];

if (!componentInput) {
  console.error('❌ Error: Component name or directory is required');
  console.log('Usage: node scripts/delete-component.js <ComponentName|directory-name>');
  console.log('Example: node scripts/delete-component.js Button');
  console.log('Example: node scripts/delete-component.js button');
  process.exit(1);
}

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask for user confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

// Find component directory - support both PascalCase component name and lowercase directory name
function findComponentDir(input) {
  const lowercaseInput = input.toLowerCase();
  
  // First try direct directory name match
  let componentDir = path.join(packageRoot, lowercaseInput);
  if (fs.existsSync(componentDir)) {
    return { dirName: lowercaseInput, path: componentDir };
  }
  
  // Try finding by component name (look for Vue files matching the input)
  const items = fs.readdirSync(packageRoot, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory() && 
        !['scripts', 'node_modules', '.git', '.vscode', 'dist', 'build'].includes(item.name) &&
        !item.name.startsWith('.')) {
      
      const dirPath = path.join(packageRoot, item.name);
      const vueFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.vue'));
      
      // Check if any Vue file matches the input (case insensitive)
      for (const vueFile of vueFiles) {
        const componentName = vueFile.replace('.vue', '');
        if (componentName.toLowerCase() === lowercaseInput) {
          return { dirName: item.name, path: dirPath, componentName };
        }
      }
    }
  }
  
  return null;
}

// Get component info
function getComponentInfo(componentPath) {
  const files = fs.readdirSync(componentPath);
  const vueFiles = files.filter(f => f.endsWith('.vue'));
  const hasIndexJs = files.includes('index.js');
  const hasIndexDts = files.includes('index.d.ts');
  const hasPackageJson = files.includes('package.json');
  
  return {
    vueFiles,
    hasIndexJs,
    hasIndexDts,
    hasPackageJson,
    allFiles: files,
    componentName: vueFiles.length > 0 ? vueFiles[0].replace('.vue', '') : 'Unknown'
  };
}

// Main execution
async function main() {
  try {
    console.log(`🔍 Looking for component: ${componentInput}`);
    
    const componentResult = findComponentDir(componentInput);
    
    if (!componentResult) {
      console.error(`❌ Error: Component "${componentInput}" not found`);
      console.log('\n📁 Available components:');
      
      // List available components
      const items = fs.readdirSync(packageRoot, { withFileTypes: true });
      const availableComponents = [];
      
      for (const item of items) {
        if (item.isDirectory() && 
            !['scripts', 'node_modules', '.git', '.vscode', 'dist', 'build'].includes(item.name) &&
            !item.name.startsWith('.')) {
          
          const dirPath = path.join(packageRoot, item.name);
          const vueFiles = fs.readdirSync(dirPath).filter(file => file.endsWith('.vue'));
          
          if (vueFiles.length > 0) {
            const componentName = vueFiles[0].replace('.vue', '');
            availableComponents.push(`   - ${componentName} (./${item.name}/)`);
          }
        }
      }
      
      if (availableComponents.length > 0) {
        console.log(availableComponents.join('\n'));
      } else {
        console.log('   No components found');
      }
      
      rl.close();
      process.exit(1);
    }
    
    const { dirName, path: componentPath, componentName: foundComponentName } = componentResult;
    const componentInfo = getComponentInfo(componentPath);
    
    console.log(`\n📦 Found component: ${componentInfo.componentName}`);
    console.log(`📁 Directory: ./${dirName}/`);
    console.log(`📄 Files to delete:`);
    componentInfo.allFiles.forEach(file => {
      console.log(`   - ${dirName}/${file}`);
    });
    
    // Ask for confirmation
    console.log(`\n⚠️  This will permanently delete the component and all its files!`);
    const confirmed = await askConfirmation(`Are you sure you want to delete "${componentInfo.componentName}"? (y/N): `);
    
    if (!confirmed) {
      console.log('❌ Deletion cancelled');
      rl.close();
      process.exit(0);
    }
    
    // Delete the component directory
    console.log(`\n🗑️  Deleting component...`);
    fs.rmSync(componentPath, { recursive: true, force: true });
    console.log(`✅ Deleted: ./${dirName}/`);
    
    // Ask if user wants to regenerate exports
    const regenerateExports = await askConfirmation(`\nRegenerate exports automatically? (Y/n): `);
    
    rl.close();
    
    if (regenerateExports) {
      console.log(`\n🔄 Regenerating exports...`);
      
      // Import and run the generate-exports script
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const { stdout, stderr } = await execAsync('node scripts/generate-exports.js', { 
          cwd: packageRoot 
        });
        console.log(stdout);
        if (stderr) console.error(stderr);
      } catch (error) {
        console.error('❌ Error regenerating exports:', error.message);
        console.log('💡 Please run manually: node scripts/generate-exports.js');
      }
    } else {
      console.log(`\n💡 Don't forget to run: node scripts/generate-exports.js`);
    }
    
    console.log(`\n🎉 Component "${componentInfo.componentName}" deleted successfully!`);
    
  } catch (error) {
    console.error('❌ Error deleting component:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
