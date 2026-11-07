import React, { useState } from 'react';
import { FileText, AlertCircle, Info, Sparkles } from 'lucide-react';
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
import { pdfToWord, downloadDocx, getPDFInfo } from '../../utils/pdfUtils';

export const PDFToWord: React.FC = () => {
  const tool = TOOLS_DATA['pdf-to-word'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setDocxBlob(null);
    const selected = newFiles[0];
    setFile(selected);

    try {
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
      const blob = await pdfToWord(file, (p) => setProgress(p));
      setDocxBlob(blob);
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
    setDocxBlob(null);
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
            subtitle="Drop your PDF here or browse files. 100% processed in your browser."
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

            {/* Layout Reconstruction Notice & Disclosed Limitations */}
            <div className="p-4 bg-blue-50/80 border border-blue-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-900 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Supported Elements:</span> Sequential text streams, typographical font sizes, heading classifications, and paragraph groupings into standards-compliant OpenXML (.docx).
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> Multi-column spreads reflow in reading order; embedded raster images, complex borderless tables, vector shapes, and running headers/footers are extracted into formatted text paragraphs rather than native Word drawing objects.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Parsing text streams & constructing DOCX..." />}

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

        {docxBlob && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Word Document (.docx)"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-converted.docx` : 'document.docx'}
              subText="Successfully converted PDF to editable Microsoft Word document."
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

export default PDFToWord;
