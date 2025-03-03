# Discord Translation Bot - Installation Guide

This guide will help you set up and run the Discord Translation Bot on your own server.

## Prerequisites

- [Node.js](https://nodejs.org/) v16.9.0 or higher
- A Discord account with permission to create and manage bots
- API keys for OpenAI, Anthropic, and Google (for the AI translation models)

## Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "TranslateBot")
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable:
   - Message Content Intent (critical for reading messages)
   - Server Members Intent
   - Presence Intent
5. Click "Reset Token" to reveal and copy your bot token (you'll need this later)
6. Go to the "OAuth2 > URL Generator" tab
7. Select the scopes: "bot" and "applications.commands"
8. In the Bot Permissions section, select these permissions:
   - Read Messages/View Channels
   - Send Messages
   - Manage Messages (for adding reactions)
   - Read Message History
   - Add Reactions
9. Copy the generated URL and open it in a browser to invite the bot to your server

## Step 2: Get API Keys

### OpenAI API Key (for GPT-4o)

1. Go to [OpenAI's platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to the [API keys section](https://platform.openai.com/api-keys)
4. Create a new secret key and copy it

### Anthropic API Key (for Claude)

1. Go to [Anthropic's console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to the [API keys section](https://console.anthropic.com/settings/keys)
4. Create a new API key and copy it

### Google API Key (for Gemini)

1. Go to [Google AI Studio](https://makersuite.google.com/app)
2. Sign up or log in
3. Navigate to the [API keys section](https://makersuite.google.com/app/apikey)
4. Create a new API key and copy it

## Step 3: Setup and Installation

1. Clone or download this repository
2. Navigate to the project directory in your terminal
3. Install dependencies:

```bash
npm install
```

4. Edit the `.env` file with your API keys:

```env
DISCORD_TOKEN=your_discord_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

## Step 4: Run the Bot

For development and testing:

```bash
npm run dev
```

For production:

```bash
npm start
```

If you want to run it permanently on a server, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/index.js --name "translate-bot"
```

## Step 5: Use the Bot

Once the bot is running and has joined your server, you can start using it:

1. In any Discord channel, type `!start` to begin a translation session
2. Send messages in English, Korean, or Japanese to see automatic translations
3. Use `!help` to see all available commands
4. Use `!end` to stop the translation session

## Configuration Options

You can modify the `config/default.json` file to change various bot settings:

- `prefix`: The command prefix (default is "!")
- `defaultMode`: The default language mode ("korean" or "japanese")
- `defaultModel`: The default AI model ("gpt4o", "claude", or "gemini")
- `systemPrompts`: The system prompts used for translation
- `translationMemoryLimit`: Maximum number of entries in the translation cache

## Troubleshooting

- **Bot doesn't respond to commands**: Make sure you've enabled the Message Content Intent in the Discord Developer Portal
- **Translation fails**: Check that your API keys are correct and that you have sufficient credits for the services
- **"Cannot find module" errors**: Run `npm install` to ensure all dependencies are installed

## Support

If you encounter any issues or have questions, please open an issue on this repository.
