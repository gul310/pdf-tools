import React, { useState } from 'react';
import { Minimize2, AlertCircle, FileText, ArrowDown } from 'lucide-react';
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
import { compressPDF, getPDFInfo, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const CompressPDF: React.FC = () => {
  const tool = TOOLS_DATA['compress-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressedResult, setCompressedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setCompressedResult(null);

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is password-protected. Please unlock it using the Unlock PDF tool first.');
        return;
      }
      setPageCount(info.pageCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to read PDF document.');
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      const output = await compressPDF(file, compressionLevel);
      setCompressedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Error occurred during PDF compression.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(compressedResult, `${originalName}-compressed.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setCompressedResult(null);
    setError(null);
  };

  const calculateSavings = () => {
    if (!file || !compressedResult) return null;
    const originalSize = file.size;
    const newSize = compressedResult.byteLength;
    const saved = originalSize - newSize;
    const pct = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;
    return { originalSize, newSize, saved, pct };
  };

  const savings = calculateSavings();

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Lossless WebAssembly Compression</span>
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
              title="Select PDF file to compress"
              subtitle="Drop your document to optimize and reduce its file size"
            />
          )}

          {file && !compressedResult && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Original size: {formatFileSize(file.size)} • {pageCount} pages
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

              {/* Compression Levels */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">
                  Select Compression Strength:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompressionLevel('medium')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      compressionLevel === 'medium'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm mb-1">
                      <span>Recommended</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Optimal balance of sharp visual quality and file size reduction.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompressionLevel('high')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      compressionLevel === 'high'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm mb-1">
                      <span>Maximum</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Smallest
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Maximum stream and object compression for tight email upload limits.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompressionLevel('low')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      compressionLevel === 'low'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm mb-1">
                      <span>Light</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Highest Quality
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Structural cleanup and lossless deduplication with minimal changes.
                    </p>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={isProcessing}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Minimize2 className="w-5 h-5" />
                  <span>Compress PDF Now</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Recompressing streams and packing object streams via WebAssembly..."
            />
          )}

          {compressedResult && savings && (
            <div className="space-y-6">
              {/* Savings Report Card */}
              <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Before</p>
                  <p className="text-xl font-bold text-slate-700 mt-1">{formatFileSize(savings.originalSize)}</p>
                </div>

                <div className="flex items-center gap-2 text-emerald-600">
                  <ArrowDown className="w-6 h-6 animate-bounce" />
                  <span className="text-2xl font-black">{savings.pct > 0 ? `-${savings.pct}%` : 'Optimized'}</span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">After Compression</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{formatFileSize(savings.newSize)}</p>
                </div>
              </div>

              <DownloadButton
                onDownload={handleDownload}
                onReset={handleReset}
                buttonText="Download Compressed PDF"
                subText={savings.saved > 0 ? `Reduced by ${formatFileSize(savings.saved)} (${savings.pct}%)` : 'Your document was fully linearized and stream-optimized.'}
                filename={`${file?.name.replace(/\.pdf$/i, '')}-compressed.pdf`}
              />
            </div>
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
