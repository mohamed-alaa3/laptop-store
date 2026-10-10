import type { LocalizedString } from './category.model';

export type ProductCondition = 'new' | 'imported';
export type OfferType = 'discount' | 'free-gift';
export type DiscountType = 'percentage' | 'fixed';

export interface ProductImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

export interface Specification {
  name: LocalizedString;
  value: LocalizedString;
}

export interface Offer {
  isActive: boolean;
  type: OfferType;
  discountType?: DiscountType;
  discountValue?: number;
  giftProduct?: string;
  giftQuantity?: number;
  message?: LocalizedString;
  startDate?: string;
  endDate?: string;
}

export interface Product {
  _id: string;
  name: LocalizedString;
  slug: string;
  brand: string;
  category: string; // Category ID
  condition: ProductCondition;
  price: number;
  oldPrice?: number;
  stock: number;
  description: LocalizedString;
  images: ProductImage[];
  specifications: Specification[];
  featured: boolean;
  newArrival: boolean;
  offer?: Offer;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProductSort =
  'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export interface ProductQuery {
  category?: string;
  brand?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  newArrival?: boolean;
  onSale?: boolean;
  search?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export type SearchSort = 'relevance' | 'newest' | 'price-asc' | 'price-desc';

export interface SearchQuery {
  q: string;
  category?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sort?: SearchSort;
  page?: number;
  limit?: number;
}
