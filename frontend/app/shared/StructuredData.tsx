// @AI-HINT: Injects global JSON-LD structured data for Organization & WebSite.
'use client';
import React from 'react';

const org = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MegiLance',
  url: 'https://megilance.com',
  logo: 'https://megilance.com/logo-icon.svg',
  sameAs: [
    'https://twitter.com/megilance'
  ]
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MegiLance',
  url: 'https://megilance.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://megilance.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

const StructuredData: React.FC = () => {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
};

export default StructuredData;
