import React, { useState } from 'react';
import { Scissors, AlertCircle, FileText, CheckSquare, Square, Layers, Archive } from 'lucide-react';
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
import { 
  splitPDF, 
  getPDFInfo, 
  renderPDFThumbnail, 
  downloadPDF, 
  downloadZIP, 
  formatFileSize
} from '../../utils/pdfUtils';

export const SplitPDF: React.FC = () => {
  const tool = TOOLS_DATA['split-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [splitMode, setSplitMode] = useState<'extract' | 'single' | 'ranges'>('extract');
  const [rangeInput, setRangeInput] = useState<string>('1');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [splitResult, setSplitResult] = useState<{ files: Array<{ name: string; data: Uint8Array }>; isZip: boolean } | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setSplitResult(null);

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is encrypted with a password. Please unlock it using our Unlock PDF tool first.');
        return;
      }
      setPageCount(info.pageCount);
      // Select first page by default
      setSelectedPages(new Set([1]));
      setRangeInput(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : '1');

      // Asynchronously load first few page thumbnails
      loadThumbnails(selected, info.pageCount);
    } catch (err: any) {
      setError(err?.message || 'Unable to inspect this PDF document.');
    }
  };

  const loadThumbnails = async (pdfFile: File, total: number) => {
    const limit = Math.min(total, 24); // load up to 24 thumbnails
    for (let p = 1; p <= limit; p++) {
      try {
        const thumb = await renderPDFThumbnail(pdfFile, p, 160);
        setThumbnails((prev) => ({ ...prev, [p]: thumb }));
      } catch {
        break;
      }
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= pageCount; i++) all.add(i);
    setSelectedPages(all);
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleSplit = async () => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await splitPDF(
        file,
        {
          mode: splitMode,
          selectedPages: Array.from(selectedPages),
          rangeString: rangeInput
        },
        (p) => setProgress(p)
      );
      setSplitResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to split the PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!splitResult) return;
    if (splitResult.isZip || splitResult.files.length > 1) {
      downloadZIP(splitResult.files, 'split-documents.zip');
    } else if (splitResult.files.length === 1) {
      downloadPDF(splitResult.files[0].data, splitResult.files[0].name);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setThumbnails({});
    setSelectedPages(new Set());
    setSplitResult(null);
    setError(null);
    setProgress(undefined);
  };

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5" />
            <span>Precise Page Extraction</span>
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
              title="Select PDF file to split"
              subtitle="Choose a document to extract pages or divide into separate files"
            />
          )}

          {file && !splitResult && (
            <div className="space-y-8">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
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

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Change File
                </button>
              </div>

              {/* Mode Selection Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSplitMode('extract')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    splitMode === 'extract'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Extract Pages</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Click thumbnails to select specific pages into a single PDF.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('ranges')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    splitMode === 'ranges'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Page Ranges</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Extract custom page numbers e.g. "1-3, 5, 8-10".
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitMode('single')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    splitMode === 'single'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-1">
                    <Archive className="w-4 h-4 text-indigo-600" />
                    <span>Split All Pages</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Save every page into its own file and download as ZIP.
                  </p>
                </button>
              </div>

              {/* Mode-specific settings */}
              {splitMode === 'ranges' && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label htmlFor="range-input" className="block text-sm font-bold text-slate-900">
                    Enter Page Ranges:
                  </label>
                  <input
                    id="range-input"
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5, 7-10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Example: "1-4, 7" extracts pages 1, 2, 3, 4, and 7. Max page is {pageCount}.
                  </p>
                </div>
              )}

              {splitMode === 'extract' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>
                      Selected: {selectedPages.size} of {pageCount} pages
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[420px] overflow-y-auto p-1">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                      const isSelected = selectedPages.has(p);
                      const thumb = thumbnails[p];
                      return (
                        <div
                          key={p}
                          onClick={() => togglePage(p)}
                          className={`relative group rounded-xl border p-2 cursor-pointer transition-all flex flex-col items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={`Page ${p}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Page {p}</span>
                            )}
                          </div>

                          <div className="w-full flex items-center justify-between mt-2 px-1">
                            <span className="text-xs font-bold text-slate-700">Page {p}</span>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={isProcessing || (splitMode === 'extract' && selectedPages.size === 0)}
                  className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-5 h-5" />
                  <span>
                    {splitMode === 'single'
                      ? `Split into ${pageCount} Files (ZIP)`
                      : splitMode === 'ranges'
                      ? 'Extract Specified Ranges'
                      : `Extract ${selectedPages.size} Selected Pages`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              progress={progress}
              statusText="Extracting pages and packaging document..."
            />
          )}

          {splitResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              isZip={splitResult.isZip || splitResult.files.length > 1}
              buttonText={splitResult.files.length > 1 ? 'Download Split Files (ZIP)' : 'Download Extracted PDF'}
              subText={`Successfully prepared ${splitResult.files.length} document ${splitResult.files.length === 1 ? 'file' : 'files'}.`}
              filename={splitResult.files.length > 1 ? 'split-documents.zip' : splitResult.files[0]?.name}
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
