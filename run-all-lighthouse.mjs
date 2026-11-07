import { execSync } from 'node:child_process';
import fs from 'node:fs';

const pages = [
  { name: 'Homepage', path: '/' },
  { name: 'Merge PDF', path: '/merge-pdf' },
  { name: 'Split PDF', path: '/split-pdf' },
  { name: 'Compress PDF', path: '/compress-pdf' },
  { name: 'PDF to Image', path: '/pdf-to-image' },
  { name: 'Protect PDF', path: '/protect-pdf' }
];

const results = [];

console.log('--- Running Lighthouse Audits on Production Build (http://127.0.0.1:4173) ---\n');

for (const p of pages) {
  const url = `http://127.0.0.1:4173${p.path}`;
  
  // Desktop
  const desktopOut = `./lh-${p.name.replace(/\s+/g, '-').toLowerCase()}-desktop.json`;
  console.log(`Auditing [Desktop] ${p.name} (${url})...`);
  try {
    execSync(`npx lighthouse ${url} --chrome-flags="--headless" --output=json --output-path=${desktopOut} --preset=desktop --quiet`, { stdio: 'pipe' });
    const d = JSON.parse(fs.readFileSync(desktopOut, 'utf8'));
    results.push({
      page: p.name,
      device: 'Desktop',
      perf: Math.round(d.categories.performance.score * 100),
      a11y: Math.round(d.categories.accessibility.score * 100),
      bp: Math.round(d.categories['best-practices'].score * 100),
      seo: Math.round(d.categories.seo.score * 100),
      lcp: d.audits['largest-contentful-paint'].displayValue,
      cls: d.audits['cumulative-layout-shift'].displayValue,
      tbt: d.audits['total-blocking-time']?.displayValue || '0 ms'
    });
  } catch (err) {
    console.error(`Desktop audit failed for ${p.name}:`, err.message);
  }

  // Mobile
  const mobileOut = `./lh-${p.name.replace(/\s+/g, '-').toLowerCase()}-mobile.json`;
  console.log(`Auditing [Mobile] ${p.name} (${url})...`);
  try {
    execSync(`npx lighthouse ${url} --chrome-flags="--headless" --output=json --output-path=${mobileOut} --quiet`, { stdio: 'pipe' });
    const m = JSON.parse(fs.readFileSync(mobileOut, 'utf8'));
    results.push({
      page: p.name,
      device: 'Mobile',
      perf: Math.round(m.categories.performance.score * 100),
      a11y: Math.round(m.categories.accessibility.score * 100),
      bp: Math.round(m.categories['best-practices'].score * 100),
      seo: Math.round(m.categories.seo.score * 100),
      lcp: m.audits['largest-contentful-paint'].displayValue,
      cls: m.audits['cumulative-layout-shift'].displayValue,
      tbt: m.audits['total-blocking-time']?.displayValue || '0 ms'
    });
  } catch (err) {
    console.error(`Mobile audit failed for ${p.name}:`, err.message);
  }
}

console.log('\n================================================================');
console.log('                 ACTUAL LIGHTHOUSE AUDIT REPORT                  ');
console.log('================================================================');
console.table(results);
fs.writeFileSync('./lighthouse-summary.json', JSON.stringify(results, null, 2));
