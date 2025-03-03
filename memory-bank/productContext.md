# Discord Translation Bot - Product Context

## Why This Project Exists
This Discord translation bot was created to solve the communication barrier between Korean, Japanese, and English speakers in Discord communities. Unlike generic translation tools, it's specifically optimized for casual conversation in Discord channels with a focus on preserving the informal, conversational tone that's typical in chat environments.

## Problems It Solves

### Language Barriers in Communities
- **Real-time communication gaps** between speakers of different languages
- **Loss of nuance and context** when using basic translation tools
- **Disrupted conversation flow** when members need to manually translate
- **Exclusion of members** who don't speak the dominant language

### Technical Translation Challenges
- **Casual, slang-heavy language** that traditional translators struggle with
- **Contextual understanding** needed for accurate translations
- **Discord-specific references and emoji usage**
- **Mixed language messages** that confuse basic translation tools

## How It Should Work

### User Experience Flow
1. Server admin or moderator adds the bot to their Discord server
2. A user starts a translation session in a specific channel with `!start`
3. The bot automatically detects the language of each message in the channel
4. Messages are translated when needed based on the current language mode
5. Translations are shown as replies with source/target language indicators
6. Users can control translation behavior with simple commands
7. Session ends when a user issues the `!end` command

### Language Flow
- **Korean Mode:**
  - Korean → English (for English speakers to understand)
  - English → Korean (for Korean speakers to understand)
  - Japanese → Korean (for Korean speakers to understand)

- **Japanese Mode:**
  - Japanese → English (for English speakers to understand)
  - English → Japanese (for Japanese speakers to understand)
  - Korean → Japanese (for Japanese speakers to understand)

### Translation Quality Focus
- Preserve slang, internet speech, and casual expressions
- Maintain the speaker's tone and intent
- Translate with awareness of gaming and internet culture
- Keep translations concise and conversational

## User Experience Goals
- **Invisible when possible** - translations should feel natural and unobtrusive
- **Fast response times** - translations should appear quickly to maintain conversation flow
- **Command simplicity** - minimal and intuitive commands for controlling the bot
- **Visual clarity** - clear indication of original language and translation
- **Error resilience** - graceful handling of API issues or detection problems
- **Non-disruptive** - session-based approach to avoid translating in channels where it's not wanted
