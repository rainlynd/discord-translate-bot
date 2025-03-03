import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic API
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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

// Translate text using Anthropic Claude
async function anthropicTranslate(text, sourceLang, mode) {
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
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });
    
    const translation = response.content[0].text.trim();
    
    // Claude doesn't provide token counts in the same way as OpenAI,
    // so we'll estimate based on the length of the text
    const tokens = {
      prompt: Math.ceil(userPrompt.length / 4) + Math.ceil(systemPrompt.length / 4),
      completion: Math.ceil(translation.length / 4),
      total: Math.ceil((userPrompt.length + systemPrompt.length + translation.length) / 4)
    };
    
    return {
      translation,
      tokens
    };
  } catch (error) {
    console.error('Anthropic translation error:', error);
    throw new Error(`Anthropic translation failed: ${error.message}`);
  }
}

export { anthropicTranslate };
