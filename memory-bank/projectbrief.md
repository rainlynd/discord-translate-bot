# Discord Translation Bot - Project Brief

## Overview
A Discord bot that provides real-time translation between English, Korean, and Japanese in Discord servers. The bot uses AI language models (GPT-4o, Claude, Gemini) to perform high-quality, contextually-aware translations in an ongoing conversation.

## Core Features
- **Session-based translation** in specific Discord channels
- **Automatic language detection** for Korean, Japanese, and English
- **Bidirectional translation** between language pairs
- **Multiple AI model support** (OpenAI GPT-4o, Anthropic Claude, Google Gemini)
- **Conversation-aware translation** that maintains context and casual speaking style
- **Translation memory** for improved performance and reduced API costs
- **Discord command system** for managing translation sessions
- **Server-specific configurations** for language modes and preferred models
- **Statistics tracking** for usage monitoring

## Target Users
- Discord communities with Korean, Japanese, and English speakers
- Gaming groups, cultural exchange servers, language learning communities
- International friend groups communicating across language barriers

## Key Goals
1. Provide seamless translation experience that preserves meaning and context
2. Support casual, conversational language including slang and informal speech
3. Maintain high performance with optimized response times
4. Create a simple user interface through intuitive Discord commands
5. Ensure reliability with proper error handling and fallback mechanisms

## Technical Requirements
- Discord.js integration for bot framework
- Multiple LLM provider API integrations (OpenAI, Anthropic, Google)
- Translation memory system for caching and performance 
- Server-specific configuration persistence
- Docker support for containerized deployment
- Optimized webhook-based response system for speed

## Success Criteria
- Accurate translations of casual conversation between supported languages
- Fast response times (under 2 seconds for cached translations, under 5 seconds for API translations)
- Intuitive command system that requires minimal instruction
- Reliable operation with proper error handling
- Scalable to support multiple Discord servers
