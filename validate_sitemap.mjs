import assert from 'node:assert/strict';
import fs from 'node:fs';

const xml = fs.readFileSync('dist/sitemap.xml', 'utf8').trim();

// Basic XML checks
assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), 'Must have XML declaration');
assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Must have urlset namespace');
assert.ok(xml.endsWith('</urlset>'), 'Must close urlset');

// Parse all <url> blocks
const urlRegex = /<url>([\s\S]*?)<\/url>/g;
const urls = [];
let match;
while ((match = urlRegex.exec(xml)) !== null) {
  const locMatch = match[1].match(/<loc>(.*?)<\/loc>/);
  const lastmodMatch = match[1].match(/<lastmod>(.*?)<\/lastmod>/);
  const changefreqMatch = match[1].match(/<changefreq>(.*?)<\/changefreq>/);
  const priorityMatch = match[1].match(/<priority>(.*?)<\/priority>/);
  
  assert.ok(locMatch, 'Every url must have loc');
  assert.ok(lastmodMatch, 'Every url must have lastmod');
  assert.ok(changefreqMatch, 'Every url must have changefreq');
  assert.ok(priorityMatch, 'Every url must have priority');
  
  urls.push({
    loc: locMatch[1],
    lastmod: lastmodMatch[1],
    changefreq: changefreqMatch[1],
    priority: priorityMatch[1]
  });
}

assert.equal(urls.length, 26, 'Must contain exactly 26 canonical URLs');
const locSet = new Set(urls.map(u => u.loc));
assert.equal(locSet.size, 26, 'All 26 URLs must be unique');

let date20261111Count = 0;
let date20261107Count = 0;

for (const u of urls) {
  assert.ok(u.loc.startsWith('https://pdf1998.com'), 'Must start with canonical domain: ' + u.loc);
  assert.match(u.lastmod, /^\d{4}-\d{2}-\d{2}$/, 'Must be valid ISO date: ' + u.lastmod);
  assert.ok(['daily', 'weekly', 'monthly'].includes(u.changefreq), 'Valid changefreq: ' + u.changefreq);
  const p = parseFloat(u.priority);
  assert.ok(p >= 0.0 && p <= 1.0, 'Valid priority: ' + u.priority);
  
  if (u.lastmod === '2026-11-11') date20261111Count++;
  if (u.lastmod === '2026-11-07') date20261107Count++;
}

assert.equal(date20261111Count, 6, 'Must have 6 URLs with 2026-11-11 (Homepage + 5 trust/content pages)');
assert.equal(date20261107Count, 20, 'Must have 20 URLs with 2026-11-07 (20 PDF tools)');

console.log('✅ SITEMAP VALIDATION PASSED:');
console.log(`- Total URLs: ${urls.length}`);
console.log(`- Unique URLs: ${locSet.size}`);
console.log(`- Recently updated routes (2026-11-11): ${date20261111Count}`);
console.log(`- Tool engine routes (2026-11-07): ${date20261107Count}`);

