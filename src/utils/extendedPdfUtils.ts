import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import * as mammoth from 'mammoth';
import { fileToArrayBuffer, fileToUint8Array } from './pdfUtils';

// Helper to convert hex color to pdf-lib rgb
export function hexToRgbPdf(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
}

// Render PDF Page onto an HTML canvas element for preview
export async function renderPDFPageToCanvas(
  file: File | Uint8Array | ArrayBuffer,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.0
): Promise<{ width: number; height: number }> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(Math.max(1, Math.min(pdf.numPages, pageNumber)));
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  await page.render({
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas
  } as any).promise;

  return { width: viewport.width, height: viewport.height };
}

// Download helpers for Office formats
export function downloadDocx(data: Blob | Uint8Array, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadXlsx(data: Blob | Uint8Array, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPptx(data: Blob | Uint8Array, filename: string) {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pptx') ? filename : `${filename}.pptx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ==========================================
// 11. PDF TO WORD
// ==========================================
export async function pdfToWord(
  file: File | Uint8Array | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const docxParagraphs: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(Math.round(((pageNum - 0.5) / numPages) * 90));
    }

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by line based on y coordinate
    interface TextItemPos {
      str: string;
      x: number;
      y: number;
      height: number;
    }

    const items: TextItemPos[] = [];
    for (const item of textContent.items as any[]) {
      if ('str' in item && item.str.trim().length > 0) {
        items.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5],
          height: Math.abs(item.height || item.transform[0] || 12)
        });
      }
    }

    // Sort by y descending (top to bottom), then x ascending (left to right)
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 4) {
        return yDiff;
      }
      return a.x - b.x;
    });

    // Group items into lines
    const lines: Array<{ text: string; height: number; y: number }> = [];
    let currentLine: TextItemPos[] = [];
    let currentY: number | null = null;

    for (const item of items) {
      if (currentY === null || Math.abs(currentY - item.y) <= 4) {
        currentLine.push(item);
        currentY = currentY === null ? item.y : currentY;
      } else {
        if (currentLine.length > 0) {
          const lineStr = currentLine.map(i => i.str).join(' ');
          const avgHeight = currentLine.reduce((sum, i) => sum + i.height, 0) / currentLine.length;
          lines.push({ text: lineStr, height: avgHeight, y: currentY });
        }
        currentLine = [item];
        currentY = item.y;
      }
    }
    if (currentLine.length > 0 && currentY !== null) {
      const lineStr = currentLine.map(i => i.str).join(' ');
      const avgHeight = currentLine.reduce((sum, i) => sum + i.height, 0) / currentLine.length;
      lines.push({ text: lineStr, height: avgHeight, y: currentY });
    }

    // Add page indicator if multi-page
    if (pageNum > 1) {
      docxParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${pageNum} ---`,
              color: '94A3B8',
              italics: true,
              size: 18
            })
          ],
          spacing: { before: 240, after: 120 }
        })
      );
    }

    // Convert lines into formatted Paragraphs
    for (const line of lines) {
      if (line.height >= 18) {
        docxParagraphs.push(
          new Paragraph({
            text: line.text,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          })
        );
      } else if (line.height >= 14) {
        docxParagraphs.push(
          new Paragraph({
            text: line.text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 100 }
          })
        );
      } else {
        docxParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: line.text, size: 22 })],
            spacing: { after: 120 }
          })
        );
      }
    }

    if (lines.length === 0) {
      docxParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: `[Page ${pageNum} contains no extractable text]`, italics: true, color: '94A3B8' })]
        })
      );
    }
  }

  if (onProgress) onProgress(95);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxParagraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  if (onProgress) onProgress(100);
  return blob;
}

// ==========================================
// 12. WORD TO PDF
// ==========================================
export async function wordToPDF(
  file: File | Uint8Array | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const arrayBuffer = await fileToArrayBuffer(file);
  if (onProgress) onProgress(20);

  const mammothOptions: any = { arrayBuffer };
  if (typeof Buffer !== 'undefined') {
    mammothOptions.buffer = Buffer.from(arrayBuffer);
  }
  const mammothResult = await mammoth.convertToHtml(mammothOptions);
  const htmlContent = mammothResult.value;
  if (onProgress) onProgress(40);

  // Parse HTML into text sections using DOMParser or structured parser
  const parser = typeof window !== 'undefined' ? new DOMParser() : null;
  const elementsToRender: Array<{ type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'table'; text?: string; rows?: string[][] }> = [];

  if (parser) {
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const bodyChildren = Array.from(doc.body.children);

    for (const el of bodyChildren) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'h1') {
        elementsToRender.push({ type: 'h1', text: el.textContent?.trim() || '' });
      } else if (tag === 'h2') {
        elementsToRender.push({ type: 'h2', text: el.textContent?.trim() || '' });
      } else if (tag === 'h3') {
        elementsToRender.push({ type: 'h3', text: el.textContent?.trim() || '' });
      } else if (tag === 'p') {
        const text = el.textContent?.trim();
        if (text) elementsToRender.push({ type: 'p', text });
      } else if (tag === 'ul' || tag === 'ol') {
        const lis = Array.from(el.querySelectorAll('li'));
        for (const li of lis) {
          const text = li.textContent?.trim();
          if (text) elementsToRender.push({ type: 'li', text });
        }
      } else if (tag === 'table') {
        const trs = Array.from(el.querySelectorAll('tr'));
        const tableRows: string[][] = [];
        for (const tr of trs) {
          const cells = Array.from(tr.querySelectorAll('td, th')).map(c => c.textContent?.trim() || '');
          tableRows.push(cells);
        }
        if (tableRows.length > 0) {
          elementsToRender.push({ type: 'table', rows: tableRows });
        }
      }
    }
  }

  // Fallback if no elements parsed
  if (elementsToRender.length === 0) {
    const rawText = mammothResult.value.replace(/<[^>]+>/g, '\n').split('\n').filter(s => s.trim().length > 0);
    for (const line of rawText) {
      elementsToRender.push({ type: 'p', text: line.trim() });
    }
  }

  if (onProgress) onProgress(60);

  // Render to PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 54;
  const marginTop = 60;
  const marginBottom = 54;
  const contentWidth = pageWidth - marginX * 2;

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - marginTop;

  function ensureSpace(heightNeeded: number) {
    if (currentY - heightNeeded < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - marginTop;
    }
  }

  function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      try {
        const width = font.widthOfTextAtSize(candidate, fontSize);
        if (width <= maxWidth) {
          currentLine = candidate;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      } catch {
        currentLine = candidate;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  for (const item of elementsToRender) {
    if (item.type === 'h1') {
      ensureSpace(40);
      const lines = wrapText(item.text || '', fontBold, 18, contentWidth);
      for (const line of lines) {
        ensureSpace(24);
        currentPage.drawText(line, {
          x: marginX,
          y: currentY - 18,
          size: 18,
          font: fontBold,
          color: rgb(0.09, 0.12, 0.2)
        });
        currentY -= 24;
      }
      currentY -= 8;
    } else if (item.type === 'h2') {
      ensureSpace(32);
      const lines = wrapText(item.text || '', fontBold, 14, contentWidth);
      for (const line of lines) {
        ensureSpace(20);
        currentPage.drawText(line, {
          x: marginX,
          y: currentY - 14,
          size: 14,
          font: fontBold,
          color: rgb(0.12, 0.16, 0.24)
        });
        currentY -= 20;
      }
      currentY -= 6;
    } else if (item.type === 'h3') {
      ensureSpace(26);
      const lines = wrapText(item.text || '', fontBold, 12, contentWidth);
      for (const line of lines) {
        ensureSpace(18);
        currentPage.drawText(line, {
          x: marginX,
          y: currentY - 12,
          size: 12,
          font: fontBold,
          color: rgb(0.18, 0.22, 0.3)
        });
        currentY -= 18;
      }
      currentY -= 4;
    } else if (item.type === 'li') {
      const lines = wrapText(item.text || '', fontRegular, 10, contentWidth - 20);
      for (let i = 0; i < lines.length; i++) {
        ensureSpace(16);
        if (i === 0) {
          currentPage.drawText('•', {
            x: marginX + 4,
            y: currentY - 10,
            size: 12,
            font: fontBold,
            color: rgb(0.2, 0.3, 0.5)
          });
        }
        currentPage.drawText(lines[i], {
          x: marginX + 18,
          y: currentY - 10,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.3)
        });
        currentY -= 16;
      }
      currentY -= 3;
    } else if (item.type === 'p') {
      const lines = wrapText(item.text || '', fontRegular, 10.5, contentWidth);
      for (const line of lines) {
        ensureSpace(16);
        currentPage.drawText(line, {
          x: marginX,
          y: currentY - 10.5,
          size: 10.5,
          font: fontRegular,
          color: rgb(0.15, 0.18, 0.24)
        });
        currentY -= 16;
      }
      currentY -= 6;
    } else if (item.type === 'table' && item.rows && item.rows.length > 0) {
      const numCols = Math.max(...item.rows.map(r => r.length));
      const colWidth = contentWidth / Math.max(1, numCols);
      const rowHeight = 22;

      for (let rIdx = 0; rIdx < item.rows.length; rIdx++) {
        ensureSpace(rowHeight + 4);
        const row = item.rows[rIdx];
        const isHeader = rIdx === 0;

        // Draw row background
        currentPage.drawRectangle({
          x: marginX,
          y: currentY - rowHeight,
          width: contentWidth,
          height: rowHeight,
          color: isHeader ? rgb(0.9, 0.94, 0.98) : rIdx % 2 === 0 ? rgb(0.98, 0.99, 1.0) : rgb(1, 1, 1),
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 0.5
        });

        for (let cIdx = 0; cIdx < row.length; cIdx++) {
          const cellText = row[cIdx] || '';
          const truncated = cellText.length > 25 ? cellText.substring(0, 22) + '...' : cellText;
          try {
            currentPage.drawText(truncated, {
              x: marginX + cIdx * colWidth + 6,
              y: currentY - rowHeight + 6,
              size: 9,
              font: isHeader ? fontBold : fontRegular,
              color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.25, 0.3)
            });
          } catch {
            // Ignore glyph rendering errors
          }
        }
        currentY -= rowHeight;
      }
      currentY -= 10;
    }
  }

  // Draw footer page numbers
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    const footerText = `Page ${i + 1} of ${totalPages}`;
    const textWidth = fontOblique.widthOfTextAtSize(footerText, 9);
    p.drawText(footerText, {
      x: (pageWidth - textWidth) / 2,
      y: 25,
      size: 9,
      font: fontOblique,
      color: rgb(0.5, 0.55, 0.6)
    });
  }

  if (onProgress) onProgress(90);
  const pdfBytes = await pdfDoc.save();
  if (onProgress) onProgress(100);
  return pdfBytes;
}

// ==========================================
// 13. PDF TO EXCEL
// ==========================================
export async function pdfToExcel(
  file: File | Uint8Array | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const workbook = XLSX.utils.book_new();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(Math.round(((pageNum - 0.5) / numPages) * 90));

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    interface CoordItem {
      str: string;
      x: number;
      y: number;
    }

    const items: CoordItem[] = [];
    for (const item of textContent.items as any[]) {
      if ('str' in item && item.str.trim().length > 0) {
        items.push({
          str: item.str,
          x: item.transform[4],
          y: item.transform[5]
        });
      }
    }

    // Cluster items by y-coordinate (tolerance 5pt)
    items.sort((a, b) => b.y - a.y);
    const rowClusters: CoordItem[][] = [];
    for (const it of items) {
      let placed = false;
      for (const cluster of rowClusters) {
        if (Math.abs(cluster[0].y - it.y) <= 5) {
          cluster.push(it);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rowClusters.push([it]);
      }
    }

    // Sort row clusters from top to bottom
    rowClusters.sort((a, b) => b[0].y - a[0].y);

    // In each row, sort by x ascending
    for (const cluster of rowClusters) {
      cluster.sort((a, b) => a.x - b.x);
    }

    // Build 2D array of cells
    const sheetData: string[][] = [];
    for (const cluster of rowClusters) {
      const rowStrings: string[] = [];
      let lastX = -100;
      for (const it of cluster) {
        // If items are very close together (< 15pt), combine text, else create new cell
        if (lastX >= 0 && it.x - lastX < 15 && rowStrings.length > 0) {
          rowStrings[rowStrings.length - 1] += ' ' + it.str;
        } else {
          rowStrings.push(it.str);
        }
        lastX = it.x + (it.str.length * 6);
      }
      if (rowStrings.length > 0) {
        sheetData.push(rowStrings);
      }
    }

    if (sheetData.length === 0) {
      sheetData.push([`[Page ${pageNum} has no extractable text data]`]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Page ${pageNum}`);
  }

  if (onProgress) onProgress(95);
  const xlsxOutput = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  if (onProgress) onProgress(100);
  return new Uint8Array(xlsxOutput);
}

// ==========================================
// 14. EXCEL TO PDF
// ==========================================
export async function excelToPDF(
  file: File | Uint8Array | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const arrayBuffer = await fileToArrayBuffer(file);
  if (onProgress) onProgress(20);

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) {
    throw new Error('The Excel workbook contains no readable sheets.');
  }

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let sheetCount = 0;
  for (const sheetName of sheetNames) {
    sheetCount++;
    if (onProgress) onProgress(20 + Math.round((sheetCount / sheetNames.length) * 60));

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];
    if (rawRows.length === 0) continue;

    const maxCols = Math.max(...rawRows.map(r => r.length), 1);
    // Use landscape if more than 5 columns
    const isLandscape = maxCols > 5;
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;
    const marginX = 36;
    const marginTop = 50;
    const marginBottom = 40;
    const contentWidth = pageWidth - marginX * 2;
    const colWidth = Math.max(45, contentWidth / maxCols);
    const rowHeight = 20;

    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let currentY = pageHeight - marginTop;

    // Draw Sheet Title
    page.drawText(`Sheet: ${sheetName}`, {
      x: marginX,
      y: currentY,
      size: 14,
      font: fontBold,
      color: rgb(0.09, 0.12, 0.2)
    });
    currentY -= 26;

    for (let rIdx = 0; rIdx < rawRows.length; rIdx++) {
      if (currentY - rowHeight < marginBottom) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        currentY = pageHeight - marginTop;
      }

      const row = rawRows[rIdx];
      const isHeader = rIdx === 0;

      // Draw row background
      page.drawRectangle({
        x: marginX,
        y: currentY - rowHeight,
        width: Math.min(contentWidth, maxCols * colWidth),
        height: rowHeight,
        color: isHeader ? rgb(0.9, 0.93, 0.97) : rIdx % 2 === 0 ? rgb(0.98, 0.99, 1.0) : rgb(1, 1, 1),
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 0.5
      });

      for (let cIdx = 0; cIdx < maxCols; cIdx++) {
        const val = row[cIdx] !== undefined && row[cIdx] !== null ? String(row[cIdx]).trim() : '';
        if (val) {
          const maxChar = Math.max(5, Math.floor(colWidth / 6));
          const truncated = val.length > maxChar ? val.substring(0, maxChar - 2) + '..' : val;
          try {
            page.drawText(truncated, {
              x: marginX + cIdx * colWidth + 4,
              y: currentY - rowHeight + 5,
              size: 8.5,
              font: isHeader ? fontBold : fontRegular,
              color: isHeader ? rgb(0.1, 0.15, 0.25) : rgb(0.2, 0.25, 0.3)
            });
          } catch {
            // Ignore encoding anomalies
          }
        }
      }
      currentY -= rowHeight;
    }
  }

  // Draw page numbers
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    const { width } = p.getSize();
    const text = `Page ${i + 1} of ${totalPages}`;
    const textWidth = fontOblique.widthOfTextAtSize(text, 8.5);
    p.drawText(text, {
      x: (width - textWidth) / 2,
      y: 18,
      size: 8.5,
      font: fontOblique,
      color: rgb(0.5, 0.55, 0.6)
    });
  }

  if (onProgress) onProgress(95);
  const pdfBytes = await pdfDoc.save();
  if (onProgress) onProgress(100);
  return pdfBytes;
}

// ==========================================
// 15. PDF TO POWERPOINT
// ==========================================
export async function pdfToPowerPoint(
  file: File | Uint8Array | ArrayBuffer,
  mode: 'slides' | 'editable' = 'slides',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const arrayBuffer = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) onProgress(Math.round(((pageNum - 0.5) / numPages) * 90));

    const page = await pdf.getPage(pageNum);
    const slide = pres.addSlide();

    if (mode === 'slides' && typeof window !== 'undefined') {
      // High-Fidelity Canvas Slide Mode
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        } as any).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
      }
    } else {
      // Editable Text Content Mode
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      const slideWidthInches = 10;
      const slideHeightInches = 5.625;

      // Group text items into paragraphs
      const textItems: any[] = textContent.items.filter((it: any) => 'str' in it && it.str.trim().length > 0);
      if (textItems.length > 0) {
        // Collect into lines
        const linesMap = new Map<number, any[]>();
        for (const it of textItems) {
          const yKey = Math.round(it.transform[5] / 8) * 8;
          if (!linesMap.has(yKey)) linesMap.set(yKey, []);
          linesMap.get(yKey)!.push(it);
        }

        const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
        let blockCount = 0;
        for (const yKey of sortedY) {
          if (blockCount >= 18) break; // Keep slides readable
          const lineItems = linesMap.get(yKey)!.sort((a, b) => a.transform[4] - b.transform[4]);
          const lineText = lineItems.map(i => i.str).join(' ');
          const first = lineItems[0];
          const xInches = Math.max(0.5, Math.min(8.5, (first.transform[4] / viewport.width) * slideWidthInches));
          const yInches = Math.max(0.5, Math.min(4.8, ((viewport.height - first.transform[5]) / viewport.height) * slideHeightInches));
          const fontSize = Math.max(10, Math.min(24, Math.round(Math.abs(first.height || 12))));

          slide.addText(lineText, {
            x: xInches,
            y: yInches,
            w: 8.5,
            h: 0.4,
            fontSize: fontSize,
            color: '1E293B',
            bold: fontSize >= 16
          });
          blockCount++;
        }
      } else {
        slide.addText(`Slide ${pageNum}`, { x: 1, y: 1, fontSize: 24, color: '1E293B', bold: true });
      }
    }
  }

  if (onProgress) onProgress(95);
  const output = (await pres.write({ outputType: 'blob' })) as Blob;
  if (onProgress) onProgress(100);
  return output;
}

// ==========================================
// 16. POWERPOINT TO PDF
// ==========================================
export async function pptToPDF(
  file: File | Uint8Array | ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const arrayBuffer = await fileToArrayBuffer(file);
  if (onProgress) onProgress(15);

  const zip = await JSZip.loadAsync(arrayBuffer);
  if (onProgress) onProgress(35);

  // Discover slide files
  const slideFiles: string[] = [];
  zip.forEach(relativePath => {
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(relativePath)) {
      slideFiles.push(relativePath);
    }
  });

  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    return numA - numB;
  });

  if (slideFiles.length === 0) {
    throw new Error('No presentation slides found in this PPTX file.');
  }

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Default 16:9 widescreen dimensions (in points): 960 x 540
  const slideWidth = 960;
  const slideHeight = 540;

  for (let sIdx = 0; sIdx < slideFiles.length; sIdx++) {
    if (onProgress) onProgress(35 + Math.round(((sIdx + 1) / slideFiles.length) * 55));

    const slidePath = slideFiles[sIdx];
    const slideXml = await zip.file(slidePath)?.async('text');
    const page = pdfDoc.addPage([slideWidth, slideHeight]);

    // Draw crisp presentation slide background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: slideWidth,
      height: slideHeight,
      color: rgb(0.98, 0.99, 1.0)
    });

    if (slideXml) {
      // Extract text content from XML tags <a:t>
      const textMatches = Array.from(slideXml.matchAll(/<a:t(?:\s[^>]*)?>([^<]+)<\/a:t>/gi)).map(m => m[1]);
      
      // Draw slide header
      page.drawText(`Slide ${sIdx + 1}`, {
        x: 48,
        y: slideHeight - 48,
        size: 14,
        font: fontBold,
        color: rgb(0.2, 0.35, 0.6)
      });

      // Render extracted text blocks
      let lineY = slideHeight - 90;
      let count = 0;
      for (const text of textMatches) {
        if (!text || text.trim().length === 0) continue;
        if (lineY < 60) break;

        const isTitle = count === 0;
        const fontSize = isTitle ? 20 : 13;
        const font = isTitle ? fontBold : fontRegular;
        const cleanText = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        const truncated = cleanText.length > 85 ? cleanText.substring(0, 82) + '...' : cleanText;

        try {
          page.drawText(truncated, {
            x: 48,
            y: lineY,
            size: fontSize,
            font: font,
            color: isTitle ? rgb(0.09, 0.12, 0.2) : rgb(0.2, 0.25, 0.35)
          });
          lineY -= fontSize + 12;
          count++;
        } catch {
          // Ignore unsupported glyphs
        }
      }

      if (count === 0) {
        page.drawText('(Slide graphics & multimedia content)', {
          x: 48,
          y: slideHeight / 2,
          size: 14,
          font: fontRegular,
          color: rgb(0.5, 0.55, 0.6)
        });
      }
    }
  }

  if (onProgress) onProgress(95);
  const pdfBytes = await pdfDoc.save();
  if (onProgress) onProgress(100);
  return pdfBytes;
}

// ==========================================
// 17. SIGN PDF
// ==========================================
export async function signPDF(
  file: File | Uint8Array | ArrayBuffer,
  signaturePngBytes: Uint8Array,
  pageNumber: number,
  position: { x: number; y: number; width: number; height: number }
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  const targetPageIdx = Math.max(0, Math.min(totalPages - 1, pageNumber - 1));
  const page = pdfDoc.getPage(targetPageIdx);

  const sigImage = await pdfDoc.embedPng(signaturePngBytes);
  page.drawImage(sigImage, {
    x: position.x,
    y: position.y,
    width: position.width,
    height: position.height
  });

  return await pdfDoc.save();
}

// ==========================================
// 18. EDIT PDF
// ==========================================
export interface PDFAnnotation {
  type: 'text' | 'image' | 'rectangle' | 'whiteout';
  page: number; // 1-indexed
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
  imageBytes?: Uint8Array;
}

export async function editPDF(
  file: File | Uint8Array | ArrayBuffer,
  annotations: PDFAnnotation[]
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const ann of annotations) {
    if (ann.page < 1 || ann.page > totalPages) continue;
    const page = pdfDoc.getPage(ann.page - 1);

    if (ann.type === 'text' && ann.text) {
      page.drawText(ann.text, {
        x: ann.x,
        y: ann.y,
        size: ann.fontSize || 14,
        font,
        color: hexToRgbPdf(ann.color || '#000000')
      });
    } else if (ann.type === 'rectangle') {
      page.drawRectangle({
        x: ann.x,
        y: ann.y,
        width: ann.width || 100,
        height: ann.height || 40,
        color: ann.fillColor ? hexToRgbPdf(ann.fillColor) : undefined,
        borderColor: ann.strokeColor ? hexToRgbPdf(ann.strokeColor) : undefined,
        borderWidth: ann.strokeWidth || 1,
        opacity: ann.opacity !== undefined ? ann.opacity : 1.0
      });
    } else if (ann.type === 'whiteout') {
      // Visual Cover Overlay: draws an opaque white rectangle over specified coordinates.
      // NOTE: This obscures content visually but does not destructively remove underlying text/image streams from the PDF structure.
      page.drawRectangle({
        x: ann.x,
        y: ann.y,
        width: ann.width || 120,
        height: ann.height || 30,
        color: rgb(1, 1, 1),
        borderWidth: 0
      });
    } else if (ann.type === 'image' && ann.imageBytes) {
      const embeddedImg = await pdfDoc.embedPng(ann.imageBytes);
      page.drawImage(embeddedImg, {
        x: ann.x,
        y: ann.y,
        width: ann.width || 100,
        height: ann.height || 60
      });
    }
  }

  return await pdfDoc.save();
}

// ==========================================
// 19. ADD PAGE NUMBERS
// ==========================================
export interface PageNumberOptions {
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  format: 'Page {n}' | 'Page {n} of {total}' | '{n}' | '{n} / {total}';
  startNumber?: number;
  fontSize?: number;
  margin?: number;
  pageRange?: 'all' | 'skip-cover' | 'custom';
  customPages?: number[];
}

export async function addPageNumbers(
  file: File | Uint8Array | ArrayBuffer,
  options: PageNumberOptions
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const startNumber = options.startNumber || 1;
  const fontSize = options.fontSize || 10;
  const margin = options.margin || 25;

  for (let i = 1; i <= totalPages; i++) {
    if (options.pageRange === 'skip-cover' && i === 1) continue;
    if (options.pageRange === 'custom' && options.customPages && !options.customPages.includes(i)) continue;

    const page = pdfDoc.getPage(i - 1);
    const { width, height } = page.getSize();
    const currentNum = startNumber + (i - 1);

    let text = `${currentNum}`;
    if (options.format === 'Page {n}') text = `Page ${currentNum}`;
    else if (options.format === 'Page {n} of {total}') text = `Page ${currentNum} of ${totalPages}`;
    else if (options.format === '{n} / {total}') text = `${currentNum} / ${totalPages}`;

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x = (width - textWidth) / 2;
    let y = margin;

    switch (options.position) {
      case 'bottom-center':
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case 'bottom-right':
        x = width - margin - textWidth;
        y = margin;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
        break;
      case 'top-right':
        x = width - margin - textWidth;
        y = height - margin - fontSize;
        break;
      case 'top-left':
        x = margin;
        y = height - margin - fontSize;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.35, 0.4, 0.48)
    });
  }

  return await pdfDoc.save();
}

// ==========================================
// 20. CROP PDF
// ==========================================
export interface CropOptions {
  pages?: 'all' | 'first' | 'custom';
  customPages?: number[];
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export async function cropPDF(
  file: File | Uint8Array | ArrayBuffer,
  options: CropOptions
): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const pdfDoc = await PDFDocument.load(bytes);
  const totalPages = pdfDoc.getPageCount();

  for (let i = 1; i <= totalPages; i++) {
    if (options.pages === 'first' && i !== 1) continue;
    if (options.pages === 'custom' && options.customPages && !options.customPages.includes(i)) continue;

    const page = pdfDoc.getPage(i - 1);
    const { x, y, width, height } = page.getMediaBox();

    const newX = x + options.left;
    const newY = y + options.bottom;
    const newWidth = Math.max(20, width - options.left - options.right);
    const newHeight = Math.max(20, height - options.top - options.bottom);

    page.setCropBox(newX, newY, newWidth, newHeight);
    page.setMediaBox(newX, newY, newWidth, newHeight);
  }

  return await pdfDoc.save();
}
