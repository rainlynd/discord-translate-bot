# Discord Translation Bot - Technical Context

## Technologies Used

### Core Platform
- **Node.js** - JavaScript runtime environment (v16.9.0+ required)
- **ES Modules** - Project uses ECMAScript modules (import/export) instead of CommonJS
- **Discord.js v14** - Library for interacting with Discord API

### AI Services
- **OpenAI API** - GPT-4o model for translations and language detection
- **Anthropic API** - Claude 3.7 Sonnet model for translations
- **Google Generative AI** - Gemini 2.0 Flash model for translations

### Data Management
- **fs-extra** - Enhanced file system operations
- **dotenv** - Environment variable management
- **franc** - Language detection (legacy, now using LLM-based detection)

### Development Tools
- **nodemon** - Automatic server restarts during development
- **Docker/Docker Compose** - Containerization for deployment

## Development Setup

### Prerequisites
- Node.js v16.9.0+
- Discord Bot token with appropriate permissions
- API keys for at least one LLM provider (OpenAI, Anthropic, Google)

### Local Development
1. Clone repository 
2. Install dependencies with `npm install`
3. Copy `.env.example` to `.env` and add API keys
4. Create required directories with `node check-data-structure.js`
5. Run development server with `npm run dev`

### Discord Bot Setup
1. Create application in Discord Developer Portal
2. Enable all Privileged Gateway Intents:
   - Message Content Intent (critical)
   - Server Members Intent
   - Presence Intent
3. Create bot token
4. Invite bot to server with appropriate permissions

## Technical Constraints

### Discord Limitations
- 2000 character limit for messages (handled by message splitting)
- Rate limits on API calls and reactions
- Webhook creation permissions required for optimal performance

### API Limitations
- API rate limits per provider
- Token limits per request
- Cost considerations for heavy usage
- API availability and uptime dependencies

### System Requirements
- Persistent storage for server configs and translation memory
- Memory requirements scale with number of active servers
- Network connectivity to Discord and AI service APIs

## Dependencies

### Core Dependencies
- `discord.js` - Discord API interaction
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Anthropic API client
- `@google/generative-ai` - Google Generative AI client
- `dotenv` - Environment management
- `fs-extra` - Enhanced file operations
- `node-fetch` - HTTP requests

### Configuration Management
- Server-specific settings stored as JSON in `data/servers/`
- Translation memory persisted in `data/translations.json`
- Global settings in `config/default.json`

### Environment Configuration
Required environment variables:
- `DISCORD_TOKEN` - Discord bot token
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_API_KEY` - Google API key

## Deployment Options

### Standard Deployment
- Run with `npm start` or `node src/index.js`
- Use PM2 for process management: `pm2 start src/index.js --name "translate-bot"`

### Docker Deployment
- Build container: `docker-compose build`
- Run container: `docker-compose up -d`
- Container configured with resource limits and proper signal handling
- Data persistence through Docker volumes

### Monitoring and Maintenance
- Health check script: `node health-check.js`
- Diagnostic utility: `node diagnose.js`
- API key validation: `node test-api-keys.js`
- Dependency verification: `node check-dependencies.js`

## Performance Considerations

### Memory Usage
- Translation memory caching affects memory usage
- Map data structure used for efficient caching
- Pruning mechanism to limit memory growth

### Network Bandwidth
- API calls to external LLM services
- Discord API communication
- Webhooks reduce API call volume

### Storage Considerations
- Server configuration files grow with number of servers
- Translation memory size depends on usage patterns
- Batched writes reduce disk I/O
