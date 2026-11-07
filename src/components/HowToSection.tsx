import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import type { HowToStep } from '../data/toolsData';

interface HowToSectionProps {
  steps: HowToStep[];
  toolName: string;
  directAnswer?: string;
}

export const HowToSection: React.FC<HowToSectionProps> = ({
  steps,
  toolName,
  directAnswer
}) => {
  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          How to Use {toolName}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Fast, effortless step-by-step instructions. No registration or software downloads required.
        </p>
      </div>

      {directAnswer && (
        <div className="max-w-3xl mx-auto mb-10 p-5 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
            <span className="font-bold text-blue-900 block mb-1">Quick Answer:</span>
            {directAnswer}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="relative bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                {idx + 1}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">
                {step.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.text}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-semibold gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Step {idx + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
