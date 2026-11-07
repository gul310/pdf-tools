import React from 'react';
import { ShieldCheck, Cpu, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getCanonicalUrl } from '../config/site';

export const About: React.FC = () => {
  return (
    <>
      <SEO
        title="About PDF Tools Pro — Privacy-First WebAssembly PDF Engineering"
        description="Learn about our mission to provide high-speed, 100% client-side PDF utilities. Powered by QPDF WebAssembly with zero server uploads and complete privacy."
        canonical={getCanonicalUrl('/about')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: 'About Us' }]} />

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Engineered for Maximum Confidentiality</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              About PDF Tools Pro
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We believe document management should never come at the expense of your privacy, security, or compliance.
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Our Core Mission
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Traditional web PDF tools rely on an outdated architecture: you upload your confidential legal contracts, financial audits, medical histories, or tax returns to a remote server. The server modifies the file, stores it in a database or temporary cloud bucket, and sends a download link back.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Even with good intentions, cloud-based architectures present unacceptable attack surfaces: server log leaks, unauthorized third-party inspection, and remote database breaches.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              <strong>PDF Tools Pro was built on a different paradigm:</strong> 100% browser-side processing. By compiling industry-standard C++ libraries (such as QPDF) and modern JavaScript engines directly to <strong>WebAssembly (WASM)</strong>, your computer does all the work locally inside your browser sandbox.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Server Data Transfer</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your PDF bytes, passwords, and rendered images never travel over the network. You can disconnect your internet and verify execution.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">WebAssembly Power</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Utilizing low-level memory compiled from verified open-source libraries for near-native CPU speeds and zero queue waiting times.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real Cryptography</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Genuine 256-bit AES encryption and decryption compliant with ISO 32000-2 standards. No simulated protections or mockups.
              </p>
            </div>
          </div>

          {/* Open Standards & Compliance */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Security & Engineering Standards
            </h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Account or Registration Required:</strong> Enjoy immediate access without handing over personal email addresses or signing into centralized accounts.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>ISO 32000-2 Compatibility:</strong> Generated documents adhere strictly to global PDF standards, ensuring full compatibility with Adobe Acrobat, Apple Preview, and mobile OS viewers.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Hardware Accelerated Rendering:</strong> PDF rendering leverages your device's GPU through HTML5 Canvas APIs for maximum visual crispness.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
