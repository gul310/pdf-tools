// Centralized Production Site Configuration
export const SITE_CONFIG = {
  name: 'PDF Tools Pro',
  title: 'PDF Tools Pro — 100% Free & Private Online PDF Suite',
  description: 'The premier client-side PDF utility suite. Merge, split, compress, protect with AES-256, unlock, rotate, and convert PDFs directly in your browser. Zero server uploads, total privacy.',
  // Base domain for production deployment (Hostinger / Apache)
  domain: 'https://pdftools-pro.com',
  author: 'PDF Tools Engineering Team',
  contactEmail: 'support@pdftools-pro.com',
  twitterHandle: '@pdftoolspro'
};

export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')) {
    return `${window.location.origin}${cleanPath}`;
  }
  return `${SITE_CONFIG.domain}${cleanPath}`;
}
