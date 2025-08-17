#!/usr/bin/env node

const https = require('https');

// DeepSeek API configuration
const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-12aec7fe829a4b5398944ee57121262f';
const API_URL = 'https://api.deepseek.com/chat/completions';

// Test data
const testPayload = {
  model: 'deepseek-chat',
  messages: [
    {
      role: 'user',
      content: 'Hello! Can you respond with a simple "API test successful" message?'
    }
  ],
  max_tokens: 50,
  temperature: 0.1
};

console.log('🔑 Testing DeepSeek API key...');
console.log(`📡 API URL: ${API_URL}`);
console.log(`🔐 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
console.log('');

// Convert payload to JSON
const postData = JSON.stringify(testPayload);

// Parse URL
const url = new URL(API_URL);

// Request options
const options = {
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make the request
const req = https.request(options, (res) => {
  console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('📋 Response Headers:');
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log('');

  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response Body:');
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (res.statusCode === 200 && jsonResponse.choices && jsonResponse.choices[0]) {
        console.log('');
        console.log('✅ DeepSeek API test SUCCESSFUL!');
        console.log(`💬 AI Response: "${jsonResponse.choices[0].message.content}"`);
      } else {
        console.log('');
        console.log('❌ DeepSeek API test FAILED!');
        if (jsonResponse.error) {
          console.log(`🚨 Error: ${jsonResponse.error.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.log(responseData);
      console.log('');
      console.log('❌ DeepSeek API test FAILED!');
      console.log(`🚨 Invalid JSON response: ${error.message}`);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ DeepSeek API test FAILED!');
  console.log(`🚨 Network Error: ${error.message}`);
});

req.on('timeout', () => {
  console.log('❌ DeepSeek API test FAILED!');
  console.log('🚨 Request timeout');
  req.destroy();
});

// Set timeout
req.setTimeout(30000);

// Send the request
req.write(postData);
req.end();

console.log('⏳ Sending request to DeepSeek API...');