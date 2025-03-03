// Event handler for when the bot is ready
import { ActivityType } from 'discord.js';

export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is ready in ${client.guilds.cache.size} servers!`);
    
    // Set bot activity using ActivityType from discord.js v14
    client.user.setActivity('!help | Translating...', { type: ActivityType.Playing });
    
    // Log active servers
    console.log('Connected servers:');
    client.guilds.cache.forEach(guild => {
      console.log(`- ${guild.name} (${guild.id})`);
    });
  }
};
