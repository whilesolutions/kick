import React, { useState } from 'react';
import { Sparkles, Layers, ShieldCheck, ChevronRight } from 'lucide-react';
import { CampaignConfig } from '../models/campaignConfig.ts';
import { ProgressIndicator } from './ProgressIndicator.tsx';
import { trackEvent } from '../services/analyticsService.ts';

interface BrandCategoryStepProps {
  config: CampaignConfig;
  onSelectBrand: (brand: string) => void;
  onSelectCategory: (category: string) => void;
  startTime: number;
}

// Visual asset mapping for brands & categories with high visual fidelity
const BRAND_VISUALS: Record<string, { image: string; tagLine: string; logoColor: string }> = {
  Penguin: {
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Estilo clásico & casual',
    logoColor: '#38bdf8'
  },
  Avia: {
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Retro basketball & running',
    logoColor: '#ef4444'
  },
  'Hey Dude': {
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Comodidad ultraliviana',
    logoColor: '#fbbf24'
  },
  'New Balance': {
    image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Iconos del streetwear',
    logoColor: '#f97316'
  },
  Vans: {
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Off the wall clásico',
    logoColor: '#ec4899'
  }
};

const CATEGORY_VISUALS: Record<string, { image: string; tagLine: string }> = {
  Calzado: {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Sneakers, casual y retro'
  },
  Chaquetas: {
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Bombers y cortavientos'
  },
  Camisetas: {
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Heavyweight & streetwear'
  },
  Gorras: {
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Original caps & curve'
  },
  Medias: {
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&auto=format&fit=crop&q=80',
    tagLine: 'Packs deportivos y confort'
  }
};

export const BrandCategoryStep: React.FC<BrandCategoryStepProps> = ({
  config,
  onSelectBrand,
  onSelectCategory,
  startTime
}) => {
  const [activeTab, setActiveTab] = useState<'brands' | 'categories'>('brands');

  const featuredBrands = config.featuredBrands?.length ? config.featuredBrands : ['Penguin', 'Avia', 'Hey Dude'];
  const featuredCategories = config.featuredCategories?.length ? config.featuredCategories : ['Calzado', 'Chaquetas'];

  const handleBrandClick = (brandName: string, index: number) => {
    const duration = Date.now() - startTime;
    trackEvent('select_brand', {
      campaign_id: config.id,
      brand: brandName,
      position_in_grid: index,
      duration_ms: duration,
      screen: 'step1_brand_category'
    });
    onSelectBrand(brandName);
  };

  const handleCategoryClick = (categoryName: string, index: number) => {
    const duration = Date.now() - startTime;
    trackEvent('select_category', {
      campaign_id: config.id,
      category: categoryName,
      position_in_grid: index,
      duration_ms: duration,
      screen: 'step1_brand_category'
    });
    onSelectCategory(categoryName);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col pb-12 animate-fade-in">
      {/* Progress */}
      <ProgressIndicator currentStep={1} totalSteps={2} stepName="Selecciona lo que buscas" />

      {/* Hero Headline */}
      <div className="px-4 pt-1 pb-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5">
          ¿Qué estás buscando?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium max-w-xs mx-auto">
          Toca una opción para ver los modelos disponibles de inmediato.
        </p>
      </div>

      {/* Filter Mode Switcher */}
      <div className="px-4 mb-4">
        <div className="bg-neutral-900 p-1 rounded-2xl border border-neutral-800 flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              activeTab === 'brands'
                ? 'bg-neutral-800 text-white shadow-sm shadow-black/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Por Marca ({featuredBrands.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              activeTab === 'categories'
                ? 'bg-neutral-800 text-white shadow-sm shadow-black/40'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4 text-red-500" />
            <span>Por Categoría ({featuredCategories.length})</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 columns on mobile (UX principle: big cards, clear tap) */}
      <div className="px-4">
        {activeTab === 'brands' ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {featuredBrands.map((brand, idx) => {
              const meta = BRAND_VISUALS[brand] || {
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
                tagLine: 'Calzado & Streetwear',
                logoColor: '#ef4444'
              };

              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandClick(brand, idx)}
                  className="group relative flex flex-col text-left bg-neutral-900 border border-neutral-800 hover:border-neutral-700 active:scale-95 rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-200 cursor-pointer min-h-[170px] shadow-sm hover:shadow-lg touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {/* Background Image thumbnail */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/80">
                    <img
                      src={meta.image}
                      alt={brand}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 text-[10px] font-bold text-neutral-300 bg-neutral-950/80 px-2 py-0.5 rounded backdrop-blur-sm">
                      Kicks Venezuela
                    </div>
                  </div>

                  {/* Brand Label & Action */}
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                        {brand}
                      </h2>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {meta.tagLine}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-800 group-hover:bg-red-600 flex items-center justify-center shrink-0 transition-colors">
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {featuredCategories.map((category, idx) => {
              const meta = CATEGORY_VISUALS[category] || {
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
                tagLine: 'Explorar colección'
              };

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryClick(category, idx)}
                  className="group relative flex flex-col text-left bg-neutral-900 border border-neutral-800 hover:border-neutral-700 active:scale-95 rounded-2xl p-3 sm:p-4 overflow-hidden transition-all duration-200 cursor-pointer min-h-[170px] shadow-sm hover:shadow-lg touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-950 mb-3 border border-neutral-800/80">
                    <img
                      src={meta.image}
                      alt={category}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                        {category}
                      </h2>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {meta.tagLine}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-neutral-800 group-hover:bg-red-600 flex items-center justify-center shrink-0 transition-colors">
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-white" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust Badge at bottom of Step 1 */}
      <div className="px-4 mt-6">
        <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Productos 100% Originales • Envíos asegurados en Venezuela</span>
        </div>
      </div>
    </div>
  );
};
