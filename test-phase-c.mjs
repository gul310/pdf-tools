if (!Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function() {
    return Array.from(this).map(b => b.toString(16).padStart(2, '0')).join('');
  };
}

import fs from 'fs';
import { execSync } from 'child_process';

if (!fs.existsSync('test-assets/sample1.pdf')) {
  execSync('node create-test-assets.mjs', { stdio: 'inherit' });
}
import {
  pdfToWord,
  wordToPDF,
  pdfToExcel,
  excelToPDF,
  pdfToPowerPoint,
  pptToPDF
} from './src/utils/extendedPdfUtils.ts';
import {
  validateDocxOutput,
  validatePdfOutput,
  validateXlsxOutput,
  validatePptxOutput
} from './src/utils/conversionValidator.ts';
import { calculateSHA256, verifyOriginalIntegrity } from './src/utils/fileIntegrity.ts';

async function runPhaseCTests() {
  console.log('================================================================');
  console.log('              PHASE C — CONVERSION ENGINES AUDIT                ');
  console.log('================================================================');

  if (!fs.existsSync('test-output')) {
    fs.mkdirSync('test-output', { recursive: true });
  }

  // 1. PDF TO WORD (Mode A: Editable)
  console.log('\n[1] Testing PDF to Word (Mode A: Editable)...');
  const samplePdfBytes = fs.readFileSync('test-assets/sample1.pdf');
  const baselineHashPdf = await calculateSHA256(samplePdfBytes);

  const docxBlob = await pdfToWord(new Uint8Array(samplePdfBytes), { mode: 'editable', detectTables: true });
  const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
  fs.writeFileSync('test-output/sample1-converted.docx', docxBuffer);

  const docxVal = await validateDocxOutput(new Uint8Array(docxBuffer), { sourcePageCount: 3, mode: 'editable' });
  console.log(`   Validation: Status = ${docxVal.status}, Summary = ${docxVal.summary}`);
  if (docxVal.status !== 'Conversion Warning' && docxVal.details.isValidSignature) {
    console.log('   PASSED: PDF to Word produced valid DOCX.');
  } else {
    throw new Error('PDF to Word validation failed');
  }

  // Verify original file integrity
  const integrity1 = await verifyOriginalIntegrity(new File([samplePdfBytes], 'sample1.pdf'), baselineHashPdf);
  console.log(`   Original File Integrity: ${integrity1.intact ? 'VERIFIED (SHA-256 Unchanged)' : 'FAILED'}`);

  // 2. WORD TO PDF
  console.log('\n[2] Testing Word to PDF...');
  const sampleDocxBytes = fs.readFileSync('test-assets/sample.docx');
  const baselineHashDocx = await calculateSHA256(sampleDocxBytes);

  const pdfFromWord = await wordToPDF(new Uint8Array(sampleDocxBytes));
  fs.writeFileSync('test-output/sample-converted.pdf', Buffer.from(pdfFromWord));

  const pdfVal = await validatePdfOutput(pdfFromWord);
  console.log(`   Validation: Status = ${pdfVal.status}, Summary = ${pdfVal.summary}`);
  if (pdfVal.status === 'High Fidelity' && pdfVal.details.isValidSignature) {
    console.log('   PASSED: Word to PDF produced valid PDF.');
  } else {
    throw new Error('Word to PDF validation failed');
  }

  // 3. PDF TO EXCEL
  console.log('\n[3] Testing PDF to Excel (Column Boundary Projection)...');
  const xlsxOutput = await pdfToExcel(new Uint8Array(samplePdfBytes));
  fs.writeFileSync('test-output/sample1-extracted.xlsx', Buffer.from(xlsxOutput));

  const xlsxVal = await validateXlsxOutput(xlsxOutput, 3);
  console.log(`   Validation: Status = ${xlsxVal.status}, Summary = ${xlsxVal.summary}`);
  if (xlsxVal.status === 'High Fidelity' && xlsxVal.details.isValidSignature) {
    console.log('   PASSED: PDF to Excel produced valid XLSX.');
  } else {
    throw new Error('PDF to Excel validation failed');
  }

  // 4. EXCEL TO PDF
  console.log('\n[4] Testing Excel to PDF (Dynamic Width & Auto-Orientation)...');
  const sampleXlsxBytes = fs.readFileSync('test-assets/sample.xlsx');
  const pdfFromExcel = await excelToPDF(new Uint8Array(sampleXlsxBytes));
  fs.writeFileSync('test-output/sample-from-excel.pdf', Buffer.from(pdfFromExcel));

  const pdfVal2 = await validatePdfOutput(pdfFromExcel);
  console.log(`   Validation: Status = ${pdfVal2.status}, Summary = ${pdfVal2.summary}`);
  if (pdfVal2.status === 'High Fidelity' && pdfVal2.details.isValidSignature) {
    console.log('   PASSED: Excel to PDF produced valid PDF.');
  } else {
    throw new Error('Excel to PDF validation failed');
  }

  // 5. PDF TO POWERPOINT
  console.log('\n[5] Testing PDF to PowerPoint...');
  const pptxBlob = await pdfToPowerPoint(new Uint8Array(samplePdfBytes), 'editable');
  const pptxBuffer = Buffer.from(await pptxBlob.arrayBuffer());
  fs.writeFileSync('test-output/sample1-slides.pptx', pptxBuffer);

  const pptxVal = await validatePptxOutput(new Uint8Array(pptxBuffer), { sourcePageCount: 3, mode: 'editable' });
  console.log(`   Validation: Status = ${pptxVal.status}, Summary = ${pptxVal.summary}`);
  if (pptxVal.status !== 'Conversion Warning' && pptxVal.details.isValidSignature) {
    console.log('   PASSED: PDF to PowerPoint produced valid PPTX.');
  } else {
    throw new Error('PDF to PowerPoint validation failed');
  }

  // 6. POWERPOINT TO PDF
  console.log('\n[6] Testing PowerPoint to PDF...');
  const samplePptxBytes = fs.readFileSync('test-assets/sample.pptx');
  const pdfFromPpt = await pptToPDF(new Uint8Array(samplePptxBytes));
  fs.writeFileSync('test-output/sample-from-ppt.pdf', Buffer.from(pdfFromPpt));

  const pdfVal3 = await validatePdfOutput(pdfFromPpt, 2);
  console.log(`   Validation: Status = ${pdfVal3.status}, Summary = ${pdfVal3.summary}`);
  if (pdfVal3.status === 'High Fidelity' && pdfVal3.details.isValidSignature) {
    console.log('   PASSED: PowerPoint to PDF produced valid PDF.');
  } else {
    throw new Error('PowerPoint to PDF validation failed');
  }

  console.log('\n================================================================');
  console.log('   ALL 6 CONVERSION DIRECTIONS VERIFIED & PASSED VALIDATION!    ');
  console.log('================================================================');
}

runPhaseCTests().catch(err => {
  console.error('Phase C Test Failed:', err);
  process.exit(1);
});
