import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { flushMemory } from './utils/translationMemory.js';
import { cleanupWebhooks } from './utils/webhookManager.js';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('Loading commands...');

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`file://${filePath}`);
  const command = commandModule.default;
  
  if ('name' in command && 'execute' in command) {
    client.commands.set(command.name, command);
    console.log(`Loaded command: ${command.name}`);
  } else {
    console.warn(`Command at ${filePath} is missing required properties`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

console.log('Loading events...');

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = await import(`file://${filePath}`);
  const event = eventModule.default;
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  
  console.log(`Loaded event: ${event.name}`);
}

// Handle process events for clean shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down...');
  flushMemory(); // Flush translation memory to disk
  cleanupWebhooks(); // Clean up webhook connections
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  flushMemory(); // Flush translation memory to disk
  cleanupWebhooks(); // Clean up webhook connections
  client.destroy();
  process.exit(0);
});

// Also handle unhandled rejections and exceptions to ensure data is saved
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  flushMemory();
  cleanupWebhooks();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  flushMemory();
  cleanupWebhooks();
  process.exit(1);
});

// Log in to Discord
console.log('Connecting to Discord...');
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('Bot is online!');
  })
  .catch(error => {
    console.error('Failed to connect to Discord:', error);
    process.exit(1);
  });
