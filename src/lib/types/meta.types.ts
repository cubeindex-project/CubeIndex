/** SEO metadata that routes can provide via load functions. */
export interface Meta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  siteName?: string;
  image?: string;
  url?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  googleSiteVerification?: string;
  jsonLd?: object;
  noindex?: boolean;
  canonical?: string;
}

/** Fully resolved metadata used to render head tags. */
export type ResolvedMeta = Required<Meta>;
