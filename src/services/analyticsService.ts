import { InteractionEventType, PublicInteractionEvent } from '../models/publicInteraction.ts';
import { ANALYTICS_CONFIG } from '../config/analytics.ts';

// Unique anonymous session ID stored per browser tab
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let sid = sessionStorage.getItem(ANALYTICS_CONFIG.sessionStorageKey);
    if (!sid) {
      sid = 'ks_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem(ANALYTICS_CONFIG.sessionStorageKey, sid);
    }
    return sid;
  } catch (e) {
    return 'anonymous_' + Date.now();
  }
}

export function getStoredUtms(): { utm_source?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(ANALYTICS_CONFIG.utmStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function storeUtms(params: URLSearchParams): void {
  if (typeof window === 'undefined') return;
  const utms: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  if (Object.keys(utms).length > 0) {
    sessionStorage.setItem(ANALYTICS_CONFIG.utmStorageKey, JSON.stringify(utms));
  }
}

/**
 * Tracks an interaction event.
 * Dispatches to both GA4 (gtag) and the Firestore tracking endpoint.
 * Uses navigator.sendBeacon for fast exit events like redirects or abandonment.
 */
export function trackEvent(
  event: InteractionEventType,
  payload: Partial<PublicInteractionEvent> & { campaign_id?: string; useBeacon?: boolean } = {}
): void {
  if (typeof window === 'undefined') return;

  const utms = getStoredUtms();
  const sessionId = getSessionId();
  const campaignId = payload.campaign_id || sessionStorage.getItem(ANALYTICS_CONFIG.campaignStorageKey) || 'default';

  const fullEvent: PublicInteractionEvent = {
    event,
    campaign_id: campaignId,
    session_id: sessionId,
    timestamp: Date.now(),
    entry_route: window.location.pathname + window.location.search,
    utm_source: utms.utm_source,
    utm_campaign: utms.utm_campaign,
    brand: payload.brand,
    category: payload.category,
    product_id: payload.product_id,
    product_handle: payload.product_handle,
    position_in_grid: payload.position_in_grid,
    duration_ms: payload.duration_ms,
    screen: payload.screen,
  };

  // 1. Dispatch to GA4 (gtag) if present on the page
  try {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, {
        campaign_id: campaignId,
        brand: payload.brand,
        category: payload.category,
        product_id: payload.product_id,
        duration_ms: payload.duration_ms,
      });
    }
  } catch (err) {
    console.debug('[GA4] Event dispatch error:', err);
  }

  // 2. Dispatch to /api/public/track (sendBeacon for instant redirects, fetch for regular interactions)
  const bodyData = JSON.stringify(fullEvent);
  const useBeacon = payload.useBeacon || event === 'redirect_to_shopify' || event === 'abandon';

  if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([bodyData], { type: 'application/json' });
    navigator.sendBeacon(ANALYTICS_CONFIG.trackEndpoint, blob);
  } else {
    fetch(ANALYTICS_CONFIG.trackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyData,
      keepalive: true,
    }).catch((err) => {
      console.debug('[Analytics] Failed to send interaction event:', err);
    });
  }
}
