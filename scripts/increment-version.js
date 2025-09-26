#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function incrementVersion(type) {
  const packagePath = resolve(process.cwd(), 'package.json');
  
  try {
    // Read current package.json
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Parse version
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Increment based on type
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      default:
        throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', or 'patch'.`);
    }
    
    // Update package.json
    packageJson.version = newVersion;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`Version updated from ${currentVersion} to ${newVersion}`);
    console.log(`Updated package.json`);
    
    return newVersion;
  } catch (error) {
    console.error('Error updating version:', error.message);
    process.exit(1);
  }
}

// Get version type from command line argument
const versionType = process.argv[2];
if (!versionType) {
  console.error('Please specify version type: major, minor, or patch');
  process.exit(1);
}

incrementVersion(versionType);