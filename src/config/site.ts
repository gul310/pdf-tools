// Centralized Production Site Configuration
export const SITE_CONFIG = {
  name: 'PDF1998',
  title: 'PDF1998 — 100% Free & Private Online PDF Suite',
  description: 'The premier client-side PDF utility suite. Merge, split, compress, protect with AES-256, unlock, rotate, and convert PDFs directly in your browser. Zero server uploads, total privacy.',
  // Base domain for production deployment (Hostinger / Apache)
  domain: 'https://pdf1998.com',
  author: 'PDF1998 Engineering Team',
  contactEmail: 'support@pdf1998.com',
  githubUrl: 'https://github.com/gul310/pdf-tools'
};

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Production canonical domain is always preserved to prevent preview staging canonical drift
  return `${SITE_CONFIG.domain}${cleanPath}`;
}
