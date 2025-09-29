#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { execSync } from 'child_process';

function createPacks() {
  const rootPath = process.cwd();
  const packsDir = resolve(rootPath, 'packs');
  const packagesDir = resolve(rootPath, 'packages');
  
  try {
    console.log('Starting pack creation process...\n');
    
    if (existsSync(packsDir)) {
      console.log('Packs directory exists, emptying it...');
      rmSync(packsDir, { recursive: true, force: true });
      console.log('Packs directory emptied');
    } else {
      console.log('Packs directory does not exist');
    }
    
    mkdirSync(packsDir, { recursive: true });
    console.log('Packs directory created\n');
    
    if (!existsSync(packagesDir) || !statSync(packagesDir).isDirectory()) {
      throw new Error('Packages directory not found');
    }
    
    const packageDirs = readdirSync(packagesDir).filter(dir => {
      const packagePath = join(packagesDir, dir);
      return statSync(packagePath).isDirectory() && 
             existsSync(join(packagePath, 'package.json'));
    });
    
    if (packageDirs.length === 0) {
      console.log('No packages found in /packages directory');
      return;
    }
    
    console.log(`Found ${packageDirs.length} packages to pack:`);
    packageDirs.forEach(dir => {
      const packagePath = join(packagesDir, dir, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
      console.log(`  - ${packageJson.name} (${dir})`);
    });
    console.log('');
    
    const packedFiles = [];
    
    for (const dir of packageDirs) {
      const packagePath = join(packagesDir, dir);
      const packageJsonPath = join(packagePath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      console.log(`Packing ${packageJson.name}...`);
      
      try {
        const packCommand = `cd "${packagePath}" && npm pack --pack-destination "${packsDir}"`;
        const result = execSync(packCommand, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const lines = result.trim().split('\n');
        const packedFile = lines[lines.length - 1];
        
        if (packedFile && packedFile.endsWith('.tgz')) {
          packedFiles.push(packedFile);
          console.log(`Successfully packed: ${packedFile}`);
        } else {
          console.log(`Successfully packed ${packageJson.name}`);
          packedFiles.push(`${packageJson.name} (filename not detected)`);
        }
      } catch (error) {
        console.error(`Failed to pack ${packageJson.name}:`, error.message);
      }
    }
    
    console.log('\nPack creation completed!');
    console.log(`Packs directory: ${packsDir}`);
    console.log(`Packed ${packedFiles.length}/${packageDirs.length} packages:`);
    packedFiles.forEach(file => console.log(`  - ${file}`));
    
    if (packedFiles.length < packageDirs.length) {
      console.log('\nSome packages failed to pack. Check the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error during pack creation:', error.message);
    process.exit(1);
  }
}

createPacks();