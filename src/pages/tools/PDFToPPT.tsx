import React, { useState } from 'react';
import { Presentation, AlertCircle, Info, Sparkles, Image, Type } from 'lucide-react';
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
import { pdfToPowerPoint, downloadPptx, getPDFInfo } from '../../utils/pdfUtils';

export const PDFToPPT: React.FC = () => {
  const tool = TOOLS_DATA['pdf-to-ppt'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'slides' | 'editable'>('slides');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pptxBlob, setPptxBlob] = useState<Blob | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setPptxBlob(null);
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
    setProgress(15);
    setError(null);

    try {
      const blob = await pdfToPowerPoint(file, mode, (p) => setProgress(p));
      setPptxBlob(blob);
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
    setPptxBlob(null);
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
            subtitle="Convert PDF slides, lectures, or decks into PowerPoint .pptx. 100% browser-side."
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

            {/* Conversion Mode Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-800">
                Select PowerPoint Output Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode('slides')}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    mode === 'slides'
                      ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-slate-900">
                    <Image className="w-4 h-4 text-orange-600" />
                    <span>High-Fidelity Presentation Slides</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Recommended for slide presentations. Renders each PDF page at high resolution as a slide background, ensuring 100% visual fidelity for diagrams, fonts, and geometry.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('editable')}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    mode === 'editable'
                      ? 'border-orange-500 bg-orange-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-sm text-slate-900">
                    <Type className="w-4 h-4 text-orange-600" />
                    <span>Editable Text Blocks</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Extracts digital text from each page into movable, editable PowerPoint text boxes positioned on standard 16:9 widescreen slides.
                  </p>
                </button>
              </div>
            </div>

            <div className="p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-orange-950 leading-relaxed space-y-1">
                <div>
                  <span className="font-semibold">Mode Capabilities:</span> High-Fidelity mode renders the complete page geometry, diagrams, images, and fonts as crisp slide backgrounds. Editable Text mode extracts text runs into movable PowerPoint text boxes.
                </div>
                <div>
                  <span className="font-semibold">Conversion Limitations:</span> In Editable Text mode, embedded vector illustrations and background charts are not converted into native editable PowerPoint shapes. For 100% diagram and visual fidelity, select High-Fidelity Presentation Slides.
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Building 16:9 slides & compiling presentation..." />}

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

        {pptxBlob && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download PowerPoint Presentation (.pptx)"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-slides.pptx` : 'presentation.pptx'}
              subText="Successfully generated 16:9 widescreen presentation deck."
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

export default PDFToPPT;
