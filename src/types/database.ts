export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ColorBlockVariant = 'lime' | 'lilac' | 'cream' | 'mint' | 'pink' | 'coral' | 'navy';

export interface ProductAttributes {
  dimensions?: string;
  material?: string;
  weight?: string;
  layout?: string;
  switches?: string;
  connectivity?: string;
  pages?: string;
  binding?: string;
  paper?: string;
  cri?: string;
  temperature?: string;
  power?: string;
  refill?: string;
  finish?: string;
  length?: string;
  capacity?: string;
  hardware?: string;
  water_resistance?: string;
  cover?: string;
  washable?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  image_urls: string[];
  category: string;
  attributes: ProductAttributes;
  featured?: boolean;
  badge_color?: ColorBlockVariant;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  shipping_address: ShippingAddress | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  product?: Product;
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at' | 'updated_at' | 'product'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CartItem, 'id'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, 'id'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at' | 'product'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
    };
    Functions: {
      create_order_atomic: {
        Args: {
          p_user_id: string;
          p_items: { product_id: string; quantity: number }[];
          p_shipping_address: ShippingAddress;
          p_payment_intent_id: string;
        };
        Returns: {
          order_id: string;
          total_amount: number;
          status: string;
        };
      };
    };
  };
}
