import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Zap,
  Lock,
  Cpu,
  Files,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Unlock,
  Stamp,
  FileText,
  FileType,
  Sheet,
  FileSpreadsheet,
  Presentation,
  FileSliders,
  PenTool,
  Edit3,
  Hash,
  Crop
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { ALL_TOOLS_LIST } from '../data/toolsData';

const ICON_MAP: Record<string, React.ElementType> = {
  Files,
  Scissors,
  Minimize2,
  Image,
  FileImage,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Stamp,
  FileText,
  FileType,
  Sheet,
  FileSpreadsheet,
  Presentation,
  FileSliders,
  PenTool,
  Edit3,
  Hash,
  Crop
};

type CategoryFilter = 'all' | 'organize' | 'convert-from' | 'convert-to' | 'security-edit';

export const Home: React.FC = () => {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filteredTools = ALL_TOOLS_LIST.filter((tool) => {
    if (filter === 'all') return true;
    if (filter === 'organize') {
      return ['merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pdf-pages', 'crop-pdf', 'add-page-numbers'].includes(tool.id);
    }
    if (filter === 'convert-from') {
      return ['pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-image'].includes(tool.id);
    }
    if (filter === 'convert-to') {
      return ['word-to-pdf', 'excel-to-pdf', 'ppt-to-pdf', 'image-to-pdf'].includes(tool.id);
    }
    if (filter === 'security-edit') {
      return ['protect-pdf', 'unlock-pdf', 'add-watermark-pdf', 'sign-pdf', 'edit-pdf', 'compress-pdf'].includes(tool.id);
    }
    return true;
  });

  return (
    <>
      <SEO
        title="PDF1998 — 100% Free & Private Online PDF Suite (Client-Side)"
        description="The ultimate free in-browser PDF suite. 20 client-side tools: merge, split, compress, convert to Word/Excel/PPT, sign, edit, protect with AES-256, and more. Zero server uploads."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>20 Complete In-Browser Tools • WebAssembly Powered</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Every PDF Tool You Need. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Zero Server Uploads.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Convert, sign, edit, encrypt, and manipulate your sensitive PDF documents directly in your web browser. Your confidential files never leave your device memory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#tools-grid"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              Explore All 20 Tools
            </a>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Server Uploads • In-Browser Processing</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <section aria-labelledby="features-heading" className="mt-16 max-w-4xl mx-auto">
          <h2 id="features-heading" className="sr-only">Key Security and Performance Advantages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Total Data Privacy</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Zero files uploaded or saved to remote servers. All processing runs locally in browser memory.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Blazing Fast Speed</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Zero upload/download waiting times. Uses your computer's native processor.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">QPDF WebAssembly</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Industry-grade C++ PDF engine compiled to WASM for bulletproof reliability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <div id="tools-grid" className="mt-20 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select a PDF Tool
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              All 20 tools are 100% free with no page limits, watermarks, or user registrations.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: 'all', label: 'All Tools (20)' },
              { id: 'organize', label: 'Organize & Manage' },
              { id: 'convert-from', label: 'Convert from PDF' },
              { id: 'convert-to', label: 'Convert to PDF' },
              { id: 'security-edit', label: 'Security & Edit' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as CategoryFilter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => {
              const Icon = ICON_MAP[tool.iconName] || Files;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className="group relative bg-white border border-slate-200/90 hover:border-blue-400 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      {tool.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {tool.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {tool.shortDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Open Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Why Client Side Section */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              Privacy By Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Why We Never Upload Your PDFs to Any Server
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Standard web-based PDF converters upload your contracts, financial reports, tax returns, and presentations to remote third-party cloud servers where they can be retained, inspected, or leaked in server breaches.
            </p>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We engineered PDF Tools with modern WebAssembly and client-side processing. Every conversion, extraction, signature, crop, annotation, and 256-bit AES encryption operation happens 100% inside your local web browser tab memory. You can even disconnect your Wi-Fi after loading the page and all 20 tools continue functioning smoothly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
