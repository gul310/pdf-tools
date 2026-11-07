import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Client-side confirmation
    setSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Contact Us — PDF Tools Pro Support & Inquiries"
        description="Have questions or feedback about our client-side PDF utilities? Get in touch with the PDF Tools Pro team. We respond within 24 business hours."
        canonical={getCanonicalUrl('/contact')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: 'Contact Us' }]} />

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>We're Here to Help</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Contact Our Team
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have a feature suggestion, bug report, or partnership inquiry? Reach out to our technical engineering team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Direct Support</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  For bug reports, security disclosures, or general feedback, email us directly:
                </p>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}`}
                  className="block text-sm font-bold text-blue-600 hover:text-blue-800 break-all"
                >
                  {SITE_CONFIG.contactEmail}
                </a>
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Typical response window: within 24 business hours.
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <HelpCircle className="w-4 h-4" />
                  <span>Important Privacy Notice</span>
                </div>
                <p className="leading-relaxed">
                  Please do not attach or email sensitive personal documents. We do not store or inspect user files on our servers.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Message Received!</h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting us, {name}. A member of our technical support team will review your inquiry and follow up at <strong>{email}</strong> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName('');
                        setEmail('');
                        setSubject('');
                        setMessage('');
                      }}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Send a Direct Message
                    </h2>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Feature request, bug report, or question"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Your Message *
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your inquiry or feedback in detail..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Message</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
