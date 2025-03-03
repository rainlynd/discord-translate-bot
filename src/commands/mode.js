// Command to switch language mode (korean/japanese)

export default {
  name: 'mode',
  async execute(message, args, client) {
    const { loadServerConfig, saveServerConfig } = await import('../utils/serverConfig.js');
    
    // Get server ID
    const serverId = message.guild.id;
    
    // Get current config
    const serverConfig = loadServerConfig(serverId);
    
    // Check if an argument was provided
    if (!args.length) {
      return message.reply({
        content: `Current language mode is: **${serverConfig.mode === 'korean' ? 'Korean' : 'Japanese'}**
        
Available modes:
• \`!mode korean\` - Translates Korean ↔ English and Japanese → Korean
• \`!mode japanese\` - Translates Japanese ↔ English and Korean → Japanese`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Get the requested mode
    const requestedMode = args[0].toLowerCase();
    
    // Validate the mode
    if (requestedMode !== 'korean' && requestedMode !== 'japanese') {
      return message.reply({
        content: `❌ Invalid mode: "${requestedMode}"
        
Available modes:
• \`!mode korean\` - Translates Korean ↔ English and Japanese → Korean
• \`!mode japanese\` - Translates Japanese ↔ English and Korean → Japanese`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Check if the mode is already set
    if (serverConfig.mode === requestedMode) {
      return message.reply({
        content: `Language mode is already set to **${requestedMode === 'korean' ? 'Korean' : 'Japanese'}**`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Update the mode
    serverConfig.mode = requestedMode;
    saveServerConfig(serverId, serverConfig);
    
    // Send confirmation message
    return message.reply({
      content: `✅ Language mode changed to **${requestedMode === 'korean' ? 'Korean' : 'Japanese'}**
      
${requestedMode === 'korean' 
  ? '• Translates Korean ↔ English and Japanese → Korean' 
  : '• Translates Japanese ↔ English and Korean → Japanese'}`,
      allowedMentions: { repliedUser: false }
    });
  }
};
