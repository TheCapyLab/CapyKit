const fs = require('fs');
const path = require('path');

/**
 * Script to visualize the current documentation structure
 * Run from build-scripts folder
 */

const docsDir = path.dirname(__dirname); // Go up one level from build-scripts to docs

function drawTree(dirPath, basePath = '', indent = '') {
  let output = '';
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    // Sort entries: directories first, then files
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    
    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const nextIndent = indent + (isLast ? '    ' : '│   ');
      
      if (entry.isDirectory()) {
        output += `${indent}${connector}${entry.name}/\n`;
        const subPath = path.join(dirPath, entry.name);
        output += drawTree(subPath, `${basePath}/${entry.name}`, nextIndent);
      } else if (entry.name.endsWith('.md')) {
        output += `${indent}${connector}${entry.name}\n`;
      } else if (!entry.name.startsWith('.') && !entry.name.endsWith('.cjs')) {
        output += `${indent}${connector}${entry.name}\n`;
      }
    });
  } catch (error) {
    output += `${indent}Error reading directory: ${error.message}\n`;
  }
  
  return output;
}

function showVersionStructure() {
  console.log('CapyKit Documentation Structure\n');
  
  const versionsDir = path.join(docsDir, 'versions');
  
  try {
    if (!fs.existsSync(versionsDir)) {
      console.log('No versions directory found. Please create docs/versions/ and add version directories inside it.');
      return;
    }
    
    const entries = fs.readdirSync(versionsDir, { withFileTypes: true });
    const versions = entries.filter(entry => entry.isDirectory());
    
    if (versions.length === 0) {
      console.log('No version directories found in docs/versions/');
      return;
    }
    
    // Sort versions (try semantic versioning first, then alphabetical)
    versions.sort((a, b) => {
      const aMatch = a.name.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
      const bMatch = b.name.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
      
      if (aMatch && bMatch) {
        const aMajor = parseInt(aMatch[1]);
        const aMinor = parseInt(aMatch[2]);
        const aPatch = parseInt(aMatch[3] || '0');
        const bMajor = parseInt(bMatch[1]);
        const bMinor = parseInt(bMatch[2]);
        const bPatch = parseInt(bMatch[3] || '0');
        
        if (aMajor !== bMajor) return bMajor - aMajor;
        if (aMinor !== bMinor) return bMinor - aMinor;
        return bPatch - aPatch;
      }
      
      return b.name.localeCompare(a.name);
    });
    
    console.log(`Found ${versions.length} version(s):\n`);
    
    versions.forEach((version, index) => {
      console.log(`${version.name}`);
      const versionPath = path.join(versionsDir, version.name);
      const tree = drawTree(versionPath, `/${version.name}`, '');
      console.log(tree);
      
      // Show what this generates in sidebar
      const componentsPath = path.join(versionPath, 'components');
      if (fs.existsSync(componentsPath)) {
        console.log(`   → Sidebar: Overview, Getting Started, Components, Component Library`);
        
        const componentEntries = fs.readdirSync(componentsPath, { withFileTypes: true });
        const dirs = componentEntries.filter(e => e.isDirectory()).map(e => e.name);
        const files = componentEntries.filter(e => e.name.endsWith('.md')).map(e => e.name.replace('.md', ''));
        
        if (dirs.length > 0) {
          console.log(`   →    Accordions: ${dirs.join(', ')}`);
        }
        if (files.length > 0) {
          console.log(`   →    Direct Links: ${files.join(', ')}`);
        }
      } else {
        console.log(`   →    Sidebar: Overview, Getting Started, Components (basic)`);
      }
      
      if (index < versions.length - 1) {
        console.log('');
      }
    });
    
  } catch (error) {
    console.error('Error scanning versions:', error);
  }
}

function main() {
  showVersionStructure();
}

if (require.main === module) {
  main();
}

module.exports = { showVersionStructure, drawTree };