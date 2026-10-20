import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { CampaignConfig } from '../models/campaignConfig.ts';

interface CampaignBannerProps {
  config: CampaignConfig;
}

export const CampaignBanner: React.FC<CampaignBannerProps> = ({ config }) => {
  const bannerText = config.theme?.bannerText;
  const promoMessage = config.promoMessage;

  if (!bannerText && !promoMessage) return null;

  return (
    <header className="w-full sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      {/* High-urgency campaign banner if active */}
      {bannerText && (
        <div 
          className="w-full px-3 py-1.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: config.theme.accentColor || '#ef4444',
            color: '#ffffff'
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow shrink-0" />
          <span className="truncate">{bannerText}</span>
        </div>
      )}

      {/* Brand logo bar & promo snippet */}
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-base tracking-tighter shadow-sm shadow-red-500/30">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white leading-none">
              KICKS
            </span>
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
              Venezuela
            </span>
          </div>
        </div>

        {promoMessage && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-300 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full shadow-inner">
            <Tag className="w-3 h-3 text-red-500 shrink-0" />
            <span className="truncate max-w-[190px]">{promoMessage}</span>
          </div>
        )}
      </div>
    </header>
  );
};
