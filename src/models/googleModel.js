import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

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

// Translate text using Google Gemini
async function geminiTranslate(text, sourceLang, mode) {
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
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Config
    const generationConfig = {
      temperature: 0.5,
      topP: 0.5,
      topK: 40,
      maxOutputTokens: 8192,
    };
    
    // Combine system prompt and user query
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    // Generate content
    const result = await model.generateContent(fullPrompt, generationConfig);
    const translation = result.response.text().trim();
    
    // Gemini doesn't provide token counts, so we'll estimate based on the length of the text
    const tokens = {
      prompt: Math.ceil(fullPrompt.length / 4),
      completion: Math.ceil(translation.length / 4),
      total: Math.ceil((fullPrompt.length + translation.length) / 4)
    };
    
    return {
      translation,
      tokens
    };
  } catch (error) {
    console.error('Google Gemini translation error:', error);
    throw new Error(`Google Gemini translation failed: ${error.message}`);
  }
}

export { geminiTranslate };
