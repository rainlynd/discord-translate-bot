import { WebhookClient } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store webhook clients to avoid recreating them
const webhookCache = new Map();

/**
 * Split content into chunks that fit within Discord's 2000 character limit
 * @param {string} content - Message content to split
 * @returns {string[]} Array of content chunks
 */
function splitMessageContent(content) {
  const chunks = [];
  const maxLength = 1950; // Leaving some buffer for safety
  
  // If content is already within limits, just return it as a single chunk
  if (!content || content.length <= maxLength) {
    return [content];
  }
  
  let currentChunk = '';
  let currentLength = 0;
  
  // Try to split on paragraph or sentence boundaries when possible
  const paragraphs = content.split('\n');
  
  for (const paragraph of paragraphs) {
    // If a single paragraph is too long, we need to split it by sentences
    if (paragraph.length > maxLength) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      
      for (const sentence of sentences) {
        // If a single sentence is too long, we'll need to split it arbitrarily
        if (sentence.length > maxLength) {
          let tempSentence = sentence;
          while (tempSentence.length > maxLength) {
            const chunk = tempSentence.substring(0, maxLength);
            chunks.push(chunk);
            tempSentence = tempSentence.substring(maxLength);
          }
          if (tempSentence.length > 0) {
            currentChunk = tempSentence;
            currentLength = tempSentence.length;
          }
        } else if (currentLength + sentence.length + 1 <= maxLength) {
          // Add to current chunk if it fits
          currentChunk += (currentChunk ? ' ' : '') + sentence;
          currentLength += sentence.length + (currentChunk ? 1 : 0);
        } else {
          // Start a new chunk if it doesn't fit
          chunks.push(currentChunk);
          currentChunk = sentence;
          currentLength = sentence.length;
        }
      }
    } else if (currentLength + paragraph.length + 1 <= maxLength) {
      // Add paragraph to current chunk if it fits
      currentChunk += (currentChunk ? '\n' : '') + paragraph;
      currentLength += paragraph.length + (currentChunk ? 1 : 0);
    } else {
      // Start a new chunk if paragraph doesn't fit
      chunks.push(currentChunk);
      currentChunk = paragraph;
      currentLength = paragraph.length;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  // Add part indicators for multiple chunks
  if (chunks.length > 1) {
    return chunks.map((chunk, index) => 
      `[Part ${index + 1}/${chunks.length}] ${chunk}`
    );
  }
  
  return chunks;
}

/**
 * Get or create a webhook for a channel
 * @param {Object} channel - Discord channel object
 * @returns {Promise<WebhookClient>} Webhook client
 */
async function getOrCreateWebhook(channel) {
  // Check if we already have a webhook for this channel
  if (webhookCache.has(channel.id)) {
    return webhookCache.get(channel.id);
  }

  try {
    // Fetch existing webhooks
    const webhooks = await channel.fetchWebhooks();
    
    // Look for an existing translation webhook
    let webhook = webhooks.find(wh => wh.name === 'TranslationBot');
    
    // If no webhook exists, create one
    if (!webhook) {
      webhook = await channel.createWebhook({
        name: 'TranslationBot',
        avatar: 'https://i.imgur.com/OLCXZzb.png', // Default bot avatar - update with your own
        reason: 'Translation webhook for faster responses'
      });
      console.log(`Created new webhook in channel ${channel.name}`);
    }
    
    // Create a webhook client
    const webhookClient = new WebhookClient({ url: webhook.url });
    
    // Cache it for future use
    webhookCache.set(channel.id, webhookClient);
    
    return webhookClient;
  } catch (error) {
    console.error(`Error creating webhook for channel ${channel.id}:`, error);
    return null;
  }
}

/**
 * Send a message via webhook, splitting if necessary
 * @param {Object} channel - Discord channel object
 * @param {Object} options - Message options
 * @returns {Promise<Message|Message[]>} Sent message(s)
 */
async function sendViaWebhook(channel, options) {
  try {
    const webhook = await getOrCreateWebhook(channel);
    
    if (!webhook) {
      throw new Error('Could not get or create webhook');
    }
    
    // Split content if needed
    const contentChunks = splitMessageContent(options.content);
    const messages = [];
    
    // Send each chunk
    for (const chunkContent of contentChunks) {
      const message = await webhook.send({
        content: chunkContent,
        username: options.username || 'Translator',
        avatarURL: options.avatarURL,
        threadId: channel.isThread() ? channel.id : undefined
      });
      
      messages.push(message);
      
      // Small delay between chunks to avoid rate limiting
      if (contentChunks.length > 1 && contentChunks.indexOf(chunkContent) < contentChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return contentChunks.length === 1 ? messages[0] : messages;
  } catch (error) {
    console.error('Error sending webhook message:', error);
    
    // Fallback to regular channel send with splitting
    const contentChunks = splitMessageContent(options.content);
    const messages = [];
    
    for (const chunkContent of contentChunks) {
      const message = await channel.send(chunkContent);
      messages.push(message);
      
      // Small delay between chunks
      if (contentChunks.length > 1 && contentChunks.indexOf(chunkContent) < contentChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return contentChunks.length === 1 ? messages[0] : messages;
  }
}

/**
 * Clean up webhook connections
 */
function cleanupWebhooks() {
  for (const [channelId, webhook] of webhookCache.entries()) {
    webhook.destroy();
    console.log(`Destroyed webhook for channel ${channelId}`);
  }
  webhookCache.clear();
}

export { sendViaWebhook, cleanupWebhooks, splitMessageContent };
