import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the translation memory file
const TRANSLATION_MEMORY_PATH = path.join(__dirname, '../../data/translations.json');

// Write buffer configuration
const WRITE_DELAY = 30000; // 30 seconds between writes
const MAX_BUFFER_SIZE = 20; // Write after 20 new translations
let writeBuffer = new Set(); // Track modified keys
let writeTimer = null;
let needsWrite = false;
let isShuttingDown = false;

// In-memory cache of translations using Map for better performance
const translationMemory = new Map();

// Load translation memory from file
function loadTranslationMemory() {
  try {
    if (fs.existsSync(TRANSLATION_MEMORY_PATH)) {
      const data = fs.readFileSync(TRANSLATION_MEMORY_PATH, 'utf8');
      const memoryObject = JSON.parse(data);
      
      // Convert object to Map
      const memoryMap = new Map();
      for (const [key, value] of Object.entries(memoryObject)) {
        memoryMap.set(key, value);
      }
      
      // Clear and populate the translationMemory Map
      translationMemory.clear();
      for (const [key, value] of memoryMap.entries()) {
        translationMemory.set(key, value);
      }
      
      console.log(`Loaded ${translationMemory.size} entries into translation memory`);
      return translationMemory;
    }
    return translationMemory;
  } catch (error) {
    console.error('Error loading translation memory:', error);
    return translationMemory;
  }
}

// Schedule a delayed write to disk
function scheduleWrite() {
  if (isShuttingDown) {
    // Write immediately during shutdown
    saveTranslationMemoryToFile();
    return;
  }
  
  if (writeTimer === null) {
    writeTimer = setTimeout(() => {
      if (needsWrite) {
        saveTranslationMemoryToFile();
      }
      writeTimer = null;
    }, WRITE_DELAY);
  }
  
  // If buffer exceeds threshold, write immediately
  if (writeBuffer.size >= MAX_BUFFER_SIZE) {
    clearTimeout(writeTimer);
    writeTimer = null;
    saveTranslationMemoryToFile();
  }
}

// Save translation memory to file
function saveTranslationMemoryToFile() {
  try {
    writeBuffer.clear();
    needsWrite = false;
    
    // Convert Map to object for JSON serialization
    const memoryObject = {};
    for (const [key, value] of translationMemory.entries()) {
      memoryObject[key] = value;
    }
    
    fs.ensureDirSync(path.dirname(TRANSLATION_MEMORY_PATH));
    fs.writeFileSync(TRANSLATION_MEMORY_PATH, JSON.stringify(memoryObject, null, 2), 'utf8');
    console.log(`Saved ${translationMemory.size} entries to translation memory file`);
  } catch (error) {
    console.error('Error saving translation memory:', error);
  }
}

// Get a translation from memory
function getTranslationMemory(text, mode) {
  const key = `${text.toLowerCase()}_${mode}`;
  return translationMemory.get(key);
}

// Save a translation to memory
function saveTranslation(originalText, translatedText, mode, tokens) {
  const key = `${originalText.toLowerCase()}_${mode}`;
  
  // Update memory cache
  translationMemory.set(key, {
    translation: translatedText,
    tokens: tokens,
    timestamp: new Date().toISOString()
  });
  
  // Mark as needing to be written to disk
  writeBuffer.add(key);
  needsWrite = true;
  
  // Prune if over limit (500 entries)
  try {
    const configPath = path.join(__dirname, '../../config/default.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const limit = config.translationMemoryLimit || 500;
    
    if (translationMemory.size > limit) {
      // Convert to array to sort by timestamp
      const entries = Array.from(translationMemory.entries())
        .map(([k, v]) => ({ key: k, ...v }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Remove oldest entries
      const toRemove = entries.slice(0, translationMemory.size - limit);
      for (const entry of toRemove) {
        translationMemory.delete(entry.key);
      }
    }
  } catch (error) {
    console.error('Error pruning translation memory:', error);
  }
  
  // Schedule a delayed write
  scheduleWrite();
  
  return translationMemory.get(key);
}

// Initialize by loading memory
loadTranslationMemory();

// Setup shutdown handler to ensure data is saved
function flushMemory() {
  isShuttingDown = true;
  if (needsWrite) {
    saveTranslationMemoryToFile();
  }
}

// Export flush method for clean shutdown

export { 
  getTranslationMemory, 
  saveTranslation, 
  loadTranslationMemory,
  flushMemory 
};
