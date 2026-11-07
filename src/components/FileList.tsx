import React from 'react';
import { FileText, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { formatFileSize } from '../utils/pdfUtils';

export interface SelectedFileItem {
  id: string;
  file: File;
  pageCount?: number;
  previewUrl?: string;
}

interface FileListProps {
  files: SelectedFileItem[];
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  allowReorder?: boolean;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  onMoveUp,
  onMoveDown,
  allowReorder = true
}) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
        <span>Selected Files ({files.length})</span>
        {allowReorder && files.length > 1 && (
          <span className="text-slate-400">Order determines output</span>
        )}
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {files.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {allowReorder && files.length > 1 && (
                <div className="text-slate-400 shrink-0 cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-slate-900 truncate" title={item.file.name}>
                  {item.file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{formatFileSize(item.file.size)}</span>
                  {typeof item.pageCount === 'number' && item.pageCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {allowReorder && onMoveUp && index > 0 && (
                <button
                  type="button"
                  onClick={() => onMoveUp(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
              {allowReorder && onMoveDown && index < files.length - 1 && (
                <button
                  type="button"
                  onClick={() => onMoveDown(index)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove File"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
