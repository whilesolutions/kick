import React, { useState } from 'react';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { Product } from '../models/product.ts';
import { CampaignConfig } from '../models/campaignConfig.ts';
import { trackEvent, getStoredUtms } from '../services/analyticsService.ts';

interface ProductCardProps {
  product: Product;
  config: CampaignConfig;
  position: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, config, position }) => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSelectAndRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);

    // 1. Track select_product event
    trackEvent('select_product', {
      campaign_id: config.id,
      brand: product.vendor,
      product_id: product.id,
      product_handle: product.handle,
      position_in_grid: position,
      screen: 'step2_products'
    });

    // 2. Build final destination URL: Product URL + campaign redirectSuffix + stored UTM parameters
    let targetUrl = product.url;
    const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);

    // Append campaign redirectSuffix params if present
    if (config.redirectSuffix) {
      const suffixQuery = config.redirectSuffix.replace(/^\?/, '');
      const suffixParams = new URLSearchParams(suffixQuery);
      suffixParams.forEach((value, key) => {
        urlObj.searchParams.set(key, value);
      });
    }

    // Append stored UTM parameters
    const storedUtms = getStoredUtms();
    Object.entries(storedUtms).forEach(([key, val]) => {
      if (val) urlObj.searchParams.set(key, val);
    });

    // 3. Track redirect_to_shopify event using sendBeacon (reliable on page unload)
    trackEvent('redirect_to_shopify', {
      campaign_id: config.id,
      brand: product.vendor,
      product_id: product.id,
      product_handle: product.handle,
      position_in_grid: position,
      useBeacon: true
    });

    // 4. Instant redirect without surprise
    setTimeout(() => {
      window.location.href = urlObj.toString();
    }, 120);
  };

  return (
    <article className="group bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-black/50">
      <div>
        {/* Product Image */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/60">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Graceful fallback image if external image fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Badge */}
          {product.badges && product.badges.length > 0 && (
            <div className="absolute top-2 left-2 bg-neutral-950/90 backdrop-blur-md text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm">
              {product.badges[0]}
            </div>
          )}

          {/* Vendor Tag */}
          <div className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur-md text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-neutral-800">
            {product.vendor}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-neutral-100 line-clamp-2 leading-snug tracking-tight mb-2 min-h-[34px]">
          {product.title}
        </h3>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-neutral-400">Precio</span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight">
            {product.price}
          </span>
        </div>

        {/* Action Button: "Ver este producto en la tienda" */}
        <button
          type="button"
          onClick={handleSelectAndRedirect}
          disabled={isRedirecting}
          className="w-full min-h-[44px] px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-75 disabled:cursor-wait touch-manipulation"
          style={{
            backgroundColor: config.theme.accentColor || '#ef4444'
          }}
        >
          {isRedirecting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Redirigiendo...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ver en la tienda</span>
              <ExternalLink className="w-3 h-3 opacity-80 shrink-0 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </article>
  );
};
