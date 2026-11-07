import React, { useState } from 'react';
import { Image as ImageIcon, AlertCircle, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
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
import { imagesToPDF, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

export const ImageToPDF: React.FC = () => {
  const tool = TOOLS_DATA['image-to-pdf'];
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('auto');
  const [margin, setMargin] = useState<number>(20);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setError(null);
    const newItems: ImageItem[] = [];

    for (const file of selectedFiles) {
      const valid = file.type.startsWith('image/') || file.name.match(/\.(jpe?g|png|webp|gif|bmp)$/i);
      if (!valid) {
        setError(`"${file.name}" is not a recognized image format.`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `${file.name}-${file.size}-${Math.random()}`,
        file,
        previewUrl
      });
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) {
      setError('Please select at least one image file.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const rawFiles = images.map((i) => i.file);
      const output = await imagesToPDF(
        rawFiles,
        {
          pageSize,
          orientation,
          margin
        },
        (p) => setProgress(p)
      );
      setPdfResult(output);
    } catch (err: any) {
      setError(err?.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfResult) return;
    downloadPDF(pdfResult, 'converted-images.pdf');
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setPdfResult(null);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Client-Side Image Conversion</span>
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

          {!pdfResult && (
            <>
              {images.length === 0 ? (
                <FileUploader
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/*"
                  onFilesSelected={handleFilesSelected}
                  title="Drop JPG, PNG, or WebP images here"
                  subtitle="Select one or multiple photos to convert into a single PDF document"
                />
              ) : (
                <div className="space-y-8">
                  {/* Image Grid with Reorder controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>Selected Photos ({images.length})</span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto p-1">
                      {images.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group relative bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                        >
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/60 mb-2 flex items-center justify-center">
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-800 truncate" title={item.file.name}>
                              {idx + 1}. {item.file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatFileSize(item.file.size)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveUp(idx)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move Earlier"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={() => handleMoveDown(idx)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move Later"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600"
                              title="Delete Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add more images */}
                  <FileUploader
                    compact
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/*"
                    onFilesSelected={handleFilesSelected}
                    title="Add more photos"
                    subtitle="Append additional images to the sequence"
                  />

                  {/* Formatting Options */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Page Size */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Page Dimensions
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="a4">Standard A4 Document</option>
                        <option value="letter">US Letter Format</option>
                        <option value="fit">Fit to Image Natural Size</option>
                      </select>
                    </div>

                    {/* Orientation */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Orientation
                      </label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="auto">Auto (Match Image Ratio)</option>
                        <option value="portrait">Portrait (Vertical)</option>
                        <option value="landscape">Landscape (Horizontal)</option>
                      </select>
                    </div>

                    {/* Margins */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Page Margins
                      </label>
                      <select
                        value={margin}
                        onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value={0}>No Margin (Edge-to-Edge)</option>
                        <option value={20}>Small Margin (20pt)</option>
                        <option value={40}>Wide Margin (40pt)</option>
                      </select>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-amber-600/25 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Convert {images.length} Photos to PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {isProcessing && (
            <ProgressBar
              progress={progress}
              statusText="Embedding images and rendering PDF pages..."
            />
          )}

          {pdfResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Assembled PDF"
              subText={`Successfully transformed ${images.length} pictures into a single document.`}
              filename="converted-images.pdf"
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
