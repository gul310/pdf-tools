import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createPdfToolkit, PdfPasswordError } from 'pdfstudio';
import JSZip from 'jszip';

// Configure PDF.js worker to use local public worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

// Singleton PdfToolkit instance to avoid repeatedly loading WASM
let toolkitPromise: ReturnType<typeof createPdfToolkit> | null = null;

export async function getPdfToolkit() {
  if (!toolkitPromise) {
    toolkitPromise = createPdfToolkit({
      wasmUrl: typeof window !== 'undefined' ? '/wasm/qpdf.wasm' : undefined
    }).catch(err => {
      toolkitPromise = null;
      throw err;
    });
  }
  return toolkitPromise;
}

// Convert File or Uint8Array to ArrayBuffer
export async function fileToArrayBuffer(file: File | Uint8Array | ArrayBuffer): Promise<ArrayBuffer> {
  if (file instanceof ArrayBuffer) {
    return file;
  }
  if (file instanceof Uint8Array) {
    const copy = new Uint8Array(file.byteLength);
    copy.set(file);
    return copy.buffer as ArrayBuffer;
  }
  return await file.arrayBuffer();
}

// Convert File or ArrayBuffer to Uint8Array
export async function fileToUint8Array(file: File | Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  if (file instanceof Uint8Array) {
    return file;
  }
  if (file instanceof ArrayBuffer) {
    return new Uint8Array(file);
  }
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

// Format file size nicely
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate if file is a valid PDF
export function validatePDF(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File is empty (0 bytes).' };
  }
  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    return { valid: false, error: 'File must have a .pdf extension.' };
  }
  return { valid: true };
}

// Trigger browser download for a PDF
export function downloadPDF(data: Uint8Array | Blob, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Trigger browser download for a ZIP archive
export async function downloadZIP(
  files: Array<{ name: string; data: Uint8Array | Blob }>,
  zipFilename: string
) {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.data);
  }
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Inspect PDF: get page count and check if encrypted
export async function getPDFInfo(file: File | Uint8Array): Promise<{ pageCount: number; isEncrypted: boolean }> {
  const buffer = await fileToArrayBuffer(file);
  try {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
    const pdf = await loadingTask.promise;
    return {
      pageCount: pdf.numPages,
      isEncrypted: false
    };
  } catch (err: any) {
    if (err?.name === 'PasswordException' || err?.message?.includes('password')) {
      return {
        pageCount: 0,
        isEncrypted: true
      };
    }
    // Fallback to pdf-lib
    try {
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return {
        pageCount: doc.getPageCount(),
        isEncrypted: doc.isEncrypted
      };
    } catch {
      throw new Error('Unable to read PDF. The file may be corrupt or encrypted.');
    }
  }
}

// Render a single PDF page thumbnail as Data URL for interactive grid preview
export async function renderPDFThumbnail(
  file: File | Uint8Array,
  pageNum: number,
  maxDimension = 200
): Promise<string> {
  const buffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNum);
  
  const unscaledViewport = page.getViewport({ scale: 1 });
  const maxActual = Math.max(unscaledViewport.width, unscaledViewport.height);
  const scale = maxDimension / maxActual;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas 2D rendering context.');
  }

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas
  } as any).promise;

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  // Clean up canvas
  canvas.width = 0;
  canvas.height = 0;

  return dataUrl;
}

// Parse range strings like "1-3, 5, 8-10" into 1-based page numbers
export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pages.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

// 1. MERGE PDFs
export async function mergePDFs(
  files: Array<File | Uint8Array>,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error('Please select at least 2 PDF files to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const fileBytes = await fileToUint8Array(files[i]);
    const pdfToMerge = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
    if (onProgress) {
      onProgress(Math.round(((i + 1) / files.length) * 100));
    }
  }

  return await mergedPdf.save();
}

// 2. SPLIT PDF
export interface SplitOptions {
  mode: 'extract' | 'single' | 'ranges';
  selectedPages?: number[];
  rangeString?: string;
}

export async function splitPDF(
  file: File | Uint8Array,
  options: SplitOptions,
  onProgress?: (progress: number) => void
): Promise<{ files: Array<{ name: string; data: Uint8Array }>; isZip: boolean }> {
  const bytes = await fileToUint8Array(file);
  const srcDoc = await PDFDocument.load(bytes);
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('The PDF document contains no pages.');
  }

  const resultFiles: Array<{ name: string; data: Uint8Array }> = [];

  if (options.mode === 'single') {
    // Split into individual 1-page documents
    for (let i = 0; i < totalPages; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copiedPage);
      const data = await singleDoc.save();
      resultFiles.push({
        name: `page-${i + 1}.pdf`,
        data
      });
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalPages) * 100));
      }
    }
    return { files: resultFiles, isZip: true };
  }

  // Extract selected pages or range into a single unified or targeted PDF
  let targetPages: number[] = [];
  if (options.mode === 'ranges' && options.rangeString) {
    targetPages = parsePageRanges(options.rangeString, totalPages);
  } else if (options.selectedPages && options.selectedPages.length > 0) {
    targetPages = options.selectedPages.filter(p => p >= 1 && p <= totalPages);
  }

  if (targetPages.length === 0) {
    throw new Error('Please select at least one valid page to extract.');
  }

  const extractedDoc = await PDFDocument.create();
  // 0-based indices for pdf-lib
  const pageIndices = targetPages.map(p => p - 1);
  const copiedPages = await extractedDoc.copyPages(srcDoc, pageIndices);
  for (const p of copiedPages) {
    extractedDoc.addPage(p);
  }

  const outputData = await extractedDoc.save();
  resultFiles.push({
    name: 'extracted-pages.pdf',
    data: outputData
  });

  if (onProgress) onProgress(100);

  return { files: resultFiles, isZip: false };
}

// 3. COMPRESS PDF
export async function compressPDF(
  file: File | Uint8Array,
  level: 'low' | 'medium' | 'high' = 'medium'
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  
  // Use QPDF WASM lossless stream recompression and object stream packing
  try {
    const toolkit = await getPdfToolkit();
    const compressionLevel = level === 'high' ? 9 : level === 'medium' ? 7 : 4;
    const compressed = await toolkit.compress(bytes, {
      compressionLevel,
      objectStreams: true,
      linearize: true
    });
    return compressed;
  } catch (err) {
    console.warn('QPDF compression fallback to pdf-lib optimization:', err);
    // Fallback using pdf-lib object stream consolidation
    const pdfDoc = await PDFDocument.load(bytes);
    return await pdfDoc.save({ useObjectStreams: true });
  }
}

// 4. IMAGE TO PDF
export interface ImageToPdfOptions {
  pageSize: 'fit' | 'a4' | 'letter';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: number; // in points
}

export async function imagesToPDF(
  imageFiles: File[],
  options: ImageToPdfOptions,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  if (imageFiles.length === 0) {
    throw new Error('Please select at least one image file.');
  }

  const pdfDoc = await PDFDocument.create();

  // Standard sizes in points (72 points = 1 inch)
  const SIZES = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612.0, height: 792.0 }
  };

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const imageBytes = await fileToUint8Array(file);
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
    const isJpg = file.type === 'image/jpeg' || file.name.toLowerCase().match(/\.(jpe?g)$/i);

    let embeddedImage;

    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        // Fallback via canvas if PNG has uncommon metadata chunks
        embeddedImage = await embedViaCanvas(pdfDoc, file);
      }
    } else if (isJpg) {
      try {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      } catch {
        embeddedImage = await embedViaCanvas(pdfDoc, file);
      }
    } else {
      // WebP, GIF, BMP, etc. -> convert via Canvas to JPEG/PNG
      embeddedImage = await embedViaCanvas(pdfDoc, file);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth = imgWidth;
    let pageHeight = imgHeight;

    if (options.pageSize === 'a4' || options.pageSize === 'letter') {
      const base = SIZES[options.pageSize];
      let isLandscape = false;
      if (options.orientation === 'landscape') {
        isLandscape = true;
      } else if (options.orientation === 'auto') {
        isLandscape = imgWidth > imgHeight;
      }
      pageWidth = isLandscape ? base.height : base.width;
      pageHeight = isLandscape ? base.width : base.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate drawing dimensions with margins
    const margin = options.pageSize === 'fit' ? 0 : Math.max(0, options.margin);
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;

    const x = margin + (availableWidth - renderWidth) / 2;
    const y = margin + (availableHeight - renderHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: renderWidth,
      height: renderHeight
    });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / imageFiles.length) * 100));
    }
  }

  return await pdfDoc.save();
}

// Helper to convert non-JPEG/PNG or problematic images via Canvas
async function embedViaCanvas(pdfDoc: PDFDocument, file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.drawImage(img, 0, 0);

  const pngUrl = canvas.toDataURL('image/png');
  canvas.width = 0;
  canvas.height = 0;

  // Convert base64 dataUrl to Uint8Array
  const byteCharacters = atob(pngUrl.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let j = 0; j < byteCharacters.length; j++) {
    byteNumbers[j] = byteCharacters.charCodeAt(j);
  }
  return await pdfDoc.embedPng(new Uint8Array(byteNumbers));
}

// 5. PDF TO IMAGE
export interface PdfToImageOptions {
  format: 'png' | 'jpeg';
  scale?: number; // 1, 2, or 3
  selectedPages?: number[];
}

export interface ConvertedImageResult {
  pageNum: number;
  blob: Blob;
  dataUrl: string;
  filename: string;
}

export async function convertPDFToImages(
  file: File | Uint8Array,
  options: PdfToImageOptions,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertedImageResult[]> {
  const buffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const targetPages = options.selectedPages && options.selectedPages.length > 0
    ? options.selectedPages.filter(p => p >= 1 && p <= totalPages)
    : Array.from({ length: totalPages }, (_, i) => i + 1);

  const results: ConvertedImageResult[] = [];
  const scale = options.scale || 2.0; // Default 2x for sharp retina output

  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Could not obtain canvas 2D context.');

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas: canvas
    } as any).promise;

    const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = options.format === 'jpeg' ? 0.92 : undefined;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob from canvas'));
      }, mimeType, quality);
    });

    // Cleanup canvas memory
    canvas.width = 0;
    canvas.height = 0;

    const ext = options.format === 'jpeg' ? 'jpg' : 'png';
    results.push({
      pageNum,
      blob,
      dataUrl,
      filename: `page-${pageNum}.${ext}`
    });

    if (onProgress) {
      onProgress(i + 1, targetPages.length);
    }
  }

  return results;
}

// 6. ROTATE PDF
export async function rotatePDF(
  file: File | Uint8Array,
  rotations: Record<number, number> | number // pageNum (1-based) -> angle (90, 180, 270)
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  for (let i = 1; i <= totalPages; i++) {
    const angleToAdd = typeof rotations === 'number' ? rotations : (rotations[i] || 0);
    if (angleToAdd !== 0) {
      const page = pdfDoc.getPage(i - 1);
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + angleToAdd + 360) % 360;
      page.setRotation(degrees(newRotation));
    }
  }

  return await pdfDoc.save();
}

// 7. DELETE PDF PAGES
export async function deletePDFPages(
  file: File | Uint8Array,
  pagesToDelete: number[] // 1-based page numbers
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  const toDeleteSet = new Set(pagesToDelete.filter(p => p >= 1 && p <= totalPages));

  if (toDeleteSet.size >= totalPages) {
    throw new Error('Cannot delete all pages from the document. At least one page must remain.');
  }
  if (toDeleteSet.size === 0) {
    return bytes;
  }

  // Create new document containing only preserved pages
  const newDoc = await PDFDocument.create();
  const pagesToKeepIndices: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!toDeleteSet.has(i)) {
      pagesToKeepIndices.push(i - 1);
    }
  }

  const copiedPages = await newDoc.copyPages(pdfDoc, pagesToKeepIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

// 8. PROTECT PDF (REAL AES-256 ENCRYPTION VIA QPDF WASM)
export async function protectPDF(
  file: File | Uint8Array,
  userPassword: string,
  ownerPassword?: string,
  permissions?: {
    print?: 'full' | 'low' | 'none';
    modify?: 'all' | 'annotate' | 'form' | 'assembly' | 'none';
    extract?: boolean;
  }
): Promise<Uint8Array> {
  if (!userPassword || userPassword.trim() === '') {
    throw new Error('A user password is required to encrypt the PDF.');
  }

  const bytes = await fileToUint8Array(file);
  const toolkit = await getPdfToolkit();

  const locked = await toolkit.lock(bytes, {
    userPassword: userPassword.trim(),
    ownerPassword: ownerPassword?.trim() || userPassword.trim(),
    keyLength: 256, // Industry-standard 256-bit AES
    permissions: permissions || {
      print: 'full',
      modify: 'all',
      extract: true
    }
  });

  return locked;
}

// 9. UNLOCK PDF (REAL DECRYPTION VIA QPDF WASM)
export async function unlockPDF(
  file: File | Uint8Array,
  password: string
): Promise<Uint8Array> {
  if (!password) {
    throw new Error('Please enter the current password to unlock this PDF.');
  }

  const bytes = await fileToUint8Array(file);
  const toolkit = await getPdfToolkit();

  try {
    const unlocked = await toolkit.unlock(bytes, {
      password: password.trim()
    });
    return unlocked;
  } catch (err: any) {
    if (err instanceof PdfPasswordError || err?.message?.toLowerCase().includes('password')) {
      throw new Error('Incorrect password. Please verify and try again.');
    }
    throw new Error(err?.message || 'Failed to unlock PDF. Please check the password.');
  }
}

// 10. ADD WATERMARK TO PDF
export interface WatermarkOptions {
  text: string;
  fontSize: number;
  color: string; // Hex color e.g. '#ff0000'
  opacity: number; // 0.1 to 1.0
  rotation: number; // degrees, e.g. -45, 0, 45
  position: 'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  pages?: 'all' | 'first' | 'custom';
  customPages?: number[];
}

// Convert hex color to rgb [0-1]
function hexToRgb(hex: string) {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;
  return rgb(isNaN(r) ? 0.5 : r, isNaN(g) ? 0.5 : g, isNaN(b) ? 0.5 : b);
}

export async function addWatermarkPDF(
  file: File | Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  if (!options.text || options.text.trim() === '') {
    throw new Error('Please provide watermark text.');
  }

  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const totalPages = pdfDoc.getPageCount();

  const color = hexToRgb(options.color || '#94a3b8');
  const opacity = Math.max(0.05, Math.min(1.0, options.opacity ?? 0.3));
  const fontSize = options.fontSize || 42;
  const watermarkText = options.text.trim();
  const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  for (let i = 1; i <= totalPages; i++) {
    if (options.pages === 'first' && i !== 1) continue;
    if (options.pages === 'custom' && options.customPages && !options.customPages.includes(i)) continue;

    const page = pdfDoc.getPage(i - 1);
    const { width, height } = page.getSize();

    let x = (width - textWidth) / 2;
    let y = (height - textHeight) / 2;
    let angle = options.rotation ?? -45;

    if (options.position === 'diagonal') {
      angle = -45;
      x = (width - textWidth) / 2;
      y = (height - textHeight) / 2;
    } else if (options.position === 'center') {
      angle = options.rotation ?? 0;
      x = (width - textWidth) / 2;
      y = (height - textHeight) / 2;
    } else if (options.position === 'top-left') {
      x = 40;
      y = height - 40 - textHeight;
      angle = 0;
    } else if (options.position === 'top-right') {
      x = width - 40 - textWidth;
      y = height - 40 - textHeight;
      angle = 0;
    } else if (options.position === 'bottom-left') {
      x = 40;
      y = 40;
      angle = 0;
    } else if (options.position === 'bottom-right') {
      x = width - 40 - textWidth;
      y = 40;
      angle = 0;
    }

    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity,
      rotate: degrees(angle)
    });
  }

  return await pdfDoc.save();
}

// Re-export extended PDF tools utilities, file integrity, and conversion validation
export * from './extendedPdfUtils';
export * from './fileIntegrity';
export * from './conversionValidator';
