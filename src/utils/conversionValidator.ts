/**
 * Conversion Quality Validation Engine
 * Validates generated binary signatures, structural integrity, element counts,
 * and detects potential content regressions prior to download.
 */

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

export type QualityStatus = 'High Fidelity' | 'Partial Fidelity' | 'Visual Only' | 'Conversion Warning';

export interface ValidationDetails {
  isValidSignature: boolean;
  expectedSignature: string;
  actualSignature: string;
  outputSizeBytes: number;
  sourceCount?: number;
  outputCount?: number;
  countLabel?: string; // 'pages' | 'slides' | 'sheets'
  extractedTextChars?: number;
  hasImages?: boolean;
  hasTables?: boolean;
  warnings: string[];
  disclosures: string[];
}

export interface ValidationResult {
  status: QualityStatus;
  summary: string;
  details: ValidationDetails;
}

/**
 * Checks magic byte signatures for binary formats.
 */
function checkMagicBytes(
  bytes: Uint8Array,
  expectedFormat: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'png' | 'jpeg'
): { valid: boolean; actual: string } {
  if (bytes.length < 4) {
    return { valid: false, actual: 'Truncated binary (< 4 bytes)' };
  }

  // PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (expectedFormat === 'pdf') {
    const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    const actual = String.fromCharCode(...bytes.slice(0, 5));
    return { valid: isPdf, actual };
  }

  // OpenXML (DOCX, XLSX, PPTX): PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (expectedFormat === 'docx' || expectedFormat === 'xlsx' || expectedFormat === 'pptx') {
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;
    const actual = `PK[${bytes[2]},${bytes[3]}]`;
    return { valid: isZip, actual };
  }

  // PNG: \x89PNG
  if (expectedFormat === 'png') {
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    return { valid: isPng, actual: isPng ? 'PNG' : 'Unknown' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (expectedFormat === 'jpeg') {
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    return { valid: isJpg, actual: isJpg ? 'JPEG' : 'Unknown' };
  }

  return { valid: true, actual: 'Unchecked format' };
}

/**
 * Validates converted PDF output.
 */
export async function validatePdfOutput(
  outputBytes: Uint8Array,
  expectedPages?: number
): Promise<ValidationResult> {
  const warnings: string[] = [];
  const disclosures: string[] = [];
  const signature = checkMagicBytes(outputBytes, 'pdf');

  if (!signature.valid) {
    return {
      status: 'Conversion Warning',
      summary: 'Invalid PDF binary signature. Document may be corrupt.',
      details: {
        isValidSignature: false,
        expectedSignature: '%PDF-',
        actualSignature: signature.actual,
        outputSizeBytes: outputBytes.length,
        warnings: ['File header does not contain standard %PDF- magic bytes.'],
        disclosures: []
      }
    };
  }

  let pageCount = 0;
  let parsedSuccessfully = false;

  try {
    const pdfDoc = await PDFDocument.load(outputBytes);
    pageCount = pdfDoc.getPageCount();
    parsedSuccessfully = true;
  } catch (err: any) {
    warnings.push(`Parser check failed: ${err?.message || 'Unable to load PDF document structure.'}`);
  }

  if (expectedPages !== undefined && pageCount !== expectedPages) {
    warnings.push(`Page count variance: generated ${pageCount} pages, but expected ${expectedPages}.`);
  }

  let status: QualityStatus = 'High Fidelity';
  if (!parsedSuccessfully) {
    status = 'Conversion Warning';
  } else if (warnings.length > 0) {
    status = 'Partial Fidelity';
  }

  return {
    status,
    summary:
      status === 'High Fidelity'
        ? `Validated ${pageCount} pages with intact PDF structure.`
        : warnings.join(' '),
    details: {
      isValidSignature: true,
      expectedSignature: '%PDF-',
      actualSignature: signature.actual,
      outputSizeBytes: outputBytes.length,
      sourceCount: expectedPages,
      outputCount: pageCount,
      countLabel: 'pages',
      warnings,
      disclosures
    }
  };
}

/**
 * Validates converted Word (.docx) output.
 */
export async function validateDocxOutput(
  outputBlobOrBytes: Blob | Uint8Array,
  options?: { sourcePageCount?: number; mode?: 'editable' | 'visual' }
): Promise<ValidationResult> {
  const bytes =
    outputBlobOrBytes instanceof Uint8Array
      ? outputBlobOrBytes
      : new Uint8Array(await outputBlobOrBytes.arrayBuffer());

  const warnings: string[] = [];
  const disclosures: string[] = [];
  const signature = checkMagicBytes(bytes, 'docx');

  if (!signature.valid) {
    return {
      status: 'Conversion Warning',
      summary: 'Invalid OpenXML package signature.',
      details: {
        isValidSignature: false,
        expectedSignature: 'PK\x03\x04',
        actualSignature: signature.actual,
        outputSizeBytes: bytes.length,
        warnings: ['File does not contain valid OpenXML ZIP header.'],
        disclosures: []
      }
    };
  }

  let hasDocumentXml = false;
  let extractedChars = 0;
  let hasImages = false;

  try {
    const zip = await JSZip.loadAsync(bytes);
    const docXml = zip.file('word/document.xml');
    if (docXml) {
      hasDocumentXml = true;
      const xmlText = await docXml.async('text');
      // Count extracted text characters inside <w:t> tags
      const textMatches = Array.from(xmlText.matchAll(/<w:t(?:\s[^>]*)?>([^<]+)<\/w:t>/gi));
      extractedChars = textMatches.reduce((acc, m) => acc + m[1].length, 0);
    }
    // Check if word/media exists
    zip.forEach((path) => {
      if (path.startsWith('word/media/')) hasImages = true;
    });
  } catch (err: any) {
    warnings.push(`OpenXML structure inspection failed: ${err?.message || 'Corrupt archive'}`);
  }

  if (!hasDocumentXml) {
    warnings.push('Missing word/document.xml in DOCX archive.');
  }

  if (extractedChars === 0 && options?.mode !== 'visual') {
    warnings.push('No extractable text found in reconstructed DOCX body.');
  }

  if (options?.mode === 'visual') {
    disclosures.push('Generated in Visual Fidelity mode: pages are rendered as high-resolution embedded images.');
  } else {
    disclosures.push('Generated in Editable mode: text and structure are fully editable in Word.');
  }

  let status: QualityStatus = 'High Fidelity';
  if (options?.mode === 'visual') {
    status = 'Visual Only';
  } else if (warnings.length > 0) {
    status = 'Partial Fidelity';
  }

  return {
    status,
    summary:
      status === 'High Fidelity'
        ? `Verified valid OpenXML document (${extractedChars} characters preserved).`
        : status === 'Visual Only'
        ? 'Verified high-resolution visual layout.'
        : warnings.join(' '),
    details: {
      isValidSignature: true,
      expectedSignature: 'PK\x03\x04',
      actualSignature: signature.actual,
      outputSizeBytes: bytes.length,
      sourceCount: options?.sourcePageCount,
      extractedTextChars: extractedChars,
      hasImages,
      warnings,
      disclosures
    }
  };
}

/**
 * Validates converted Excel (.xlsx) output.
 */
export async function validateXlsxOutput(
  outputBytes: Uint8Array,
  expectedSheets?: number
): Promise<ValidationResult> {
  const warnings: string[] = [];
  const disclosures: string[] = [];
  const signature = checkMagicBytes(outputBytes, 'xlsx');

  if (!signature.valid) {
    return {
      status: 'Conversion Warning',
      summary: 'Invalid XLSX spreadsheet binary signature.',
      details: {
        isValidSignature: false,
        expectedSignature: 'PK\x03\x04',
        actualSignature: signature.actual,
        outputSizeBytes: outputBytes.length,
        warnings: ['File header does not contain standard XLSX magic bytes.'],
        disclosures: []
      }
    };
  }

  let sheetCount = 0;
  let totalRows = 0;

  try {
    const workbook = XLSX.read(outputBytes, { type: 'array' });
    sheetCount = workbook.SheetNames.length;
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      totalRows += rows.length;
    }
  } catch (err: any) {
    warnings.push(`Workbook verification failed: ${err?.message || 'Unable to parse spreadsheet'}`);
  }

  if (sheetCount === 0) {
    warnings.push('Workbook contains 0 readable worksheets.');
  }

  if (expectedSheets !== undefined && sheetCount !== expectedSheets) {
    warnings.push(`Worksheet count mismatch: output contains ${sheetCount} sheets, expected ${expectedSheets}.`);
  }

  let status: QualityStatus = 'High Fidelity';
  if (warnings.length > 0) {
    status = 'Partial Fidelity';
  }

  return {
    status,
    summary:
      status === 'High Fidelity'
        ? `Verified valid Excel spreadsheet (${sheetCount} sheets, ${totalRows} populated rows).`
        : warnings.join(' '),
    details: {
      isValidSignature: true,
      expectedSignature: 'PK\x03\x04',
      actualSignature: signature.actual,
      outputSizeBytes: outputBytes.length,
      sourceCount: expectedSheets,
      outputCount: sheetCount,
      countLabel: 'sheets',
      warnings,
      disclosures
    }
  };
}

/**
 * Validates converted PowerPoint (.pptx) output.
 */
export async function validatePptxOutput(
  outputBlobOrBytes: Blob | Uint8Array,
  options?: { sourcePageCount?: number; mode?: 'slides' | 'editable' }
): Promise<ValidationResult> {
  const bytes =
    outputBlobOrBytes instanceof Uint8Array
      ? outputBlobOrBytes
      : new Uint8Array(await outputBlobOrBytes.arrayBuffer());

  const warnings: string[] = [];
  const disclosures: string[] = [];
  const signature = checkMagicBytes(bytes, 'pptx');

  if (!signature.valid) {
    return {
      status: 'Conversion Warning',
      summary: 'Invalid PPTX presentation binary signature.',
      details: {
        isValidSignature: false,
        expectedSignature: 'PK\x03\x04',
        actualSignature: signature.actual,
        outputSizeBytes: bytes.length,
        warnings: ['File does not contain valid PPTX ZIP header.'],
        disclosures: []
      }
    };
  }

  let slideCount = 0;
  try {
    const zip = await JSZip.loadAsync(bytes);
    zip.forEach((path) => {
      if (/^ppt\/slides\/slide\d+\.xml$/i.test(path)) {
        slideCount++;
      }
    });
  } catch (err: any) {
    warnings.push(`Presentation structure inspection failed: ${err?.message || 'Corrupt PPTX'}`);
  }

  if (slideCount === 0) {
    warnings.push('Presentation archive contains 0 slides.');
  }

  if (options?.sourcePageCount !== undefined && slideCount !== options.sourcePageCount) {
    warnings.push(`Slide count variance: output has ${slideCount} slides, source had ${options.sourcePageCount} pages.`);
  }

  if (options?.mode === 'slides') {
    disclosures.push('Generated in Visual Slide mode: original pages preserved as high-resolution slide backgrounds.');
  } else {
    disclosures.push('Generated in Editable Text mode: text blocks are editable in PowerPoint.');
  }

  let status: QualityStatus = 'High Fidelity';
  if (options?.mode === 'slides') {
    status = 'Visual Only';
  } else if (warnings.length > 0) {
    status = 'Partial Fidelity';
  }

  return {
    status,
    summary:
      status === 'High Fidelity'
        ? `Verified valid PowerPoint presentation with ${slideCount} slides.`
        : status === 'Visual Only'
        ? `Verified ${slideCount} high-resolution visual presentation slides.`
        : warnings.join(' '),
    details: {
      isValidSignature: true,
      expectedSignature: 'PK\x03\x04',
      actualSignature: signature.actual,
      outputSizeBytes: bytes.length,
      sourceCount: options?.sourcePageCount,
      outputCount: slideCount,
      countLabel: 'slides',
      warnings,
      disclosures
    }
  };
}
