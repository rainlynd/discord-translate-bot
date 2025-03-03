// Dependency checker for Discord Translator Bot
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==== Discord Translator Bot Dependency Check ====');

// Critical dependencies for the bot
const CRITICAL_DEPENDENCIES = [
  'discord.js',
  'openai',
  '@anthropic-ai/sdk',
  '@google/generative-ai',
  'dotenv',
  'franc',
  'fs-extra'
];

// Check package.json exists
function checkPackageJson() {
  console.log('\nChecking package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    return null;
  }
  
  try {
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log('✅ package.json found and parsed');
    return packageData;
  } catch (error) {
    console.error(`❌ Error parsing package.json: ${error.message}`);
    return null;
  }
}

// Check Node.js version
function checkNodeVersion() {
  console.log('\nChecking Node.js version...');
  const nodeVersion = process.version;
  console.log(`Current Node.js version: ${nodeVersion}`);
  
  // Extract major version
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0], 10);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is recommended for this bot');
    console.log('Some features may not work correctly with your current version');
  } else {
    console.log('✅ Node.js version is compatible');
  }
}

// Check installed dependencies
function checkInstalledDependencies(packageData) {
  console.log('\nChecking installed dependencies...');
  
  if (!packageData) {
    console.error('❌ Cannot check dependencies without valid package.json');
    return;
  }
  
  const dependencies = {
    ...packageData.dependencies,
    ...packageData.devDependencies
  };
  
  const missingDeps = [];
  
  // Check each critical dependency
  for (const dep of CRITICAL_DEPENDENCIES) {
    console.log(`Checking ${dep}...`);
    
    // Check if in package.json
    if (!dependencies[dep]) {
      console.error(`❌ ${dep} is not listed in package.json`);
      missingDeps.push(dep);
      continue;
    }
    
    // Check if actually installed
    try {
      const depPath = path.join(__dirname, 'node_modules', dep);
      if (!fs.existsSync(depPath)) {
        console.error(`❌ ${dep} is in package.json but not installed`);
        missingDeps.push(dep);
        continue;
      }
      
      // Try to import the module
      try {
        // We'll use dynamic import which works with ES modules
        import(dep).then(() => {
          console.log(`✅ ${dep} is installed and importable`);
        }).catch(err => {
          console.error(`❌ ${dep} cannot be imported: ${err.message}`);
          missingDeps.push(dep);
        });
      } catch (error) {
        console.error(`❌ Error testing import for ${dep}: ${error.message}`);
      }
      
    } catch (error) {
      console.error(`❌ Error checking ${dep}: ${error.message}`);
      missingDeps.push(dep);
    }
  }
  
  return missingDeps;
}

// Offer to install missing dependencies
function offerToInstallMissing(missingDeps) {
  if (!missingDeps || missingDeps.length === 0) {
    console.log('\n✅ All critical dependencies are installed!');
    return;
  }
  
  console.log('\n⚠️ Missing dependencies detected:');
  missingDeps.forEach(dep => console.log(`  - ${dep}`));
  
  console.log('\nYou should install the missing dependencies with:');
  console.log(`\nnpm install ${missingDeps.join(' ')}\n`);
  
  // For automated install in the future:
  // console.log('Installing missing dependencies...');
  // try {
  //   execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
  //   console.log('✅ Dependencies installed successfully');
  // } catch (error) {
  //   console.error(`❌ Failed to install dependencies: ${error.message}`);
  // }
}

// Run all checks
async function runChecks() {
  const packageData = checkPackageJson();
  checkNodeVersion();
  const missingDeps = await checkInstalledDependencies(packageData);
  offerToInstallMissing(missingDeps);
  
  console.log('\n==== Dependency check complete! ====');
}

// Run all checks
runChecks().catch(error => {
  console.error('Fatal error during dependency checks:', error);
});
