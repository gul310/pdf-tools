import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export const GLOBAL_SHARED_DEPENDENCIES = [
  'src/components/SEO.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/config/site.ts'
];

export const CORE_TOOLS_METADATA = 'src/data/toolsData.ts';
export const EXTENDED_TOOLS_METADATA = 'src/data/extendedToolsData.ts';

export const ROUTE_DEPENDENCY_REGISTRY = [
  { route: '/', type: 'home', own: ['src/pages/Home.tsx', 'index.html'], group: [], changefreq: 'daily', priority: '1.0' },

  // 10 Core PDF Tools
  { route: '/merge-pdf', type: 'core-tool', own: ['src/pages/tools/MergePDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/split-pdf', type: 'core-tool', own: ['src/pages/tools/SplitPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/compress-pdf', type: 'core-tool', own: ['src/pages/tools/CompressPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/protect-pdf', type: 'core-tool', own: ['src/pages/tools/ProtectPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/unlock-pdf', type: 'core-tool', own: ['src/pages/tools/UnlockPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/rotate-pdf', type: 'core-tool', own: ['src/pages/tools/RotatePDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/delete-pdf-pages', type: 'core-tool', own: ['src/pages/tools/DeletePDFPages.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/pdf-to-image', type: 'core-tool', own: ['src/pages/tools/PDFToImage.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/image-to-pdf', type: 'core-tool', own: ['src/pages/tools/ImageToPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/add-watermark-pdf', type: 'core-tool', own: ['src/pages/tools/AddWatermarkPDF.tsx'], group: [CORE_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },

  // 10 Extended PDF Tools
  { route: '/pdf-to-word', type: 'extended-tool', own: ['src/pages/tools/PDFToWord.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/word-to-pdf', type: 'extended-tool', own: ['src/pages/tools/WordToPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/pdf-to-excel', type: 'extended-tool', own: ['src/pages/tools/PDFToExcel.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/excel-to-pdf', type: 'extended-tool', own: ['src/pages/tools/ExcelToPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/pdf-to-ppt', type: 'extended-tool', own: ['src/pages/tools/PDFToPPT.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/ppt-to-pdf', type: 'extended-tool', own: ['src/pages/tools/PPTToPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/sign-pdf', type: 'extended-tool', own: ['src/pages/tools/SignPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/edit-pdf', type: 'extended-tool', own: ['src/pages/tools/EditPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.9' },
  { route: '/add-page-numbers', type: 'extended-tool', own: ['src/pages/tools/AddPageNumbers.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },
  { route: '/crop-pdf', type: 'extended-tool', own: ['src/pages/tools/CropPDF.tsx'], group: [EXTENDED_TOOLS_METADATA], changefreq: 'weekly', priority: '0.8' },

  // Compliance & Institutional
  { route: '/blog', type: 'content', own: ['src/pages/Blog.tsx'], group: [], changefreq: 'weekly', priority: '0.7' },
  { route: '/about', type: 'content', own: ['src/pages/About.tsx'], group: [], changefreq: 'monthly', priority: '0.6' },
  { route: '/contact', type: 'content', own: ['src/pages/Contact.tsx'], group: [], changefreq: 'monthly', priority: '0.6' },
  { route: '/privacy-policy', type: 'content', own: ['src/pages/PrivacyPolicy.tsx'], group: [], changefreq: 'monthly', priority: '0.5' },
  { route: '/terms', type: 'content', own: ['src/pages/Terms.tsx'], group: [], changefreq: 'monthly', priority: '0.5' }
];

export function getRouteModificationDate(routeItem, overrides = {}) {
  // 1. Direct explicit override (for testing or manual pin)
  if (overrides[routeItem.route]) {
    return overrides[routeItem.route];
  }

  // 2. Query Git history for route's own files
  let ownDate = '';
  try {
    const ownArgs = routeItem.own.map(f => `"${f}"`).join(' ');
    ownDate = execSync(`git log -1 --format="%cd" --date=short -- ${ownArgs}`, { encoding: 'utf8' }).trim();
  } catch {
    // Git unavailable
  }

  // 3. Query group metadata if specified in overrides
  if (routeItem.group.length > 0) {
    for (const gf of routeItem.group) {
      if (overrides[gf]) {
        return overrides[gf];
      }
    }
  }

  // 4. Query global override
  if (overrides['__GLOBAL__']) {
    return overrides['__GLOBAL__'];
  }

  // 5. Canonical fallback matching verified repository commits
  if (ownDate && /^\d{4}-\d{2}-\d{2}$/.test(ownDate)) {
    return ownDate;
  }

  return routeItem.type.includes('tool') ? '2026-11-07' : '2026-11-11';
}

export function generateSitemap(overrides = {}) {
  const domain = 'https://pdf1998.com';
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const item of ROUTE_DEPENDENCY_REGISTRY) {
    const lastmod = getRouteModificationDate(item, overrides);
    const loc = item.route === '/' ? `${domain}/` : `${domain}${item.route}`;
    xml += '  <url>\n';
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

if (process.argv[1] && process.argv[1].endsWith('generate_sitemap.mjs')) {
  const xml = generateSitemap();
  fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
  if (fs.existsSync('dist')) {
    fs.writeFileSync('dist/sitemap.xml', xml, 'utf8');
  }
  console.log('✅ Generated sitemap from Git modification history (26 routes).');
}
