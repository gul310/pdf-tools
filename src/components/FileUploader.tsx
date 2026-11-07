import React, { useRef, useState } from 'react';
import { UploadCloud, ShieldCheck, AlertCircle, FileText, Plus } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = false,
  maxSizeMB = 100,
  title = 'Select PDF files',
  subtitle = 'or drag and drop files directly here',
  compact = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incomingFiles: FileList | null) => {
    setErrorMessage(null);
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validFiles: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];

      if (file.size === 0) {
        setErrorMessage(`"${file.name}" is empty (0 bytes).`);
        continue;
      }

      if (file.size > maxBytes) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMB}MB in-browser limit.`);
        continue;
      }

      validFiles.push(file);
      if (!multiple) break;
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99] shadow-inner'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60 shadow-sm'
        } ${compact ? 'p-6' : 'p-10 md:p-14'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload-input"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            {compact ? <Plus className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 text-sm transition-all pointer-events-none"
          >
            Choose {multiple ? 'Files' : 'File'}
          </button>
        </div>

        {/* Security & In-Browser Guarantee */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side • Files Never Leave Your Device</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Max file size: {maxSizeMB}MB</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
