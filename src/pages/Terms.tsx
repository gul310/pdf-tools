import React from 'react';
import { FileCheck } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

export const Terms: React.FC = () => {
  return (
    <>
      <SEO
        title="Terms of Service — PDF1998"
        description="Review the terms, conditions, and acceptable use guidelines governing the use of PDF1998 client-side utilities."
        canonical={getCanonicalUrl('/terms')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <div className="space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <FileCheck className="w-4 h-4 text-slate-600" />
              <span>Last Revised: January 1, 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Please read these Terms of Service carefully before utilizing the PDF1998 web application.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing, browsing, or using {SITE_CONFIG.name} ("the Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you disagree with any part of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                2. Nature of the Software
              </h2>
              <p>
                {SITE_CONFIG.name} provides browser-based, client-side document utilities. All transformations execute via client-side JavaScript, WebAssembly, and HTML5 APIs. The Service is provided free of charge without mandatory subscriptions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                3. User Responsibilities & Acceptable Use
              </h2>
              <p>
                You represent and warrant that you own or possess the legitimate rights, licenses, or permissions to manipulate, encrypt, split, or unlock any files you process through the Service.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                <li>You agree not to attempt to reverse engineer, disrupt, or tamper with the underlying static web assets.</li>
                <li>You agree not to use the Service for any unlawful, infringing, or malicious activities.</li>
                <li>You agree that the "Unlock PDF" tool may only be used on documents where you are authorized to access and decrypt the content.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                4. Intellectual Property
              </h2>
              <p>
                Your files remain 100% your exclusive property. {SITE_CONFIG.name} claims no ownership, copyright, or intellectual property rights over any file or data you process through our tools.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                5. Disclaimer of Warranties
              </h2>
              <p className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                <strong>DISCLAIMER:</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                6. Contact Information
              </h2>
              <p>
                Questions regarding these Terms of Service should be directed to{' '}
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
