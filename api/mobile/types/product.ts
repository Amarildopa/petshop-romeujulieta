export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  category: Category;
  brand?: string;
  price: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  tags: string[];
  attributes: ProductAttribute[];
  variants?: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  allowBackorder: boolean;
  trackStock: boolean;
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  sortOrder: number;
  isMain: boolean;
  createdAt: Date;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  isRequired: boolean;
  isVisible: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes: {
    [key: string]: string;
  };
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  attributes?: {
    [key: string]: string | string[];
  };
  rating?: number;
  search?: string;
}

export interface ProductSort {
  field: 'name' | 'price' | 'rating' | 'salesCount' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  filter?: ProductFilter;
  sort?: ProductSort;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    categories: Category[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
    attributes: {
      name: string;
      values: string[];
    }[];
  };
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface ProductRecommendation {
  type: 'related' | 'similar' | 'frequently_bought' | 'recently_viewed';
  products: Product[];
  reason?: string;
}