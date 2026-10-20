export type InteractionEventType =
  | 'page_view'
  | 'select_brand'
  | 'select_category'
  | 'select_product'
  | 'back_click'
  | 'redirect_to_shopify'
  | 'whatsapp_fallback_click'
  | 'abandon';

export interface PublicInteractionEvent {
  event: InteractionEventType;
  campaign_id: string;
  session_id: string;
  brand?: string;
  category?: string;
  product_id?: string;
  product_handle?: string;
  position_in_grid?: number;
  duration_ms?: number;
  user_agent?: string;
  timestamp: number | string;
  entry_route?: string;
  utm_source?: string;
  utm_campaign?: string;
  screen?: 'step1_brand_category' | 'step2_products' | 'direct';
}

export interface FunnelMetrics {
  totalSessions: number;
  pageViews: number;
  step1Selections: number;
  step2ProductClicks: number;
  shopifyRedirects: number;
  whatsappClicks: number;
  abandonments: number;
  conversionRate: number; // shopifyRedirects / pageViews
  step1ToStep2Rate: number;
  step2ToShopifyRate: number;
  averageTimeStep1Ms: number;
  averageTimeStep2Ms: number;
  topBrands: { name: string; clicks: number }[];
  topCategories: { name: string; clicks: number }[];
  topProducts: { id: string; title: string; clicks: number; redirects: number }[];
  campaignDistribution: { campaign_id: string; count: number }[];
}
