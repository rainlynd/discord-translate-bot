# Discord Translator Bot Troubleshooting Guide

If your Discord translator bot is not responding to messages after starting a session, follow this guide to diagnose and fix the issue.

## Quick Diagnostic Scripts

I've created several diagnostic scripts to help you identify the problem:

### 1. Run the Debug Version

The debug version adds detailed logging to help track exactly what's happening:

```bash
node debug.js
```

This will show you:
- If messages are being received
- If the active session is being detected
- If language detection works
- Detailed errors from the translation process

### 2. Check API Keys

If the bot connects but doesn't translate, your API keys might be invalid:

```bash
npm install @anthropic-ai/sdk @google/generative-ai
node test-api-keys.js
```

This script tests connections to:
- OpenAI API
- Anthropic API
- Google Gemini API

### 3. Verify Data Structure

Make sure all required directories and files exist:

```bash
node check-data-structure.js
```

## Common Issues & Solutions

### Bot Connects But Doesn't Respond to Messages

1. **Check if session started correctly**
   - Look for confirmation message after running `!start`
   - Debug logs will show if `client.activeSessions` includes your channel

2. **API Key Problems**
   - Run `node test-api-keys.js` to check API key validity
   - Check for expired or rate-limited API keys

3. **Language Detection Issues**
   - The bot only translates Korean, English, and Japanese
   - Very short messages may not be detected correctly
   - Debug logs will show detected language and translation decision

4. **Directory Structure Problems**
   - Run `node check-data-structure.js` to verify and fix directories
   - Ensure the bot can create/read server config files

5. **Discord Permissions**
   - Ensure the bot has these permissions:
     - Read Messages/View Channels
     - Send Messages
     - Read Message History
     - Add Reactions

## Step-by-Step Troubleshooting Process

1. Start with the debug version:
   ```bash
   node debug.js
   ```

2. In your Discord server:
   - Run `!start` to begin a session
   - Check debug logs to confirm the session was created
   - Send a test message in Korean or English
   - Check debug logs for the message processing flow

3. If no translation happens:
   - Check if `Channel has active session: false` appears in logs
     - If so, the session isn't being saved properly
   - Check if language detection works 
     - Look for `Language detection: "your message..." => eng` or `kor`
   - Check if translation condition passes
     - Look for `Should translate check: Lang=eng, Mode=korean => true`

4. Verify API keys are working:
   ```bash
   node test-api-keys.js
   ```

5. Check data directories:
   ```bash
   node check-data-structure.js
   ```

## Still Having Issues?

If you've followed all steps and the bot still doesn't work:

1. Check your Discord bot token - it might need to be refreshed
2. Try regenerating API keys for OpenAI, Anthropic, and Google
3. Look for any rate limiting or quota issues in the API service dashboards
4. Clear any existing server configuration files in the `data/servers` directory
