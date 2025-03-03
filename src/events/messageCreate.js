// Event handler for processing incoming messages

import { translateMessage, formatTranslation, perfMetrics } from '../services/translationService.js';
import { loadServerConfig, updateServerStats } from '../utils/serverConfig.js';
import { sendViaWebhook, splitMessageContent } from '../utils/webhookManager.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Queue system for managing concurrent translations
const translationQueue = {
  concurrentLimit: 3,  // Maximum number of concurrent translations
  active: 0,           // Currently active translations
  waiting: [],         // Queue of waiting translations

  // Add a translation task to the queue
  add(task) {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.active--;
          this.processNext();
        }
      };

      // If we can process it immediately, do so
      if (this.active < this.concurrentLimit) {
        this.active++;
        wrappedTask();
      } else {
        // Otherwise add it to the waiting queue
        this.waiting.push(wrappedTask);
      }
    });
  },

  // Process next item in the queue
  processNext() {
    if (this.waiting.length > 0 && this.active < this.concurrentLimit) {
      this.active++;
      const nextTask = this.waiting.shift();
      nextTask();
    }
  }
};

// Cache for prefix to avoid repeated file reads
let cachedPrefix = null;

// Get command prefix from config
function getPrefix() {
  if (cachedPrefix) return cachedPrefix;
  
  try {
    const configPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    cachedPrefix = config.prefix || '!';
    return cachedPrefix;
  } catch (error) {
    console.error('Error loading prefix:', error);
    cachedPrefix = '!'; // Default prefix
    return cachedPrefix;
  }
}

export default {
  name: 'messageCreate',
  async execute(message, client) {
    const messageProcessStart = Date.now();
    
    // Ignore messages from bots
    if (message.author.bot) return;
    
    // Get prefix from cache
    const prefix = getPrefix();
    
    // Handle commands
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();
      
      const command = client.commands.get(commandName);
      
      if (!command) return;
      
      try {
        await command.execute(message, args, client);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        // Don't wait for the reply to finish - fire and forget
        message.reply({ 
          content: '❌ There was an error trying to execute that command!',
          allowedMentions: { repliedUser: false }
        }).catch(console.error);
      }
      
      return;
    }
    
    // Check if the message is in a channel with an active translation session
    const channelId = message.channel.id;
    if (!client.activeSessions.has(channelId)) return;
    
    // Get session and server info
    const session = client.activeSessions.get(channelId);
    const serverId = message.guild.id;
    
    // Load server config - only once per message
    const serverConfig = loadServerConfig(serverId);
    
    // Add this translation task to the queue
    translationQueue.add(async () => {
      try {
        // Process translation
        const translationResult = await translateMessage(message, serverConfig);
        
        // If no translation was needed or possible, just return
        if (!translationResult) return;
        
        // Format the translation for display
        const formattedMessage = formatTranslation(translationResult);
        
        // Use webhook for faster delivery
        const replyPromise = sendViaWebhook(message.channel, {
          content: `**${message.author.username}**: ${formattedMessage}`,
          username: `Translator (${translationResult.model})`,
          avatarURL: 'https://i.imgur.com/OLCXZzb.png'
        }).catch(error => {
          console.error('Webhook failed, falling back to reply:', error);
          
          // Split message for reply if needed
          const contentChunks = splitMessageContent(formattedMessage);
          if (contentChunks.length === 1) {
            // Single message reply
            return message.reply({
              content: formattedMessage,
              allowedMentions: { repliedUser: false }
            });
          } else {
            // Handle split messages - reply to the original first, then send the rest as regular messages
            const messages = [];
            const firstMessage = message.reply({
              content: contentChunks[0],
              allowedMentions: { repliedUser: false }
            });
            messages.push(firstMessage);
            
            // Send the remaining chunks
            for (let i = 1; i < contentChunks.length; i++) {
              const followupMsg = message.channel.send(contentChunks[i]);
              messages.push(followupMsg);
            }
            
            return Promise.all(messages);
          }
        });
        
        // Update session statistics immediately (don't wait for reply)
        session.translations += 1;
        session.totalTokens += translationResult.tokens?.total || 0;
        
        // Update server statistics
        updateServerStats(serverId, {
          totalTranslations: serverConfig.stats.totalTranslations + 1,
          totalTokens: serverConfig.stats.totalTokens + (translationResult.tokens?.total || 0)
        });
        
        // Log response time if it's available
        if (translationResult.responseTime) {
          const totalTime = Date.now() - messageProcessStart;
          console.log(`Translation completed in ${translationResult.responseTime}ms (total processing: ${totalTime}ms)`);
        }
        
        // Make sure the reply was sent
        await replyPromise;
      } catch (error) {
        console.error('Error processing translation:', error);
        
        // Use a more specific error message if possible
        let errorMessage = '❌ Failed to translate message. Please try again later.';
        
        if (error.message?.includes('rate limit')) {
          errorMessage = '❌ Rate limit exceeded. Please try again in a few moments.';
        } else if (error.message?.includes('API')) {
          errorMessage = '❌ Translation API error. Please try a different model.';
        }
        
        // Reply with error message - try webhook first, fallback to reply
        sendViaWebhook(message.channel, {
          content: `**Error**: ${errorMessage}`,
          username: 'Translation Error',
          avatarURL: 'https://i.imgur.com/JYAVksw.png'
        }).catch(e => {
          // Fallback to standard reply
          return message.reply({
            content: errorMessage,
            allowedMentions: { repliedUser: false }
          });
        }).catch(e => console.error('Could not send error message:', e));
      }
    }).catch(error => {
      console.error('Queue processing error:', error);
    });
  }
};
