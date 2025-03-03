import { openaiTranslate, detectLanguageWithLLM } from '../models/openaiModel.js';
import { anthropicTranslate } from '../models/anthropicModel.js';
import { geminiTranslate } from '../models/googleModel.js';
import { getTranslationMemory, saveTranslation } from '../utils/translationMemory.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Preprocess message content to remove irrelevant information
 * @param {string} content - Message content to preprocess
 * @returns {string} Cleaned message content
 */
// Cache preprocessing config to avoid disk reads
let cachedPreprocessingConfig = null;

// Load preprocessing config
function getPreprocessingConfig() {
  if (cachedPreprocessingConfig) return cachedPreprocessingConfig;
  
  try {
    const configPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    cachedPreprocessingConfig = config.messagePreprocessing || {
      enabled: true,
      removeEmojis: true,
      removeTimestamps: true,
      removeUrls: true
    };
    return cachedPreprocessingConfig;
  } catch (error) {
    console.error('Error loading preprocessing config:', error);
    cachedPreprocessingConfig = {
      enabled: true,
      removeEmojis: true,
      removeTimestamps: true,
      removeUrls: true
    };
    return cachedPreprocessingConfig;
  }
}

function preprocessMessage(content) {
  // Skip preprocessing if content is too short
  if (!content || content.length < 10) return content;
  
  const preprocessConfig = getPreprocessingConfig();
  
  // Skip if preprocessing is disabled
  if (!preprocessConfig.enabled) return content;
  
  // Remove Discord emojis
  if (preprocessConfig.removeEmojis) {
    content = content.replace(/(:(\S+):)/g, '');
  }
  
  // Remove Discord timestamps
  if (preprocessConfig.removeTimestamps) {
    content = content.replace(/([^—]+) — (?:Today at|Yesterday at|\d{1,2}\/\d{1,2}\/\d{4}) \d{1,2}:\d{2} [AP]M/g, '$1:');
  }
  
  // Remove URLs
  if (preprocessConfig.removeUrls) {
    content = content.replace(/(https?:\/\/[^\s]+)/g, '');
  }
  
  // Remove excessive whitespace that might be left after filtering
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.trim();
  
  return content;
}

// Performance tracking
const perfMetrics = {
  totalTranslations: 0,
  cachedTranslations: 0,
  apiTranslations: 0,
  totalTime: 0,
  cacheLookupTime: 0,
  apiCallTime: 0
};

// Language codes mapping
const LANGUAGES = {
  eng: 'English',
  kor: 'Korean',
  jpn: 'Japanese'
};

// Flag emojis for each language
const FLAGS = {
  eng: '🇺🇸',
  kor: '🇰🇷',
  jpn: '🇯🇵'
};

// Cache emoji config to avoid disk reads on every translation
let cachedEmojis = null;

// Load emoji config
function getEmojis() {
  if (cachedEmojis) return cachedEmojis;
  
  try {
    const configPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    cachedEmojis = config.emoji || {
      translating: '🔄',
      error: '❌',
      english: '🇺🇸',
      korean: '🇰🇷', 
      japanese: '🇯🇵'
    };
    return cachedEmojis;
  } catch (error) {
    console.error('Error loading emoji config:', error);
    cachedEmojis = {
      translating: '🔄',
      error: '❌',
      english: '🇺🇸',
      korean: '🇰🇷',
      japanese: '🇯🇵'
    };
    return cachedEmojis;
  }
}

// Detect language of text using LLM instead of franc
async function detectLanguage(text) {
  if (!text || text.trim().length < 3) {
    return 'eng'; // Default to English for very short texts
  }
  
  // Use LLM-based detection
  return await detectLanguageWithLLM(text);
}

// Always translate if the language is one of our supported languages
function shouldTranslate(detectedLang, mode) {
  // We always translate if language is Korean, Japanese, or English
  return detectedLang === 'kor' || detectedLang === 'jpn' || detectedLang === 'eng';
}

// Get target language based on source language and mode
function getTargetLanguage(sourceLang, mode) {
  if (mode === 'korean') {
    if (sourceLang === 'kor') return 'eng';
    if (sourceLang === 'eng') return 'kor';
    if (sourceLang === 'jpn') return 'kor';
  } else { // japanese mode
    if (sourceLang === 'jpn') return 'eng';
    if (sourceLang === 'eng') return 'jpn';
    if (sourceLang === 'kor') return 'jpn';
  }
  return 'eng'; // default
}

// Format translation result for display - Only show tokens for non-cached translations
function formatTranslation(result) {
  if (result.model === 'cache') {
    return `${result.translated}`;
  } else {
    return `${result.translated}\n📊 Tokens: ${result.tokens.total}`;
  }
}

// Translate a message
async function translateMessage(message, serverConfig) {
  const emojis = getEmojis();
  const startTime = Date.now();
  let detectedLang = 'eng';
  
  try {
  // Preprocess the message content to remove irrelevant information
  const content = preprocessMessage(message.content);
  
  // Skip empty messages or commands
  if (!content.trim() || content.startsWith(serverConfig.prefix || '!')) {
    return null;
  }
    
    // Detect language using LLM
    detectedLang = await detectLanguage(content);
    
    // Check if translation is needed based on mode
    if (!shouldTranslate(detectedLang, serverConfig.mode)) {
      return null;
    }
    
    // Performance tracking
    perfMetrics.totalTranslations++;
    const cacheStartTime = Date.now();
    
    // Check translation memory first
    const cachedTranslation = getTranslationMemory(content, serverConfig.mode);
    
    // Update cache lookup metrics
    perfMetrics.cacheLookupTime += (Date.now() - cacheStartTime);
    
    // If we have a cached translation, return it immediately without adding reactions
    if (cachedTranslation) {
      perfMetrics.cachedTranslations++;
      
      // Add language flag reaction for cached results - but don't wait for it
      message.react(FLAGS[detectedLang] || '❓').catch(e => 
        console.error('Could not add flag reaction to cached translation:', e)
      );
      
      return {
        original: content,
        translated: cachedTranslation.translation,
        sourceLang: detectedLang,
        targetLang: getTargetLanguage(detectedLang, serverConfig.mode),
        model: 'cache',
        tokens: cachedTranslation.tokens
      };
    }
    
    // Since it's not cached, add thinking reaction
    // Don't await this - let it happen in the background to speed up response
    const reactionPromise = message.react(emojis.translating);
    
    // API translation performance tracking
    const apiStartTime = Date.now();
    perfMetrics.apiTranslations++;
    
    // Get translation using selected model
    let result;
    switch (serverConfig.model) {
      case 'gpt4o':
        result = await openaiTranslate(content, detectedLang, serverConfig.mode);
        break;
      case 'claude':
        result = await anthropicTranslate(content, detectedLang, serverConfig.mode);
        break;
      case 'gemini':
        result = await geminiTranslate(content, detectedLang, serverConfig.mode);
        break;
      default:
        result = await openaiTranslate(content, detectedLang, serverConfig.mode);
    }
    
    // Update API call metrics
    perfMetrics.apiCallTime += (Date.now() - apiStartTime);
    
    // Make sure reaction was added before updating
    await reactionPromise;
    
    // Save to translation memory - don't wait for this
    saveTranslation(content, result.translation, serverConfig.mode, result.tokens);
    
    // Update/replace existing reactions with flag
    try {
      await message.reactions.cache.get(emojis.translating)?.remove();
    } catch (e) {
      console.error('Could not remove translating reaction:', e);
    }
    
    // Add language flag reaction - don't wait for it to complete
    message.react(FLAGS[detectedLang] || '❓').catch(e => 
      console.error('Could not add flag reaction:', e)
    );
    
    // Update total performance time
    const totalTime = Date.now() - startTime;
    perfMetrics.totalTime += totalTime;
    
    // Log performance metrics every 50 translations
    if (perfMetrics.totalTranslations % 50 === 0) {
      console.log(`Translation Performance Metrics:
        Total: ${perfMetrics.totalTranslations}, 
        Cached: ${perfMetrics.cachedTranslations} (${Math.round(perfMetrics.cachedTranslations/perfMetrics.totalTranslations*100)}%),
        Avg time: ${Math.round(perfMetrics.totalTime/perfMetrics.totalTranslations)}ms,
        Avg cache lookup: ${Math.round(perfMetrics.cacheLookupTime/perfMetrics.totalTranslations)}ms,
        Avg API call: ${Math.round(perfMetrics.apiCallTime/perfMetrics.apiTranslations)}ms
      `);
    }
    
    return {
      original: content,
      translated: result.translation,
      sourceLang: detectedLang,
      targetLang: getTargetLanguage(detectedLang, serverConfig.mode),
      model: serverConfig.model,
      tokens: result.tokens,
      responseTime: totalTime
    };
  } catch (error) {
    // Be more specific about where the error occurred
    let errorMessage = 'Translation error';
    
    if (error.message?.includes('API')) {
      errorMessage = `API error: ${error.message}`;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded';
    }
    
    console.error(`${errorMessage}:`, error);
    
    try {
      // Don't await these operations to prevent blocking
      message.reactions.removeAll().catch(e => console.error('Could not clear reactions:', e));
      message.react(emojis.error).catch(e => console.error('Could not add error reaction:', e));
    } catch (reactionError) {
      console.error('Error handling reactions:', reactionError);
    }
    
    return null;
  }
}

export { 
  translateMessage, 
  detectLanguage, 
  shouldTranslate,
  getTargetLanguage,
  formatTranslation,
  LANGUAGES, 
  FLAGS,
  perfMetrics
};
