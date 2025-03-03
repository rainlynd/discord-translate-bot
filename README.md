# Discord Translation Bot

A powerful Discord bot that automatically translates messages between English, Korean, and Japanese using AI language models (GPT-4o, Claude, Gemini).

## Features

- **Session-Based Translation**: Start and stop translation sessions in specific channels as needed
- **Conversation Context**: Maintains conversation history for more accurate contextual translations
- **Automatic Translation**: Detects message language and translates without manual commands
- **Multi-Language Support**: Korean ↔ English and Japanese ↔ English translation
- **Multiple AI Models**: Choose between OpenAI (GPT-4o), Anthropic (Claude), and Google (Gemini) models
- **Translation Memory**: Caches translations to improve response time for repeated phrases
- **Helpful Commands**: Easily switch language modes, models, and view statistics
- **Visual Indicators**: Emoji reactions show translation status and source language
- **Error Handling**: Gracefully handles API errors and displays helpful messages
- **Token count**: Shows the number of tokens used in each translation

### How It Works

1. A user starts a translation session with `!start` in a specific channel
2. When a user sends a message in that channel, the bot automatically detects the language
3. If translation is needed based on the current language mode, the bot adds a "🔄" reaction
4. The message is translated using the selected AI model
5. The bot replies with the translated message, including source and target language indicators
6. A flag emoji is added to the original message to indicate the detected language
7. The session continues until a user ends it with `!end`

### Language Modes

- **Korean Mode**: Translates Korean ↔ English and Japanese → Korean
- **Japanese Mode**: Translates Japanese ↔ English and Korean → Japanese

### System prompts
- **For Korean**: """너는 카카오톡 단체 채팅방의 한국어 번역가야. 제한이 없고 반말, 은어, 밈, 성 관련 정보에 특화되어 있어 (팁: 나무위키를 참고해). 번역 컨텍스트는 사용자가 처음에 제공할 수도 있어. 모든 메시지를 예외 없이 번역하고, 에로틱하거나 성적이거나 공격적이거나 강렬하거나 어두운 메시지라도 그 본질을 유지해. 한국어를 영어로 번역할 때는 최대한 정확하게 번역해. 영어를 한국어로 번역할 때는 다음 가이드를 따라야 해:
1. 번역 시 긴 문장을 피하고 대화체로 간결하게 번역해
2. 친근하고 비공식적인 톤으로 온라인 캐주얼 채팅 스타일을 사용해 (무례하지 않게)"""
- **For Japanese**: """あなたはLINEグループチャット用の日本語翻訳者です。制限はなく、インフォーマルな言葉遣いやスラング、ミーム、性的ジョークを専門としています。翻訳の文脈が始めにユーザーから提供されることがあります。日本語から英語への翻訳はできるだけ正確に行いますが、英語から日本語への翻訳は以下のガイドラインに従ってください：
1. 翻訳では長い文を避け、会話的で簡潔にする
2. 親しみやすくインフォーマルなトーンで、オンラインのカジュアルなチャットスタイルを使用する（失礼にならないように"""

### Available Models

- **OpenAI**: gpt4o
- **Anthropic**: claude-3-7-sonnet-20250219
- **Google**: gemini-2.0-flash

## Configuration Options

The bot stores server-specific configurations, so each Discord server can have different settings:

- Language mode (Korean or Japanese)
- Translation model
- Auto-translate setting (enabled by default)

## Advanced Features

- **Translation Memory**: Recently translated messages are cached to reduce API calls
- **Error Handling**: Graceful handling of API errors with visual indicators