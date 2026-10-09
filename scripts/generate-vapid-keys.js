#!/usr/bin/env node
/**
 * VAPID Key Generation & Environment Tool
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 *
 * Generates an RFC 8292 compliant Web Push VAPID key pair.
 */

const webpush = require('web-push');

console.log('\n' + '='.repeat(72));
console.log('   DAILYTITHI.COM — VAPID WEB PUSH CREDENTIAL GENERATOR');
console.log('='.repeat(72) + '\n');

const keys = webpush.generateVAPIDKeys();

console.log('Generated Cryptographically Secure VAPID Key Pair:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);
console.log(`VAPID_SUBJECT="mailto:contact@dailytithi.com"\n`);

console.log('='.repeat(72));
console.log('HOW TO CONFIGURE:');
console.log('1. Local Development:');
console.log('   Add the 3 variables above into your .env.local file.\n');
console.log('2. Production Deployment (Vercel):');
console.log('   Go to: Vercel Dashboard -> Your Project -> Settings -> Environment Variables');
console.log('   Add the following 3 environment variables for Production & Preview:');
console.log('   - NEXT_PUBLIC_VAPID_PUBLIC_KEY');
console.log('   - VAPID_PRIVATE_KEY');
console.log('   - VAPID_SUBJECT');
console.log('='.repeat(72) + '\n');
