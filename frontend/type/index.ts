export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  images: ProductImage[];
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_main: boolean;
  sort_order: number;
}

export interface User {
  id: number;
  email: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: number;
}
