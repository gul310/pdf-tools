import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { generateSitemap } from './generate_sitemap.mjs';

const ROUTES = [
  '/',
  '/merge-pdf',
  '/split-pdf',
  '/compress-pdf',
  '/image-to-pdf',
  '/pdf-to-image',
  '/rotate-pdf',
  '/delete-pdf-pages',
  '/protect-pdf',
  '/unlock-pdf',
  '/add-watermark-pdf',
  '/pdf-to-word',
  '/word-to-pdf',
  '/pdf-to-excel',
  '/excel-to-pdf',
  '/pdf-to-ppt',
  '/ppt-to-pdf',
  '/sign-pdf',
  '/edit-pdf',
  '/add-page-numbers',
  '/crop-pdf',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/blog',
  '/404'
];

async function main() {
  console.log('========================================================');
  console.log('BUILDING STATIC PRERENDERED HTML FOR ALL 26 ROUTES & 404');
  console.log('========================================================\n');

  // 1. Build SSR bundle
  console.log('[Step 1/4] Compiling SSR entry with Vite...');
  execSync('npx vite build --ssr src/entry-server.tsx --outDir dist-ssr', { stdio: 'inherit' });

  // 2. Import SSR render function
  console.log('\n[Step 2/4] Loading compiled SSR renderer...');
  const ssrBundlePath = path.resolve('dist-ssr/entry-server.js');
  const { render } = await import(pathToFileURL(ssrBundlePath).href);

  // 3. Read client template
  console.log('[Step 3/4] Reading client template from dist/index.html...');
  const templatePath = path.resolve('dist/index.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error('dist/index.html not found. Run client build first (npm run build).');
  }
  const rawTemplate = fs.readFileSync(templatePath, 'utf8');

  // 4. Prerender each route
  console.log('\n[Step 4/4] Prerendering static HTML for each canonical route:');
  let renderedCount = 0;

  for (const route of ROUTES) {
    const { html, helmet } = render(route);

    // Extract hoisted elements from render output or helmet
    let title = '';
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      title = `<title>${titleMatch[1]}</title>`;
    } else if (helmet && helmet.title) {
      title = helmet.title.toString();
    }

    // Extract meta tags
    const metaMatches = [...html.matchAll(/<meta\s+[^>]*\/?>/gi)].map(m => m[0]);
    if (helmet && helmet.meta) {
      const hMeta = helmet.meta.toString();
      if (hMeta && !metaMatches.includes(hMeta)) metaMatches.push(hMeta);
    }

    // Extract link tags (canonical, etc.)
    const linkMatches = [...html.matchAll(/<link\s+[^>]*canonical[^>]*\/?>/gi)].map(m => m[0]);
    if (helmet && helmet.link) {
      const hLink = helmet.link.toString();
      if (hLink && !linkMatches.includes(hLink)) linkMatches.push(hLink);
    }

    // Extract ld+json script tags
    const jsonLdMatches = [...html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[0]);
    if (helmet && helmet.script) {
      const hScript = helmet.script.toString();
      if (hScript && !jsonLdMatches.includes(hScript)) jsonLdMatches.push(hScript);
    }

    // Clean body HTML: remove hoisted head elements
    let cleanBodyHtml = html
      .replace(/<title>.*?<\/title>/gi, '')
      .replace(/<meta\s+[^>]*\/?>/gi, '')
      .replace(/<link\s+[^>]*canonical[^>]*\/?>/gi, '')
      .replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');

    // Assemble final page HTML
    let pageHtml = rawTemplate;

    // Replace <title> in <head>
    if (title) {
      pageHtml = pageHtml.replace(/<title>[\s\S]*?<\/title>/i, title);
    }

    // Insert meta tags, canonical link, and json-ld schema right before </head>
    const headItems = [
      ...metaMatches,
      ...linkMatches,
      ...jsonLdMatches
    ].filter(Boolean);

    const headFragment = headItems.map(item => `    ${item}`).join('\n');
    pageHtml = pageHtml.replace('</head>', `${headFragment}\n  </head>`);

    // Insert clean body HTML into <div id="root">
    pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${cleanBodyHtml}</div>`);

    // Determine target output path
    if (route === '/') {
      fs.writeFileSync(path.resolve('dist/index.html'), pageHtml, 'utf8');
      console.log(`  ✓ Prerendered ${route.padEnd(20)} -> dist/index.html (${pageHtml.length} bytes)`);
    } else if (route === '/404') {
      fs.writeFileSync(path.resolve('dist/404.html'), pageHtml, 'utf8');
      console.log(`  ✓ Prerendered ${route.padEnd(20)} -> dist/404.html (${pageHtml.length} bytes)`);
    } else {
      const cleanRoute = route.replace(/^\//, '');
      const dirPath = path.resolve(`dist/${cleanRoute}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(path.join(dirPath, 'index.html'), pageHtml, 'utf8');
      fs.writeFileSync(path.resolve(`dist/${cleanRoute}.html`), pageHtml, 'utf8');
      console.log(`  ✓ Prerendered ${route.padEnd(20)} -> dist/${cleanRoute}/index.html (${pageHtml.length} bytes)`);
    }

    renderedCount++;
  }

  // 5. Generate & Synchronize Sitemap from Git History
  const sitemapXml = generateSitemap();
  fs.writeFileSync(path.resolve('dist/sitemap.xml'), sitemapXml, 'utf8');
  if (process.env.SYNC_PUBLIC_SITEMAP === 'true') {
    fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemapXml, 'utf8');
    console.log('  ✓ Synchronized public/sitemap.xml with Git history');
  }
  const urlCount = (sitemapXml.match(/<url>/g) || []).length;
  if (urlCount !== 26) {
    throw new Error(`Sitemap integrity failure: expected 26 canonical URLs, found ${urlCount}`);
  }
  console.log(`\n  ✓ Sitemap dynamically generated from Git history into dist/sitemap.xml (${urlCount} URLs)`);

  // 6. Clean up temporary SSR bundle
  fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
  console.log(`\nPrerender Complete: Successfully generated ${renderedCount} static HTML pages.`);
}

main().catch((err) => {
  console.error('\nPrerender Error:', err);
  process.exit(1);
});
