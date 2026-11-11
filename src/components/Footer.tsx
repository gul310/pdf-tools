import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Cpu, Lock } from 'lucide-react';
import { ALL_TOOLS_LIST } from '../data/toolsData';

export const Footer: React.FC = () => {
  const col1Tools = ALL_TOOLS_LIST.slice(0, 10);
  const col2Tools = ALL_TOOLS_LIST.slice(10, 20);

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900">
                PDF<span className="text-blue-600">1998</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-xs sm:text-sm">
              The premier client-side PDF utility suite. Powered by WebAssembly and local JavaScript, all PDF transformations occur strictly inside your device memory. Zero server uploads, zero logs, complete privacy guaranteed.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <Shield className="w-4 h-4" /> 100% Client-Side Privacy
              </span>
              <span className="flex items-center gap-1.5 font-medium text-blue-600">
                <Cpu className="w-4 h-4" /> QPDF WebAssembly Engine
              </span>
              <span className="flex items-center gap-1.5 font-medium text-indigo-600">
                <Lock className="w-4 h-4" /> Real 256-Bit AES Encryption
              </span>
            </div>
          </div>

          {/* Tools Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Core PDF Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {col1Tools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="hover:text-blue-600 transition-colors block text-slate-600"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools Column 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Convert & Edit Tools
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {col2Tools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="hover:text-blue-600 transition-colors block text-slate-600"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal, Institutional & AdSense Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="/llms.txt" className="hover:text-blue-600 transition-colors block text-slate-600 font-medium">
                  AI Context (llms.txt)
                </a>
              </li>
              <li>
                <a href="mailto:support@pdf1998.com" className="hover:text-blue-600 transition-colors block text-blue-600 font-medium">
                  support@pdf1998.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 PDF1998. All rights reserved. 100% private in-browser document processing.</p>
          <p className="text-slate-400">
            Powered by WebAssembly, PDF-Lib & QPDF. Files are never stored or uploaded.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
