// Directory structure and permissions diagnostic script
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('==== Discord Translator Bot Data Structure Check ====');

// Define key directories
const dataDir = path.join(__dirname, 'data');
const serversDir = path.join(dataDir, 'servers');
const configDir = path.join(__dirname, 'config');

// Run all checks
async function checkDirectories() {
  console.log('Checking required directories...');
  
  // Check config directory
  console.log('\nChecking config directory...');
  if (fs.existsSync(configDir)) {
    console.log(`✅ Config directory exists: ${configDir}`);
    
    // Check if default.json exists
    const defaultConfigPath = path.join(configDir, 'default.json');
    if (fs.existsSync(defaultConfigPath)) {
      console.log(`✅ Default config file exists: ${defaultConfigPath}`);
      
      // Verify default.json is readable
      try {
        const configContent = fs.readFileSync(defaultConfigPath, 'utf8');
        const configData = JSON.parse(configContent);
        console.log('✅ Default config file is valid JSON');
      } catch (error) {
        console.error(`❌ Error reading default config: ${error.message}`);
      }
    } else {
      console.error(`❌ Default config file MISSING: ${defaultConfigPath}`);
    }
  } else {
    console.error(`❌ Config directory MISSING: ${configDir}`);
  }
  
  // Check data directory
  console.log('\nChecking data directory...');
  if (fs.existsSync(dataDir)) {
    console.log(`✅ Data directory exists: ${dataDir}`);
  } else {
    console.error(`❌ Data directory MISSING: ${dataDir}`);
    console.log('Creating data directory...');
    try {
      fs.mkdirSync(dataDir);
      console.log(`✅ Created data directory: ${dataDir}`);
    } catch (error) {
      console.error(`❌ Failed to create data directory: ${error.message}`);
      return;
    }
  }
  
  // Check servers directory
  console.log('\nChecking servers directory...');
  if (fs.existsSync(serversDir)) {
    console.log(`✅ Servers directory exists: ${serversDir}`);
  } else {
    console.error(`❌ Servers directory MISSING: ${serversDir}`);
    console.log('Creating servers directory...');
    try {
      fs.mkdirSync(serversDir);
      console.log(`✅ Created servers directory: ${serversDir}`);
    } catch (error) {
      console.error(`❌ Failed to create servers directory: ${error.message}`);
      return;
    }
  }
  
  // Count server config files
  console.log('\nChecking existing server configs...');
  try {
    const serverFiles = fs.readdirSync(serversDir).filter(file => file.endsWith('.json'));
    console.log(`Found ${serverFiles.length} server configuration files`);
    
    if (serverFiles.length > 0) {
      console.log('Server config files:');
      serverFiles.forEach(file => {
        console.log(`- ${file}`);
      });
    } else {
      console.log('No server config files found - this may be normal if no sessions have been started yet');
    }
  } catch (error) {
    console.error(`❌ Error reading servers directory: ${error.message}`);
  }
  
  // Test writing a server config
  console.log('\nTesting server config write permissions...');
  const testServerId = 'test-server-123';
  const testServerConfig = {
    mode: 'korean',
    model: 'gpt4o',
    autoTranslate: true,
    stats: {
      totalTranslations: 0,
      totalTokens: 0,
      sessionsStarted: 0,
      lastUsed: new Date().toISOString()
    }
  };
  
  try {
    const testConfigPath = path.join(serversDir, `${testServerId}.json`);
    fs.writeFileSync(testConfigPath, JSON.stringify(testServerConfig, null, 2), 'utf8');
    console.log(`✅ Successfully wrote test server config: ${testConfigPath}`);
    
    // Try reading it back
    const readConfig = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'));
    console.log('✅ Successfully read test server config');
    
    // Clean up test file
    fs.unlinkSync(testConfigPath);
    console.log('✅ Cleaned up test server config file');
  } catch (error) {
    console.error(`❌ Server config write/read test failed: ${error.message}`);
  }
  
  console.log('\nDirectory structure check complete!');
}

// Run all checks
checkDirectories().catch(error => {
  console.error('Fatal error during directory checks:', error);
});
