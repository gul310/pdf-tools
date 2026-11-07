import React, { useState } from 'react';
import { FileSliders, AlertCircle, Info, Sparkles } from 'lucide-react';
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
import { pptToPDF, downloadPDF } from '../../utils/pdfUtils';

export const PPTToPDF: React.FC = () => {
  const tool = TOOLS_DATA['ppt-to-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const selected = newFiles[0];
    if (!selected.name.toLowerCase().endsWith('.pptx')) {
      setError('Please select a valid Microsoft PowerPoint presentation (.pptx).');
      return;
    }
    setError(null);
    setPdfBytes(null);
    setFile(selected);
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a PowerPoint file.');
      return;
    }

    setIsProcessing(true);
    setProgress(15);
    setError(null);

    try {
      const output = await pptToPDF(file, (p) => setProgress(p));
      setPdfBytes(output);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to convert presentation to PDF. Ensure the file is a valid .pptx archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBytes || !file) return;
    const baseName = file.name.replace(/\.pptx$/i, '');
    downloadPDF(pdfBytes, `${baseName}-slides.pdf`);
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
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-2xl mb-4">
          <FileSliders className="w-8 h-8 text-orange-600" />
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
            accept=".pptx"
            multiple={false}
            onFilesSelected={handleFilesSelected}
            title="Choose a PowerPoint (.pptx) file to convert"
            subtitle="Converts PowerPoint presentation slides to universal PDF documents. 100% private."
          />
        )}

        {file && !pdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  PPTX
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

            {/* Browser Renderer Note & Limitations */}
            <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-orange-950 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Supported Elements:</span> Slide text blocks, titles, font sizing, background colors, embedded PNG/JPG imagery, and 16:9 widescreen layout dimensions.
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> Complex native PowerPoint vector shapes, smart tables, dynamic Excel charts, slide transition animations, and embedded audio/video clips are omitted or flattened during browser-side OpenXML rendering.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Parsing slide packages & rendering PDF..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConvert}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              buttonText="Download Presentation PDF"
              filename={file ? `${file.name.replace(/\.pptx$/i, '')}-slides.pdf` : 'presentation.pdf'}
              subText="Successfully converted PowerPoint slides to widescreen PDF document."
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

export default PPTToPDF;
