import React, { useState } from 'react';
import { Lock, AlertCircle, FileText, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';
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
import { protectPDF, getPDFInfo, downloadPDF, formatFileSize } from '../../utils/pdfUtils';

export const ProtectPDF: React.FC = () => {
  const tool = TOOLS_DATA['protect-pdf'];
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);

  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protectedResult, setProtectedResult] = useState<Uint8Array | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setError(null);
    setProtectedResult(null);

    try {
      const info = await getPDFInfo(selected);
      if (info.isEncrypted) {
        setError('This PDF is already encrypted with a password.');
        return;
      }
      setPageCount(info.pageCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to inspect PDF document.');
    }
  };

  const handleProtect = async () => {
    if (!file) return;

    if (!userPassword || userPassword.length === 0) {
      setError('Please enter a user password to lock the PDF.');
      return;
    }

    if (userPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const output = await protectPDF(
        file,
        userPassword,
        ownerPassword || undefined,
        {
          print: allowPrinting ? 'full' : 'none',
          extract: allowCopying,
          modify: 'none'
        }
      );
      setProtectedResult(output);
    } catch (err: any) {
      setError(err?.message || 'Failed to encrypt the PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!protectedResult || !file) return;
    const originalName = file.name.replace(/\.pdf$/i, '');
    downloadPDF(protectedResult, `${originalName}-protected.pdf`);
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setUserPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    setProtectedResult(null);
    setError(null);
  };

  return (
    <>
      <SEO tool={tool} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: tool.name }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Industry-Standard AES-256 In-Browser Encryption</span>
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
                <p className="font-semibold">Security Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!file && (
            <FileUploader
              onFilesSelected={handleFileSelected}
              title="Select PDF file to protect"
              subtitle="Apply real 256-bit AES encryption right in your browser"
            />
          )}

          {file && !protectedResult && (
            <div className="space-y-8">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • {pageCount} pages
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

              {/* Password Inputs */}
              <div className="space-y-5 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-violet-600" />
                    <span>Set Document Open Password:</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="user-password-input" className="block text-xs font-semibold text-slate-600">
                      Enter Password *
                    </label>
                    <input
                      id="user-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter strong password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm-password-input" className="block text-xs font-semibold text-slate-600">
                      Confirm Password *
                    </label>
                    <input
                      id="confirm-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 font-mono ${
                        confirmPassword && confirmPassword !== userPassword
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-violet-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Advanced Owner Password & Permissions Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800"
                  >
                    {showAdvanced ? '− Hide Advanced Security Options' : '+ Show Advanced Permissions (Owner Password)'}
                  </button>

                  {showAdvanced && (
                    <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="owner-password-input" className="block text-xs font-semibold text-slate-600">
                          Owner Password (Optional — grants permission to decrypt/change settings)
                        </label>
                        <input
                          id="owner-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={ownerPassword}
                          onChange={(e) => setOwnerPassword(e.target.value)}
                          placeholder="Separate owner master password"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                          Usage Restrictions for User-Password Holders:
                        </span>
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allowPrinting}
                              onChange={(e) => setAllowPrinting(e.target.checked)}
                              className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                            />
                            <span>Allow Document Printing</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allowCopying}
                              onChange={(e) => setAllowCopying(e.target.checked)}
                              className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                            />
                            <span>Allow Text & Graphic Copying</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Passwords and files never touch any external server</span>
                </div>

                <button
                  type="button"
                  onClick={handleProtect}
                  disabled={isProcessing || !userPassword || userPassword !== confirmPassword}
                  className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                  <span>Protect & Encrypt PDF</span>
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <ProgressBar
              statusText="Applying real 256-bit AES encryption via QPDF WebAssembly..."
            />
          )}

          {protectedResult && (
            <DownloadButton
              onDownload={handleDownload}
              onReset={handleReset}
              buttonText="Download Encrypted PDF"
              subText="Document is secured with real 256-bit AES encryption. Standard PDF viewers will strictly require your password."
              filename={`${file?.name.replace(/\.pdf$/i, '')}-protected.pdf`}
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
