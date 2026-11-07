import React, { useState, useRef, useEffect } from 'react';
import { Crop, AlertCircle, Sparkles } from 'lucide-react';
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
import { cropPDF, downloadPDF, getPDFInfo, renderPDFPageToCanvas } from '../../utils/pdfUtils';
import type { CropOptions } from '../../utils/extendedPdfUtils';

export const CropPDF: React.FC = () => {
  const tool = TOOLS_DATA['crop-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [previewPage, setPreviewPage] = useState<number>(1);

  // Crop margins in points (standard A4 is 595 x 842 pt)
  const [cropTop, setCropTop] = useState<number>(36);
  const [cropBottom, setCropBottom] = useState<number>(36);
  const [cropLeft, setCropLeft] = useState<number>(36);
  const [cropRight, setCropRight] = useState<number>(36);
  const [pagesScope, setPagesScope] = useState<'all' | 'first' | 'custom'>('all');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [croppedPdfBytes, setCroppedPdfBytes] = useState<Uint8Array | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 380, height: 537 });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setCroppedPdfBytes(null);
    const selected = newFiles[0];
    setFile(selected);

    try {
      const info = await getPDFInfo(selected);
      setPageCount(info.pageCount);
      setPreviewPage(1);
    } catch {
      setPageCount(1);
    }
  };

  useEffect(() => {
    if (!file || !previewCanvasRef.current) return;
    let isCancelled = false;

    renderPDFPageToCanvas(file, previewPage, previewCanvasRef.current, 0.7)
      .then((dims) => {
        if (!isCancelled && dims) {
          setCanvasDims({ width: dims.width, height: dims.height });
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) console.error('Error rendering preview:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [file, previewPage]);

  const applyPreset = (preset: 'trim10' | 'headerFooter' | 'reset') => {
    if (preset === 'trim10') {
      setCropTop(55);
      setCropBottom(55);
      setCropLeft(45);
      setCropRight(45);
    } else if (preset === 'headerFooter') {
      setCropTop(72);
      setCropBottom(72);
      setCropLeft(18);
      setCropRight(18);
    } else {
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
    }
  };

  const handleCrop = async () => {
    if (!file) {
      setError('Please select a PDF file to crop.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    const options: CropOptions = {
      pages: pagesScope,
      top: cropTop,
      bottom: cropBottom,
      left: cropLeft,
      right: cropRight
    };

    try {
      setProgress(50);
      const output = await cropPDF(file, options);
      setCroppedPdfBytes(output);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to crop PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!croppedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(croppedPdfBytes, `${baseName}-cropped.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setCroppedPdfBytes(null);
    setError(null);
  };

  const scaleX = canvasDims.width / 595.28;
  const scaleY = canvasDims.height / 841.89;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-2xl mb-4">
          <Crop className="w-8 h-8 text-amber-600" />
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
            title="Choose a PDF file to crop"
            subtitle="Trim excess margins and headers with live visual boundaries. 100% private."
          />
        )}

        {file && !croppedPdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {pageCount} {pageCount === 1 ? 'page' : 'pages'}
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

            {/* Presets and Page Scope */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('trim10')}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                >
                  Trim 10% Margins
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('headerFooter')}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold text-slate-700"
                >
                  Cut Headers/Footers
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('reset')}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold text-slate-500"
                >
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700">Apply to:</span>
                <select
                  value={pagesScope}
                  onChange={(e) => setPagesScope(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="all">All Pages ({pageCount})</option>
                  <option value="first">Page 1 Only</option>
                </select>
              </div>
            </div>

            {/* Two-Column: Margin Sliders and Visual Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* Margin Inputs */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs">
                <span className="font-bold text-sm text-slate-800 block">Configure Crop Boundaries</span>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Top Margin</span>
                    <span>{cropTop} pt ({Math.round(cropTop * 0.35)} mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={cropTop}
                    onChange={(e) => setCropTop(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Bottom Margin</span>
                    <span>{cropBottom} pt ({Math.round(cropBottom * 0.35)} mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={cropBottom}
                    onChange={(e) => setCropBottom(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Left Margin</span>
                    <span>{cropLeft} pt ({Math.round(cropLeft * 0.35)} mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    value={cropLeft}
                    onChange={(e) => setCropLeft(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Right Margin</span>
                    <span>{cropRight} pt ({Math.round(cropRight * 0.35)} mm)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={150}
                    value={cropRight}
                    onChange={(e) => setCropRight(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              {/* Visual Preview Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Live Crop Preview</span>
                  {pageCount > 1 && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={previewPage <= 1}
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-0.5 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span>Pg {previewPage}</span>
                      <button
                        type="button"
                        disabled={previewPage >= pageCount}
                        onClick={() => setPreviewPage((p) => Math.min(pageCount, p + 1))}
                        className="px-2 py-0.5 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative border border-slate-300 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-3 select-none">
                  <div className="relative shadow-md rounded-lg overflow-hidden bg-white">
                    <canvas ref={previewCanvasRef} className="block max-w-full h-auto" />

                    {/* Dimmed Crop Boundary Overlays */}
                    <div
                      style={{ height: `${cropTop * scaleY}px` }}
                      className="absolute top-0 left-0 right-0 bg-slate-900/40 pointer-events-none"
                    />
                    <div
                      style={{ height: `${cropBottom * scaleY}px` }}
                      className="absolute bottom-0 left-0 right-0 bg-slate-900/40 pointer-events-none"
                    />
                    <div
                      style={{
                        top: `${cropTop * scaleY}px`,
                        bottom: `${cropBottom * scaleY}px`,
                        width: `${cropLeft * scaleX}px`
                      }}
                      className="absolute left-0 bg-slate-900/40 pointer-events-none"
                    />
                    <div
                      style={{
                        top: `${cropTop * scaleY}px`,
                        bottom: `${cropBottom * scaleY}px`,
                        width: `${cropRight * scaleX}px`
                      }}
                      className="absolute right-0 bg-slate-900/40 pointer-events-none"
                    />

                    {/* Active Crop Box Border */}
                    <div
                      style={{
                        top: `${cropTop * scaleY}px`,
                        bottom: `${cropBottom * scaleY}px`,
                        left: `${cropLeft * scaleX}px`,
                        right: `${cropRight * scaleX}px`
                      }}
                      className="absolute border-2 border-dashed border-amber-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Technical & Security note on Cropping */}
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                <span className="font-bold">Important Privacy Notice:</span> Cropping updates the display viewport (<code className="font-mono bg-amber-100 px-1 rounded">MediaBox</code> and <code className="font-mono bg-amber-100 px-1 rounded">CropBox</code>) for reading and printing. <span className="font-semibold underline">It does not delete or purge hidden content outside the cropped area</span> from the underlying PDF stream. Do not rely on cropping to remove confidential or sensitive data.
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Applying crop boundaries & saving PDF..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCrop}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Crop & Download PDF</span>
            </button>
          </div>
        )}

        {croppedPdfBytes && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Cropped PDF Document"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-cropped.pdf` : 'cropped.pdf'}
              subText="Successfully cropped document margins losslessly."
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

export default CropPDF;
