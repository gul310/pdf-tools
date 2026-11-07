import React, { useState } from 'react';
import { Hash, AlertCircle, Sparkles } from 'lucide-react';
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
import { addPageNumbers, downloadPDF, getPDFInfo } from '../../utils/pdfUtils';
import type { PageNumberOptions } from '../../utils/extendedPdfUtils';

export const AddPageNumbers: React.FC = () => {
  const tool = TOOLS_DATA['add-page-numbers'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);

  // Pagination config
  const [position, setPosition] = useState<PageNumberOptions['position']>('bottom-center');
  const [format, setFormat] = useState<PageNumberOptions['format']>('Page {n}');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [fontSize, setFontSize] = useState<number>(10);
  const [margin, setMargin] = useState<number>(25);
  const [pageRange, setPageRange] = useState<'all' | 'skip-cover' | 'custom'>('all');
  const [customRangeStr, setCustomRangeStr] = useState<string>('1-5');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [numberedPdfBytes, setNumberedPdfBytes] = useState<Uint8Array | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setNumberedPdfBytes(null);
    const selected = newFiles[0];
    setFile(selected);

    try {
      const info = await getPDFInfo(selected);
      setPageCount(info.pageCount);
      setCustomRangeStr(`1-${info.pageCount}`);
    } catch {
      setPageCount(1);
    }
  };

  const parseCustomPages = (str: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = str.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(maxPages, end); p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleApply = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    let customPages: number[] | undefined;
    if (pageRange === 'custom') {
      customPages = parseCustomPages(customRangeStr, pageCount);
      if (customPages.length === 0) {
        setError('Please provide a valid page range (e.g. 1-5, 8).');
        return;
      }
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      setProgress(50);
      const output = await addPageNumbers(file, {
        position,
        format,
        startNumber,
        fontSize,
        margin,
        pageRange,
        customPages
      });
      setNumberedPdfBytes(output);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to add page numbers to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(numberedPdfBytes, `${baseName}-numbered.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setNumberedPdfBytes(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-100 rounded-2xl mb-4">
          <Hash className="w-8 h-8 text-cyan-600" />
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
            title="Choose a PDF file to number"
            subtitle="Add clean, customizable page numbers to your document. 100% processed locally."
          />
        )}

        {file && !numberedPdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
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

            {/* Pagination Configuration Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Number Position on Page</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'top-center', label: 'Top Center' },
                    { id: 'top-right', label: 'Top Right' },
                    { id: 'bottom-left', label: 'Bottom Left' },
                    { id: 'bottom-center', label: 'Bottom Center' },
                    { id: 'bottom-right', label: 'Bottom Right' }
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                        position === pos.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Format & Scope */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Number Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                  >
                    <option value="Page {n}">Page 1, Page 2 ...</option>
                    <option value="Page {n} of {total}">Page 1 of {pageCount} (Formal)</option>
                    <option value="{n}">1, 2, 3 (Minimal)</option>
                    <option value="{n} / {total}">1 / {pageCount}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Page Selection</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPageRange('all')}
                      className={`p-2 rounded-lg font-medium border text-center transition ${
                        pageRange === 'all'
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                          : 'border-slate-200 text-slate-600 bg-white'
                      }`}
                    >
                      All Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageRange('skip-cover')}
                      className={`p-2 rounded-lg font-medium border text-center transition ${
                        pageRange === 'skip-cover'
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                          : 'border-slate-200 text-slate-600 bg-white'
                      }`}
                    >
                      Skip Cover (Pg 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageRange('custom')}
                      className={`p-2 rounded-lg font-medium border text-center transition ${
                        pageRange === 'custom'
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-900'
                          : 'border-slate-200 text-slate-600 bg-white'
                      }`}
                    >
                      Custom Range
                    </button>
                  </div>
                </div>

                {pageRange === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Range (e.g. 2-5, 8)</label>
                    <input
                      type="text"
                      value={customRangeStr}
                      onChange={(e) => setCustomRangeStr(e.target.value)}
                      placeholder="e.g. 2-8"
                      className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sliders: Start number, Margin, Font Size */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Start Number</span>
                  <span>{startNumber}</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={startNumber}
                  onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Font Size</span>
                  <span>{fontSize} pt</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={16}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Margin from Edge</span>
                  <span>{margin} pt</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={50}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Applying page numbers & compiling PDF..." />}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleApply}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Add Page Numbers to PDF</span>
            </button>
          </div>
        )}

        {numberedPdfBytes && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Numbered PDF Document"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-numbered.pdf` : 'numbered.pdf'}
              subText="Successfully added page numbers across document."
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

export default AddPageNumbers;
