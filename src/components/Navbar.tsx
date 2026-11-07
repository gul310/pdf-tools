import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  ChevronDown, 
  ShieldCheck, 
  Menu, 
  X,
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

export const Navbar: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              PDF<span className="text-blue-600">Tools</span>
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full">
              Local WASM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors ${
              location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tools (20)
          </Link>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 250)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span>Explore Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 max-h-[460px] overflow-y-auto grid grid-cols-1 gap-1 z-50">
                {ALL_TOOLS_LIST.map((tool) => {
                  const Icon = ICON_MAP[tool.iconName] || Files;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 hover:text-blue-600"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{tool.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{tool.shortDescription}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/merge-pdf"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Merge
          </Link>
          <Link
            to="/pdf-to-word"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            PDF to Word
          </Link>
          <Link
            to="/sign-pdf"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign PDF
          </Link>
          <Link
            to="/blog"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Blog
          </Link>
          <Link
            to="/about"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Security Badge & CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Zero Uploads • 100% Private</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            All 20 PDF Tools
          </div>
          <div className="grid grid-cols-1 gap-1">
            {ALL_TOOLS_LIST.map((tool) => {
              const Icon = ICON_MAP[tool.iconName] || Files;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm"
                >
                  <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{tool.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Contact
            </Link>
            <Link
              to="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
