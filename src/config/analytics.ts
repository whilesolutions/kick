/**
 * Analytics Configuration
 * Client & Server shared metadata for GA4 and interaction events.
 */
export const ANALYTICS_CONFIG = {
  gaMeasurementId: (typeof window !== 'undefined' && (window as any).VITE_GA4_MEASUREMENT_ID) || 'G-KICKSVZLA01',
  trackEndpoint: '/api/public/track',
  sessionStorageKey: 'kicks_selector_session_v1',
  campaignStorageKey: 'kicks_selector_campaign_v1',
  utmStorageKey: 'kicks_selector_utms_v1',
};
