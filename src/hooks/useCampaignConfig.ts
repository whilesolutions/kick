import { useState, useEffect } from 'react';
import { CampaignConfig, DEFAULT_CAMPAIGN_CONFIG } from '../models/campaignConfig.ts';
import { ANALYTICS_CONFIG } from '../config/analytics.ts';

export function useCampaignConfig(initialCampaignId?: string) {
  const [config, setConfig] = useState<CampaignConfig>(DEFAULT_CAMPAIGN_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Resolve campaign ID from param or URL (?c= or /r/:id)
    let campaignId = initialCampaignId;
    if (!campaignId && typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const cParam = searchParams.get('c');
      if (cParam) {
        campaignId = cParam;
      } else {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'r' && pathParts[1]) {
          campaignId = pathParts[1];
        }
      }
    }

    const resolvedId = (campaignId || 'default').toLowerCase();
    sessionStorage.setItem(ANALYTICS_CONFIG.campaignStorageKey, resolvedId);

    // 2. Fetch campaign configuration
    let isCancelled = false;
    setLoading(true);

    fetch(`/api/public/campaign/${encodeURIComponent(resolvedId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Campaña no encontrada o error en servidor');
        return res.json();
      })
      .then((data: CampaignConfig) => {
        if (isCancelled) return;

        // If inactive, fallback to default
        if (data.active === false && resolvedId !== 'default') {
          console.warn(`Campaign ${resolvedId} is inactive, using default.`);
          // update URL parameter gracefully
          const url = new URL(window.location.href);
          url.searchParams.set('c', 'default');
          window.history.replaceState({}, '', url.toString());
          setConfig(DEFAULT_CAMPAIGN_CONFIG);
          applyTheme(DEFAULT_CAMPAIGN_CONFIG.theme);
        } else {
          setConfig(data);
          applyTheme(data.theme);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn('[useCampaignConfig] Falling back to default campaign:', err);
        setError(err.message);
        setConfig(DEFAULT_CAMPAIGN_CONFIG);
        applyTheme(DEFAULT_CAMPAIGN_CONFIG.theme);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [initialCampaignId]);

  function applyTheme(theme: CampaignConfig['theme']) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--theme-primary', theme.primaryColor);
    if (theme.accentColor) root.style.setProperty('--theme-accent', theme.accentColor);
    if (theme.backgroundColor) root.style.setProperty('--theme-bg', theme.backgroundColor);
    if (theme.textColor) root.style.setProperty('--theme-text', theme.textColor);
    if (theme.cardBgColor) root.style.setProperty('--theme-card-bg', theme.cardBgColor);
  }

  return { config, loading, error };
}
