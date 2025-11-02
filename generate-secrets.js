#!/usr/bin/env node

/**
 * Generate Strapi secrets for production deployment
 * Run this script with: node generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

function generateAppKeys() {
  return Array(4)
    .fill(0)
    .map(() => generateSecret())
    .join(',');
}

console.log('🔐 Strapi Production Secrets\n');
console.log('Copy these values to your Railway environment variables:\n');
console.log('─'.repeat(60));
console.log(`APP_KEYS=${generateAppKeys()}`);
console.log('─'.repeat(60));
console.log(`API_TOKEN_SALT=${generateSecret()}`);
console.log('─'.repeat(60));
console.log(`ADMIN_JWT_SECRET=${generateSecret()}`);
console.log('─'.repeat(60));
console.log(`TRANSFER_TOKEN_SALT=${generateSecret()}`);
console.log('─'.repeat(60));
console.log(`JWT_SECRET=${generateSecret()}`);
console.log('─'.repeat(60));
console.log('\n⚠️  IMPORTANT:');
console.log('1. Keep these secrets safe and private');
console.log('2. Never commit these to version control');
console.log('3. Add them to Railway project settings → Variables');
console.log('4. Also ensure you set:');
console.log('   - NODE_ENV=production');
console.log('   - DATABASE_CLIENT=postgres');
console.log('   - DATABASE_SSL=true');
console.log('\n✅ Railway will automatically provide DATABASE_URL when you add PostgreSQL\n');

