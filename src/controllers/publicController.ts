import { Request, Response } from 'express';
import { getCampaignConfig, listActiveCampaigns } from '../services/campaignConfigService.ts';
import { getShopifyProducts, APPROVED_VENDORS, APPROVED_CATEGORIES } from '../services/shopifyPublicService.ts';
import { recordInteraction, getFunnelAnalytics } from '../services/adminFunnelService.ts';
import { PublicInteractionEvent } from '../models/publicInteraction.ts';

const CAMPAIGN_ID_REGEX = /^[a-z0-9_-]{1,32}$/i;

/**
 * GET /api/public/campaign/:id
 * Fetches campaign configuration with fallback to default
 */
export async function handleGetCampaign(req: Request, res: Response) {
  try {
    const rawId = req.params.id || 'default';
    if (!CAMPAIGN_ID_REGEX.test(rawId)) {
      return res.status(400).json({ error: 'Invalid campaign ID format. Must match [a-z0-9_-]{1,32}' });
    }

    const config = await getCampaignConfig(rawId);

    // Cache-Control 60s as specified
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    return res.status(200).json(config);
  } catch (err: any) {
    console.error('[publicController] getCampaign error:', err);
    return res.status(500).json({ error: 'Failed to retrieve campaign configuration' });
  }
}

/**
 * GET /api/public/products
 * Fetches products filtered by vendor or tag/category with caching and whitelist verification
 */
export async function handleGetProducts(req: Request, res: Response) {
  try {
    const vendor = typeof req.query.vendor === 'string' ? req.query.vendor.trim() : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : undefined;
    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 12;

    // Sanitize string length to prevent injection or abuse
    if (vendor && vendor.length > 50) return res.status(400).json({ error: 'Vendor parameter too long' });
    if (category && category.length > 50) return res.status(400).json({ error: 'Category parameter too long' });
    if (tag && tag.length > 50) return res.status(400).json({ error: 'Tag parameter too long' });

    const products = await getShopifyProducts({
      vendor,
      category,
      tag,
      limit: Math.min(Math.max(limit, 1), 24)
    });

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.status(200).json({
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error('[publicController] getProducts error:', err);
    return res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

/**
 * POST /api/public/track
 * Receives analytics event, validates schema, persists to Firestore public_interactions
 */
export async function handleTrackInteraction(req: Request, res: Response) {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const {
      event,
      campaign_id,
      session_id,
      brand,
      category,
      product_id,
      product_handle,
      position_in_grid,
      duration_ms,
      entry_route,
      utm_source,
      utm_campaign,
      screen
    } = body;

    const validEvents = [
      'page_view',
      'select_brand',
      'select_category',
      'select_product',
      'back_click',
      'redirect_to_shopify',
      'whatsapp_fallback_click',
      'abandon'
    ];

    if (!event || !validEvents.includes(event)) {
      return res.status(400).json({ error: 'Invalid or missing event type' });
    }

    if (!session_id || typeof session_id !== 'string' || session_id.length > 64) {
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    const safeCampaignId = typeof campaign_id === 'string' && campaign_id.length <= 32
      ? campaign_id
      : 'default';

    const safeEvent: PublicInteractionEvent = {
      event,
      campaign_id: safeCampaignId,
      session_id,
      brand: typeof brand === 'string' ? brand.slice(0, 64) : undefined,
      category: typeof category === 'string' ? category.slice(0, 64) : undefined,
      product_id: typeof product_id === 'string' ? product_id.slice(0, 100) : undefined,
      product_handle: typeof product_handle === 'string' ? product_handle.slice(0, 100) : undefined,
      position_in_grid: typeof position_in_grid === 'number' && position_in_grid >= 0 ? position_in_grid : undefined,
      duration_ms: typeof duration_ms === 'number' && duration_ms >= 0 && duration_ms < 600000 ? duration_ms : undefined,
      user_agent: (req.headers['user-agent'] || '').slice(0, 255),
      timestamp: Date.now(),
      entry_route: typeof entry_route === 'string' ? entry_route.slice(0, 120) : undefined,
      utm_source: typeof utm_source === 'string' ? utm_source.slice(0, 64) : undefined,
      utm_campaign: typeof utm_campaign === 'string' ? utm_campaign.slice(0, 64) : undefined,
      screen: typeof screen === 'string' ? (screen as any) : undefined
    };

    const docId = await recordInteraction(safeEvent);
    return res.status(200).json({ success: true, id: docId });
  } catch (err: any) {
    console.error('[publicController] trackInteraction error:', err);
    return res.status(500).json({ error: 'Failed to record interaction' });
  }
}

/**
 * GET /api/admin/funnel-metrics
 * Protected funnel analytics metrics for the conversion dashboard
 */
export async function handleGetFunnelMetrics(req: Request, res: Response) {
  try {
    const configuredPassword = process.env.ADMIN_FUNNEL_PASSWORD || 'kicks2026';
    const providedAuth = req.headers['x-admin-password'] || req.query.password;

    if (providedAuth !== configuredPassword) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
    }

    const campaignId = typeof req.query.campaign === 'string' ? req.query.campaign : undefined;
    const metrics = await getFunnelAnalytics(campaignId);
    const campaigns = await listActiveCampaigns();

    return res.status(200).json({
      metrics,
      campaigns
    });
  } catch (err: any) {
    console.error('[publicController] getFunnelMetrics error:', err);
    return res.status(500).json({ error: 'Failed to retrieve funnel metrics' });
  }
}
