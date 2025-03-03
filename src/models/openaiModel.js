import OpenAI from 'openai';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Detect language using LLM instead of franc
async function detectLanguageWithLLM(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Analyze the text and determine the alphabet used. Respond with 'Korean' for 한글, 'Japanese' for 日本語, or 'English' for English or other languages."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0,
      max_tokens: 10
    });
    
    const result = response.choices[0].message.content.trim().toLowerCase();
    
    if (result.includes('korean')) return 'kor';
    if (result.includes('japanese')) return 'jpn';
    return 'eng'; // Default to English for other cases
  } catch (error) {
    console.error('Language detection error:', error);
    return 'eng'; // Default to English on error
  }
}

// Get system prompts from config
function getSystemPrompt(mode) {
  try {
    const configPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.systemPrompts[mode] || '';
  } catch (error) {
    console.error('Error loading system prompts:', error);
    return '';
  }
}

// Translate text using OpenAI GPT-4o
async function openaiTranslate(text, sourceLang, mode) {
  // Get the appropriate system prompt
  const systemPrompt = getSystemPrompt(mode);
  
  // Define target language based on source language and mode
  let targetLang;
  let userPrompt;
  
  if (mode === 'korean') {
    if (sourceLang === 'kor') {
      targetLang = 'eng'; // Korean to English
      userPrompt = `Translate the following Korean text to English: "${text}"`;
    } else if (sourceLang === 'eng') {
      targetLang = 'kor'; // English to Korean
      userPrompt = `Translate the following English text to Korean: "${text}"`;
    } else if (sourceLang === 'jpn') {
      targetLang = 'kor'; // Japanese to Korean
      userPrompt = `Translate the following Japanese text to Korean: "${text}"`;
    }
  } else { // japanese mode
    if (sourceLang === 'jpn') {
      targetLang = 'eng'; // Japanese to English
      userPrompt = `Translate the following Japanese text to English: "${text}"`;
    } else if (sourceLang === 'eng') {
      targetLang = 'jpn'; // English to Japanese
      userPrompt = `Translate the following English text to Japanese: "${text}"`;
    } else if (sourceLang === 'kor') {
      targetLang = 'jpn'; // Korean to Japanese
      userPrompt = `Translate the following Korean text to Japanese: "${text}"`;
    }
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const translation = response.choices[0].message.content.trim();
    const tokens = {
      prompt: response.usage.prompt_tokens,
      completion: response.usage.completion_tokens,
      total: response.usage.total_tokens
    };
    
    return {
      translation,
      tokens
    };
  } catch (error) {
    console.error('OpenAI translation error:', error);
    throw new Error(`OpenAI translation failed: ${error.message}`);
  }
}

export { openaiTranslate, detectLanguageWithLLM };
