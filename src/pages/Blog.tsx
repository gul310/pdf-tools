import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Cpu, Lock, Calendar, Clock } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getCanonicalUrl } from '../config/site';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  icon: React.ElementType;
  sections: {
    heading: string;
    content: string;
  }[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'client-side-pdf-security',
    title: 'Why In-Browser WebAssembly is the Future of Document Privacy',
    summary: 'Cloud PDF converters expose confidential legal, medical, and financial documents to server breaches. Discover how WebAssembly processes PDFs in local memory with zero data egress.',
    category: 'Security & Architecture',
    date: 'February 15, 2026',
    readTime: '5 min read',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'The Unseen Threat of Server-Side Converters',
        content: 'When you upload a sensitive PDF to a traditional cloud converter, your file travels over public networks to a remote server. Even with HTTPS in transit, your unencrypted data resides temporarily in server memory, file caches, or database queues. Server misconfigurations, rogue insiders, or subpoena requests can compromise your confidential records.'
      },
      {
        heading: 'How WebAssembly Changes the Paradigm',
        content: 'WebAssembly (WASM) enables compiled languages like C and C++ to execute inside the browser sandbox at near-native CPU speeds. By compiling robust engines like QPDF to WebAssembly, your browser executes the exact same algorithms locally. The bytes representing your document never leave your computer RAM, giving you mathematically verified privacy.'
      }
    ]
  },
  {
    id: 'understanding-pdf-aes-encryption',
    title: 'Understanding Real AES-256 PDF Encryption vs Simulated Protection',
    summary: 'Not all PDF protection tools are equal. Learn the difference between browser-based password prompts and true ISO 32000-2 256-bit AES cryptographic encryption.',
    category: 'Cryptography',
    date: 'January 28, 2026',
    readTime: '6 min read',
    icon: Lock,
    sections: [
      {
        heading: 'The Trap of Superficial Restrictions',
        content: 'Some online tools claim to "protect" PDFs by simply adding a viewer flag or saving an encrypted wrapper with static hardcoded keys. In reality, any open-source parser can ignore viewer restrictions unless genuine cryptographic algorithms scramble the underlying byte stream.'
      },
      {
        heading: 'Standard-Compliant AES-256 Implementation',
        content: 'True AES-256 encryption uses PBKDF2 or SHA-256 key derivation from user and owner passphrases. It encrypts every indirect object stream, cross-reference table, and metadata dictionary. When opened in compliant viewers like Adobe Acrobat or Apple Preview, the file cannot be rendered without computing the exact key.'
      }
    ]
  },
  {
    id: 'lossless-pdf-compression-explained',
    title: 'How to Shrink PDF File Size Without Destroying Text or Image Clarity',
    summary: 'Stop blurry scans and degraded fonts. Discover how object stream packing, redundant dictionary deduplication, and Flate compression reduce file size while keeping text razor-sharp.',
    category: 'Optimization Guide',
    date: 'January 10, 2026',
    readTime: '4 min read',
    icon: Cpu,
    sections: [
      {
        heading: 'The Flaw in Lossy Downsampling',
        content: 'Crude PDF shrinkers compress documents by reducing embedded image resolution to 72 DPI and crushing JPEG quality to 40%. The resulting files look pixelated and unreadable on high-resolution smartphone screens and printouts.'
      },
      {
        heading: 'Structural Stream Compaction',
        content: 'Modern PDF optimization focuses on syntax cleanliness. Packing uncompressed individual PDF objects into consolidated object streams, stripping unused font subset descriptors, and linearizing cross-reference tables reduces file sizes by 30% to 60% without touching a single image pixel.'
      }
    ]
  }
];

export const Blog: React.FC = () => {
  return (
    <>
      <SEO
        title="PDF Technology & Security Blog — Insights by PDF Tools Pro"
        description="Explore technical articles, privacy guides, and tutorials on WebAssembly PDF processing, AES-256 security, lossless compression, and document management."
        canonical={getCanonicalUrl('/blog')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: 'Blog & Articles' }]} />

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Engineering Insights & Security Guides</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              PDF Insights & Tutorials
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore in-depth technical guides on document security, client-side cryptography, and modern WebAssembly architecture.
            </p>
          </div>

          {/* Blog Articles List */}
          <div className="space-y-8">
            {BLOG_POSTS.map((post) => {
              const Icon = post.icon;
              return (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs hover:shadow-md transition-shadow space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Post Content Excerpt */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                    {post.sections.map((section, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <h3 className="text-sm font-bold text-slate-900">
                          {section.heading}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Original Technical Content</span>
                    </div>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>Try Free PDF Tools</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
