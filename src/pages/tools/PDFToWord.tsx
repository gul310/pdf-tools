import React, { useState } from 'react';
import { FileText, AlertCircle, Info, Sparkles, Layers, Edit3 } from 'lucide-react';
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
  pdfToWord,
  downloadDocx,
  getPDFInfo,
  createIntegrityRecord,
  validateDocxOutput,
  type FileIntegrityRecord,
  type ValidationResult
} from '../../utils/pdfUtils';

export const PDFToWord: React.FC = () => {
  const tool = TOOLS_DATA['pdf-to-word'];
  const [file, setFile] = useState<File | null>(null);
  const [integrityRecord, setIntegrityRecord] = useState<FileIntegrityRecord | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'editable' | 'visual'>('editable');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setDocxBlob(null);
    setValidationResult(null);
    const selected = newFiles[0];
    setFile(selected);

    try {
      const record = await createIntegrityRecord(selected);
      setIntegrityRecord(record);
      const info = await getPDFInfo(selected);
      setPageCount(info.pageCount);
    } catch {
      setPageCount(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PDF file to convert.');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      const blob = await pdfToWord(file, { mode, detectTables: true }, (p) => setProgress(p));
      const validation = await validateDocxOutput(blob, {
        sourcePageCount: pageCount || undefined,
        mode
      });

      setDocxBlob(blob);
      setValidationResult(validation);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert PDF to Word. Ensure the file is not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!docxBlob || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadDocx(docxBlob, `${baseName}-converted.docx`);
  };

  const handleReset = () => {
    setFile(null);
    setIntegrityRecord(null);
    setDocxBlob(null);
    setValidationResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
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
            accept=".pdf"
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Choose a PDF file to convert to Word"
            subtitle="Drop your PDF here or browse files. 100% processed in your browser with zero server uploads."
          />
        )}

        {file && !docxBlob && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB {pageCount ? `• ${pageCount} pages` : ''}
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

            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Choose Conversion Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('editable')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'editable'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'editable' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Mode A: Editable Document</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Extracts editable paragraphs, headings, bullet points, and detected Word tables.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('visual')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'visual'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'visual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Mode B: Exact Visual Conversion</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Preserves 100% of complex layouts, vector graphics, and fonts as high-res OpenXML slides.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Layout Reconstruction Notice & Disclosed Limitations */}
            <div className="p-4 bg-blue-50/80 border border-blue-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Supported Elements:</span> Sequential text streams, typographical font sizes, heading classifications, detected tables, and standards-compliant OpenXML (.docx).
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> In Editable Mode, complex multi-column flow reflows in reading order. For 100% identical graphical appearance, use Exact Visual Mode.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Processing document with client-side engine..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Convert to Word (.docx)</span>
            </button>
          </div>
        )}

        {docxBlob && file && (
          <ConversionValidationCard
            validationResult={validationResult}
            integrityRecord={integrityRecord}
            originalFile={file}
            outputFilename={`${file.name.replace(/\.pdf$/i, '')}-converted.docx`}
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
