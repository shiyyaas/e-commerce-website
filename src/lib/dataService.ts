import { supabase, isLiveSupabaseConfigured } from './supabase';
import { Product, CartItem, Order, Profile, ShippingAddress } from '../types/database';
import { INITIAL_PRODUCTS } from './mockData';

// Local storage keys for mock mode
const LOCAL_PRODUCTS_KEY = 'atelier_products_v1';
const LOCAL_ORDERS_KEY = 'atelier_orders_v1';
const LOCAL_CART_KEY = 'atelier_cart_v1';
const LOCAL_PROFILE_KEY = 'atelier_profile_v1';

// Seed mock products in localStorage if not set
export function getLocalProducts(): Product[] {
  const stored = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]): void {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

export function getLocalOrders(userId: string): Order[] {
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (!stored) return [];
  try {
    const allOrders: Order[] = JSON.parse(stored);
    return allOrders.filter(o => o.user_id === userId);
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  const stored = localStorage.getItem(LOCAL_ORDERS_KEY);
  const allOrders: Order[] = stored ? JSON.parse(stored) : [];
  allOrders.unshift(order);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(allOrders));
}

// -------------------------------------------------------------
// Products Data Service
// -------------------------------------------------------------
export async function fetchProducts(options?: {
  category?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
  searchQuery?: string;
}): Promise<Product[]> {
  if (isLiveSupabaseConfigured) {
    try {
      let query = (supabase as any).from('products').select('*');

      if (options?.category && options.category !== 'All') {
        query = query.eq('category', options.category);
      }

      if (options?.searchQuery) {
        query = query.ilike('title', `%${options.searchQuery}%`);
      }

      if (options?.sortBy === 'price-asc') {
        query = query.order('price', { ascending: true });
      } else if (options?.sortBy === 'price-desc') {
        query = query.order('price', { ascending: false });
      } else if (options?.sortBy === 'name-asc') {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('featured', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (e) {
      console.warn('Falling back to local data store due to network / config:', e);
    }
  }

  // Fallback local products
  let products = getLocalProducts();

  if (options?.category && options.category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (options?.sortBy === 'price-asc') {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (options?.sortBy === 'price-desc') {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (options?.sortBy === 'name-asc') {
    products = [...products].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Featured first
    products = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  return products;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (isLiveSupabaseConfigured) {
    try {
      const { data, error } = await (supabase as any).from('products').select('*').eq('id', id).single();
      if (!error && data) return data as Product;
    } catch (e) {
      console.warn('Supabase fetchProductById fallback:', e);
    }
  }
  const products = getLocalProducts();
  return products.find(p => p.id === id) || null;
}

// -------------------------------------------------------------
// Cart Data Service
// -------------------------------------------------------------
export async function fetchUserCart(userId?: string): Promise<CartItem[]> {
  if (userId && isLiveSupabaseConfigured) {
    try {
      const { data, error } = await (supabase as any)
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map((item: any) => ({
          ...item,
          product: Array.isArray(item.product) ? item.product[0] : item.product,
        })) as CartItem[];
      }
    } catch (e) {
      console.warn('Supabase fetchUserCart fallback:', e);
    }
  }

  const stored = localStorage.getItem(LOCAL_CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function syncCartItem(
  userId: string | undefined,
  productId: string,
  quantity: number
): Promise<void> {
  if (userId && isLiveSupabaseConfigured) {
    try {
      if (quantity <= 0) {
        await (supabase as any)
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
      } else {
        await (supabase as any)
          .from('cart_items')
          .upsert({
            user_id: userId,
            product_id: productId,
            quantity,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,product_id' });
      }
    } catch (e) {
      console.warn('Supabase syncCartItem error:', e);
    }
  }
}

// -------------------------------------------------------------
// Orders / Atomic Checkout Service
// -------------------------------------------------------------
export async function createOrder(params: {
  userId: string;
  items: { product: Product; quantity: number }[];
  shippingAddress: ShippingAddress;
  paymentIntentId: string;
}): Promise<Order> {
  const { userId, items, shippingAddress, paymentIntentId } = params;

  // Real atomic Supabase RPC if configured
  if (isLiveSupabaseConfigured) {
    try {
      const payload = items.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
      }));

      const { data, error } = await (supabase as any).rpc('create_order_atomic', {
        p_user_id: userId,
        p_items: payload,
        p_shipping_address: shippingAddress,
        p_payment_intent_id: paymentIntentId,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Fetch newly created order
      const { data: orderData } = await (supabase as any)
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('id', (data as any).order_id)
        .single();

      if (orderData) {
        return orderData as unknown as Order;
      }
    } catch (e) {
      console.warn('Supabase create_order_atomic fallback to local execution:', e);
    }
  }

  // Atomic fallback execution locally:
  // Validate stock, decrement, generate order
  const allProducts = getLocalProducts();
  let totalAmount = 0;

  for (const item of items) {
    const prod = allProducts.find(p => p.id === item.product.id);
    if (!prod) throw new Error(`Product not found: ${item.product.title}`);
    if (prod.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${prod.title}. Only ${prod.stock} available.`);
    }
    prod.stock -= item.quantity;
    totalAmount += prod.price * item.quantity;
  }

  saveLocalProducts(allProducts);

  const orderId = 'ord-' + Math.random().toString(36).substring(2, 9);
  const newOrder: Order = {
    id: orderId,
    user_id: userId,
    total_amount: Number(totalAmount.toFixed(2)),
    status: 'processing',
    shipping_address: shippingAddress,
    payment_intent_id: paymentIntentId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: items.map(i => ({
      id: 'oi-' + Math.random().toString(36).substring(2, 9),
      order_id: orderId,
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.product.price,
      created_at: new Date().toISOString(),
      product: i.product,
    })),
  };

  saveLocalOrder(newOrder);
  localStorage.removeItem(LOCAL_CART_KEY);

  return newOrder;
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  if (isLiveSupabaseConfigured) {
    try {
      const { data, error } = await (supabase as any)
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as unknown as Order[];
      }
    } catch (e) {
      console.warn('Supabase fetchUserOrders fallback:', e);
    }
  }

  return getLocalOrders(userId);
}

// -------------------------------------------------------------
// Profile Service
// -------------------------------------------------------------
export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (isLiveSupabaseConfigured) {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) return data as Profile;
    } catch (e) {
      console.warn('Supabase fetchProfile fallback:', e);
    }
  }

  const stored = localStorage.getItem(LOCAL_PROFILE_KEY + '_' + userId);
  return stored ? JSON.parse(stored) : null;
}

export async function saveProfile(profile: Profile): Promise<void> {
  if (isLiveSupabaseConfigured) {
    try {
      await (supabase as any)
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase saveProfile fallback:', e);
    }
  }
  localStorage.setItem(LOCAL_PROFILE_KEY + '_' + profile.id, JSON.stringify(profile));
}
