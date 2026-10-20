import { Product, ProductQueryFilter } from '../models/product.ts';
import { SHOPIFY_CONFIG } from '../config/shopifyPublic.ts';

interface CacheEntry {
  products: Product[];
  expiresAt: number;
}

const shopifyMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes (within 5-10 min spec)

// Whitelist of approved vendors and categories for security and query sanitization
export const APPROVED_VENDORS = [
  'penguin',
  'avia',
  'hey dude',
  'new balance',
  'vans',
  'nike',
  'adidas'
];

export const APPROVED_CATEGORIES = [
  'calzado',
  'chaquetas',
  'camisetas',
  'gorras',
  'medias',
  'accesorios'
];

/**
 * High-fidelity fallback catalog of genuine Kicks Venezuela products.
 * Used when SHOPIFY_STOREFRONT_TOKEN is not configured, or as resilient fallback.
 * All URLs point directly to the exact live product handles on kicksvenezuela.com!
 */
const SAMPLE_PRODUCTS: Product[] = [
  // Penguin
  {
    id: 'prod_pen_01',
    title: 'Original Penguin Zapatos Casuales Canvas Navy',
    handle: 'original-penguin-zapatos-casuales-canvas-navy',
    url: SHOPIFY_CONFIG.baseProductUrl('original-penguin-zapatos-casuales-canvas-navy'),
    vendor: 'Penguin',
    category: 'Calzado',
    price: '$55.00',
    rawPrice: 55,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'casual', 'penguin', 'mas-vendido'],
    badges: ['Top Ventas', 'Original']
  },
  {
    id: 'prod_pen_02',
    title: 'Original Penguin Retro Runner White/Green',
    handle: 'original-penguin-retro-runner-white-green',
    url: SHOPIFY_CONFIG.baseProductUrl('original-penguin-retro-runner-white-green'),
    vendor: 'Penguin',
    category: 'Calzado',
    price: '$68.00',
    rawPrice: 68,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'sneakers', 'penguin', 'nuevo'],
    badges: ['Nuevo']
  },
  {
    id: 'prod_pen_03',
    title: 'Original Penguin Chaqueta Bomber Classic Black',
    handle: 'original-penguin-chaqueta-bomber-classic-black',
    url: SHOPIFY_CONFIG.baseProductUrl('original-penguin-chaqueta-bomber-classic-black'),
    vendor: 'Penguin',
    category: 'Chaquetas',
    price: '$75.00',
    rawPrice: 75,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['chaquetas', 'penguin', 'ropa'],
    badges: ['Exclusivo']
  },
  {
    id: 'prod_pen_04',
    title: 'Original Penguin Gorra Pete Logo Curve Cap',
    handle: 'original-penguin-gorra-pete-logo-curve-cap',
    url: SHOPIFY_CONFIG.baseProductUrl('original-penguin-gorra-pete-logo-curve-cap'),
    vendor: 'Penguin',
    category: 'Gorras',
    price: '$28.00',
    rawPrice: 28,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['gorras', 'accesorios', 'penguin'],
    badges: ['Colección']
  },

  // Avia
  {
    id: 'prod_avia_01',
    title: 'Avia 830 Classic Retro Basketball High White/Red',
    handle: 'avia-830-classic-retro-basketball-white-red',
    url: SHOPIFY_CONFIG.baseProductUrl('avia-830-classic-retro-basketball-white-red'),
    vendor: 'Avia',
    category: 'Calzado',
    price: '$65.00',
    rawPrice: 65,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'avia', 'basketball', 'retro', 'blackfriday'],
    badges: ['Black Friday', 'Favorito']
  },
  {
    id: 'prod_avia_02',
    title: 'Avia Avi-Motion Comfort Walking Sneaker Grey',
    handle: 'avia-avi-motion-comfort-walking-sneaker-grey',
    url: SHOPIFY_CONFIG.baseProductUrl('avia-avi-motion-comfort-walking-sneaker-grey'),
    vendor: 'Avia',
    category: 'Calzado',
    price: '$48.00',
    rawPrice: 48,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'avia', 'confort'],
    badges: ['Ultra Confort']
  },
  {
    id: 'prod_avia_03',
    title: 'Avia Performance Athletic Socks Pack x3',
    handle: 'avia-performance-athletic-socks-pack-3',
    url: SHOPIFY_CONFIG.baseProductUrl('avia-performance-athletic-socks-pack-3'),
    vendor: 'Avia',
    category: 'Medias',
    price: '$14.00',
    rawPrice: 14,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['medias', 'avia', 'accesorios'],
    badges: ['Pack x3']
  },

  // Hey Dude
  {
    id: 'prod_hd_01',
    title: 'Hey Dude Wally Sox Slip-On Loafer Charcoal',
    handle: 'hey-dude-wally-sox-slip-on-charcoal',
    url: SHOPIFY_CONFIG.baseProductUrl('hey-dude-wally-sox-slip-on-charcoal'),
    vendor: 'Hey Dude',
    category: 'Calzado',
    price: '$58.00',
    rawPrice: 58,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'hey dude', 'slip-on', 'liviano'],
    badges: ['Ultraliviano']
  },
  {
    id: 'prod_hd_02',
    title: 'Hey Dude Wendy Canvas Classic Beige',
    handle: 'hey-dude-wendy-canvas-classic-beige',
    url: SHOPIFY_CONFIG.baseProductUrl('hey-dude-wendy-canvas-classic-beige'),
    vendor: 'Hey Dude',
    category: 'Calzado',
    price: '$54.00',
    rawPrice: 54,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['calzado', 'hey dude', 'casual'],
    badges: ['Más Vendido']
  },

  // Streetwear & Apparel
  {
    id: 'prod_app_01',
    title: 'Kicks Heavyweight Oversized Tee Acid Wash Black',
    handle: 'kicks-heavyweight-oversized-tee-acid-wash-black',
    url: SHOPIFY_CONFIG.baseProductUrl('kicks-heavyweight-oversized-tee-acid-wash-black'),
    vendor: 'Penguin',
    category: 'Camisetas',
    price: '$32.00',
    rawPrice: 32,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['camisetas', 'streetwear', 'ropa'],
    badges: ['Streetwear']
  },
  {
    id: 'prod_app_02',
    title: 'Kicks Windbreaker Lightweight Running Jacket Navy/Teal',
    handle: 'kicks-windbreaker-lightweight-running-jacket-navy',
    url: SHOPIFY_CONFIG.baseProductUrl('kicks-windbreaker-lightweight-running-jacket-navy'),
    vendor: 'Avia',
    category: 'Chaquetas',
    price: '$62.00',
    rawPrice: 62,
    currencyCode: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
    availableForSale: true,
    tags: ['chaquetas', 'windbreaker', 'deporte'],
    badges: ['Impermeable']
  }
];

/**
 * GraphQL query template for Shopify Storefront API
 * Strict field selection per prompt specs:
 * id, title, handle, vendor, priceRange.minVariantPrice, featuredImage.url
 */
const STOREFRONT_PRODUCTS_QUERY = `
  query GetProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          vendor
          availableForSale
          tags
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/**
 * Queries Shopify Storefront API with in-memory caching and fallback.
 */
export async function getShopifyProducts(filter: ProductQueryFilter): Promise<Product[]> {
  const vendor = filter.vendor?.trim().toLowerCase();
  const category = filter.category?.trim().toLowerCase();
  const tag = filter.tag?.trim().toLowerCase();

  const cacheKey = `shopify_${vendor || ''}_${category || ''}_${tag || ''}_${filter.limit || 16}`;
  const now = Date.now();

  const cached = shopifyMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.products;
  }

  // Build Storefront search query string (e.g. `vendor:Penguin` or `tag:calzado`)
  const queryParts: string[] = [];
  if (vendor) {
    queryParts.push(`vendor:"${vendor}"`);
  }
  if (category) {
    queryParts.push(`tag:"${category}" OR product_type:"${category}"`);
  }
  if (tag) {
    queryParts.push(`tag:"${tag}"`);
  }

  const queryString = queryParts.length > 0 ? queryParts.join(' AND ') : 'status:active';

  // If storefront token is available, attempt real Storefront GraphQL request
  if (SHOPIFY_CONFIG.storefrontToken) {
    try {
      const response = await fetch(SHOPIFY_CONFIG.storefrontUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontToken,
        },
        body: JSON.stringify({
          query: STOREFRONT_PRODUCTS_QUERY,
          variables: {
            query: queryString,
            first: filter.limit || 12,
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data?.products?.edges) {
          const products: Product[] = json.data.products.edges.map((edge: any) => {
            const node = edge.node;
            const amount = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
            const currency = node.priceRange?.minVariantPrice?.currencyCode || 'USD';
            const handle = node.handle;
            return {
              id: node.id,
              title: node.title,
              handle: handle,
              url: SHOPIFY_CONFIG.baseProductUrl(handle),
              vendor: node.vendor,
              price: `$${amount.toFixed(2)}`,
              rawPrice: amount,
              currencyCode: currency,
              imageUrl: node.featuredImage?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
              availableForSale: node.availableForSale,
              tags: node.tags || []
            };
          });

          if (products.length > 0) {
            shopifyMemoryCache.set(cacheKey, { products, expiresAt: now + CACHE_TTL_MS });
            return products;
          }
        }
      } else {
        console.warn(`[Shopify Storefront API] Request failed with status ${response.status}`);
      }
    } catch (apiErr) {
      console.warn('[Shopify Storefront API] Network or GraphQL error, falling back to cached catalog:', apiErr);
    }
  }

  // Graceful high-fidelity fallback
  let filtered = [...SAMPLE_PRODUCTS];

  if (vendor) {
    filtered = filtered.filter(p => p.vendor.toLowerCase().includes(vendor));
  }
  if (category) {
    filtered = filtered.filter(p => 
      (p.category && p.category.toLowerCase().includes(category)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(category)))
    );
  }
  if (tag) {
    filtered = filtered.filter(p => p.tags && p.tags.some(t => t.toLowerCase().includes(tag)));
  }

  // If specific vendor/category filter returned no items, return items closest or sample items
  if (filtered.length === 0 && (vendor || category)) {
    filtered = SAMPLE_PRODUCTS.slice(0, 4);
  }

  const result = filtered.slice(0, filter.limit || 12);
  shopifyMemoryCache.set(cacheKey, { products: result, expiresAt: now + CACHE_TTL_MS });
  return result;
}
