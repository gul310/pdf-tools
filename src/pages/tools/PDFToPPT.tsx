import React, { useState } from 'react';
import { Presentation, AlertCircle, Info, Sparkles, Image, Type } from 'lucide-react';
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
  pdfToPowerPoint,
  downloadPptx,
  getPDFInfo,
  createIntegrityRecord,
  validatePptxOutput,
  type FileIntegrityRecord,
  type ValidationResult
} from '../../utils/pdfUtils';

export const PDFToPPT: React.FC = () => {
  const tool = TOOLS_DATA['pdf-to-ppt'];
  const [file, setFile] = useState<File | null>(null);
  const [integrityRecord, setIntegrityRecord] = useState<FileIntegrityRecord | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'slides' | 'editable'>('slides');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pptxBlob, setPptxBlob] = useState<Blob | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setPptxBlob(null);
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
    setProgress(15);
    setError(null);

    try {
      const blob = await pdfToPowerPoint(file, mode, (p) => setProgress(p));
      const validation = await validatePptxOutput(blob, {
        sourcePageCount: pageCount || undefined,
        mode
      });

      setPptxBlob(blob);
      setValidationResult(validation);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert PDF to PowerPoint. Ensure the file is not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pptxBlob || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPptx(pptxBlob, `${baseName}-slides.pptx`);
  };

  const handleReset = () => {
    setFile(null);
    setIntegrityRecord(null);
    setPptxBlob(null);
    setValidationResult(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-2xl mb-4">
          <Presentation className="w-8 h-8 text-orange-600" />
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
            title="Choose a PDF file to convert to PowerPoint"
            subtitle="Drop your PDF here or browse files. Processed 100% locally with zero server uploads."
          />
        )}

        {file && !pptxBlob && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
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

            {/* Mode Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">
                Choose Slide Generation Mode:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('slides')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'slides'
                      ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'slides' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Image className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Mode B: Exact Visual Presentation</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Renders exact page graphics, charts, and fonts as high-res slide backgrounds. Recommended for presentations.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('editable')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    mode === 'editable'
                      ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      mode === 'editable' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Mode A: Editable Text Boxes</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Extracts paragraphs and headings into editable PowerPoint text containers.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Fidelity Notice */}
            <div className="p-4 bg-orange-50/80 border border-orange-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-orange-900 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Aspect Ratio Matching:</span> Automatically configures 16:9 widescreen, 4:3 standard, or portrait slide dimensions based on your source PDF proportions.
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> Complex 3D animations and audio tracks in the source document are not supported.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Generating PowerPoint presentation slides..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Convert to PowerPoint (.pptx)</span>
            </button>
          </div>
        )}

        {pptxBlob && file && (
          <ConversionValidationCard
            validationResult={validationResult}
            integrityRecord={integrityRecord}
            originalFile={file}
            outputFilename={`${file.name.replace(/\.pdf$/i, '')}-slides.pptx`}
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
