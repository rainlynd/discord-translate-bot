// Debug script for Discord Translator Bot
import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable more detailed verbose logging
console.debug = (...args) => console.log('[DEBUG]', ...args);

// Check if environment variables are set
if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN is required in .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY || !process.env.GOOGLE_API_KEY) {
  console.warn('WARNING: One or more API keys are missing. Some translation models may not work.');
}

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction
  ]
});

// Store commands and active translation sessions
client.commands = new Collection();
client.activeSessions = new Map();

// Debug function to view active sessions
function logActiveSessions() {
  console.debug('Active Sessions:');
  if (client.activeSessions.size === 0) {
    console.debug('  No active sessions');
  } else {
    client.activeSessions.forEach((session, channelId) => {
      console.debug(`  Channel ID: ${channelId}`);
      console.debug(`    Server ID: ${session.serverId}`);
      console.debug(`    Start Time: ${session.startTime}`);
      console.debug(`    Translations: ${session.translations}`);
    });
  }
}

// Load commands
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('Loading commands...');

// Monkey patch the start command to add more debugging
async function patchStartCommand() {
  const startCommandPath = path.join(commandsPath, 'start.js');
  const startCommandModule = await import(`file://${startCommandPath}`);
  const originalExecute = startCommandModule.default.execute;
  
  startCommandModule.default.execute = async function(message, args, client) {
    console.debug('Start command executed');
    console.debug(`Channel ID: ${message.channel.id}`);
    console.debug(`Server ID: ${message.guild.id}`);
    
    const result = await originalExecute.call(this, message, args, client);
    
    console.debug('After start command execution:');
    logActiveSessions();
    
    return result;
  };
  
  return startCommandModule.default;
}

// Load all commands with special handling for start.js
(async () => {
  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      
      if (file === 'start.js') {
        const command = await patchStartCommand();
        client.commands.set(command.name, command);
        console.log(`Loaded command with debug: ${command.name}`);
      } else {
        const commandModule = await import(`file://${filePath}`);
        const command = commandModule.default;
        
        if ('name' in command && 'execute' in command) {
          client.commands.set(command.name, command);
          console.log(`Loaded command: ${command.name}`);
        } else {
          console.warn(`Command at ${filePath} is missing required properties`);
        }
      }
    } catch (error) {
      console.error(`Error loading command ${file}:`, error);
    }
  }
})();

// Patch the message create event for debugging
async function setupDebugMessageHandler() {
  const eventsPath = path.join(__dirname, 'src', 'events');
  const messageCreatePath = path.join(eventsPath, 'messageCreate.js');
  
  try {
    // Import original handler
    const messageCreateModule = await import(`file://${messageCreatePath}`);
    const originalExecute = messageCreateModule.default.execute;
    
    // Create enhanced handler with debugging
    client.on('messageCreate', async (message) => {
      // Skip bot messages to prevent spam
      if (message.author.bot) return;
      
      console.debug('=== Message received ===');
      console.debug(`Channel: ${message.channel.name} (${message.channel.id})`);
      console.debug(`Author: ${message.author.tag} (${message.author.id})`);
      console.debug(`Content: "${message.content}"`);
      
      // Log active sessions before processing
      console.debug('Active Sessions Check:');
      const channelHasSession = client.activeSessions.has(message.channel.id);
      console.debug(`Channel ${message.channel.id} has active session: ${channelHasSession}`);
      logActiveSessions();
      
      try {
        // Call original handler
        await originalExecute(message, client);
      } catch (error) {
        console.error('Error in messageCreate handler:', error);
      }
    });
    
    console.log('Patched messageCreate event with debugging');
  } catch (error) {
    console.error('Failed to patch messageCreate event:', error);
  }
}

// Patch translation service for debugging
async function patchTranslationService() {
  try {
    const translationServicePath = path.join(__dirname, 'src', 'services', 'translationService.js');
    const translationModule = await import(`file://${translationServicePath}`);
    
    // Store original functions
    const originalTranslateMessage = translationModule.translateMessage;
    const originalDetectLanguage = translationModule.detectLanguage;
    const originalShouldTranslate = translationModule.shouldTranslate;
    
    // Patched functions with logging
    translationModule.detectLanguage = (text) => {
      const result = originalDetectLanguage(text);
      console.debug(`Language detection: "${text.substring(0, 20)}..." => ${result}`);
      return result;
    };
    
    translationModule.shouldTranslate = (detectedLang, mode) => {
      const result = originalShouldTranslate(detectedLang, mode);
      console.debug(`Should translate check: Lang=${detectedLang}, Mode=${mode} => ${result}`);
      return result;
    };
    
    translationModule.translateMessage = async (message, serverConfig) => {
      console.debug('=== Translation attempt ===');
      console.debug(`Channel: ${message.channel.id}`);
      console.debug(`Message: "${message.content.substring(0, 30)}..."`);
      console.debug(`Server config:`, JSON.stringify(serverConfig, null, 2));
      
      try {
        const result = await originalTranslateMessage(message, serverConfig);
        
        if (result) {
          console.debug('Translation successful:');
          console.debug(`Source: ${result.sourceLang}, Target: ${result.targetLang}`);
          console.debug(`Original: "${result.original}"`);
          console.debug(`Translated: "${result.translated}"`);
          console.debug(`Tokens: ${JSON.stringify(result.tokens)}`);
        } else {
          console.debug('No translation returned (null result)');
        }
        
        return result;
      } catch (error) {
        console.error('Translation error:', error);
        return null;
      }
    };
    
    console.log('Patched translation service with debugging');
  } catch (error) {
    console.error('Failed to patch translation service:', error);
  }
}

// Patch server config functions
async function patchServerConfig() {
  try {
    const serverConfigPath = path.join(__dirname, 'src', 'utils', 'serverConfig.js');
    const serverConfigModule = await import(`file://${serverConfigPath}`);
    
    const originalLoadServerConfig = serverConfigModule.loadServerConfig;
    
    serverConfigModule.loadServerConfig = (serverId) => {
      console.debug(`Loading server config for ${serverId}`);
      
      try {
        const config = originalLoadServerConfig(serverId);
        console.debug(`Server config loaded:`, JSON.stringify(config, null, 2));
        return config;
      } catch (error) {
        console.error(`Error in loadServerConfig:`, error);
        const defaultConfig = serverConfigModule.getDefaultConfig();
        console.debug(`Using default config:`, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
      }
    };
    
    console.log('Patched server config with debugging');
  } catch (error) {
    console.error('Failed to patch server config:', error);
  }
}

// Set up all debug patches and event handlers
async function setupDebugEnvironment() {
  await setupDebugMessageHandler();
  await patchTranslationService();
  await patchServerConfig();
  
  // Log ready event
  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is ready in ${client.guilds.cache.size} servers!`);
    
    // Log active servers
    console.log('Connected servers:');
    client.guilds.cache.forEach(guild => {
      console.log(`- ${guild.name} (${guild.id})`);
    });
  });
  
  // Test each API key to verify they are working
  console.log('Testing API keys...');
  
  // Test OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    console.log('OpenAI API key is set - will test on first translation');
  } else {
    console.error('OpenAI API key is not set');
  }
  
  // Test Anthropic API key
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Anthropic API key is set - will test on first translation');
  } else {
    console.error('Anthropic API key is not set');
  }
  
  // Test Google API key
  if (process.env.GOOGLE_API_KEY) {
    console.log('Google API key is set - will test on first translation');
  } else {
    console.error('Google API key is not set');
  }
}

// Handle process events for clean shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  client.destroy();
  process.exit(0);
});

// Initialize everything and start
(async () => {
  try {
    await setupDebugEnvironment();
    
    // Log in to Discord
    console.log('Connecting to Discord...');
    await client.login(process.env.DISCORD_TOKEN);
    console.log('Bot is online!');
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
})();
