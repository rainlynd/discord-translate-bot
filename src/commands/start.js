// Command to start a translation session in the current channel

export default {
  name: 'start',
  async execute(message, args, client) {
    const { loadServerConfig, updateServerStats } = await import('../utils/serverConfig.js');
    
    // Get channel ID and server ID
    const channelId = message.channel.id;
    const serverId = message.guild.id;
    
    // Get server config
    const serverConfig = loadServerConfig(serverId);
    
    // Check if a session is already active in this channel
    if (client.activeSessions.has(channelId)) {
      return message.reply('A translation session is already active in this channel. Use `!end` to stop it first.');
    }
    
    // Add channel to active sessions
    client.activeSessions.set(channelId, {
      serverId,
      channelId,
      startTime: new Date(),
      translations: 0,
      totalTokens: 0
    });
    
    // Update server stats
    updateServerStats(serverId, {
      sessionsStarted: serverConfig.stats.sessionsStarted + 1
    });
    
    // Send confirmation message
    return message.reply({
      content: `🎉 Translation session started in this channel!
      
Mode: **${serverConfig.mode === 'korean' ? 'Korean' : 'Japanese'}**
Model: **${serverConfig.model}**

• Messages will be automatically translated
• Use \`!end\` to stop the session
• Use \`!mode [korean|japanese]\` to change language mode
• Use \`!model [gpt4o|claude|gemini]\` to change AI model`,
      allowedMentions: { repliedUser: false }
    });
  }
};
