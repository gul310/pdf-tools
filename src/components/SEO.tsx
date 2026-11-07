import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { ToolData } from '../data/toolsData';
import { SITE_CONFIG, getCanonicalUrl } from '../config/site';

interface SEOProps {
  tool?: ToolData;
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({
  tool,
  title,
  description,
  canonical,
  type = 'website'
}) => {
  const pageTitle = tool ? tool.seoTitle : (title || SITE_CONFIG.title);
  const metaDescription = tool ? tool.metaDescription : (description || SITE_CONFIG.description);
  const canonicalUrl = tool ? tool.canonicalUrl : (canonical || getCanonicalUrl('/'));

  // Schema: SoftwareApplication
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool ? tool.name : 'PDF Tools Suite',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    description: metaDescription,
    url: canonicalUrl
  };

  // Schema: FAQPage (if tool has faqs)
  const faqSchema = tool?.faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  // Schema: HowTo (if tool has steps)
  const howToSchema = tool?.howToSteps ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to ${tool.name}`,
    description: tool.directAnswer,
    step: tool.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.name,
      text: step.text
    }))
  } : null;

  // Schema: BreadcrumbList
  const breadcrumbSchema = tool ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getCanonicalUrl('/')
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.name,
        item: tool.canonicalUrl
      }
    ]
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={metaDescription} />
      {tool?.keywords && <meta name="keywords" content={tool.keywords.join(', ')} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content="PDF Tools Pro" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={metaDescription} />

      {/* Security & Client-Side Privacy Notice */}
      <meta name="application-name" content="PDF Tools Pro" />
      <meta name="robots" content="index, follow" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(softwareAppSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {howToSchema && (
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};
