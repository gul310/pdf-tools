import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

export const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <SEO
        title="Privacy Policy — PDF Tools Pro Client-Side Architecture"
        description="Read the complete Privacy Policy of PDF Tools Pro. Discover how our client-side WebAssembly architecture ensures zero PDF files are ever uploaded or retained."
        canonical={getCanonicalUrl('/privacy-policy')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <div className="space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Effective Date: January 1, 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              At {SITE_CONFIG.name}, we believe data privacy is a fundamental human right. This Privacy Policy explains our unique client-side architecture and how we treat user data.
            </p>
          </div>

          {/* Core Principle Banner */}
          <div className="p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>Core Principle: 100% Client-Side Processing</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              We never upload, transmit, read, inspect, store, or sell your PDF documents, images, or document passwords. All file operations (including merging, splitting, compressing, rotating, page deletion, watermarking, and 256-bit AES encryption) execute exclusively within the volatile memory (RAM) of your web browser via WebAssembly.
            </p>
          </div>

          {/* Detailed Sections */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Information We Do NOT Collect
              </h2>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Document Contents:</strong> We do not receive, process, or store the contents, metadata, text, or graphics of files you manipulate on this website.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Passphrases & Cryptographic Keys:</strong> Passwords entered for document encryption or decryption remain strictly in client-side memory and are instantly cleared upon page refresh.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Personal Identity Files:</strong> Financial statements, government IDs, medical forms, and contracts processed through our tools never leave your device.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Information We May Collect Automatically
              </h2>
              <p>
                Like most modern websites, standard non-identifying server log data may be generated when your browser requests static assets (HTML, CSS, JS, WASM binaries). This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Referring URL and requested page paths</li>
                <li>Date and time stamps for server health monitoring</li>
              </ul>
              <p>
                This telemetry is aggregated and cannot be linked to any individual user or document.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. Cookies and Third-Party Advertising
              </h2>
              <p>
                We may partner with third-party advertising platforms, such as Google AdSense, to serve non-intrusive advertisements when you visit our website. These platforms may use cookies, web beacons, or device identifiers to serve ads based on your prior visits to this or other websites on the internet.
              </p>
              <p>
                Google’s use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">Google Ads Settings</a> or through <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">www.aboutads.info</a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Data Protection Rights & Regulatory Compliance
              </h2>
              <p>
                Because our architecture eliminates cloud data ingestion, we do not maintain databases of personal data. Users under GDPR and CCPA enjoy:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                <li>The right to know what personal information is collected (none with respect to document contents).</li>
                <li>The right to total data portability by keeping files on your own device.</li>
                <li>Zero retention: all temporary object buffers in memory are automatically cleared upon tab closure.</li>
              </ul>
              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                <strong>Compliance Clarification:</strong> While client-side execution means files never traverse or get stored on our servers, this technical architecture does not by itself constitute an official Business Associate Agreement (BAA) under HIPAA, nor does it replace an organization's internal data controller governance obligations under GDPR or other local privacy statutes.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. Contacting the Data Protection Officer
              </h2>
              <p>
                If you have questions, disclosures, or technical inquiries regarding our privacy posture, please email our security team at{' '}
                <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-blue-600 font-bold underline">
                  {SITE_CONFIG.contactEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
