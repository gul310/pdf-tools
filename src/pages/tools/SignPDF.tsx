import React, { useState, useRef, useEffect } from 'react';
import { PenTool, AlertCircle, Info, Sparkles, RotateCcw, Upload, Move } from 'lucide-react';
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
import { signPDF, downloadPDF, getPDFInfo, renderPDFPageToCanvas } from '../../utils/pdfUtils';

export const SignPDF: React.FC = () => {
  const tool = TOOLS_DATA['sign-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signaturePngUrl, setSignaturePngUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [signedPdfBytes, setSignedPdfBytes] = useState<Uint8Array | null>(null);

  // Signature placement state (percentages)
  const [sigXPercent, setSigXPercent] = useState<number>(50);
  const [sigYPercent, setSigYPercent] = useState<number>(80);
  const [sigWidth, setSigWidth] = useState<number>(140);
  const [sigHeight, setSigHeight] = useState<number>(55);

  // Canvas drawing ref
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Page preview canvas ref
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setError(null);
    setSignedPdfBytes(null);
    const selected = newFiles[0];
    setFile(selected);

    try {
      const info = await getPDFInfo(selected);
      setPageCount(info.pageCount);
      setSelectedPage(1);
    } catch {
      setPageCount(1);
    }
  };

  // Render PDF page preview
  useEffect(() => {
    if (!file || !previewCanvasRef.current) return;
    let isCancelled = false;

    renderPDFPageToCanvas(file, selectedPage, previewCanvasRef.current, 0.75)
      .catch((err: unknown) => {
        if (!isCancelled) console.error('Error rendering preview:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [file, selectedPage]);

  // Setup drawing canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
  }, [signatureMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = drawCanvasRef.current;
    if (canvas) {
      setSignaturePngUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignaturePngUrl(null);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSignaturePngUrl(event.target.result);
      }
    };
    reader.readAsDataURL(uploaded);
  };

  const handleApplySignature = async () => {
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (!signaturePngUrl) {
      setError('Please draw or upload a signature before applying.');
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setError(null);

    try {
      const res = await fetch(signaturePngUrl);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const pngBytes = new Uint8Array(arrayBuffer);

      const estimatedPageWidth = 595.28;
      const estimatedPageHeight = 841.89;

      const pdfX = (sigXPercent / 100) * estimatedPageWidth - sigWidth / 2;
      const pdfY = estimatedPageHeight - (sigYPercent / 100) * estimatedPageHeight - sigHeight / 2;

      setProgress(60);
      const signed = await signPDF(file, pngBytes, selectedPage, {
        x: Math.max(10, Math.min(estimatedPageWidth - sigWidth - 10, pdfX)),
        y: Math.max(10, Math.min(estimatedPageHeight - sigHeight - 10, pdfY)),
        width: sigWidth,
        height: sigHeight
      });

      setSignedPdfBytes(signed);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to apply signature to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!signedPdfBytes || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(signedPdfBytes, `${baseName}-signed.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setSignedPdfBytes(null);
    setSignaturePngUrl(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO tool={tool} />
      <Breadcrumbs items={[{ label: 'Tools', path: '/' }, { label: tool.name }]} />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
          <PenTool className="w-8 h-8 text-indigo-600" />
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
            title="Choose a PDF file to sign"
            subtitle="Upload any contract, invoice, or agreement. 100% private in-browser signature."
          />
        )}

        {file && !signedPdfBytes && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
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

            {/* Signature Creation Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Column: Signature Creator */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-sm text-slate-800">1. Create Signature</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        signatureMode === 'draw'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Draw
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('upload')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                        signatureMode === 'upload'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Upload Image
                    </button>
                  </div>
                </div>

                {signatureMode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-2 relative">
                      <canvas
                        ref={drawCanvasRef}
                        width={380}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-40 bg-white rounded-xl touch-none cursor-crosshair shadow-sm border border-slate-200"
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                          Sign with your mouse or fingertip here
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 font-medium"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear Signature</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 text-center space-y-3">
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Upload signature file (PNG, JPG)</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Transparent PNG recommended</p>
                    </div>
                    <label className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700 transition">
                      Browse Image
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Page Selection and Positioning Controls */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Target Page</label>
                    <select
                      value={selectedPage}
                      onChange={(e) => setSelectedPage(Number(e.target.value))}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
                    >
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map((pg) => (
                        <option key={pg} value={pg}>
                          Page {pg} of {pageCount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Vertical Position</span>
                      <span>{sigYPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={sigYPercent}
                      onChange={(e) => setSigYPercent(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Horizontal Position</span>
                      <span>{sigXPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={sigXPercent}
                      onChange={(e) => setSigXPercent(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Signature Stamp Size</span>
                      <span>{sigWidth} pt</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={220}
                      value={sigWidth}
                      onChange={(e) => {
                        const w = Number(e.target.value);
                        setSigWidth(w);
                        setSigHeight(Math.round(w * 0.4));
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Document Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-sm text-slate-800">2. Placement Preview</span>
                  <span className="text-xs text-slate-500">Page {selectedPage}</span>
                </div>

                <div className="relative border border-slate-300 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center p-2 min-h-[380px]">
                  <canvas ref={previewCanvasRef} className="shadow-md rounded-lg max-w-full h-auto bg-white" />

                  {/* Stamp Placement Box Overlay */}
                  {signaturePngUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${sigYPercent}%`,
                        left: `${sigXPercent}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${(sigWidth / 595) * 100 * 1.5}%`,
                        maxWidth: '180px'
                      }}
                      className="border-2 border-indigo-500 bg-indigo-50/40 rounded p-1 shadow-md pointer-events-none"
                    >
                      <img src={signaturePngUrl} alt="Signature stamp" className="w-full h-auto" />
                      <div className="text-[9px] text-indigo-700 font-bold text-center mt-0.5 flex items-center justify-center gap-0.5">
                        <Move className="w-2.5 h-2.5" /> Signature Stamp
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Signature & Technical Distinction Notice */}
            <div className="p-4 bg-indigo-50/80 border border-indigo-200/60 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                <span className="font-bold">Visual Electronic Signature Notice:</span> This tool stamps a visual electronic signature (drawn or uploaded image mark) onto the document. It is <span className="font-semibold underline">not</span> a certificate-based cryptographic digital signature (PKI/X.509) and does not provide an eIDAS Qualified Electronic Signature (QES) or cryptographic tamper-evident seal. Legal acceptance varies by jurisdiction and document type.
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isProcessing && <ProgressBar progress={progress} statusText="Embedding signature & saving PDF..." />}

            <button
              type="button"
              disabled={isProcessing || !signaturePngUrl}
              onClick={handleApplySignature}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Sign & Download PDF</span>
            </button>
          </div>
        )}

        {signedPdfBytes && (
          <div className="py-2">
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Signed PDF Document"
              filename={file ? `${file.name.replace(/\.pdf$/i, '')}-signed.pdf` : 'signed.pdf'}
              subText={`Successfully applied signature to Page ${selectedPage} of document.`}
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

export default SignPDF;
