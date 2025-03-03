# Discord Translator Bot Long Message Handling

## Overview

This bot now includes features to handle messages that exceed Discord's 2000 character limit. The implementation includes:

1. **Content Filtering** - Removes irrelevant information to reduce message length
2. **Message Splitting** - Intelligently divides long messages into multiple parts

## Content Filtering

The bot can automatically filter out content that doesn't need translation, including:

- Discord emojis (`:emoji_name:`)
- Discord timestamps (such as "Today at 4:35 AM")
- URLs (http/https links)

These filters significantly reduce message size without affecting the essential content that needs translation.

### Configuration

Content filtering can be configured in the `config/default.json` file:

```json
"messagePreprocessing": {
  "enabled": true,
  "removeEmojis": true,
  "removeTimestamps": true,
  "removeUrls": true
}
```

You can disable any specific filter or turn off preprocessing entirely by setting the relevant option to `false`.

## Message Splitting

For messages that still exceed Discord's character limit after filtering, the bot implements smart message splitting with the following features:

- Intelligent splitting on natural boundaries (paragraphs, sentences) where possible
- Clear part indicators ([Part 1/3], etc.) to help users follow conversation flow
- Minimal delay between split messages to avoid rate limiting
- Graceful fallback to regular channel messages if webhook delivery fails

The splitting algorithm prioritizes:

1. Paragraph boundaries (newlines)
2. Sentence boundaries (periods, question marks, exclamation points)
3. Character limits as a last resort

## Performance Considerations

Both features are optimized for performance:
- Configuration settings are cached to avoid repeated file reads
- Message splitting only occurs when necessary
- The bot maintains a small buffer below the 2000 character limit to account for Discord's behavior

## Example Usage

When a long conversation is translated, the bot will:

1. Filter out unnecessary content
2. If the resulting message is still too long, split it into parts
3. Send each part sequentially, with clear part indicators
4. Maintain proper threading in Discord channels

No user action is required to enable these features, as they work automatically when needed.
