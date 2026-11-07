import React, { useState } from 'react';
import { Trash2, AlertCircle, FileText, Undo } from 'lucide-react';
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
import { deletePDFPages, getPDFInfo, renderPDFThumbnail, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const DeletePDFPages: React.FC = () => {
  const tool = TOOLS_DATA['delete-pages'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [pagesToDelete, setPagesToDelete] = useState<Set<number>>(new Set());

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedResult, setUpdatedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setUpdatedResult(null);
    setPagesToDelete(new Set());

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is encrypted with a password. Please unlock it using Unlock PDF first.');
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

  const togglePageToDelete = (pageNum: number) => {
    setPagesToDelete((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        if (next.size + 1 >= pageCount) {
          setError('You cannot delete all pages from the document. At least one page must remain.');
          return prev;
        }
        setError(null);
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleRemove = async () => {
    if (!file) return;
    if (pagesToDelete.size === 0) {
      setError('Please click on at least one page you wish to delete.');
      return;
    }
    if (pagesToDelete.size >= pageCount) {
      setError('Cannot delete all pages from the PDF. At least one page must remain.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const output = await deletePDFPages(file, Array.from(pagesToDelete));
      setUpdatedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!updatedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(updatedResult, `${originalName}-pages-removed.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setThumbnails({});
    setPagesToDelete(new Set());
    setUpdatedResult(null);
    setError(null);
  };

  const remainingCount = pageCount - pagesToDelete.size;

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Interactive Page Sanitization</span>
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
              title="Select PDF file"
              subtitle="Choose a document to remove blank, confidential, or unwanted pages"
            />
          )}

          {file && !updatedResult && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • {pageCount} pages total •{' '}
                      <span className="font-bold text-red-600">{pagesToDelete.size} marked for deletion</span> •{' '}
                      <span className="font-bold text-emerald-600">{remainingCount} remaining</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {pagesToDelete.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setPagesToDelete(new Set())}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      <Undo className="w-3.5 h-3.5" />
                      <span>Clear Selection</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-400 hover:text-red-600"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Page Selection Instructions */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500">
                  Click on the pages you want to remove. A red highlight indicates the page will be permanently purged:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[460px] overflow-y-auto p-1">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                    const isMarked = pagesToDelete.has(p);
                    const thumb = thumbnails[p];
                    return (
                      <div
                        key={p}
                        onClick={() => togglePageToDelete(p)}
                        className={`group relative rounded-2xl border p-2.5 cursor-pointer transition-all flex flex-col items-center justify-between ${
                          isMarked
                            ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={`Page ${p}`}
                              className={`w-full h-full object-contain ${isMarked ? 'opacity-40 grayscale' : ''}`}
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">Page {p}</span>
                          )}

                          {isMarked && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/20 text-red-600">
                              <Trash2 className="w-8 h-8 drop-shadow-sm" />
                              <span className="text-[10px] font-black uppercase tracking-wider mt-1 bg-red-600 text-white px-2 py-0.5 rounded">
                                Delete
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-xs">
                          <span className={`font-bold ${isMarked ? 'text-red-600 line-through' : 'text-slate-700'}`}>
                            Page {p}
                          </span>
                          <span className={`text-[10px] font-semibold ${isMarked ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isMarked ? 'Remove' : 'Keep'}
                          </span>
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
                  onClick={handleRemove}
                  disabled={isProcessing || pagesToDelete.size === 0}
                  className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-red-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>
                    Delete {pagesToDelete.size} {pagesToDelete.size === 1 ? 'Page' : 'Pages'} & Save
                  </span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Purging selected page streams and rebuilding PDF..."
            />
          )}

          {updatedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Cleaned PDF"
              subText={`Successfully removed ${pagesToDelete.size} ${pagesToDelete.size === 1 ? 'page' : 'pages'}. ${remainingCount} pages preserved.`}
              filename={`${file?.name.replace(/\.pdf$/i, '')}-pages-removed.pdf`}
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
