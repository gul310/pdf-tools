import React, { useState } from 'react';
import { RotateCw, AlertCircle, FileText, Undo2 } from 'lucide-react';
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
import { rotatePDF, getPDFInfo, renderPDFThumbnail, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const RotatePDF: React.FC = () => {
  const tool = TOOLS_DATA['rotate-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [rotations, setRotations] = useState<Record<number, number>>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotatedResult, setRotatedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setRotatedResult(null);
    setRotations({});

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is protected by a password. Please unlock it using Unlock PDF first.');
        return;
      }
      setPageCount(info.pageCount);
      loadThumbnails(selected, info.pageCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect PDF document.');
    }
  };

  const loadThumbnails = async (pdfFile: File, total: number) => {
    const limit = Math.min(total, 24);
    for (let p = 1; p <= limit; p++) {
      try {
        const thumb = await renderPDFThumbnail(pdfFile, p, 150);
        setThumbnails((prev) => ({ ...prev, [p]: thumb }));
      } catch {
        break;
      }
    }
  };

  const rotatePage = (pageNum: number) => {
    setRotations((prev) => {
      const current = prev[pageNum] || 0;
      const next = (current + 90) % 360;
      return { ...prev, [pageNum]: next };
    });
  };

  const rotateAll = (deg: number) => {
    setRotations((prev) => {
      const updated: Record<number, number> = {};
      for (let i = 1; i <= pageCount; i++) {
        const current = prev[i] || 0;
        updated[i] = (current + deg) % 360;
      }
      return updated;
    });
  };

  const resetRotations = () => {
    setRotations({});
  };

  const handleSave = async () => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const output = await rotatePDF(file, rotations);
      setRotatedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Failed to rotate PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(rotatedResult, `${originalName}-rotated.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setThumbnails({});
    setRotations({});
    setRotatedResult(null);
    setError(null);
  };

  const hasAnyRotations = Object.values(rotations).some((r) => r !== 0);

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-semibold">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Permanent Orientation Correction</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {tool.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>

        {/* Workspace */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!file && (
            <FileUploader
              onFilesSelected={handleFileSelected}
              title="Select PDF file to rotate"
              subtitle="Fix upside-down or sideways pages with instant visual feedback"
            />
          )}

          {file && !rotatedResult && (
            <div className="space-y-8">
              {/* File Info & Global Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => rotateAll(90)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Rotate All +90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateAll(180)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    Rotate All 180°
                  </button>
                  {hasAnyRotations && (
                    <button
                      type="button"
                      onClick={resetRotations}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <Undo2 className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-400 hover:text-red-600 ml-2"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Interactive Thumbnail Grid */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  Click any page thumbnail or the rotate button below it to turn it 90° clockwise:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[460px] overflow-y-auto p-1">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                    const angle = rotations[p] || 0;
                    const thumb = thumbnails[p];
                    return (
                      <div
                        key={p}
                        className="group bg-slate-50 border border-slate-200 hover:border-cyan-400 rounded-2xl p-2.5 flex flex-col items-center justify-between transition-all"
                      >
                        <div
                          onClick={() => rotatePage(p)}
                          className="w-full aspect-[3/4] bg-white rounded-xl overflow-hidden border border-slate-200/80 cursor-pointer flex items-center justify-center p-2 relative"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={`Page ${p}`}
                              style={{ transform: `rotate(${angle}deg)` }}
                              className="max-w-full max-h-full object-contain transition-transform duration-200"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Page {p}</span>
                          )}

                          {angle !== 0 && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-bold shadow-xs">
                              +{angle}°
                            </div>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60 text-xs">
                          <span className="font-bold text-slate-700">Page {p}</span>
                          <button
                            type="button"
                            onClick={() => rotatePage(p)}
                            className="p-1 rounded text-cyan-600 hover:bg-cyan-50 transition-colors"
                            title="Rotate 90 degrees"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Save Rotated PDF</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Updating rotation dictionaries in PDF structures..."
            />
          )}

          {rotatedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Rotated PDF"
              subText="Page rotation angles permanently applied."
              filename={`${file?.name.replace(/\.pdf$/i, '')}-rotated.pdf`}
            />
          )}
        </div>

        <AdPlaceholder />

        {/* SEO Article */}
        <div className="mt-16 bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {tool.articleContent.heading}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tool.articleContent.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  {section.subheading}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <HowToSection
          toolName={tool.name}
          steps={tool.howToSteps}
          directAnswer={tool.directAnswer}
        />

        <FAQSection
          toolName={tool.name}
          faqs={tool.faqs}
        />

        <RelatedTools
          currentToolId={tool.id}
          relatedIds={tool.relatedToolIds}
        />
      </div>
    </>
  );
};
