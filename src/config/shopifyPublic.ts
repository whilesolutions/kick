/**
 * Configuration for Shopify Storefront API (Public, read-only token)
 * Real Storefront tokens have read-only public access to published products.
 */
export const SHOPIFY_CONFIG = {
  domain: process.env.SHOPIFY_STORE_DOMAIN || 'kicksvenezuela.com',
  storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN || '',
  apiVersion: '2024-01',
  get storefrontUrl(): string {
    return `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
  },
  baseProductUrl: (handle: string): string => {
    const cleanDomain = (process.env.SHOPIFY_STORE_DOMAIN || 'kicksvenezuela.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${cleanDomain}/products/${handle}`;
  }
};
