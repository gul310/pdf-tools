import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress?: number;
  statusText?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  statusText = 'Processing your document locally...'
}) => {
  const isIndeterminate = progress === undefined || progress < 0;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span>{statusText}</span>
        </div>
        {!isIndeterminate && (
          <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
        )}
      </div>

      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
        {isIndeterminate ? (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 w-1/3 animate-[shimmer_1.5s_infinite] rounded-full" />
        ) : (
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Running 100% in browser memory via WebAssembly • Zero server data transfer
      </p>
    </div>
  );
};
