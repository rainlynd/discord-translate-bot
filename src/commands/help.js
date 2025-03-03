// Command to show help information

export default {
  name: 'help',
  async execute(message, args, client) {
    // Load configuration to get command descriptions
    const fs = await import('fs-extra');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    // Get the current file's directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Get command descriptions from config
    let commandDescriptions;
    try {
      const configPath = path.join(__dirname, '../../../config/default.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      commandDescriptions = config.commandDescriptions || {};
    } catch (error) {
      console.error('Error loading command descriptions:', error);
      commandDescriptions = {};
    }
    
    // Default descriptions if not in config
    const defaultDescriptions = {
      start: 'Start a translation session in the current channel',
      end: 'End the current translation session',
      mode: 'Switch language mode (korean/japanese)',
      model: 'Switch AI model (gpt4o/claude/gemini)',
      stats: 'Show translation statistics',
      help: 'Show this help message'
    };
    
    // Get prefix from config or use default
    let prefix = '!';
    try {
      const configPath = path.join(__dirname, '../../../config/default.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      prefix = config.prefix || '!';
    } catch (error) {
      console.error('Error loading prefix:', error);
    }
    
    // Create help message
    const helpMessage = `🤖 **Discord Translation Bot Help**

**Available Commands:**
• \`${prefix}start\` - ${commandDescriptions.start || defaultDescriptions.start}
• \`${prefix}end\` - ${commandDescriptions.end || defaultDescriptions.end}
• \`${prefix}mode [korean|japanese]\` - ${commandDescriptions.mode || defaultDescriptions.mode}
• \`${prefix}model [gpt4o|claude|gemini]\` - ${commandDescriptions.model || defaultDescriptions.model}
• \`${prefix}stats\` - ${commandDescriptions.stats || defaultDescriptions.stats}
• \`${prefix}help\` - ${commandDescriptions.help || defaultDescriptions.help}

**How It Works:**
1. Start a translation session with \`${prefix}start\` in a specific channel
2. Send messages in any supported language (English, Korean, Japanese)
3. The bot automatically detects the language and translates when needed
4. Translation appears as a reply with source and target language indicators
5. End the session with \`${prefix}end\` when you're done

**Language Modes:**
• **Korean Mode**: Translates Korean ↔ English and Japanese → Korean
• **Japanese Mode**: Translates Japanese ↔ English and Korean → Japanese`;

    // Send help message
    return message.reply({
      content: helpMessage,
      allowedMentions: { repliedUser: false }
    });
  }
};
