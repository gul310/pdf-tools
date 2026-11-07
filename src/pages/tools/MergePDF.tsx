import React, { useState } from 'react';
import { Files, AlertCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { FileUploader } from '../../components/FileUploader';
import { FileList } from '../../components/FileList';
import type { SelectedFileItem } from '../../components/FileList';
import { ProgressBar } from '../../components/ProgressBar';
import { DownloadButton } from '../../components/DownloadButton';
import { HowToSection } from '../../components/HowToSection';
import { FAQSection } from '../../components/FAQSection';
import { RelatedTools } from '../../components/RelatedTools';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { TOOLS_DATA } from '../../data/toolsData';
import { mergePDFs, getPDFInfo, downloadPDF } from '../../utils/pdfUtils';

export const MergePDF: React.FC = () => {
  const tool = TOOLS_DATA['merge-pdf'];
  const [files, setFiles] = useState<SelectedFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [mergedResult, setMergedResult] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    setError(null);
    const newItems: SelectedFileItem[] = [];

    for (const file of newFiles) {
      const id = `${file.name}-${file.size}-${Math.random()}`;
      let pageCount: number | undefined;
      try {
        const info = await getPDFInfo(file);
        pageCount = info.pageCount;
      } catch {
        // Continue if info cannot be read immediately
      }
      newItems.push({ id, file, pageCount });
    }

    setFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const rawFiles = files.map((f) => f.file);
      const output = await mergePDFs(rawFiles, (p) => setProgress(p));
      setMergedResult(output);
    } catch (err: any) {
      setError(err?.message || 'An error occurred while merging your PDF files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    downloadPDF(mergedResult, 'merged-document.pdf');
  };

  const handleReset = () => {
    setFiles([]);
    setMergedResult(null);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Files className="w-3.5 h-3.5" />
            <span>100% In-Browser Merging</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            {tool.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {tool.shortDescription}
          </p>
        </div>

        {/* Interactive Workspace */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold">Processing Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!mergedResult && (
            <>
              {files.length === 0 ? (
                <FileUploader
                  multiple
                  onFilesSelected={handleFilesSelected}
                  title="Drop PDF files to merge here"
                  subtitle="Select two or more files to combine into one"
                />
              ) : (
                <div className="space-y-6">
                  <FileList
                    files={files}
                    onRemove={handleRemove}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />

                  {/* Add more files uploader */}
                  <div className="pt-2">
                    <FileUploader
                      compact
                      multiple
                      onFilesSelected={handleFilesSelected}
                      title="Add more PDF files"
                      subtitle="Add additional documents to the merge queue"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Clear All Files
                    </button>

                    <button
                      type="button"
                      onClick={handleMerge}
                      disabled={isProcessing || files.length < 2}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Files className="w-5 h-5" />
                      <span>Merge {files.length} PDF Files</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isProcessing && (
            <ProgressBar
              progress={progress}
              statusText="Combining PDF pages in browser memory..."
            />
          )}

          {mergedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Merged PDF"
              subText={`Successfully combined ${files.length} documents into one.`}
              filename="merged-document.pdf"
            />
          )}
        </div>

        <AdPlaceholder />

        {/* Detailed Article Content for SEO */}
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
