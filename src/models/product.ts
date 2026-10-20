export interface Product {
  id: string;
  title: string;
  handle: string;
  url: string; // https://kicksvenezuela.com/products/{handle}
  vendor: string;
  category?: string;
  price: string;
  rawPrice?: number;
  currencyCode: string;
  imageUrl: string;
  availableForSale: boolean;
  tags?: string[];
  badges?: string[];
}

export interface ProductQueryFilter {
  vendor?: string;
  category?: string;
  tag?: string;
  limit?: number;
}
