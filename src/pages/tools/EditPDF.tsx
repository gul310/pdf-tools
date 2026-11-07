import React, { useState, useRef, useEffect } from 'react';
import { Edit3, AlertCircle, Sparkles, Type, Square, Eraser, Trash2 } from 'lucide-react';
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
import { editPDF, downloadPDF, getPDFInfo, renderPDFPageToCanvas } from '../../utils/pdfUtils';
import type { PDFAnnotation } from '../../utils/extendedPdfUtils';

export const EditPDF: React.FC = () => {
  const tool = TOOLS_DATA['edit-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<'text' | 'rectangle' | 'whiteout'>('text');

  // Annotation options
  const [textInput, setTextInput] = useState<string>('Sample Text');
  const [textColor, setTextColor] = useState<string>('#0f172a');
  const [fontSize, setFontSize] = useState<number>(14);

  // List of added annotations
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [editedPdfBytes, setEditedPdfBytes] = useState<Uint8Array | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({ width: 500, height: 700 });

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setEditedPdfBytes(null);
    setAnnotations([]);
    const selected = newFiles[0];
    setFile(selected);

    try {
      const info = await getPDFInfo(selected);
      setPageCount(info.pageCount);
      setCurrentPage(1);
    } catch {
      setPageCount(1);
    }
  };

  // Render preview canvas
  useEffect(() => {
    if (!file || !previewCanvasRef.current) return;
    let isCancelled = false;

    renderPDFPageToCanvas(file, currentPage, previewCanvasRef.current, 0.85)
      .then((dims) => {
        if (!isCancelled && dims) {
          setCanvasDims({ width: dims.width, height: dims.height });
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) console.error('Error rendering page:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [file, currentPage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = 595.28 / canvasDims.width;
    const scaleY = 841.89 / canvasDims.height;

    const pdfX = clickX * scaleX;
    const pdfY = 841.89 - clickY * scaleY;

    if (activeTool === 'text') {
      if (!textInput.trim()) return;
      const newAnn: PDFAnnotation = {
        type: 'text',
        page: currentPage,
        x: pdfX,
        y: pdfY,
        text: textInput,
        fontSize: fontSize,
        color: textColor
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === 'whiteout') {
      const newAnn: PDFAnnotation = {
        type: 'whiteout',
        page: currentPage,
        x: pdfX - 60,
        y: pdfY - 12,
        width: 120,
        height: 24
      };
      setAnnotations((prev) => [...prev, newAnn]);
    } else if (activeTool === 'rectangle') {
      const newAnn: PDFAnnotation = {
        type: 'rectangle',
        page: currentPage,
        x: pdfX - 50,
        y: pdfY - 20,
        width: 100,
        height: 40,
        fillColor: '#fef08a',
        opacity: 0.4
      };
      setAnnotations((prev) => [...prev, newAnn]);
    }
  };

  const removeAnnotation = (index: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (annotations.length === 0) {
      setError('Please add at least one annotation or text block onto the document.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      setProgress(50);
      const output = await editPDF(file, annotations);
      setEditedPdfBytes(output);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to apply edits to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(editedPdfBytes, `${baseName}-edited.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setEditedPdfBytes(null);
    setAnnotations([]);
    setError(null);
  };

  const currentAnnotations = annotations.filter((a) => a.page === currentPage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-2xl mb-4">
          <Edit3 className="w-8 h-8 text-violet-600" />
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
            title="Choose a PDF file to edit"
            subtitle="Add text overlays, highlight callouts, and visual cover blocks."
          />
        )}

        {file && !editedPdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
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

            {/* Tool Toolbar */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool('text')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTool === 'text'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Add Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('whiteout')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTool === 'whiteout'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                  <span>Cover Content (Visual Only)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('rectangle')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTool === 'rectangle'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Square className="w-4 h-4" />
                  <span>Highlight Box</span>
                </button>
              </div>

              {/* Page Selector */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Tool Specific Config Bar */}
            {activeTool === 'text' && (
              <div className="p-3 bg-violet-50/60 border border-violet-200/60 rounded-2xl flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="font-bold text-slate-700 shrink-0">Text:</span>
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type text to place..."
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Size:</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg"
                  >
                    {[10, 12, 14, 16, 18, 20, 24, 28, 32].map((s) => (
                      <option key={s} value={s}>
                        {s} pt
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-violet-700 italic">Click on the page below to place text.</span>
              </div>
            )}

            {/* Interactive Document Overlay */}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Click anywhere on the preview to place the active element.</span>
                <span>{currentAnnotations.length} annotations on Page {currentPage}</span>
              </div>

              <div
                onClick={handleCanvasClick}
                className="relative border border-slate-300 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-4 cursor-crosshair select-none"
              >
                <div className="relative shadow-md rounded-lg overflow-hidden bg-white">
                  <canvas ref={previewCanvasRef} className="block max-w-full h-auto" />

                  {/* Render Visual Overlays for current page */}
                  {currentAnnotations.map((ann, idx) => {
                    const pxX = (ann.x / 595.28) * canvasDims.width;
                    const pxY = ((841.89 - ann.y) / 841.89) * canvasDims.height;

                    if (ann.type === 'text') {
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${pxX}px`,
                            top: `${pxY - 14}px`,
                            color: ann.color,
                            fontSize: `${(ann.fontSize || 14) * 0.9}px`
                          }}
                          className="font-sans font-medium whitespace-nowrap bg-white/70 px-1 rounded shadow-xs"
                        >
                          {ann.text}
                        </div>
                      );
                    } else if (ann.type === 'whiteout') {
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${pxX}px`,
                            top: `${pxY}px`,
                            width: `${((ann.width || 120) / 595.28) * canvasDims.width}px`,
                            height: `${((ann.height || 24) / 841.89) * canvasDims.height}px`
                          }}
                          className="bg-white border border-slate-300/60 shadow-xs"
                        />
                      );
                    } else if (ann.type === 'rectangle') {
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'absolute',
                            left: `${pxX}px`,
                            top: `${pxY}px`,
                            width: `${((ann.width || 100) / 595.28) * canvasDims.width}px`,
                            height: `${((ann.height || 40) / 841.89) * canvasDims.height}px`
                          }}
                          className="bg-yellow-300/40 border border-yellow-400 rounded-xs"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>

            {/* Annotation List */}
            {annotations.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700">Added Elements ({annotations.length})</span>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-200 text-xs">
                  {annotations.map((ann, i) => (
                    <div key={i} className="py-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">
                          {ann.type === 'whiteout' ? 'Cover Block' : ann.type}
                        </span>
                        <span className="text-slate-600">Page {ann.page}</span>
                        {ann.text && <span className="text-slate-900 truncate max-w-[200px]">"{ann.text}"</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnnotation(i);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Architecture & Security Warning Note */}
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                <span className="font-bold">Important Security Notice:</span> Covering text with white blocks only obscures content visually. The original underlying text, images, and data streams remain present in the PDF file and can still be selected, searched, or extracted by standard PDF tools. <span className="font-semibold underline">Do not use this feature for confidential, legal, or privacy redaction.</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Embedding elements & generating PDF..." />}

            <button
              type="button"
              disabled={isProcessing || annotations.length === 0}
              onClick={handleSave}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Save & Download PDF</span>
            </button>
          </div>
        )}

        {editedPdfBytes && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Edited PDF Document"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-edited.pdf` : 'edited.pdf'}
              subText={`Successfully embedded ${annotations.length} elements into document.`}
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

export default EditPDF;
