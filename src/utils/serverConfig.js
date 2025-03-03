import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the server configs directory
const SERVER_CONFIG_DIR = path.join(__dirname, '../../data/servers');

// Load default config
function getDefaultConfig() {
  try {
    const defaultConfigPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    
    return {
      mode: config.defaultMode || 'korean',
      model: config.defaultModel || 'gpt4o',
      autoTranslate: config.autoTranslate !== undefined ? config.autoTranslate : true,
      stats: {
        totalTranslations: 0,
        totalTokens: 0,
        sessionsStarted: 0,
        lastUsed: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error loading default config:', error);
    
    // Fallback default config
    return {
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
  }
}

// Load server config
function loadServerConfig(serverId) {
  try {
    const serverConfigPath = path.join(SERVER_CONFIG_DIR, `${serverId}.json`);
    
    if (fs.existsSync(serverConfigPath)) {
      const data = fs.readFileSync(serverConfigPath, 'utf8');
      return JSON.parse(data);
    }
    
    // If no config exists, create one with default values
    const defaultConfig = getDefaultConfig();
    saveServerConfig(serverId, defaultConfig);
    return defaultConfig;
  } catch (error) {
    console.error(`Error loading config for server ${serverId}:`, error);
    return getDefaultConfig();
  }
}

// Save server config
function saveServerConfig(serverId, config) {
  try {
    fs.ensureDirSync(SERVER_CONFIG_DIR);
    const serverConfigPath = path.join(SERVER_CONFIG_DIR, `${serverId}.json`);
    fs.writeFileSync(serverConfigPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving config for server ${serverId}:`, error);
    return false;
  }
}

// Update server stats
function updateServerStats(serverId, stats) {
  try {
    const config = loadServerConfig(serverId);
    config.stats = { ...config.stats, ...stats, lastUsed: new Date().toISOString() };
    return saveServerConfig(serverId, config);
  } catch (error) {
    console.error(`Error updating stats for server ${serverId}:`, error);
    return false;
  }
}

export { loadServerConfig, saveServerConfig, updateServerStats, getDefaultConfig };
