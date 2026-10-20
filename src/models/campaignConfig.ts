export interface CampaignTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  bannerText?: string;
  cardBgColor?: string;
}

export interface CampaignConfig {
  id: string;
  name: string;
  active: boolean;
  theme: CampaignTheme;
  featuredBrands: string[];
  featuredCategories: string[];
  promoMessage?: string;
  redirectSuffix?: string;
  fallbackWhatsApp?: string;
}

export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  id: "default",
  name: "Kicks General",
  active: true,
  theme: {
    primaryColor: "#0a0a0a",
    accentColor: "#ef4444",
    backgroundColor: "#09090b",
    textColor: "#fafafa",
    bannerText: "",
    cardBgColor: "#18181b",
  },
  featuredBrands: ["Penguin", "Avia", "Hey Dude", "New Balance", "Vans"],
  featuredCategories: ["Calzado", "Chaquetas", "Camisetas", "Gorras", "Medias"],
  promoMessage: "Calzado 100% Original con Envíos a Toda Venezuela",
  redirectSuffix: "?utm_source=meta&utm_medium=kicks_selector",
  fallbackWhatsApp: "https://wa.me/584242523184?text=Hola%20Kicks%20Venezuela,%20estoy%20buscando%20un%20producto",
};
