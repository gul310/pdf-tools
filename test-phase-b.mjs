import { calculateSHA256, createWorkingBuffer, verifyOriginalIntegrity } from './src/utils/fileIntegrity.ts';
import {
  validatePdfOutput,
  validateDocxOutput,
  validateXlsxOutput,
  validatePptxOutput
} from './src/utils/conversionValidator.ts';
import fs from 'fs';
import { execSync } from 'child_process';

if (!fs.existsSync('test-assets/sample1.pdf')) {
  execSync('node create-test-assets.mjs', { stdio: 'inherit' });
}

async function runPhaseBTests() {
  console.log('================================================================');
  console.log('              PHASE B — INTEGRITY & VALIDATOR TESTS             ');
  console.log('================================================================');

  // Test 1: SHA-256 calculation
  const samplePdfBytes = fs.readFileSync('test-assets/sample1.pdf');
  const hash1 = await calculateSHA256(samplePdfBytes);
  console.log(`[Test 1] SHA-256 for sample1.pdf: ${hash1}`);
  if (hash1 && hash1.length === 64) {
    console.log('   PASS: SHA-256 calculation valid 64-char hex string.');
  } else {
    throw new Error('SHA-256 calculation failed.');
  }

  // Test 2: Working buffer cloning & immutability
  const originalBuf = samplePdfBytes.buffer.slice(samplePdfBytes.byteOffset, samplePdfBytes.byteOffset + samplePdfBytes.byteLength);
  const clonedBuf = await createWorkingBuffer(originalBuf);
  if (clonedBuf !== originalBuf && clonedBuf.byteLength === originalBuf.byteLength) {
    console.log('   PASS: Working buffer is an isolated, deep-cloned ArrayBuffer.');
  } else {
    throw new Error('Working buffer cloning failed.');
  }

  // Test 3: PDF Validation
  const pdfVal = await validatePdfOutput(new Uint8Array(samplePdfBytes), 3);
  console.log(`[Test 3] PDF Validation: Status = ${pdfVal.status}, Summary = ${pdfVal.summary}`);
  if (pdfVal.status === 'High Fidelity' && pdfVal.details.isValidSignature) {
    console.log('   PASS: validatePdfOutput verified magic bytes and 3 pages.');
  } else {
    throw new Error(`PDF validation failed: ${JSON.stringify(pdfVal)}`);
  }

  // Test 4: DOCX Validation
  const sampleDocxBytes = fs.readFileSync('test-assets/sample.docx');
  const docxVal = await validateDocxOutput(new Uint8Array(sampleDocxBytes), { mode: 'editable' });
  console.log(`[Test 4] DOCX Validation: Status = ${docxVal.status}, Summary = ${docxVal.summary}`);
  if (docxVal.status === 'High Fidelity' && docxVal.details.isValidSignature) {
    console.log('   PASS: validateDocxOutput verified OpenXML structure.');
  } else {
    throw new Error(`DOCX validation failed: ${JSON.stringify(docxVal)}`);
  }

  // Test 5: XLSX Validation
  const sampleXlsxBytes = fs.readFileSync('test-assets/sample.xlsx');
  const xlsxVal = await validateXlsxOutput(new Uint8Array(sampleXlsxBytes));
  console.log(`[Test 5] XLSX Validation: Status = ${xlsxVal.status}, Summary = ${xlsxVal.summary}`);
  if (xlsxVal.status === 'High Fidelity' && xlsxVal.details.isValidSignature) {
    console.log('   PASS: validateXlsxOutput verified XLSX sheets.');
  } else {
    throw new Error(`XLSX validation failed: ${JSON.stringify(xlsxVal)}`);
  }

  // Test 6: PPTX Validation
  const samplePptxBytes = fs.readFileSync('test-assets/sample.pptx');
  const pptxVal = await validatePptxOutput(new Uint8Array(samplePptxBytes));
  console.log(`[Test 6] PPTX Validation: Status = ${pptxVal.status}, Summary = ${pptxVal.summary}`);
  if (pptxVal.status === 'High Fidelity' && pptxVal.details.isValidSignature) {
    console.log('   PASS: validatePptxOutput verified PPTX slides.');
  } else {
    throw new Error(`PPTX validation failed: ${JSON.stringify(pptxVal)}`);
  }

  console.log('\nALL PHASE B INTEGRITY & VALIDATION TESTS PASSED!');
}

runPhaseBTests().catch(err => {
  console.error('Phase B Test Error:', err);
  process.exit(1);
});
