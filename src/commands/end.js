// Command to end a translation session in the current channel

export default {
  name: 'end',
  async execute(message, args, client) {
    // Get channel ID
    const channelId = message.channel.id;
    
    // Check if a session is active in this channel
    if (!client.activeSessions.has(channelId)) {
      return message.reply('No active translation session in this channel. Use `!start` to begin one.');
    }
    
    // Get session data
    const session = client.activeSessions.get(channelId);
    const duration = Math.floor((new Date() - session.startTime) / 1000); // duration in seconds
    
    // Delete session
    client.activeSessions.delete(channelId);
    
    // Format duration
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    const formattedDuration = [
      hours > 0 ? `${hours}h` : '',
      minutes > 0 ? `${minutes}m` : '',
      `${seconds}s`
    ].filter(Boolean).join(' ');
    
    // Send confirmation message
    return message.reply({
      content: `🛑 Translation session ended!
      
**Session Statistics:**
• Duration: ${formattedDuration}
• Messages Translated: ${session.translations}
• Total Tokens Used: ${session.totalTokens}

Use \`!start\` to begin a new translation session.`,
      allowedMentions: { repliedUser: false }
    });
  }
};
