import React, { useState } from 'react';
import { FileImage, AlertCircle, FileText, CheckSquare, Square, Download } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { FileUploader } from '../../components/FileUploader';
import { ProgressBar } from '../../components/ProgressBar';
import { HowToSection } from '../../components/HowToSection';
import { FAQSection } from '../../components/FAQSection';
import { RelatedTools } from '../../components/RelatedTools';
import { AdPlaceholder } from '../../components/AdPlaceholder';
import { TOOLS_DATA } from '../../data/toolsData';
import { 
  convertPDFToImages, 
  getPDFInfo, 
  renderPDFThumbnail, 
  downloadZIP, 
  formatFileSize
} from '../../utils/pdfUtils';
import type { ConvertedImageResult } from '../../utils/pdfUtils';

export const PDFToImage: React.FC = () => {
  const tool = TOOLS_DATA['pdf-to-image'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState<number>(2.0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [convertedImages, setConvertedImages] = useState<ConvertedImageResult[] | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setConvertedImages(null);

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is encrypted. Please unlock it using our Unlock PDF tool first.');
        return;
      }
      setPageCount(info.pageCount);
      // Select all pages by default
      const all = new Set<number>();
      for (let i = 1; i <= info.pageCount; i++) all.add(i);
      setSelectedPages(all);

      // Render previews
      loadThumbnails(selected, info.pageCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to read PDF document.');
    }
  };

  const loadThumbnails = async (pdfFile: File, total: number) => {
    const limit = Math.min(total, 16);
    for (let p = 1; p <= limit; p++) {
      try {
        const thumb = await renderPDFThumbnail(pdfFile, p, 140);
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

  const handleConvert = async () => {
    if (!file) return;
    if (selectedPages.size === 0) {
      setError('Please select at least one page to convert.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress({ current: 0, total: selectedPages.size });

    try {
      const results = await convertPDFToImages(
        file,
        {
          format,
          scale,
          selectedPages: Array.from(selectedPages).sort((a, b) => a - b)
        },
        (current, total) => {
          setProgress({ current, total });
        }
      );
      setConvertedImages(results);
    } catch (err: any) {
      setError(err?.message || 'Failed to render PDF to images.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!convertedImages) return;
    const filesToZip = convertedImages.map((img) => ({
      name: img.filename,
      data: img.blob
    }));
    await downloadZIP(filesToZip, `${file?.name.replace(/\.pdf$/i, '')}-images.zip`);
  };

  const handleDownloadSingle = (img: ConvertedImageResult) => {
    const a = document.createElement('a');
    a.href = img.dataUrl;
    a.download = img.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setThumbnails({});
    setSelectedPages(new Set());
    setConvertedImages(null);
    setError(null);
    setProgress(null);
  };

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
            <FileImage className="w-3.5 h-3.5" />
            <span>High-DPI PDF.js Rendering</span>
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
              title="Select PDF document"
              subtitle="Choose a PDF file to convert pages into high-resolution JPG or PNG pictures"
            />
          )}

          {file && !convertedImages && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
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

              {/* Conversion Configuration */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Image Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormat('png')}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        format === 'png'
                          ? 'border-rose-600 bg-rose-50/60 text-rose-700 ring-1 ring-rose-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      PNG (Crisp & Lossless)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat('jpeg')}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        format === 'jpeg'
                          ? 'border-rose-600 bg-rose-50/60 text-rose-700 ring-1 ring-rose-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      JPG (Lightweight)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Resolution / Quality
                  </label>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value={1.0}>1x Standard Resolution (Web)</option>
                    <option value={2.0}>2x High Definition Retina (Recommended)</option>
                    <option value={3.0}>3x Ultra-Crisp 300 DPI Equivalent (Print)</option>
                  </select>
                </div>
              </div>

              {/* Page Selection Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Selected: {selectedPages.size} of {pageCount} pages to convert</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-rose-600 hover:text-rose-800"
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[380px] overflow-y-auto p-1">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                    const isSelected = selectedPages.has(p);
                    const thumb = thumbnails[p];
                    return (
                      <div
                        key={p}
                        onClick={() => togglePage(p)}
                        className={`relative group rounded-xl border p-2 cursor-pointer transition-all flex flex-col items-center justify-between ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-600 shadow-sm'
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
                            <CheckSquare className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
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
                  onClick={handleConvert}
                  disabled={isProcessing || selectedPages.size === 0}
                  className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileImage className="w-5 h-5" />
                  <span>Convert {selectedPages.size} Pages to {format.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              progress={
                progress && progress.total > 0
                  ? Math.round((progress.current / progress.total) * 100)
                  : undefined
              }
              statusText={`Rendering page ${progress?.current || 1} of ${progress?.total || 1}...`}
            />
          )}

          {convertedImages && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-rose-50/60 border border-rose-200 rounded-2xl gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Converted {convertedImages.length} Image {convertedImages.length === 1 ? 'Page' : 'Pages'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Rendered in {format.toUpperCase()} format with zero server uploads.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All as ZIP</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                  >
                    Convert Another
                  </button>
                </div>
              </div>

              {/* Converted images preview gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[460px] overflow-y-auto p-1">
                {convertedImages.map((img) => (
                  <div
                    key={img.pageNum}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col justify-between"
                  >
                    <div className="w-full aspect-[3/4] bg-white rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center mb-2">
                      <img
                        src={img.dataUrl}
                        alt={img.filename}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Page {img.pageNum}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(img)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100/70 transition-colors"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
