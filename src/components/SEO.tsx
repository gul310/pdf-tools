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

  // Organization Schema
  const organizationSchema = {
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.domain}/#organization`,
    name: SITE_CONFIG.name,
    url: `${SITE_CONFIG.domain}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.domain}/logo.svg`
    },
    description: SITE_CONFIG.description,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: SITE_CONFIG.contactEmail,
        url: `${SITE_CONFIG.domain}/contact`
      }
    ]
  };

  // WebSite Schema
  const webSiteSchema = {
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.domain}/#website`,
    name: SITE_CONFIG.name,
    url: `${SITE_CONFIG.domain}/`,
    publisher: {
      '@id': `${SITE_CONFIG.domain}/#organization`
    },
    description: SITE_CONFIG.description
  };

  // WebPage Schema
  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: metaDescription,
    isPartOf: {
      '@id': `${SITE_CONFIG.domain}/#website`
    },
    about: {
      '@id': `${SITE_CONFIG.domain}/#organization`
    }
  };

  // Schema: SoftwareApplication
  const softwareAppSchema = {
    '@type': 'SoftwareApplication',
    '@id': `${canonicalUrl}#software`,
    name: tool ? `${tool.name} — ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} Suite`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any (Web Browser)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    description: metaDescription,
    url: canonicalUrl,
    provider: {
      '@id': `${SITE_CONFIG.domain}/#organization`
    }
  };

  // Schema: SoftwareSourceCode
  const sourceCodeSchema = {
    '@type': 'SoftwareSourceCode',
    '@id': `${SITE_CONFIG.domain}/#sourcecode`,
    name: `${SITE_CONFIG.name} Source Code`,
    codeRepository: SITE_CONFIG.githubUrl,
    targetProduct: {
      '@id': `${canonicalUrl}#software`
    }
  };

  // Schema: FAQPage (if tool has faqs)
  const faqSchema = tool?.faqs ? {
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

  // Unified @graph schema
  const graphEntities: any[] = [
    organizationSchema,
    webSiteSchema,
    webPageSchema,
    softwareAppSchema,
    sourceCodeSchema
  ];

  if (faqSchema) graphEntities.push(faqSchema);
  if (howToSchema) graphEntities.push(howToSchema);
  if (breadcrumbSchema) graphEntities.push(breadcrumbSchema);

  const unifiedSchema = {
    '@context': 'https://schema.org',
    '@graph': graphEntities
  };

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
      <meta property="og:site_name" content={SITE_CONFIG.name} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={metaDescription} />

      {/* Security & Client-Side Privacy Notice */}
      <meta name="application-name" content={SITE_CONFIG.name} />
      <meta name="robots" content="index, follow" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(unifiedSchema)}
      </script>
    </Helmet>
  );
};
