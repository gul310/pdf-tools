import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';

const ASSETS_DIR = path.resolve('test-assets');
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function createFixtures() {
  console.log('Generating test fixtures in', ASSETS_DIR);

  // 1. sample1.pdf (3 pages)
  const pdf1 = await PDFDocument.create();
  const font = await pdf1.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) {
    const page = pdf1.addPage([595.28, 841.89]);
    page.drawText(`Document 1 - Page ${i} Content`, { x: 50, y: 750, size: 14, font });
  }
  const pdf1Bytes = await pdf1.save();
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample1.pdf'), pdf1Bytes);

  // 2. sample2.pdf (2 pages)
  const pdf2 = await PDFDocument.create();
  for (let i = 1; i <= 2; i++) {
    const page = pdf2.addPage([595.28, 841.89]);
    page.drawText(`Document 2 - Appendix Page ${i}`, { x: 50, y: 750, size: 14, font });
  }
  const pdf2Bytes = await pdf2.save();
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample2.pdf'), pdf2Bytes);

  // 3. sample.docx
  const docx = new DocxDocument({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'Quarterly Executive Summary', bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1
        }),
        new Paragraph({
          children: [new TextRun({ text: 'This is a genuine Microsoft Word test document for Word to PDF conversion testing.' })]
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Key Highlights: Client-side rendering, zero uploads, instant pagination.', italics: true })]
        })
      ]
    }]
  });
  const docxBytes = await Packer.toBuffer(docx);
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample.docx'), docxBytes);

  // 4. sample.xlsx
  const wb = XLSX.utils.book_new();
  const wsData = [
    ['Product ID', 'Category', 'Units Sold', 'Unit Price', 'Gross Revenue'],
    ['SKU-001', 'Enterprise Hardware', 450, 120.50, 54225.00],
    ['SKU-002', 'Cloud Subscriptions', 1200, 45.00, 54000.00],
    ['SKU-003', 'Consulting Hours', 85, 250.00, 21250.00],
    ['SKU-004', 'Support Licenses', 600, 29.99, 17994.00]
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');
  const xlsxBytes = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample.xlsx'), xlsxBytes);

  // 5. sample.pptx
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  const slide1 = pres.addSlide();
  slide1.addText('Q3 Engineering Overview', { x: 1, y: 1, fontSize: 28, bold: true, color: '1E293B' });
  slide1.addText('Slide 1: In-browser PDF & Presentation Suite testing.', { x: 1, y: 2, fontSize: 16, color: '475569' });
  const slide2 = pres.addSlide();
  slide2.addText('Performance Benchmarks', { x: 1, y: 1, fontSize: 24, bold: true, color: '1E293B' });
  slide2.addText('Slide 2: 100% browser-side processing without server roundtrips.', { x: 1, y: 2, fontSize: 16, color: '475569' });
  const pptxBytes = await pres.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample.pptx'), pptxBytes);

  // 6. sample.png (200x200 solid color with alpha)
  // Simple valid 10x10 PNG
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QDwAJYGIgGoEIAAKiA/1Z0r0zAAAAAElFTkSuQmCC';
  fs.writeFileSync(path.join(ASSETS_DIR, 'sample.png'), Buffer.from(pngBase64, 'base64'));

  console.log('Fixtures generated successfully.');
}

createFixtures();
