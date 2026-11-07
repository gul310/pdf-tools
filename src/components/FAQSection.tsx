import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { ToolFAQ } from '../data/toolsData';

interface FAQSectionProps {
  faqs: ToolFAQ[];
  toolName: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs, toolName }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-200">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Common Questions About {toolName}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Everything you need to know about security, performance, and formatting.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-base sm:text-lg">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/70">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
