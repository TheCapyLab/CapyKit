#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';

function isValidSemver(version) {
  // Basic semver regex that allows for build metadata and pre-release identifiers
  // Format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

function setVersion(targetVersion) {
  const rootPath = process.cwd();
  const rootPackagePath = resolve(rootPath, 'package.json');
  
  try {
    // Validate the target version
    if (!isValidSemver(targetVersion)) {
      throw new Error(`Invalid semver version: ${targetVersion}. Must follow semver format (e.g., 1.2.3, 1.2.3-alpha.1, 1.2.3+build.123)`);
    }
    
    // Read current root package.json
    const rootPackageJson = JSON.parse(readFileSync(rootPackagePath, 'utf8'));
    const currentVersion = rootPackageJson.version;
    
    // Update root package.json
    rootPackageJson.version = targetVersion;
    writeFileSync(rootPackagePath, JSON.stringify(rootPackageJson, null, 2) + '\n');
    
    console.log(`Root version updated from ${currentVersion} to ${targetVersion}`);
    console.log(`Updated root package.json`);
    
    // Find all packages in /packages directory
    const packagesDir = resolve(rootPath, 'packages');
    const packages = [];
    
    if (statSync(packagesDir).isDirectory()) {
      const packageDirs = readdirSync(packagesDir).filter(dir => {
        const packagePath = join(packagesDir, dir);
        return statSync(packagePath).isDirectory() && 
               readdirSync(packagePath).includes('package.json');
      });
      
      // Collect package information
      for (const dir of packageDirs) {
        const packagePath = join(packagesDir, dir, 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        packages.push({
          name: packageJson.name,
          path: packagePath,
          dir: dir,
          json: packageJson
        });
      }
      
      console.log(`Found ${packages.length} packages to update:`);
      packages.forEach(pkg => console.log(`  - ${pkg.name} (${pkg.dir})`));
      
      // Update versions for all packages
      for (const pkg of packages) {
        const oldVersion = pkg.json.version;
        pkg.json.version = targetVersion;
        
        // Update dependencies that reference other packages in this monorepo
        if (pkg.json.dependencies) {
          for (const depName in pkg.json.dependencies) {
            const matchingPkg = packages.find(p => p.name === depName);
            if (matchingPkg) {
              // For semver with pre-release or build metadata, use exact version
              const versionPrefix = targetVersion.includes('-') || targetVersion.includes('+') ? '' : '^';
              pkg.json.dependencies[depName] = `${versionPrefix}${targetVersion}`;
              console.log(`  Updated dependency ${depName} to ${versionPrefix}${targetVersion} in ${pkg.name}`);
            }
          }
        }
        
        // Update devDependencies that reference other packages in this monorepo
        if (pkg.json.devDependencies) {
          for (const depName in pkg.json.devDependencies) {
            const matchingPkg = packages.find(p => p.name === depName);
            if (matchingPkg) {
              const versionPrefix = targetVersion.includes('-') || targetVersion.includes('+') ? '' : '^';
              pkg.json.devDependencies[depName] = `${versionPrefix}${targetVersion}`;
              console.log(`  Updated devDependency ${depName} to ${versionPrefix}${targetVersion} in ${pkg.name}`);
            }
          }
        }
        
        // Update peerDependencies that reference other packages in this monorepo
        if (pkg.json.peerDependencies) {
          for (const depName in pkg.json.peerDependencies) {
            const matchingPkg = packages.find(p => p.name === depName);
            if (matchingPkg) {
              const versionPrefix = targetVersion.includes('-') || targetVersion.includes('+') ? '' : '^';
              pkg.json.peerDependencies[depName] = `${versionPrefix}${targetVersion}`;
              console.log(`  Updated peerDependency ${depName} to ${versionPrefix}${targetVersion} in ${pkg.name}`);
            }
          }
        }
        
        // Write updated package.json
        writeFileSync(pkg.path, JSON.stringify(pkg.json, null, 2) + '\n');
        console.log(`Updated ${pkg.name} from ${oldVersion} to ${targetVersion}`);
        
        // Remove individual version scripts if they exist
        const scriptsDir = join(packagesDir, pkg.dir, 'scripts');
        try {
          if (statSync(scriptsDir).isDirectory()) {
            const versionScripts = ['increment-version.js', 'set-version.js'];
            for (const script of versionScripts) {
              const scriptPath = join(scriptsDir, script);
              try {
                if (statSync(scriptPath).isFile()) {
                  unlinkSync(scriptPath);
                  console.log(`  Removed ${script} from ${pkg.name}/scripts`);
                }
              } catch (err) {
                // File doesn't exist, ignore
              }
            }
          }
        } catch (err) {
          // Scripts directory doesn't exist, ignore
        }
      }
    }
    
    console.log(`\nAll packages synchronized to version ${targetVersion}`);
    return targetVersion;
  } catch (error) {
    console.error('Error setting version:', error.message);
    process.exit(1);
  }
}

// Get version from command line argument
const targetVersion = process.argv[2];
if (!targetVersion) {
  console.error('Please specify a version (e.g., 1.2.3, 1.2.3-alpha.1, 1.2.3+build.123)');
  console.error('Usage: node scripts/set-version.js <version>');
  console.error('Examples:');
  console.error('  node scripts/set-version.js 1.0.0');
  console.error('  node scripts/set-version.js 2.1.0-beta.1');
  console.error('  node scripts/set-version.js 1.0.0+build.20230929');
  console.error('  node scripts/set-version.js 1.0.0-rc.1+build.123');
  process.exit(1);
}

setVersion(targetVersion);