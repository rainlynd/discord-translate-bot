// Test script for LLM-based language detection
import 'dotenv/config';
import { detectLanguageWithLLM } from './src/models/openaiModel.js';

// Sample texts to test in different languages
const testSamples = [
  // Korean samples
  { text: '안녕하세요! 오늘 날씨가 좋네요.', expected: 'kor', description: 'Simple Korean greeting' },
  { text: '한국어로 대화하는 것이 재미있어요.', expected: 'kor', description: 'Korean sentence' },
  
  // Japanese samples
  { text: 'こんにちは！今日の天気はいいですね。', expected: 'jpn', description: 'Simple Japanese greeting' },
  { text: '日本語で話すのは楽しいです。', expected: 'jpn', description: 'Japanese sentence' },
  
  // English samples
  { text: 'Hello! The weather is nice today.', expected: 'eng', description: 'Simple English greeting' },
  { text: 'It\'s fun to chat in English.', expected: 'eng', description: 'English sentence' },
  
  // Mixed language samples
  { text: 'Hello 안녕하세요 こんにちは', expected: 'eng', description: 'Mixed greetings' },
  { text: 'I want to learn 한국어 and 日本語', expected: 'eng', description: 'English with Korean and Japanese words' },
  { text: '오늘 weather is 晴れ', expected: 'kor', description: 'Korean with English and Japanese words' },
  
  // Short texts
  { text: 'hi', expected: 'eng', description: 'Very short English' },
  { text: '안녕', expected: 'kor', description: 'Very short Korean' },
  { text: 'こん', expected: 'jpn', description: 'Very short Japanese' },
  
  // Edge cases
  { text: '1234567890', expected: 'eng', description: 'Numbers only' },
  { text: '😊👍🎉', expected: 'eng', description: 'Emojis only' },
  { text: 'lol', expected: 'eng', description: 'Short internet slang' },
  { text: 'ㅋㅋㅋㅋ', expected: 'kor', description: 'Korean internet slang' },
  { text: 'www', expected: 'eng', description: 'Japanese internet slang (might be detected as eng)' }
];

// Run tests
async function runTests() {
  console.log('=== Testing LLM-based Language Detection ===\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const sample of testSamples) {
    try {
      console.log(`Testing: "${sample.text}" (${sample.description})`);
      console.log(`Expected: ${sample.expected}`);
      
      const result = await detectLanguageWithLLM(sample.text);
      
      console.log(`Detected: ${result}`);
      
      if (result === sample.expected) {
        console.log('✅ PASSED\n');
        passed++;
      } else {
        console.log('❌ FAILED\n');
        failed++;
      }
    } catch (error) {
      console.error(`Error testing "${sample.text}": ${error.message}`);
      console.log('❌ FAILED (error)\n');
      failed++;
    }
  }
  
  // Print summary
  console.log('=== Test Summary ===');
  console.log(`Total tests: ${testSamples.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${(passed / testSamples.length * 100).toFixed(2)}%`);
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! LLM-based language detection is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Review the results to determine if adjustments are needed.');
  }
}

// Run all tests
runTests().catch(error => {
  console.error('Error during testing:', error);
});
