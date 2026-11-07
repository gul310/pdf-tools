import React, { useState } from 'react';
import { FileSpreadsheet, AlertCircle, Info, Sparkles } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { FileUploader } from '../../components/FileUploader';
import { ProgressBar } from '../../components/ProgressBar';
import { DownloadButton } from '../../components/DownloadButton';
import { HowToSection } from '../../components/HowToSection';
import { FAQSection } from '../../components/FAQSection';
import { RelatedTools } from '../../components/RelatedTools';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { TOOLS_DATA } from '../../data/toolsData';
import { excelToPDF, downloadPDF } from '../../utils/pdfUtils';

export const ExcelToPDF: React.FC = () => {
  const tool = TOOLS_DATA['excel-to-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const selected = newFiles[0];
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) spreadsheet.');
      return;
    }
    setError(null);
    setPdfBytes(null);
    setFile(selected);
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
      setPdfBytes(output);
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
    setPdfBytes(null);
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
            title="Choose an Excel or CSV file to convert"
            subtitle="Supports .xlsx, .xls, and .csv files. Converted cleanly and privately in your browser."
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
                  <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
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

            {/* Smart Auto-Layout Note & Limitations */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-950 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Supported Elements:</span> Evaluated formula results, text, numbers, dates, automated column widths, and auto-orientation (switches to Landscape for wide sheets with &gt;5 columns).
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> Renders the primary/active worksheet; dynamic Excel chart objects, user-defined print area masks, custom cell comments, and secondary worksheets are not rendered in single-table PDF export mode.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Rendering worksheet grids & generating PDF..." />}

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

        {pdfBytes && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download PDF Document"
              filename={file ? `${file.name.replace(/\.(xlsx|xls|csv)$/i, '')}-converted.pdf` : 'report.pdf'}
              subText="Successfully converted spreadsheet to publication-ready PDF."
            />
          </div>
        )}
      </div>

      <AdPlaceholder />

      {/* SEO & Educational Content */}
      <div className="prose prose-slate max-w-none bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{tool.articleContent.heading}</h2>
        {tool.articleContent.sections.map((section, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{section.subheading}</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{section.content}</p>
          </div>
        ))}
      </div>

      <HowToSection toolName={tool.name} steps={tool.howToSteps} />
      <FAQSection faqs={tool.faqs} toolName={tool.name} />
      <RelatedTools currentToolId={tool.id} relatedIds={tool.relatedToolIds} />
      <AdPlaceholder />
    </div>
  );
};

export default ExcelToPDF;
