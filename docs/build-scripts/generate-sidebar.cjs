const fs = require('fs');
const path = require('path');

/**
 * Script to automatically generate sidebar configuration based on directory structure
 * Run from build-scripts folder
 */

const docsDir = path.dirname(__dirname); // Go up one level from build-scripts to docs

function formatName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function scanDirectory(dirPath, basePath) {
  const items = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    // Sort entries: directories first, then files
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Create accordion for directories
        const subItems = scanDirectory(fullPath, `${basePath}/${entry.name}`);
        if (subItems.length > 0) {
          items.push({
            text: formatName(entry.name),
            items: subItems,
            collapsed: true
          });
        }
      } else if (entry.name.endsWith('.md')) {
        // Create link for markdown files
        const fileName = entry.name.replace('.md', '');
        items.push({
          text: formatName(fileName),
          link: `${basePath}/${fileName}`
        });
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${dirPath}:`, error);
  }
  
  return items;
}

function generateSidebarForVersion(version) {
  const versionsDir = path.join(docsDir, 'versions');
  const versionPath = path.join(versionsDir, version);
  const componentsPath = path.join(versionPath, 'components');
  
  const sidebar = [
    {
      text: 'Overview',
      link: `/${version}/`
    },
    {
      text: 'Getting Started',
      link: `/${version}/getting-started`
    },
    {
      text: 'Components',  
      link: `/${version}/components`
    }
  ];

  // Generate components section if it exists
  if (fs.existsSync(componentsPath)) {
    const componentItems = scanDirectory(componentsPath, `/${version}/components`);
    if (componentItems.length > 0) {
      sidebar.push({
        text: 'Component Library',
        collapsed: false,
        items: componentItems
      });
    }
  }

  return sidebar;
}

function generateSidebarConfig() {
  const sidebar = {};
  const versionsDir = path.join(docsDir, 'versions');
  
  try {
    if (!fs.existsSync(versionsDir)) {
      return sidebar;
    }
    
    const entries = fs.readdirSync(versionsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const versionSidebar = generateSidebarForVersion(entry.name);
        sidebar[`/${entry.name}/`] = versionSidebar;
      }
    }
  } catch (error) {
    console.warn('Could not generate sidebar config:', error);
  }
  
  return sidebar;
}

function updateSidebarFile() {
  const sidebarConfig = generateSidebarConfig();
  const sidebarPath = path.join(docsDir, '.vitepress', 'utils', 'sidebar.ts');
  
  const content = `interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

interface SidebarConfig {
  [key: string]: SidebarItem[];
}

/**
 * Format file/directory name for display
 */
function formatName(name: string): string {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Auto-generated sidebar configuration
 * Generated on: ${new Date().toISOString()}
 */
export function getSidebarConfig(): SidebarConfig {
  return ${JSON.stringify(sidebarConfig, null, 2)};
}`;

  try {
    fs.writeFileSync(sidebarPath, content);
    console.log('Updated sidebar configuration');
    console.log('Generated sidebars for versions:', Object.keys(sidebarConfig).join(', '));
  } catch (error) {
    console.error('Error updating sidebar file:', error);
  }
}

function main() {
  console.log('Scanning for version directories and components...');
  
  const versions = [];
  const versionsDir = path.join(docsDir, 'versions');
  
  try {
    if (!fs.existsSync(versionsDir)) {
      console.log('No versions directory found. Please create docs/versions/ and add version directories inside it.');
      return;
    }
    
    const entries = fs.readdirSync(versionsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        versions.push(entry.name);
      }
    }
  } catch (error) {
    console.error('Error scanning directories:', error);
    return;
  }

  if (versions.length === 0) {
    console.log('No version directories found in docs/versions/ directory');
    return;
  }

  console.log(`Found ${versions.length} version(s):`, versions.join(', '));
  
  // Show what will be generated
  for (const version of versions) {
    const componentsPath = path.join(versionsDir, version, 'components');
    if (fs.existsSync(componentsPath)) {
      console.log(`${version}/components/ found - will generate component navigation`);
    } else {
      console.log(`${version}/components/ not found - basic navigation only`);
    }
  }

  updateSidebarFile();
  console.log('Sidebar generation complete!');
}

if (require.main === module) {
  main();
}

module.exports = { 
  generateSidebarConfig, 
  generateSidebarForVersion, 
  scanDirectory,
  updateSidebarFile
};