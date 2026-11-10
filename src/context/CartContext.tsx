import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types/database';
import { useAuth } from './AuthContext';
import { fetchUserCart, syncCartItem } from '../lib/dataService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_CART_STORAGE_KEY = 'atelier_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart on auth change
  useEffect(() => {
    async function loadCart() {
      const items = await fetchUserCart(user?.id);
      setCart(items);
    }
    loadCart();
  }, [user]);

  // Persist guest cart to local storage
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      let updated: CartItem[];

      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        updated = prev.map(item =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
        syncCartItem(user?.id, product.id, newQty);
      } else {
        const newItem: CartItem = {
          id: 'ci-' + Math.random().toString(36).substring(2, 9),
          user_id: user?.id || 'guest',
          product_id: product.id,
          quantity: Math.min(product.stock, quantity),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product,
        };
        updated = [...prev, newItem];
        syncCartItem(user?.id, product.id, newItem.quantity);
      }
      return updated;
    });
    setIsOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      const updated = prev.map(item => {
        if (item.product_id === productId) {
          const maxStock = item.product?.stock ?? 99;
          const finalQty = Math.min(maxStock, quantity);
          return { ...item, quantity: finalQty };
        }
        return item;
      });
      syncCartItem(user?.id, productId, quantity);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
    syncCartItem(user?.id, productId, 0);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
