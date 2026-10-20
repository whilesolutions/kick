import React from 'react';
import { MessageCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { CampaignConfig } from '../models/campaignConfig.ts';
import { useProducts } from '../hooks/useProducts.ts';
import { ProductCard } from './ProductCard.tsx';
import { SkeletonCard } from './SkeletonCard.tsx';
import { ProgressIndicator } from './ProgressIndicator.tsx';
import { BackButton } from './BackButton.tsx';
import { trackEvent } from '../services/analyticsService.ts';

interface ProductStepProps {
  config: CampaignConfig;
  selectedBrand?: string;
  selectedCategory?: string;
  onBack: () => void;
  startTime: number;
}

export const ProductStep: React.FC<ProductStepProps> = ({
  config,
  selectedBrand,
  selectedCategory,
  onBack,
  startTime
}) => {
  const filter = {
    vendor: selectedBrand,
    category: selectedCategory,
  };

  const { products, loading, error, empty, refresh } = useProducts(filter);

  const headingTitle = selectedBrand || selectedCategory || 'Modelos Destacados';
  const headingSubtitle = selectedBrand
    ? `Colección oficial de ${selectedBrand} en Kicks Venezuela`
    : `Modelos de ${selectedCategory} disponibles ahora`;

  const handleBackClick = () => {
    const duration = Date.now() - startTime;
    trackEvent('back_click', {
      campaign_id: config.id,
      brand: selectedBrand,
      category: selectedCategory,
      duration_ms: duration,
      screen: 'step2_products'
    });
    onBack();
  };

  const handleWhatsAppFallback = () => {
    trackEvent('whatsapp_fallback_click', {
      campaign_id: config.id,
      brand: selectedBrand,
      category: selectedCategory,
      screen: 'step2_products'
    });

    const targetUrl = config.fallbackWhatsApp || 'https://wa.me/584242523184';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col pb-16 animate-fade-in">
      {/* Progress & Nav Bar */}
      <div className="flex items-center justify-between px-4 pt-2">
        <BackButton onClick={handleBackClick} label="Elegir otra opción" />
        <span className="text-xs font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full">
          {products.length > 0 && !loading ? `${products.length} productos` : 'Kicks'}
        </span>
      </div>

      <ProgressIndicator currentStep={2} totalSteps={2} stepName={`Viendo ${headingTitle}`} />

      {/* Screen Title */}
      <div className="px-4 pt-1 pb-3">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          {headingTitle}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium">
          {headingSubtitle}
        </p>
      </div>

      {/* Product Grid: 2 cols on mobile, 3 on tablet/desktop */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center my-6 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
            <h3 className="text-base font-bold text-white mb-1">
              No pudimos cargar los productos
            </h3>
            <p className="text-xs text-neutral-400 mb-4 max-w-xs">
              Ocurrió un problema de conexión temporal con la tienda.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        ) : empty ? (
          /* Empty state with friendly WhatsApp fallback */
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center my-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-red-400 mb-3">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              ¿No ves tu talla o modelo de {headingTitle}?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 max-w-xs">
              Escríbenos directamente a WhatsApp. Nuestro equipo en tienda revisará disponibilidad en tiempo real para ti.
            </p>
            <button
              type="button"
              onClick={handleWhatsAppFallback}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar disponibilidad por WhatsApp
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                config={config}
                position={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick reassurance footer */}
      {!loading && products.length > 0 && (
        <div className="px-4 mt-8 text-center">
          <p className="text-xs text-neutral-500">
            Al tocar <strong className="text-neutral-400">"Ver en la tienda"</strong> serás llevado directamente al producto en{' '}
            <span className="text-red-400">kicksvenezuela.com</span> para completar tu compra.
          </p>
        </div>
      )}
    </div>
  );
};
