const fs = require('fs');
const path = require('path');

/**
 * Script to automatically detect version directories and update VitePress config
 * Run from build-scripts folder
 */

const docsDir = path.dirname(__dirname); // Go up one level from build-scripts to docs
const configPath = path.join(docsDir, '.vitepress', 'config.ts');
const versionSwitcherPath = path.join(docsDir, '.vitepress', 'theme', 'components', 'VersionSwitcher.vue');
const homeVersionSelectorPath = path.join(docsDir, '.vitepress', 'theme', 'components', 'HomeVersionSelector.vue');

function getVersionDirectories() {
  const versions = [];
  const versionsDir = path.join(docsDir, 'versions');
  
  try {
    // Check if versions directory exists
    if (!fs.existsSync(versionsDir)) {
      console.log('No versions directory found. Please create docs/versions/ and add version directories inside it.');
      return versions;
    }
    
    const entries = fs.readdirSync(versionsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        versions.push({
          text: entry.name,
          link: `/${entry.name}/`,
          label: entry.name,
          value: `/${entry.name}/`
        });
      }
    }
    
    // Sort versions alphabetically (you can customize this sorting logic as needed)
    versions.sort((a, b) => {
      // Try to sort by version numbers if they follow semantic versioning
      const aMatch = a.text.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
      const bMatch = b.text.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?/);
      
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
      
      // Fallback to alphabetical sorting (reverse order for newest first)
      return b.text.localeCompare(a.text);
    });
  } catch (error) {
    console.error('Could not read version directories:', error);
  }
  
  return versions;
}

function updateConfigFile(versions) {
  try {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    const versionArrayString = versions.map(v => `  { text: "${v.text}", link: "${v.link}" }`).join(',\n');
    const newVersionsSection = `const versions = [\n${versionArrayString},\n];`;
    
    // Replace the versions array in the config
    configContent = configContent.replace(
      /const versions = \[[\s\S]*?\];/,
      newVersionsSection
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('Updated VitePress config with versions:', versions.map(v => v.text).join(', '));
  } catch (error) {
    console.error('Error updating config file:', error);
  }
}

function updateVersionSwitcher(versions) {
  try {
    let switcherContent = fs.readFileSync(versionSwitcherPath, 'utf8');
    
    const versionArrayString = versions.map(v => `  { label: "${v.label}", value: "${v.value}" }`).join(',\n');
    const newVersionsSection = `const versions: Version[] = [\n${versionArrayString},\n];`;
    
    // Replace the versions array in the component
    switcherContent = switcherContent.replace(
      /const versions: Version\[\] = \[[\s\S]*?\];/,
      newVersionsSection
    );
    
    fs.writeFileSync(versionSwitcherPath, switcherContent);
    console.log('Updated VersionSwitcher component');
  } catch (error) {
    console.error('Error updating VersionSwitcher component:', error);
  }
}

function updateHomeVersionSelector(versions) {
  try {
    let homeVersionSelectorContent = fs.readFileSync(homeVersionSelectorPath, 'utf8');
    
    const versionArrayString = versions.map(v => `  { label: "${v.label}", value: "${v.value}" }`).join(',\n');
    const newVersionsSection = `const versions: Version[] = [\n${versionArrayString},\n];`;
    
    // Replace the versions array in the component
    homeVersionSelectorContent = homeVersionSelectorContent.replace(
      /const versions: Version\[\] = \[[\s\S]*?\];/,
      newVersionsSection
    );
    
    fs.writeFileSync(homeVersionSelectorPath, homeVersionSelectorContent);
    console.log('Updated HomeVersionSelector component');
  } catch (error) {
    console.error('Error updating HomeVersionSelector component:', error);
  }
}

function runSidebarGeneration() {
  try {
    const { exec } = require('child_process');
    exec('node build-scripts/generate-sidebar.cjs', { cwd: docsDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('Error running sidebar generation:', error);
        return;
      }
      if (stderr) {
        console.error('Sidebar generation stderr:', stderr);
      }
      console.log(stdout);
    });
  } catch (error) {
    console.error('Error running sidebar generation script:', error);
  }
}

function main() {
  console.log('🔍 Scanning for version directories...');
  const versions = getVersionDirectories();
  
  if (versions.length === 0) {
    console.log('No version directories found in docs/versions/ directory');
    return;
  }
  
  console.log(`Found ${versions.length} version(s):`, versions.map(v => v.text).join(', '));
  
  updateConfigFile(versions);
  updateVersionSwitcher(versions);
  updateHomeVersionSelector(versions);
  
  console.log('Generating sidebar configuration...');
  runSidebarGeneration();
}

if (require.main === module) {
  main();
}

module.exports = { getVersionDirectories, updateConfigFile, updateVersionSwitcher, updateHomeVersionSelector };