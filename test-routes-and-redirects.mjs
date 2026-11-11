import fs from 'node:fs';
import path from 'node:path';

console.log('====================================================');
console.log('TESTING ROUTES, REDIRECTS & CANONICAL CONSISTENCY');
console.log('====================================================\n');

// 1. Inspect public/sitemap.xml
const sitemapContent = fs.readFileSync('public/sitemap.xml', 'utf8');
const locMatches = [...sitemapContent.matchAll(/<loc>(https:\/\/pdf1998\.com[^<]*)<\/loc>/g)].map(m => m[1]);
console.log(`[Check 1] Sitemap URLs: Verified ${locMatches.length} canonical URLs.`);
if (locMatches.length !== 26) {
  console.error(`ERROR: Expected 26 canonical URLs in sitemap, found ${locMatches.length}`);
} else {
  console.log('  PASS: Sitemap contains exact 26 canonical URLs.');
}

// 2. Inspect Cloudflare public/_redirects
const redirectsContent = fs.readFileSync('public/_redirects', 'utf8');
const redirectLines = redirectsContent
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.startsWith('#'));

console.log('\n[Check 2] Cloudflare _redirects Rules:');
const cloudflareRules = [];
for (const line of redirectLines) {
  const parts = line.split(/\s+/);
  if (parts.length >= 3 && parts[2] === '301') {
    cloudflareRules.push({ from: parts[0], to: parts[1], status: 301 });
    console.log(`  Rule: ${parts[0]} -> ${parts[1]} (${parts[2]} Permanent)`);
  } else if (parts[0] === '/*' && parts[1] === '/index.html' && parts[2] === '200') {
    console.log(`  SPA Fallback: /* -> /index.html (200 Rewrite)`);
  }
}

// 3. Inspect Hostinger public/.htaccess
const htaccessContent = fs.readFileSync('public/.htaccess', 'utf8');
const rewriteRules = [...htaccessContent.matchAll(/RewriteRule\s+\^([^$\s]+)\/?\$\s+([^\s]+)\s+\[([^\]]+)\]/g)];
console.log('\n[Check 3] Hostinger .htaccess Permanent Redirect Rules:');
const apacheRules = [];
for (const match of rewriteRules) {
  const [_, fromPattern, target, flags] = match;
  apacheRules.push({ from: `/${fromPattern}`, to: target, flags });
  console.log(`  Rule: ^${fromPattern}/?$ -> ${target} [${flags}]`);
}

// 4. Inspect src/App.tsx Route Declarations & Redirects
const appTsxContent = fs.readFileSync('src/App.tsx', 'utf8');
const reactRouteMatches = [...appTsxContent.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<([^/>\s]+)/g)];
const reactRedirectMatches = [...appTsxContent.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate\s+to="([^"]+)"\s+replace/g)];

console.log(`\n[Check 4] React Router App.tsx Routes:`);
console.log(`  Total Active Page Routes: ${reactRouteMatches.length}`);
console.log(`  Total React Router Client Redirects: ${reactRedirectMatches.length}`);
for (const match of reactRedirectMatches) {
  console.log(`    Client Redirect: ${match[1]} -> ${match[2]} (replace)`);
}

// 5. Check for Redirect Loops
console.log('\n[Check 5] Redirect Loop Analysis:');
let hasLoop = false;
for (const rule of cloudflareRules) {
  const target = rule.to;
  const loopRule = cloudflareRules.find(r => r.from === target);
  if (loopRule) {
    console.error(`  FAIL: Detected redirect loop between ${rule.from} and ${target}!`);
    hasLoop = true;
  }
}
if (!hasLoop) {
  console.log('  PASS: Zero redirect loops detected in Cloudflare _redirects.');
}

let hasApacheLoop = false;
for (const rule of apacheRules) {
  const target = rule.to;
  const loopRule = apacheRules.find(r => r.from === target);
  if (loopRule) {
    console.error(`  FAIL: Detected Apache redirect loop between ${rule.from} and ${target}!`);
    hasApacheLoop = true;
  }
}
if (!hasApacheLoop) {
  console.log('  PASS: Zero redirect loops detected in Apache .htaccess.');
}

console.log('\n====================================================');
console.log('ALL ROUTE & REDIRECT CHECKS COMPLETED');
console.log('====================================================');
