import { useState, useEffect } from 'react';
import { Product } from '../models/product.ts';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  empty: boolean;
  refresh: () => void;
}

const SESSION_CACHE_PREFIX = 'kicks_prod_cache_';
const SESSION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useProducts(filter: { vendor?: string; category?: string; tag?: string }): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerCount, setTriggerCount] = useState<number>(0);

  const vendorKey = filter.vendor?.toLowerCase().trim() || '';
  const categoryKey = filter.category?.toLowerCase().trim() || '';
  const tagKey = filter.tag?.toLowerCase().trim() || '';

  const cacheKey = `${SESSION_CACHE_PREFIX}${vendorKey}_${categoryKey}_${tagKey}`;

  useEffect(() => {
    let isCancelled = false;
    const now = Date.now();

    // 1. Check client-side sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.timestamp && now - parsed.timestamp < SESSION_CACHE_TTL) {
          setProducts(parsed.products);
          setLoading(false);
          setError(null);
          return;
        }
      }
    } catch {
      // sessionStorage parse error, proceed to fetch
    }

    setLoading(true);
    setError(null);

    // 2. Build API query parameters
    const params = new URLSearchParams();
    if (vendorKey) params.set('vendor', vendorKey);
    if (categoryKey) params.set('category', categoryKey);
    if (tagKey) params.set('tag', tagKey);

    fetch(`/api/public/products?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        const items: Product[] = data.products || [];
        setProducts(items);
        setLoading(false);

        // Save in sessionStorage
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              products: items,
              timestamp: Date.now(),
            })
          );
        } catch {
          // sessionStorage quota exceeded or disabled
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('[useProducts] Fetch error:', err);
        setError(err.message || 'Error inesperado al cargar productos');
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [vendorKey, categoryKey, tagKey, cacheKey, triggerCount]);

  const refresh = () => setTriggerCount((c) => c + 1);

  return {
    products,
    loading,
    error,
    empty: !loading && products.length === 0,
    refresh,
  };
}
