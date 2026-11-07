import React, { useState } from 'react';
import { Unlock, AlertCircle, FileText, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
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
import { unlockPDF, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const UnlockPDF: React.FC = () => {
  const tool = TOOLS_DATA['unlock-pdf'];
  const [file, setFile] = useState<File | null>(null);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedResult, setUnlockedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setUnlockedResult(null);
    setPassword('');
  };

  const handleUnlock = async () => {
    if (!file) return;

    if (!password) {
      setError('Please enter the current document password.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const output = await unlockPDF(file, password);
      setUnlockedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Incorrect password. Could not decrypt document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(unlockedResult, `${originalName}-unlocked.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPassword('');
    setUnlockedResult(null);
    setError(null);
  };

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
            <Unlock className="w-3.5 h-3.5" />
            <span>Cryptographic WebAssembly Decryption</span>
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
                <p className="font-semibold">Decryption Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!file && (
            <FileUploader
              onFilesSelected={handleFileSelected}
              title="Select locked PDF file"
              subtitle="Upload your password-protected PDF to decrypt and remove all restrictions"
            />
          )}

          {file && !unlockedResult && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • Protected document
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

              {/* Password Input Area */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="pdf-password-input" className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-600" />
                    <span>Enter Current Password:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide Password' : 'Show Password'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="pdf-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUnlock();
                    }}
                    placeholder="Enter user or owner password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Supplying the correct password allows QPDF WebAssembly to strip the cryptographic layer and remove usage restrictions locally.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Passwords are never sent across the internet</span>
                </div>

                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={isProcessing || !password}
                  className="px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-5 h-5" />
                  <span>Decrypt & Unlock PDF</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Verifying cryptographic key and decrypting PDF streams..."
            />
          )}

          {unlockedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Unlocked PDF"
              subText="Encryption and usage restrictions have been permanently removed. Opens without passwords."
              filename={`${file?.name.replace(/\.pdf$/i, '')}-unlocked.pdf`}
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
