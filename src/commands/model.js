// Command to switch AI translation model (gpt4o/claude/gemini)

export default {
  name: 'model',
  async execute(message, args, client) {
    const { loadServerConfig, saveServerConfig } = await import('../utils/serverConfig.js');
    
    // Get server ID
    const serverId = message.guild.id;
    
    // Get current config
    const serverConfig = loadServerConfig(serverId);
    
    // List of available models
    const availableModels = ['gpt4o', 'claude', 'gemini'];
    
    // Check if an argument was provided
    if (!args.length) {
      return message.reply({
        content: `Current AI model is: **${serverConfig.model}**
        
Available models:
• \`!model gpt4o\` - OpenAI's GPT-4o model
• \`!model claude\` - Anthropic's Claude 3.7 Sonnet model
• \`!model gemini\` - Google's Gemini 2.0 Flash model`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Get the requested model
    const requestedModel = args[0].toLowerCase();
    
    // Validate the model
    if (!availableModels.includes(requestedModel)) {
      return message.reply({
        content: `❌ Invalid model: "${requestedModel}"
        
Available models:
• \`!model gpt4o\` - OpenAI's GPT-4o model
• \`!model claude\` - Anthropic's Claude 3.7 Sonnet model
• \`!model gemini\` - Google's Gemini 2.0 Flash model`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Check if the model is already set
    if (serverConfig.model === requestedModel) {
      return message.reply({
        content: `AI model is already set to **${requestedModel}**`,
        allowedMentions: { repliedUser: false }
      });
    }
    
    // Update the model
    serverConfig.model = requestedModel;
    saveServerConfig(serverId, serverConfig);
    
    // Send confirmation message
    let modelDescription;
    switch (requestedModel) {
      case 'gpt4o':
        modelDescription = 'OpenAI\'s GPT-4o model';
        break;
      case 'claude':
        modelDescription = 'Anthropic\'s Claude 3.7 Sonnet model';
        break;
      case 'gemini':
        modelDescription = 'Google\'s Gemini 2.0 Flash model';
        break;
      default:
        modelDescription = requestedModel;
    }
    
    return message.reply({
      content: `✅ AI model changed to **${requestedModel}**
      
Now using: ${modelDescription}`,
      allowedMentions: { repliedUser: false }
    });
  }
};
