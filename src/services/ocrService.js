import { createHash } from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { PaddleOCR } from 'node-paddleocr';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// OCR models configuration for each language
const OCR_CONFIG = {
  japanese: {
    det: 'ch_PP-OCRv3_det',
    rec: 'japanese_PP-OCRv3',
    cls: 'ch_ppocr_mobile_v2.0_cls',
  },
  korean: {
    det: 'ch_PP-OCRv3_det',
    rec: 'korean_PP-OCRv3',
    cls: 'ch_ppocr_mobile_v2.0_cls',
  },
  english: {
    det: 'ch_PP-OCRv3_det',
    rec: 'en_PP-OCRv4',
    cls: 'ch_ppocr_mobile_v2.0_cls',
  }
};

class OCRService {
  constructor() {
    this.ocrInstances = {};
    this.cacheDir = path.join(__dirname, '../../data/ocr-cache');
    this.initializeService();
  }

  async initializeService() {
    // Ensure cache directory exists
    await fs.ensureDir(this.cacheDir);

    // Initialize OCR instances for each language
    for (const [lang, config] of Object.entries(OCR_CONFIG)) {
      this.ocrInstances[lang] = new PaddleOCR({
        det: config.det,
        rec: config.rec,
        cls: config.cls,
      });
    }
  }

  /**
   * Generate hash for image data for caching
   */
  generateHash(data) {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached OCR result if available
   */
  async getCachedResult(imageHash) {
    const cachePath = path.join(this.cacheDir, `${imageHash}.json`);
    try {
      if (await fs.pathExists(cachePath)) {
        const cacheData = await fs.readJson(cachePath);
        if (cacheData.timestamp > Date.now() - 24 * 60 * 60 * 1000) { // 24 hour cache
          return cacheData.result;
        }
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  }

  /**
   * Cache OCR result
   */
  async cacheResult(imageHash, result) {
    const cachePath = path.join(this.cacheDir, `${imageHash}.json`);
    try {
      await fs.writeJson(cachePath, {
        timestamp: Date.now(),
        result
      });
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(buffer) {
    return sharp(buffer)
      .normalize() // Normalize image contrast
      .sharpen() // Sharpen image
      .toBuffer();
  }

  /**
   * Download image from URL
   */
  async downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    return response.buffer();
  }

  /**
   * Process image with appropriate OCR model based on expected language
   */
  async processImage(buffer, expectedLang = 'english') {
    const ocr = this.ocrInstances[expectedLang];
    if (!ocr) {
      throw new Error(`No OCR instance available for language: ${expectedLang}`);
    }

    const result = await ocr.recognize(buffer);
    return this.formatOCRResult(result);
  }

  /**
   * Format OCR result into clean text
   */
  formatOCRResult(result) {
    if (!result || !Array.isArray(result)) {
      return '';
    }

    // Sort results by vertical position to maintain reading order
    const sortedResults = result.sort((a, b) => {
      const aY = a.box ? a.box[0][1] : 0;
      const bY = b.box ? b.box[0][1] : 0;
      return aY - bY;
    });

    return sortedResults
      .map(item => item.text)
      .filter(text => text && text.trim())
      .join(' ');
  }

  /**
   * Main method to extract text from image URL
   */
  async extractText(imageUrl, expectedLang = 'english') {
    try {
      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);
      const imageHash = this.generateHash(imageBuffer);

      // Check cache
      const cachedResult = await this.getCachedResult(imageHash);
      if (cachedResult) {
        return cachedResult;
      }

      // Preprocess image
      const processedBuffer = await this.preprocessImage(imageBuffer);

      // Perform OCR
      const result = await this.processImage(processedBuffer, expectedLang);

      // Cache result
      await this.cacheResult(imageHash, result);

      return result;
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  /**
   * Process multiple images in parallel
   */
  async extractTextFromMultipleImages(imageUrls, expectedLang = 'english') {
    const promises = imageUrls.map(url => this.extractText(url, expectedLang));
    return Promise.all(promises);
  }
}

export default new OCRService();
