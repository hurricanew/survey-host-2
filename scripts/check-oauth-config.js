#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * Run this script to verify your Google OAuth setup
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../apps/web/.env.local');
const exampleCredentials = [
  'your_actual_client_id_here.apps.googleusercontent.com',
  'your_actual_client_secret_here'
];

console.log('🔍 Checking OAuth Configuration...\n');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Expected location: apps/web/.env.local');
  console.log('   Please create this file with your Google OAuth credentials');
  process.exit(1);
}

// Read .env.local file
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const config = {};

lines.forEach(line => {
  if (line.includes('=') && !line.trim().startsWith('#')) {
    const [key, value] = line.split('=');
    config[key.trim()] = value.trim();
  }
});

console.log('✅ .env.local file found');

// Check required variables
const required = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
let allConfigured = true;

required.forEach(key => {
  if (!config[key]) {
    console.log(`❌ ${key} is missing`);
    allConfigured = false;
  } else if (key === 'NEXTAUTH_SECRET' && config[key] === 'your_nextauth_secret_here') {
    console.log(`⚠️  ${key} is still using placeholder value`);
    allConfigured = false;
  } else if (exampleCredentials.includes(config[key])) {
    console.log(`⚠️  ${key} is using example/placeholder credentials`);
    console.log(`   Current value: ${config[key]}`);
    console.log('   You need real credentials from Google Cloud Console');
    allConfigured = false;
  } else {
    console.log(`✅ ${key} is configured`);
  }
});

// Show expected redirect URI
console.log('\n🔗 Expected OAuth Redirect URI:');
console.log(`   ${config.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`);
console.log('\n📝 Add this EXACT URI to your Google Cloud Console OAuth 2.0 Client ID configuration');

if (allConfigured) {
  console.log('\n🎉 OAuth configuration looks good!');
  console.log('   You should now be able to sign in with Google');
} else {
  console.log('\n⚠️  Please fix the configuration issues above');
  console.log('   See OAUTH_SETUP.md for detailed instructions');
}

console.log('\n🌐 Test configuration: http://localhost:3000/api/auth/test');
console.log('📚 Setup guide: OAUTH_SETUP.md');