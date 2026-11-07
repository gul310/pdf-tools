import React, { useState } from 'react';
import { FileSpreadsheet, AlertCircle, Info, Sparkles } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { FileUploader } from '../../components/FileUploader';
import { ProgressBar } from '../../components/ProgressBar';
import { HowToSection } from '../../components/HowToSection';
import { FAQSection } from '../../components/FAQSection';
import { RelatedTools } from '../../components/RelatedTools';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { ConversionValidationCard } from '../../components/ConversionValidationCard';
import { TOOLS_DATA } from '../../data/toolsData';
import {
  excelToPDF,
  downloadPDF,
  createIntegrityRecord,
  validatePdfOutput,
  type FileIntegrityRecord,
  type ValidationResult
} from '../../utils/pdfUtils';

export const ExcelToPDF: React.FC = () => {
  const tool = TOOLS_DATA['excel-to-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [integrityRecord, setIntegrityRecord] = useState<FileIntegrityRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const selected = newFiles[0];
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) spreadsheet.');
      return;
    }
    setError(null);
    setPdfBytes(null);
    setValidationResult(null);
    setFile(selected);

    try {
      const record = await createIntegrityRecord(selected);
      setIntegrityRecord(record);
    } catch {
      setIntegrityRecord(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select an Excel or CSV spreadsheet.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setError(null);

    try {
      const output = await excelToPDF(file, (p) => setProgress(p));
      const validation = await validatePdfOutput(output);

      setPdfBytes(output);
      setValidationResult(validation);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert spreadsheet to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBytes || !file) return;
    const baseName = file.name.replace(/\.(xlsx|xls|csv)$/i, '');
    downloadPDF(pdfBytes, `${baseName}-converted.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setIntegrityRecord(null);
    setPdfBytes(null);
    setValidationResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4">
          <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {tool.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          {tool.shortDescription}
        </p>
      </div>

      <AdPlaceholder />

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 mb-8">
        {!file && (
          <FileUploader
            accept=".xlsx,.xls,.csv"
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Choose a Spreadsheet to convert to PDF"
            subtitle="Drop your .xlsx, .xls, or .csv here. 100% processed locally in your browser."
          />
        )}

        {file && !pdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  XLSX
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                    {integrityRecord && ` • SHA-256: ${integrityRecord.shortHash}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-600 underline font-medium"
              >
                Change File
              </button>
            </div>

            {/* Smart Formatting Notice */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Auto-Orientation & Fitting:</span> Tables exceeding standard portrait widths automatically switch to Landscape (A4) layout. Dynamic column auto-fitting prevents abrupt cell clipping.
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> Active Excel macro code (VBA) and live external database linkages are rendered as static calculated snapshots.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Formatting cell grid & compiling PDF document..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Convert to PDF</span>
            </button>
          </div>
        )}

        {pdfBytes && file && (
          <ConversionValidationCard
            validationResult={validationResult}
            integrityRecord={integrityRecord}
            originalFile={file}
            outputFilename={`${file.name.replace(/\.(xlsx|xls|csv)$/i, '')}-converted.pdf`}
            onDownloadConverted={handleDownload}
            onReset={handleReset}
          />
        )}
      </div>

      <HowToSection
        steps={tool.howToSteps}
        toolName={tool.name}
        directAnswer={tool.directAnswer}
      />
      <FAQSection
        faqs={tool.faqs}
        toolName={tool.name}
      />
      <RelatedTools
        currentToolId={tool.id}
        relatedIds={tool.relatedToolIds}
      />
    </div>
  );
};
