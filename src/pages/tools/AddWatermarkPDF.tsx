import React, { useState } from 'react';
import { Stamp, AlertCircle, FileText } from 'lucide-react';
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
import { addWatermarkPDF, getPDFInfo, renderPDFThumbnail, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const AddWatermarkPDF: React.FC = () => {
  const tool = TOOLS_DATA['add-watermark'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [firstPageThumb, setFirstPageThumb] = useState<string | null>(null);

  // Watermark parameters
  const [text, setText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState<number>(48);
  const [color, setColor] = useState<string>('#dc2626'); // Red by default
  const [opacity, setOpacity] = useState<number>(0.3);
  const [rotation, setRotation] = useState<number>(-45);
  const [position, setPosition] = useState<'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('diagonal');
  const [pageScope, setPageScope] = useState<'all' | 'first' | 'custom'>('all');
  const [customPagesInput, setCustomPagesInput] = useState('1');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watermarkedResult, setWatermarkedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setWatermarkedResult(null);

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is encrypted with a password. Please unlock it using Unlock PDF first.');
        return;
      }
      setPageCount(info.pageCount);
      const thumb = await renderPDFThumbnail(selected, 1, 240);
      setFirstPageThumb(thumb);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect PDF document.');
    }
  };

  const handleApply = async () => {
    if (!file) return;
    if (!text.trim()) {
      setError('Please provide watermark text.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const customPages = pageScope === 'custom'
        ? customPagesInput.split(',').map((p) => parseInt(p.trim(), 10)).filter((n) => !isNaN(n))
        : undefined;

      const output = await addWatermarkPDF(file, {
        text: text.trim(),
        fontSize,
        color,
        opacity,
        rotation,
        position,
        pages: pageScope,
        customPages
      });
      setWatermarkedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Failed to apply watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(watermarkedResult, `${originalName}-watermarked.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setFirstPageThumb(null);
    setWatermarkedResult(null);
    setError(null);
  };

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
            <Stamp className="w-3.5 h-3.5" />
            <span>High-Precision Vector Stamping</span>
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
              subtitle="Stamp custom text, copyright notices, or confidentiality marks on your pages"
            />
          )}

          {file && !watermarkedResult && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
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

              {/* Watermark Editor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Controls */}
                <div className="space-y-5">
                  {/* Text Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="watermark-text-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Watermark Text *
                    </label>
                    <input
                      id="watermark-text-input"
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY', 'INTERNAL USE'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setText(preset)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-600 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position & Angle */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Placement
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="diagonal">Diagonal Across Page</option>
                        <option value="center">Centered</option>
                        <option value="top-left">Top-Left Header</option>
                        <option value="top-right">Top-Right Header</option>
                        <option value="bottom-left">Bottom-Left Footer</option>
                        <option value="bottom-right">Bottom-Right Footer</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Rotation Angle
                      </label>
                      <select
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value={-45}>-45° Diagonal</option>
                        <option value={0}>0° Horizontal</option>
                        <option value={45}>+45° Diagonal</option>
                        <option value={-90}>-90° Vertical</option>
                      </select>
                    </div>
                  </div>

                  {/* Size and Opacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                        <span>Font Size</span>
                        <span>{fontSize}pt</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        step="4"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                        className="w-full accent-purple-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                        <span>Opacity</span>
                        <span>{Math.round(opacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                  </div>

                  {/* Color & Scope */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Stamp Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <div className="flex gap-1.5">
                          {['#dc2626', '#475569', '#2563eb', '#16a34a'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setColor(c)}
                              style={{ backgroundColor: c }}
                              className="w-6 h-6 rounded-full border border-white shadow-xs"
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Apply To
                      </label>
                      <select
                        value={pageScope}
                        onChange={(e) => setPageScope(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Pages ({pageCount})</option>
                        <option value="first">First Page Only</option>
                        <option value="custom">Custom Page List</option>
                      </select>
                    </div>
                  </div>

                  {pageScope === 'custom' && (
                    <div className="space-y-1.5">
                      <label htmlFor="custom-pages-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Target Page Numbers (comma separated)
                      </label>
                      <input
                        id="custom-pages-input"
                        type="text"
                        value={customPagesInput}
                        onChange={(e) => setCustomPagesInput(e.target.value)}
                        placeholder="e.g. 1, 3, 5"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Live Preview Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Live Page Preview</span>
                    <span>Page 1 Simulation</span>
                  </div>

                  <div className="w-full max-w-[240px] aspect-[3/4] bg-white border border-slate-300 rounded-xl shadow-xs overflow-hidden relative flex items-center justify-center">
                    {firstPageThumb ? (
                      <img
                        src={firstPageThumb}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-slate-300 text-xs text-center p-4">
                        Page 1 Content
                      </div>
                    )}

                    {/* Watermark Overlay in preview */}
                    {text && (
                      <div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                      >
                        <div
                          style={{
                            color: color,
                            opacity: opacity,
                            transform: `rotate(${rotation}deg)`,
                            fontSize: `${Math.max(12, Math.round(fontSize * 0.45))}px`,
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            userSelect: 'none'
                          }}
                        >
                          {text}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-3 text-center">
                    Vector typography is stamped directly into PDF page content streams.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isProcessing || !text.trim()}
                  className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Stamp className="w-5 h-5" />
                  <span>Apply Watermark & Download</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Stamping vector watermark onto PDF pages..."
            />
          )}

          {watermarkedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Watermarked PDF"
              subText={`Watermark "${text}" successfully applied across your document.`}
              filename={`${file?.name.replace(/\.pdf$/i, '')}-watermarked.pdf`}
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
