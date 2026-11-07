import React from 'react';

interface AdPlaceholderProps {
  slot?: string;
  format?: 'horizontal' | 'rectangle';
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  format = 'horizontal'
}) => {
  return (
    <div
      className={`w-full mx-auto my-8 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center text-xs text-slate-400 ${
        format === 'horizontal' ? 'h-24 max-w-4xl' : 'h-64 max-w-sm'
      }`}
      aria-hidden="true"
    >
      <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 mb-1">
        Advertisement
      </span>
      <span>Clean, Privacy-Safe Space for Future Sponsor Placements</span>
    </div>
  );
};
