// API Key validation script for Discord Translator Bot
import 'dotenv/config';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('==== Discord Translator Bot API Key Validation ====');

// OpenAI API key test
async function testOpenAI() {
  console.log('\nTesting OpenAI API key...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not defined in .env file');
    return false;
  }
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('Sending test request to OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "OpenAI API connection successful"' }
      ],
      max_tokens: 20
    });
    
    console.log('✅ OpenAI API response received:');
    console.log(`"${response.choices[0].message.content}"`);
    return true;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Anthropic API key test
async function testAnthropic() {
  console.log('\nTesting Anthropic API key...');
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not defined in .env file');
    return false;
  }
  
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    console.log('Sending test request to Anthropic API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 20,
      system: 'You are a helpful assistant.',
      messages: [
        { role: 'user', content: 'Say "Anthropic API connection successful"' }
      ]
    });
    
    console.log('✅ Anthropic API response received:');
    console.log(`"${response.content[0].text}"`);
    return true;
  } catch (error) {
    console.error('❌ Anthropic API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Google API key test
async function testGoogle() {
  console.log('\nTesting Google API key...');
  
  if (!process.env.GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY is not defined in .env file');
    return false;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('Sending test request to Google Gemini API...');
    const result = await model.generateContent('Say "Google Gemini API connection successful"');
    const response = result.response;
    
    console.log('✅ Google Gemini API response received:');
    console.log(`"${response.text()}"`);
    return true;
  } catch (error) {
    console.error('❌ Google Gemini API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API validation tests...\n');
  
  const openaiResult = await testOpenAI();
  const anthropicResult = await testAnthropic();
  const googleResult = await testGoogle();
  
  console.log('\n==== Test Results Summary ====');
  console.log(`OpenAI API: ${openaiResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`Anthropic API: ${anthropicResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`Google Gemini API: ${googleResult ? '✅ Working' : '❌ Failed'}`);
  
  if (!openaiResult && !anthropicResult && !googleResult) {
    console.log('\n❌ All API tests failed. Please check your API keys and internet connection.');
  } else if (openaiResult && anthropicResult && googleResult) {
    console.log('\n✅ All API tests passed! Your keys are valid.');
  } else {
    console.log('\n⚠️ Some API tests failed. Please update the failing API keys in your .env file.');
  }
}

// Execute all tests
runAllTests().catch(error => {
  console.error('Fatal error during testing:', error);
});
