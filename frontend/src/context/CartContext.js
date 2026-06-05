"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart on mount or when token/auth state changes
  useEffect(() => {
    fetchCart();
  }, [token, isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, message: "Please sign in to add items to cart" };
    }
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      await fetchCart();
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update quantity");
      }

      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove item");
      }

      await fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const clearCartLocal = () => {
    setCartItems([]);
  };

  // Derived state
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.quantity * parseFloat(item.price), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        clearCartLocal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
