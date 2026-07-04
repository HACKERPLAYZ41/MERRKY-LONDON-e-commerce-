import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // ── Fetch cart from backend ──────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const response = await API.get('/cart');
      const data = response.data.data;
      setCartItems(data.items || []);
      setCartTotal(data.total_amount || 0);

      // Save server-issued guest token for unauthenticated sessions
      if (data.guest_token) {
        localStorage.setItem('guest_token', data.guest_token);
      }
    } catch (err) {
      // Fallback: load from localStorage if backend unreachable
      const saved = localStorage.getItem('cart_local');
      if (saved) {
        try { setCartItems(JSON.parse(saved)); } catch (_) {}
      }
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Add to cart ──────────────────────────────────────────────────────────
  const addToCart = async (product, quantity, size, color) => {
    try {
      const response = await API.post('/cart/add', {
        product_id: product.id,
        quantity,
        size: size || null,
        color: color || null,
      });
      const data = response.data.data;
      setCartItems(data.items || []);
      setCartTotal(data.total_amount || 0);
      if (data.guest_token) localStorage.setItem('guest_token', data.guest_token);
    } catch (err) {
      console.error('Add to cart failed:', err);
      // Optimistic local fallback
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.product_id === product.id && i.size === size && i.color === color
        );
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
          return updated;
        }
        return [...prev, {
          id: Date.now(),
          product_id: product.id,
          name: product.name,
          price: product.discount_price ?? product.price,
          image_url: product.primary_image,
          quantity,
          size,
          color,
          subtotal: (product.discount_price ?? product.price) * quantity
        }];
      });
    }
  };

  // ── Update quantity ──────────────────────────────────────────────────────
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    try {
      const response = await API.put(`/cart/items/${itemId}`, { quantity });
      const data = response.data.data;
      setCartItems(data.items || []);
      setCartTotal(data.total_amount || 0);
    } catch (err) {
      console.error('Update cart failed:', err);
    }
  };

  // ── Remove item ──────────────────────────────────────────────────────────
  const removeFromCart = async (itemId) => {
    try {
      const response = await API.delete(`/cart/items/${itemId}`);
      const data = response.data.data;
      setCartItems(data.items || []);
      setCartTotal(data.total_amount || 0);
    } catch (err) {
      // Optimistic removal
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // ── Clear cart locally (after order success) ─────────────────────────────
  const clearCart = () => {
    setCartItems([]);
    setCartTotal(0);
  };

  // ── Computed helpers (keep backward compat) ──────────────────────────────
  const getCartTotal = () => cartTotal;
  const getCartCount = () => cartItems.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
