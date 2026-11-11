import assert from 'node:assert/strict';
import fs from 'node:fs';

const robotsTxt = fs.readFileSync('public/robots.txt', 'utf8');

// 1. Check Content-Signal header
assert.ok(robotsTxt.includes('Content-Signal: ai-train=no, ai-input=yes, search=yes'), 'Must have Content-Signal directive');

// 2. AI Model Training Crawlers must all be Disallow: /
const trainingBots = ['GPTBot', 'Google-Extended', 'Applebot-Extended', 'ClaudeBot', 'Amazonbot'];
for (const bot of trainingBots) {
  const pattern = new RegExp(`User-agent:\\s*${bot}\\s*[\\r\\n]+Disallow:\\s*\\/`, 'i');
  assert.ok(pattern.test(robotsTxt), `${bot} must be Disallow: / per ai-train=no`);
}

// 3. Search Discovery Crawlers must be Allow: /
const searchBots = ['OAI-SearchBot', 'Claude-SearchBot', 'Amzn-SearchBot', 'PerplexityBot'];
for (const bot of searchBots) {
  const pattern = new RegExp(`User-agent:\\s*${bot}\\s*[\\r\\n]+Allow:\\s*\\/`, 'i');
  assert.ok(pattern.test(robotsTxt), `${bot} must be Allow: / per search=yes`);
}

// 4. User-Initiated Crawlers must be Allow: /
const userBots = ['ChatGPT-User', 'Claude-User', 'Amzn-User', 'facebookexternalhit'];
for (const bot of userBots) {
  const pattern = new RegExp(`User-agent:\\s*${bot}\\s*[\\r\\n]+Allow:\\s*\\/`, 'i');
  assert.ok(pattern.test(robotsTxt), `${bot} must be Allow: / per ai-input=yes`);
}

// 5. General Wildcard
assert.ok(/User-agent:\s*\*[\r\n]+Allow:\s*\//i.test(robotsTxt), 'User-agent: * must be Allow: /');

// 6. Check sitemap declaration
assert.ok(robotsTxt.includes('Sitemap: https://pdf1998.com/sitemap.xml'), 'Must declare production sitemap');

// 7. Check for duplicate user-agent declarations
const uaMatches = [...robotsTxt.matchAll(/User-agent:\s*([^\r\n]+)/gi)].map(m => m[1].trim());
const uaSet = new Set(uaMatches);
assert.equal(uaMatches.length, uaSet.size, `Duplicate user-agent groups detected: ${uaMatches}`);

console.log('✅ ROBOTS.TXT CRAWLER POLICY VALIDATION PASSED:');
console.log('- Total User-Agent Groups:', uaSet.size);
console.log('- Training Bots (Disallow /):', trainingBots.join(', '));
console.log('- Search Discovery Bots (Allow /):', searchBots.join(', '));
console.log('- User-Initiated Bots (Allow /):', userBots.join(', '));
console.log('- General Wildcard (*): Allow /');
console.log('- Content-Signal: ai-train=no, ai-input=yes, search=yes');
console.log('- Sitemap:', 'https://pdf1998.com/sitemap.xml');
