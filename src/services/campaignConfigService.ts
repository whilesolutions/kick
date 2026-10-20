import { CampaignConfig, DEFAULT_CAMPAIGN_CONFIG } from '../models/campaignConfig.ts';
import { getFirestoreDb } from '../config/firebase.ts';

// Pre-configured campaigns as defined in requirements
const INITIAL_CAMPAIGNS: Record<string, CampaignConfig> = {
  default: { ...DEFAULT_CAMPAIGN_CONFIG },
  blackfriday: {
    id: "blackfriday",
    name: "Black Friday 2026",
    active: true,
    theme: {
      primaryColor: "#000000",
      accentColor: "#FF0000",
      backgroundColor: "#0a0a0a",
      textColor: "#ffffff",
      bannerText: "🔥 Ofertas Black Friday - Solo por hoy",
      cardBgColor: "#141414"
    },
    featuredBrands: ["Penguin", "Avia"],
    featuredCategories: ["Calzado"],
    promoMessage: "Envío gratis en compras mayores a $50",
    redirectSuffix: "?utm_source=meta&utm_campaign=blackfriday",
    fallbackWhatsApp: "https://wa.me/584242523184?text=Hola%20Kicks,%20vi%20la%20promo%20de%20Black%20Friday"
  },
  diciembre: {
    id: "diciembre",
    name: "Campaña Diciembre 2026",
    active: true,
    theme: {
      primaryColor: "#051622",
      accentColor: "#10b981",
      backgroundColor: "#070e17",
      textColor: "#ffffff",
      bannerText: "🎄 Especial Navideño Kicks - Entregas Rápidas en Venezuela",
      cardBgColor: "#0d1b2a"
    },
    featuredBrands: ["Penguin", "Avia", "Hey Dude"],
    featuredCategories: ["Calzado", "Chaquetas", "Gorras"],
    promoMessage: "Estrena tus mejores Kicks esta temporada",
    redirectSuffix: "?utm_source=meta&utm_campaign=diciembre",
    fallbackWhatsApp: "https://wa.me/584242523184?text=Hola%20Kicks,%20busco%20regalos%20de%20Diciembre"
  }
};

interface CacheEntry {
  config: CampaignConfig;
  expiresAt: number;
}

const campaignMemoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds memory cache

let isSeeded = false;

/**
 * Seeds initial campaigns into Firestore if they don't exist yet.
 */
async function ensureSeeded() {
  if (isSeeded) return;
  try {
    const db = getFirestoreDb();
    const col = db.collection('campaign_configs');
    for (const [id, campaign] of Object.entries(INITIAL_CAMPAIGNS)) {
      const docRef = col.doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        await docRef.set(campaign);
      }
    }
    isSeeded = true;
  } catch (err) {
    console.warn('[campaignConfigService] Seeding notice:', err);
  }
}

/**
 * Retrieves campaign configuration by ID with 60s memory cache.
 * Falls back to default if campaign doesn't exist or active === false.
 */
export async function getCampaignConfig(id: string): Promise<CampaignConfig> {
  const normalizedId = (id || 'default').toLowerCase().trim();
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = campaignMemoryCache.get(normalizedId);
  if (cached && cached.expiresAt > now) {
    return cached.config;
  }

  await ensureSeeded();

  try {
    const db = getFirestoreDb();
    const docRef = db.collection('campaign_configs').doc(normalizedId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data() as CampaignConfig;
      // If inactive and not default, fall back to default
      if (data.active !== false) {
        campaignMemoryCache.set(normalizedId, { config: data, expiresAt: now + CACHE_TTL_MS });
        return data;
      }
    }
  } catch (err) {
    console.error(`[campaignConfigService] Error reading campaign ${normalizedId}:`, err);
  }

  // If not found or inactive, fallback to default (or initial memory config)
  if (normalizedId !== 'default') {
    const defaultConfig = await getCampaignConfig('default');
    return defaultConfig;
  }

  const fallback = INITIAL_CAMPAIGNS.default;
  campaignMemoryCache.set('default', { config: fallback, expiresAt: now + CACHE_TTL_MS });
  return fallback;
}

/**
 * Lists all active campaigns (used by Admin Funnel and switcher).
 */
export async function listActiveCampaigns(): Promise<CampaignConfig[]> {
  await ensureSeeded();
  try {
    const db = getFirestoreDb();
    const col = db.collection('campaign_configs');
    const snapshot = await col.get();

    const campaigns: CampaignConfig[] = [];
    snapshot.docs.forEach((d: any) => {
      const data = d.data() as CampaignConfig;
      campaigns.push(data);
    });

    if (campaigns.length > 0) return campaigns;
  } catch (err) {
    console.error('[campaignConfigService] Error listing campaigns:', err);
  }

  return Object.values(INITIAL_CAMPAIGNS);
}

/**
 * Update or create a campaign configuration in Firestore.
 * Invalidates cache immediately.
 */
export async function saveCampaignConfig(config: CampaignConfig): Promise<void> {
  const db = getFirestoreDb();
  await db.collection('campaign_configs').doc(config.id).set(config);
  campaignMemoryCache.delete(config.id);
}
