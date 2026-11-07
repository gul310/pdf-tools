import React from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface DownloadButtonProps {
  onDownload: () => void;
  onReset: () => void;
  buttonText?: string;
  subText?: string;
  filename?: string;
  isZip?: boolean;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  onDownload,
  onReset,
  buttonText = 'Download Processed PDF',
  subText,
  filename,
  isZip = false
}) => {
  return (
    <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-5">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-1">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
          Ready to Download!
        </h3>
        {filename && (
          <p className="text-sm font-medium text-slate-600 truncate max-w-md mx-auto">
            {filename}
          </p>
        )}
        {subText && (
          <p className="text-xs sm:text-sm text-emerald-700 font-semibold mt-1">
            {subText}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onDownload}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-base transition-all cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{isZip ? 'Download ZIP Package' : buttonText}</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Process Another File</span>
        </button>
      </div>
    </div>
  );
};
