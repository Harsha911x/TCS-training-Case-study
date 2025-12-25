export interface Product {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  price: number;
  category: ProductCategory;
  description?: string;
  quantityAvailable: number;
  status: ProductStatus;
  softDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export enum ProductCategory {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  BOOKS = 'BOOKS',
  HOME = 'HOME',
  SPORTS = 'SPORTS',
  TOYS = 'TOYS',
  FOOD = 'FOOD',
  OTHER = 'OTHER'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface ProductHighlights {
  heroProducts?: Product[];
  spotlight?: Product[];
  topDeals?: Product[];
  newArrivals?: Product[];
}

