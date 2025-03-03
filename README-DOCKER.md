# Docker Deployment Guide for Discord Translation Bot

This guide explains how to deploy the Discord Translation Bot using Docker, which allows for easy setup, consistent environment, and simplified management.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system
- Discord Bot Token and necessary API keys (OpenAI, Anthropic, Google)

## Setup Instructions

### 1. Clone and Prepare Environment

First, clone the repository and set up your environment variables:

```bash
# Navigate to the project directory
cd discord-translate-bot

# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual API keys
nano .env
```

### 2. Build and Start the Container

Build and start the Docker container using Docker Compose:

```bash
# Build and start in detached mode
docker-compose up -d

# To see the logs in real-time
docker-compose logs -f
```

### 3. Verify the Bot is Running

Check that the container is running properly:

```bash
docker-compose ps
```

The bot should now be connected to Discord and ready to translate messages.

## Data Persistence

The bot stores translation memory in the `./data` directory, which is mapped to a volume in the Docker container. This ensures your translation data persists even if the container is restarted or rebuilt.

## Updating the Bot

To update the bot when new code is available:

```bash
# Pull the latest changes
git pull

# Rebuild and restart the container
docker-compose down
docker-compose up -d --build
```

## Advanced Management

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow log output
docker-compose logs -f

# Show only the last 100 lines
docker-compose logs --tail=100
```

### Stopping the Bot

```bash
# Stop but don't remove the container
docker-compose stop

# Stop and remove the container (data is still preserved in volumes)
docker-compose down
```

### Complete Reset

If you need to completely reset the application and its data:

```bash
# Remove containers, networks, and volumes
docker-compose down -v
```

## Troubleshooting

### Bot Won't Start

1. Check your environment variables in the `.env` file
2. Verify Docker logs: `docker-compose logs`
3. Ensure your Discord token is valid and the bot is invited to your server

### API Errors

If you see errors related to API limits or authentication:
- Verify your API keys in the `.env` file
- Check if you've exceeded your API usage limits

### Container Keeps Restarting

If the container repeatedly restarts:
- Check the logs for errors: `docker-compose logs`
- Verify file permissions on the data directory
- Ensure all required environment variables are set

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DISCORD_TOKEN | Yes | Your Discord bot token |
| OPENAI_API_KEY | No | OpenAI API key for GPT models |
| ANTHROPIC_API_KEY | No | Anthropic API key for Claude models |
| GOOGLE_API_KEY | No | Google API key for Gemini models |

At least one of the AI model API keys must be provided.
