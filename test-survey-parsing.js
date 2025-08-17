#!/usr/bin/env node

const https = require('https');

// DeepSeek API configuration
const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-12aec7fe829a4b5398944ee57121262f';
const API_URL = 'https://api.deepseek.com/chat/completions';

// Sample survey text
const sampleText = `Sample Survey

This is a test survey.

1. What is your favorite color?
a) Red
b) Blue
c) Green
d) Yellow`;

console.log('🔍 Testing Survey Text Parsing...');
console.log('📝 Sample Survey Text:');
console.log('---');
console.log(sampleText);
console.log('---');
console.log('');

// Test payload for survey parsing
const testPayload = {
  model: 'deepseek-chat',
  messages: [
    {
      role: 'system',
      content: `You are a survey text parser. Parse the survey text and return a JSON object with the following structure:
{
  "title": "string",
  "description": "string", 
  "questions": [
    {
      "id": number,
      "text": "string",
      "options": [
        {
          "id": "a"|"b"|"c"|"d",
          "text": "string",
          "score": 0|1|2|3
        }
      ]
    }
  ],
  "scoringGuide": {
    "pointValues": "string",
    "totalPossible": number,
    "ranges": [
      {
        "min": number,
        "max": number,
        "title": "string", 
        "description": "string"
      }
    ]
  },
  "note": "string (optional)"
}

Rules:
- Extract the title from the first line
- Extract description from the text after title before questions
- Parse numbered questions (1., 2., etc.)
- Parse lettered options (a), b), c), d) with scores a=0, b=1, c=2, d=3
- Extract scoring guide with point values and score ranges
- Extract any notes at the end
- Return only valid JSON, no explanations`
    },
    {
      role: 'user',
      content: sampleText
    }
  ],
  temperature: 0.1,
  max_tokens: 4000
};

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
  console.log('');

  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseData);
      
      if (res.statusCode === 200 && jsonResponse.choices && jsonResponse.choices[0]) {
        const content = jsonResponse.choices[0].message.content;
        console.log('📝 AI Raw Response:');
        console.log('---');
        console.log(content);
        console.log('---');
        console.log('');
        
        // Try to parse the returned JSON
        try {
          const parsedSurvey = JSON.parse(content);
          console.log('✅ Survey parsing SUCCESSFUL!');
          console.log('🎯 Parsed Survey Structure:');
          console.log(JSON.stringify(parsedSurvey, null, 2));
          
          // Basic validation
          if (parsedSurvey.title && parsedSurvey.description && parsedSurvey.questions) {
            console.log('');
            console.log('✅ Basic validation PASSED!');
            console.log(`📋 Title: "${parsedSurvey.title}"`);
            console.log(`📄 Description: "${parsedSurvey.description}"`);
            console.log(`❓ Questions: ${parsedSurvey.questions.length}`);
          } else {
            console.log('');
            console.log('⚠️ Basic validation FAILED - missing required fields');
          }
        } catch (parseError) {
          console.log('❌ Survey parsing FAILED!');
          console.log(`🚨 JSON Parse Error: ${parseError.message}`);
        }
      } else {
        console.log('❌ DeepSeek API request FAILED!');
        console.log('📝 Response:');
        console.log(JSON.stringify(jsonResponse, null, 2));
      }
    } catch (error) {
      console.log('❌ DeepSeek API request FAILED!');
      console.log(`🚨 Invalid JSON response: ${error.message}`);
      console.log('📝 Raw Response:');
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ DeepSeek API request FAILED!');
  console.log(`🚨 Network Error: ${error.message}`);
});

req.on('timeout', () => {
  console.log('❌ DeepSeek API request FAILED!');
  console.log('🚨 Request timeout');
  req.destroy();
});

// Set timeout
req.setTimeout(30000);

// Send the request
req.write(postData);
req.end();

console.log('⏳ Sending survey text to DeepSeek API for parsing...');