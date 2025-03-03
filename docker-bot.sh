#!/bin/bash
# Docker management script for Discord Translation Bot
# Usage: ./docker-bot.sh [command]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_usage {
  echo -e "${BLUE}Discord Translation Bot - Docker Management Script${NC}"
  echo
  echo "Usage: $0 [command]"
  echo
  echo "Commands:"
  echo "  start       - Start the bot container"
  echo "  stop        - Stop the running bot container"
  echo "  restart     - Restart the bot container"
  echo "  logs        - View the bot logs (press Ctrl+C to exit)"
  echo "  status      - Check the status of the bot container"
  echo "  build       - Rebuild the bot container (needed after code changes)"
  echo "  check       - Run the health check inside the container"
  echo "  shell       - Open a shell inside the running container"
  echo "  clean       - Remove container, keeping data"
  echo "  reset       - Reset completely (WARNING: removes all data)"
  echo
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed${NC}"
  echo "Please install Docker first: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: Docker Compose is not installed${NC}"
  echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
  exit 1
fi

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: No .env file found${NC}"
  echo -e "Creating one from .env.example. ${RED}You will need to edit it with your actual API keys.${NC}"
  cp .env.example .env
fi

# Execute command based on first argument
case "$1" in
  start)
    echo -e "${GREEN}Starting Discord Translation Bot...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Bot started. Run '$0 logs' to see the logs.${NC}"
    ;;
    
  stop)
    echo -e "${YELLOW}Stopping Discord Translation Bot...${NC}"
    docker-compose stop
    ;;
    
  restart)
    echo -e "${YELLOW}Restarting Discord Translation Bot...${NC}"
    docker-compose restart
    echo -e "${GREEN}Bot restarted.${NC}"
    ;;
    
  logs)
    echo -e "${BLUE}Showing logs (press Ctrl+C to exit)...${NC}"
    docker-compose logs -f
    ;;
    
  status)
    echo -e "${BLUE}Bot status:${NC}"
    docker-compose ps
    ;;
    
  build)
    echo -e "${BLUE}Rebuilding Discord Translation Bot container...${NC}"
    docker-compose build
    echo -e "${GREEN}Build complete. Run '$0 start' to start the bot.${NC}"
    ;;
    
  check)
    echo -e "${BLUE}Running health check...${NC}"
    docker-compose run --rm discord-bot node health-check.js
    ;;
    
  shell)
    echo -e "${BLUE}Opening shell in container...${NC}"
    docker-compose exec discord-bot /bin/sh
    ;;
    
  clean)
    echo -e "${YELLOW}Removing container but keeping data volumes...${NC}"
    docker-compose down
    echo -e "${GREEN}Container removed. Data is preserved.${NC}"
    ;;
    
  reset)
    echo -e "${RED}WARNING: This will remove all containers, networks, and volumes!${NC}"
    read -p "Are you sure you want to continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Removing all Docker resources including data...${NC}"
      docker-compose down -v
      echo -e "${RED}Reset complete.${NC}"
    else
      echo -e "${GREEN}Reset cancelled.${NC}"
    fi
    ;;
    
  *)
    print_usage
    ;;
esac
