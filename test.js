import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

// Check environment variable
console.log('DISCORD_TOKEN defined:', !!process.env.DISCORD_TOKEN);

// Initialize a client but don't connect
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Simple event handler
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  // Test activity setting
  try {
    client.user.setActivity('Testing...', { type: ActivityType.Playing });
    console.log('Activity set successfully');
  } catch (error) {
    console.error('Error setting activity:', error);
  }
  
  // Cleanup and exit
  setTimeout(() => {
    console.log('Test complete, exiting');
    client.destroy();
    process.exit(0);
  }, 2000);
});

// Log any errors
client.on('error', error => {
  console.error('Client error:', error);
});

// Attempt to connect
console.log('Attempting to connect to Discord...');
console.log('(NOTE: This will fail with placeholder token values)');

// Only attempt login if token seems valid
if (process.env.DISCORD_TOKEN && 
    process.env.DISCORD_TOKEN.length > 20 && 
    process.env.DISCORD_TOKEN !== 'your_discord_bot_token_here') {
  client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Login successful'))
    .catch(error => {
      console.error('Login failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('Not attempting login - please set a valid DISCORD_TOKEN in .env');
  
  // Test imports
  console.log('Testing imports...');
  Promise.all([
    import('franc').then(() => console.log('✓ franc imported successfully')),
    import('fs-extra').then(() => console.log('✓ fs-extra imported successfully')),
    import('path').then(() => console.log('✓ path imported successfully')),
    import('./src/utils/translationMemory.js')
      .then(() => console.log('✓ translationMemory.js imported successfully'))
      .catch(e => console.error('× translationMemory.js import failed:', e.message))
  ]).catch(e => console.error('Import test failed:', e));
}
