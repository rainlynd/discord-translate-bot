// Command to show translation statistics

export default {
  name: 'stats',
  async execute(message, args, client) {
    const { loadServerConfig } = await import('../utils/serverConfig.js');
    
    // Get server ID
    const serverId = message.guild.id;
    
    // Get server config with stats
    const serverConfig = loadServerConfig(serverId);
    
    // Get active sessions count for this server
    let activeSessionsCount = 0;
    client.activeSessions.forEach(session => {
      if (session.serverId === serverId) {
        activeSessionsCount++;
      }
    });
    
    // Calculate total tokens used in current sessions
    let currentSessionTokens = 0;
    client.activeSessions.forEach(session => {
      if (session.serverId === serverId) {
        currentSessionTokens += session.totalTokens;
      }
    });
    
    // Format last used date
    const lastUsed = new Date(serverConfig.stats.lastUsed);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedLastUsed = new Intl.DateTimeFormat('en-US', options).format(lastUsed);
    
    // Send stats message
    return message.reply({
      content: `📊 **Translation Statistics for This Server**

**Current Status:**
• Mode: ${serverConfig.mode === 'korean' ? '🇰🇷 Korean' : '🇯🇵 Japanese'}
• Model: ${serverConfig.model}
• Active Sessions: ${activeSessionsCount}

**Usage Statistics:**
• Total Translations: ${serverConfig.stats.totalTranslations}
• Total Tokens Used: ${serverConfig.stats.totalTokens + currentSessionTokens}
• Sessions Started: ${serverConfig.stats.sessionsStarted}
• Last Used: ${formattedLastUsed}`,
      allowedMentions: { repliedUser: false }
    });
  }
};
