// Master diagnostic script for Discord Translator Bot
import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=========================================================');
console.log('= Discord Translator Bot - Complete Diagnostic Suite   =');
console.log('=========================================================');

// Create a diagnostic report directory
const reportDir = path.join(__dirname, 'diagnostic-report');
const reportTime = new Date().toISOString().replace(/[:.]/g, '-');
const reportFile = path.join(reportDir, `diagnostic-${reportTime}.log`);

// Ensure the report directory exists
fs.ensureDirSync(reportDir);

// Create a writable stream for the report
const reportStream = fs.createWriteStream(reportFile);

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Override console methods to also write to the report file
console.log = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  reportStream.write(message + '\n');
  originalConsole.log(...args);
};

console.error = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  reportStream.write(`ERROR: ${message}\n`);
  originalConsole.error(...args);
};

console.warn = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  reportStream.write(`WARNING: ${message}\n`);
  originalConsole.warn(...args);
};

console.info = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  reportStream.write(`INFO: ${message}\n`);
  originalConsole.info(...args);
};

console.debug = (...args) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  reportStream.write(`DEBUG: ${message}\n`);
  if (originalConsole.debug) {
    originalConsole.debug(...args);
  } else {
    originalConsole.log('[DEBUG]', ...args);
  }
};

// Environment check
async function checkEnvironment() {
  console.log('\n====== ENVIRONMENT CHECK ======');
  
  // Node.js version
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);
  
  // Check if required env variables are set
  console.log('\nEnvironment Variables:');
  const hasDiscordToken = !!process.env.DISCORD_TOKEN;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasGoogleKey = !!process.env.GOOGLE_API_KEY;
  
  console.log(`DISCORD_TOKEN: ${hasDiscordToken ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`OPENAI_API_KEY: ${hasOpenAIKey ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`ANTHROPIC_API_KEY: ${hasAnthropicKey ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`GOOGLE_API_KEY: ${hasGoogleKey ? 'Set ✅' : 'Not set ❌'}`);
  
  if (!hasDiscordToken) {
    console.error('ERROR: DISCORD_TOKEN is required but not set');
    console.error('Please set this in your .env file');
  }
}

// Run directory structure check
async function checkDirectories() {
  console.log('\n====== DIRECTORY STRUCTURE CHECK ======');
  
  try {
    // Import the check-data-structure.js file if it exists
    if (fs.existsSync(path.join(__dirname, 'check-data-structure.js'))) {
      console.log('Executing directory structure check...');
      
      // We'll create a temporary function to capture the module's exports
      // and run its checks directly rather than spawning a new process
      try {
        const module = await import('./check-data-structure.js');
        // The module should run its checks automatically
      } catch (error) {
        console.error(`Failed to import directory check module: ${error.message}`);
        
        // Fallback to basic checks
        console.log('Performing basic directory checks...');
        const dataDir = path.join(__dirname, 'data');
        const serversDir = path.join(dataDir, 'servers');
        const configDir = path.join(__dirname, 'config');
        
        console.log(`Config directory exists: ${fs.existsSync(configDir)}`);
        console.log(`Data directory exists: ${fs.existsSync(dataDir)}`);
        console.log(`Servers directory exists: ${fs.existsSync(serversDir)}`);
      }
    } else {
      console.warn('check-data-structure.js not found, skipping detailed directory checks');
    }
  } catch (error) {
    console.error(`Error during directory checks: ${error.message}`);
  }
}

// Check package dependencies
async function checkDependencies() {
  console.log('\n====== DEPENDENCY CHECK ======');
  
  // Read package.json
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log(`Package name: ${packageData.name}`);
      console.log(`Version: ${packageData.version}`);
      
      // List dependencies
      console.log('\nDependencies:');
      const deps = packageData.dependencies || {};
      Object.entries(deps).forEach(([name, version]) => {
        console.log(`- ${name}: ${version}`);
      });
      
      // Critical dependencies
      const criticalDeps = [
        'discord.js',
        'openai',
        '@anthropic-ai/sdk',
        '@google/generative-ai',
        'franc'
      ];
      
      console.log('\nCritical dependencies check:');
      criticalDeps.forEach(dep => {
        const exists = !!deps[dep];
        console.log(`- ${dep}: ${exists ? 'Found ✅' : 'Missing ❌'}`);
      });
    } else {
      console.error('package.json not found');
    }
  } catch (error) {
    console.error(`Error checking dependencies: ${error.message}`);
  }
}

// Check Discord token by making a test connection
async function testDiscordConnection() {
  console.log('\n====== DISCORD CONNECTION TEST ======');
  
  if (!process.env.DISCORD_TOKEN) {
    console.error('Cannot test Discord connection without a token');
    return;
  }
  
  try {
    // We'll use the test.js file if it exists
    const testPath = path.join(__dirname, 'test.js');
    
    if (fs.existsSync(testPath)) {
      console.log('Running Discord connection test script...');
      console.log('The test script will try to connect, then exit automatically');
      console.log('Check below for connection success or failure\n');
      
      // Import the test.js module
      try {
        await import('./test.js');
      } catch (error) {
        console.error(`Error running test script: ${error.message}`);
      }
    } else {
      console.warn('test.js not found, skipping Discord connection test');
    }
  } catch (error) {
    console.error(`Error during Discord connection test: ${error.message}`);
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('Starting diagnostic process...');
  console.log(`Report will be saved to: ${reportFile}`);
  console.log('Date and time: ' + new Date().toLocaleString());
  
  try {
    await checkEnvironment();
    await checkDirectories();
    await checkDependencies();
    await testDiscordConnection();
    
    console.log('\n======================================');
    console.log('Diagnostic process complete!');
    console.log(`Full report saved to: ${reportFile}`);
    console.log('======================================');
    
    // Close the report file
    reportStream.end();
    
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    
    console.log(`\nTo run the debug version of the bot:`);
    console.log(`node debug.js`);
    
    console.log(`\nTo test your API keys:`);
    console.log(`node test-api-keys.js`);
    
    console.log(`\nSee TROUBLESHOOTING.md for more detailed debugging steps.`);
    
  } catch (error) {
    console.error('Fatal error during diagnostics:', error);
    
    // Make sure to close the report stream on error
    reportStream.end();
    
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  }
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('Uncaught error in diagnostics:', error);
});
