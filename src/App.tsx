import React, { useState, useEffect, useRef } from 'react';
import { useCampaignConfig } from './hooks/useCampaignConfig.ts';
import { CampaignBanner } from './components/CampaignBanner.tsx';
import { BrandCategoryStep } from './components/BrandCategoryStep.tsx';
import { ProductStep } from './components/ProductStep.tsx';
import { AdminFunnel } from './components/AdminFunnel.tsx';
import { trackEvent, storeUtms } from './services/analyticsService.ts';
import { BarChart2, Zap } from 'lucide-react';

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const hasRedirectedRef = useRef<boolean>(false);

  // Parse initial query params and route
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const pathName = typeof window !== 'undefined' ? window.location.pathname : '/';

  // 1. Resolve Campaign ID from ?c= or /r/:id
  let initialCampaignId = searchParams.get('c') || 'default';
  const pathParts = pathName.split('/').filter(Boolean);
  if (pathParts[0] === 'r' && pathParts[1]) {
    initialCampaignId = pathParts[1];
  }

  const { config, loading } = useCampaignConfig(initialCampaignId);

  // Check if entering admin funnel route directly
  useEffect(() => {
    if (pathName.includes('/admin/funnel')) {
      setIsAdminView(true);
    }
  }, [pathName]);

  // Initial setup: UTM extraction, Brand/Category deep linking, and page_view event
  useEffect(() => {
    storeUtms(searchParams);

    const paramBrand = searchParams.get('brand');
    const paramCategory = searchParams.get('category');

    // Rule: If brand or category is passed in URL from Meta Ad, skip screen 1 directly to screen 2
    if (paramBrand) {
      setSelectedBrand(paramBrand);
      setStep(2);
    } else if (paramCategory) {
      setSelectedCategory(paramCategory);
      setStep(2);
    }

    // Fire initial page_view event
    trackEvent('page_view', {
      campaign_id: initialCampaignId,
      screen: paramBrand || paramCategory ? 'step2_products' : 'step1_brand_category'
    });

    // Abandonment detector via visibilitychange and beforeunload
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasRedirectedRef.current) {
        trackEvent('abandon', {
          campaign_id: initialCampaignId,
          brand: selectedBrand,
          category: selectedCategory,
          duration_ms: Date.now() - stepStartTime,
          useBeacon: true
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedCategory(undefined);
    setStepStartTime(Date.now());
    setStep(2);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedBrand(undefined);
    setStepStartTime(Date.now());
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setSelectedBrand(undefined);
    setSelectedCategory(undefined);
    setStepStartTime(Date.now());
    setStep(1);
  };

  const switchCampaignQuick = (campaignId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('c', campaignId);
    url.searchParams.delete('brand');
    url.searchParams.delete('category');
    window.location.href = url.toString();
  };

  if (isAdminView) {
    return <AdminFunnel onBackToApp={() => setIsAdminView(false)} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between selection:bg-red-500 selection:text-white"
      style={{
        backgroundColor: config.theme?.backgroundColor || '#09090b',
        color: config.theme?.textColor || '#fafafa',
      }}
    >
      {/* Top Banner (Themeable per Campaign) */}
      <CampaignBanner config={config} />

      {/* Main Funnel Container (Mobile-first 375px max centered) */}
      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col justify-start">
        {step === 1 ? (
          <BrandCategoryStep
            config={config}
            onSelectBrand={handleSelectBrand}
            onSelectCategory={handleSelectCategory}
            startTime={stepStartTime}
          />
        ) : (
          <ProductStep
            config={config}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            onBack={handleBackToStep1}
            startTime={stepStartTime}
          />
        )}
      </main>

      {/* Meta Ads Campaign Switcher & Admin Toolbar (Floating Bottom Bar for Reviewers & Marketers) */}
      <footer className="w-full bg-neutral-950/95 border-t border-neutral-800/80 backdrop-blur-md px-3 py-2.5 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Quick Campaign Switchers */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-red-500" />
              Campaña:
            </span>
            <button
              type="button"
              onClick={() => switchCampaignQuick('default')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                config.id === 'default'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => switchCampaignQuick('blackfriday')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                config.id === 'blackfriday'
                  ? 'bg-red-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Black Friday
            </button>
            <button
              type="button"
              onClick={() => switchCampaignQuick('diciembre')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                config.id === 'diciembre'
                  ? 'bg-emerald-600 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Navidad
            </button>
          </div>

          {/* Admin Funnel Access */}
          <button
            type="button"
            onClick={() => setIsAdminView(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold shrink-0 cursor-pointer transition-colors"
            title="Ver métricas del embudo"
          >
            <BarChart2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Embudo</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
