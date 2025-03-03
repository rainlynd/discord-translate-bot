#!/usr/bin/env node
/**
 * Health check script for Discord Translation Bot
 * 
 * This script verifies that all required services and configurations are
 * working correctly. Run it inside the Docker container to diagnose issues.
 */

import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const DATA_DIR = path.join(__dirname, 'data');
const MEMORY_PATH = path.join(DATA_DIR, 'translations.json');
const CONFIG_DIR = path.join(__dirname, 'config');
const CONFIG_PATH = path.join(CONFIG_DIR, 'default.json');

console.log('=== Discord Translation Bot Health Check ===');
console.log(`Running in: ${process.cwd()}`);
console.log(`Node version: ${process.version}`);
console.log('Timestamp:', new Date().toISOString());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check environment variables
console.log('\n--- Checking Environment Variables ---');
const envVars = [
  { name: 'DISCORD_TOKEN', required: true },
  { name: 'OPENAI_API_KEY', required: false },
  { name: 'ANTHROPIC_API_KEY', required: false },
  { name: 'GOOGLE_API_KEY', required: false },
];

let envErrors = 0;
let hasAnyModelKey = false;

for (const envVar of envVars) {
  const value = process.env[envVar.name];
  if (!value && envVar.required) {
    console.error(`❌ Required env var ${envVar.name} is missing`);
    envErrors++;
  } else if (!value) {
    console.warn(`⚠️ Optional env var ${envVar.name} is not set`);
  } else {
    if (envVar.name !== 'DISCORD_TOKEN') {
      hasAnyModelKey = true;
    }
    console.log(`✅ ${envVar.name} is set${envVar.name === 'DISCORD_TOKEN' ? ' (' + value.substring(0, 5) + '...' + value.substring(value.length - 3) + ')' : ''}`);
  }
}

if (!hasAnyModelKey) {
  console.error('❌ At least one AI model API key must be set');
  envErrors++;
}

// Check file system access
console.log('\n--- Checking File System Access ---');
try {
  // Check config access
  if (fs.existsSync(CONFIG_PATH)) {
    const config = fs.readJSONSync(CONFIG_PATH);
    console.log(`✅ Config file found with ${Object.keys(config).length} keys`);
  } else {
    console.error('❌ Config file not found');
  }

  // Check data directory
  fs.ensureDirSync(DATA_DIR);
  console.log('✅ Data directory exists/created');
  
  // Try writing a test file
  const testPath = path.join(DATA_DIR, 'health-check-test.json');
  fs.writeJSONSync(testPath, { timestamp: Date.now() });
  fs.removeSync(testPath);
  console.log('✅ Data directory is writable');
  
  // Check translation memory
  if (fs.existsSync(MEMORY_PATH)) {
    try {
      const memory = fs.readJSONSync(MEMORY_PATH);
      const entryCount = Object.keys(memory).length;
      console.log(`✅ Translation memory loaded with ${entryCount} entries`);
    } catch (error) {
      console.error('❌ Translation memory file is corrupt:', error.message);
    }
  } else {
    console.log('ℹ️ Translation memory file doesn\'t exist yet (normal for first run)');
  }
} catch (error) {
  console.error('❌ File system error:', error.message);
}

// Final assessment
console.log('\n--- Health Check Summary ---');
if (envErrors > 0) {
  console.error(`❌ Found ${envErrors} environment variable issues that must be fixed`);
} else {
  console.log('✅ All required environment variables are set');
}

console.log('\nDocker container setup appears to be complete. To check if the Discord bot connects successfully,');
console.log('run the container and check the logs with: docker-compose logs -f');
