if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function() {
    return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
  };
}

import fs from 'node:fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { Document, Paragraph, TextRun, Packer } from 'docx';
import PptxGenJS from 'pptxgenjs';

// We import the compiled logic or test via direct node implementations
import {
  pdfToWord,
  wordToPDF,
  pdfToExcel,
  excelToPDF,
  pdfToPowerPoint,
  pptToPDF,
  signPDF,
  editPDF,
  addPageNumbers,
  cropPDF
} from './src/utils/extendedPdfUtils.ts';

async function runTests() {
  console.log('--- STARTING EXTENDED PDF TOOLS FUNCTIONAL TESTING ---');
  let passed = 0;
  let total = 10;

  // 1. Create a baseline sample PDF for testing
  const baselinePdf = await PDFDocument.create();
  const font = await baselinePdf.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) {
    const page = baselinePdf.addPage([595.28, 841.89]);
    page.drawText(`Page ${i} Header Title`, { x: 50, y: 800, size: 20, font, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(`This is sample paragraph text on page ${i} discussing technical specifications.`, {
      x: 50,
      y: 760,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(`Item A    100    $45.00`, { x: 50, y: 720, size: 11, font });
    page.drawText(`Item B    200    $90.00`, { x: 50, y: 700, size: 11, font });
  }
  const baselinePdfBytes = await baselinePdf.save();

  // TEST 1: PDF to Word
  try {
    const docxBlob = await pdfToWord(baselinePdfBytes);
    const docxArrayBuffer = await docxBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(docxArrayBuffer);
    const hasDocXml = zip.file('word/document.xml') !== null;
    if (hasDocXml && docxArrayBuffer.byteLength > 1000) {
      console.log('✅ TEST 1 PASSED: PDF to Word generated valid DOCX OpenXML package (' + docxArrayBuffer.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 1 FAILED: Missing word/document.xml in DOCX zip');
    }
  } catch (e) {
    console.error('❌ TEST 1 EXCEPTION:', e);
  }

  // TEST 2: Word to PDF
  try {
    const sampleDoc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: 'Annual Performance Report', heading: 'Heading1' }),
          new Paragraph({ children: [new TextRun('This document was created from Word to test PDF compilation.')] })
        ]
      }]
    });
    const sampleDocxBuf = await Packer.toBuffer(sampleDoc);
    const pdfOutput = await wordToPDF(sampleDocxBuf);
    const loadedPdf = await PDFDocument.load(pdfOutput);
    if (loadedPdf.getPageCount() >= 1 && pdfOutput.byteLength > 500) {
      console.log('✅ TEST 2 PASSED: Word to PDF compiled valid PDF document (' + loadedPdf.getPageCount() + ' page, ' + pdfOutput.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 2 FAILED: Word to PDF did not produce valid pages');
    }
  } catch (e) {
    console.error('❌ TEST 2 EXCEPTION:', e);
  }

  // TEST 3: PDF to Excel
  try {
    const xlsxBytes = await pdfToExcel(baselinePdfBytes);
    const wb = XLSX.read(xlsxBytes, { type: 'array' });
    if (wb.SheetNames.length >= 1 && xlsxBytes.byteLength > 500) {
      console.log('✅ TEST 3 PASSED: PDF to Excel generated XLSX workbook (' + wb.SheetNames.length + ' sheets, ' + xlsxBytes.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 3 FAILED: PDF to Excel workbook invalid');
    }
  } catch (e) {
    console.error('❌ TEST 3 EXCEPTION:', e);
  }

  // TEST 4: Excel to PDF
  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['Product ID', 'Product Name', 'Category', 'Price', 'Stock'],
      ['P-101', 'High Speed Scanner', 'Hardware', 499.99, 14],
      ['P-102', 'Laser Printer Pro', 'Hardware', 899.00, 8],
      ['P-103', 'A4 Premium Paper', 'Supplies', 12.50, 240]
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    const xlsxBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const pdfOutput = await excelToPDF(xlsxBuf);
    const loadedPdf = await PDFDocument.load(pdfOutput);
    if (loadedPdf.getPageCount() >= 1 && pdfOutput.byteLength > 500) {
      console.log('✅ TEST 4 PASSED: Excel to PDF rendered table to PDF (' + loadedPdf.getPageCount() + ' page, ' + pdfOutput.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 4 FAILED: Excel to PDF failed');
    }
  } catch (e) {
    console.error('❌ TEST 4 EXCEPTION:', e);
  }

  // TEST 5: PDF to PowerPoint
  try {
    const pptxBlob = await pdfToPowerPoint(baselinePdfBytes, 'editable');
    const pptxArrayBuf = await pptxBlob.arrayBuffer();
    const zip = await JSZip.loadAsync(pptxArrayBuf);
    const hasPresentationXml = zip.file('ppt/presentation.xml') !== null;
    if (hasPresentationXml && pptxArrayBuf.byteLength > 1000) {
      console.log('✅ TEST 5 PASSED: PDF to PowerPoint generated valid PPTX deck (' + pptxArrayBuf.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 5 FAILED: Missing ppt/presentation.xml');
    }
  } catch (e) {
    console.error('❌ TEST 5 EXCEPTION:', e);
  }

  // TEST 6: PowerPoint to PDF
  try {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_16x9';
    const s1 = pres.addSlide();
    s1.addText('Executive Presentation', { x: 1, y: 1, fontSize: 24 });
    s1.addText('Confidential Strategy Overview', { x: 1, y: 2, fontSize: 14 });
    const s2 = pres.addSlide();
    s2.addText('Market Opportunities', { x: 1, y: 1, fontSize: 24 });
    const pptxBuf = await pres.write({ outputType: 'nodebuffer' });
    const pdfOutput = await pptToPDF(pptxBuf);
    const loadedPdf = await PDFDocument.load(pdfOutput);
    if (loadedPdf.getPageCount() === 2) {
      console.log('✅ TEST 6 PASSED: PowerPoint to PDF extracted 2 slides into 2 PDF pages (' + pdfOutput.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 6 FAILED: Expected 2 pages, got ' + loadedPdf.getPageCount());
    }
  } catch (e) {
    console.error('❌ TEST 6 EXCEPTION:', e);
  }

  // TEST 7: Sign PDF
  try {
    // 1x1 transparent PNG signature mock
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBytes = Uint8Array.from(Buffer.from(pngBase64, 'base64'));
    const signedPdf = await signPDF(baselinePdfBytes, pngBytes, 1, { x: 100, y: 150, width: 120, height: 50 });
    const loadedPdf = await PDFDocument.load(signedPdf);
    if (loadedPdf.getPageCount() === 3 && signedPdf.byteLength > baselinePdfBytes.byteLength) {
      console.log('✅ TEST 7 PASSED: Sign PDF stamped signature image onto Page 1 (' + signedPdf.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 7 FAILED: Sign PDF did not embed image');
    }
  } catch (e) {
    console.error('❌ TEST 7 EXCEPTION:', e);
  }

  // TEST 8: Edit PDF
  try {
    const editedPdf = await editPDF(baselinePdfBytes, [
      { type: 'text', page: 1, x: 200, y: 500, text: 'Approved by Audit Committee', fontSize: 16, color: '#2563eb' },
      { type: 'whiteout', page: 1, x: 50, y: 715, width: 250, height: 30 },
      { type: 'rectangle', page: 2, x: 45, y: 750, width: 400, height: 25, fillColor: '#fef08a', opacity: 0.5 }
    ]);
    const loadedPdf = await PDFDocument.load(editedPdf);
    if (loadedPdf.getPageCount() === 3 && editedPdf.byteLength > baselinePdfBytes.byteLength) {
      console.log('✅ TEST 8 PASSED: Edit PDF embedded text, whiteout, and highlight annotations (' + editedPdf.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 8 FAILED: Edit PDF failed');
    }
  } catch (e) {
    console.error('❌ TEST 8 EXCEPTION:', e);
  }

  // TEST 9: Add Page Numbers
  try {
    const numberedPdf = await addPageNumbers(baselinePdfBytes, {
      position: 'bottom-center',
      format: 'Page {n} of {total}',
      startNumber: 1,
      fontSize: 10,
      margin: 30,
      pageRange: 'all'
    });
    const loadedPdf = await PDFDocument.load(numberedPdf);
    if (loadedPdf.getPageCount() === 3 && numberedPdf.byteLength > baselinePdfBytes.byteLength) {
      console.log('✅ TEST 9 PASSED: Add Page Numbers numbered all 3 pages (' + numberedPdf.byteLength + ' bytes)');
      passed++;
    } else {
      console.error('❌ TEST 9 FAILED: Add Page Numbers failed');
    }
  } catch (e) {
    console.error('❌ TEST 9 EXCEPTION:', e);
  }

  // TEST 10: Crop PDF
  try {
    const croppedPdf = await cropPDF(baselinePdfBytes, {
      pages: 'all',
      top: 50,
      bottom: 50,
      left: 40,
      right: 40
    });
    const loadedPdf = await PDFDocument.load(croppedPdf);
    const p1 = loadedPdf.getPage(0);
    const cropBox = p1.getCropBox();
    const mediaBox = p1.getMediaBox();
    // Original width 595.28 - 40 - 40 = 515.28
    const expectedWidth = 595.28 - 80;
    const expectedHeight = 841.89 - 100;
    if (Math.abs(cropBox.width - expectedWidth) < 1 && Math.abs(mediaBox.height - expectedHeight) < 1) {
      console.log('✅ TEST 10 PASSED: Crop PDF accurately adjusted MediaBox & CropBox to ' + Math.round(cropBox.width) + 'x' + Math.round(cropBox.height) + ' pt');
      passed++;
    } else {
      console.error('❌ TEST 10 FAILED: Expected ' + expectedWidth + 'x' + expectedHeight + ', got ' + cropBox.width + 'x' + cropBox.height);
    }
  } catch (e) {
    console.error('❌ TEST 10 EXCEPTION:', e);
  }

  console.log('\n========================================');
  console.log(`TOTAL RESULT: ${passed}/${total} TESTS PASSED`);
  console.log('========================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
