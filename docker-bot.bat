@echo off
:: Docker management script for Discord Translation Bot
:: Usage: docker-bot.bat [command]

setlocal enabledelayedexpansion

:: Set console colors
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:: Display usage information
if "%~1"=="" (
  goto :print_usage
)

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo %RED%Error: Docker is not installed%NC%
  echo Please install Docker first: https://docs.docker.com/get-docker/
  exit /b 1
)

:: Check if Docker Compose is installed
where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo %RED%Error: Docker Compose is not installed%NC%
  echo Please install Docker Compose first: https://docs.docker.com/compose/install/
  exit /b 1
)

:: Create a .env file if it doesn't exist
if not exist .env (
  echo %YELLOW%Warning: No .env file found%NC%
  echo Creating one from .env.example. %RED%You will need to edit it with your actual API keys.%NC%
  copy .env.example .env
)

:: Execute command based on first argument
if "%~1"=="start" (
  echo %GREEN%Starting Discord Translation Bot...%NC%
  docker-compose up -d
  echo %GREEN%Bot started. Run 'docker-bot.bat logs' to see the logs.%NC%
  exit /b 0
)

if "%~1"=="stop" (
  echo %YELLOW%Stopping Discord Translation Bot...%NC%
  docker-compose stop
  exit /b 0
)

if "%~1"=="restart" (
  echo %YELLOW%Restarting Discord Translation Bot...%NC%
  docker-compose restart
  echo %GREEN%Bot restarted.%NC%
  exit /b 0
)

if "%~1"=="logs" (
  echo %BLUE%Showing logs (press Ctrl+C to exit)...%NC%
  docker-compose logs -f
  exit /b 0
)

if "%~1"=="status" (
  echo %BLUE%Bot status:%NC%
  docker-compose ps
  exit /b 0
)

if "%~1"=="build" (
  echo %BLUE%Rebuilding Discord Translation Bot container...%NC%
  docker-compose build
  echo %GREEN%Build complete. Run 'docker-bot.bat start' to start the bot.%NC%
  exit /b 0
)

if "%~1"=="check" (
  echo %BLUE%Running health check...%NC%
  docker-compose run --rm discord-bot node health-check.js
  exit /b 0
)

if "%~1"=="shell" (
  echo %BLUE%Opening shell in container...%NC%
  docker-compose exec discord-bot /bin/sh
  exit /b 0
)

if "%~1"=="clean" (
  echo %YELLOW%Removing container but keeping data volumes...%NC%
  docker-compose down
  echo %GREEN%Container removed. Data is preserved.%NC%
  exit /b 0
)

if "%~1"=="reset" (
  echo %RED%WARNING: This will remove all containers, networks, and volumes!%NC%
  set /p CONFIRM="Are you sure you want to continue? (y/n): "
  if /i "!CONFIRM!"=="y" (
    echo %RED%Removing all Docker resources including data...%NC%
    docker-compose down -v
    echo %RED%Reset complete.%NC%
  ) else (
    echo %GREEN%Reset cancelled.%NC%
  )
  exit /b 0
)

:print_usage
echo %BLUE%Discord Translation Bot - Docker Management Script%NC%
echo.
echo Usage: docker-bot.bat [command]
echo.
echo Commands:
echo   start       - Start the bot container
echo   stop        - Stop the running bot container
echo   restart     - Restart the bot container
echo   logs        - View the bot logs (press Ctrl+C to exit)
echo   status      - Check the status of the bot container
echo   build       - Rebuild the bot container (needed after code changes)
echo   check       - Run the health check inside the container
echo   shell       - Open a shell inside the running container
echo   clean       - Remove container, keeping data
echo   reset       - Reset completely (WARNING: removes all data)
echo.
exit /b 0
