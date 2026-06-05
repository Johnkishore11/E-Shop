"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function CartPage() {
  const { cartItems, cartTotal, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (itemId, currentQty, stock, increment) => {
    const newQty = currentQty + increment;
    if (newQty <= 0) return;
    if (newQty > stock) return;

    setUpdatingId(itemId);
    await updateQuantity(itemId, newQty);
    setUpdatingId(null);
  };

  const handleRemoveClick = async (itemId) => {
    setUpdatingId(itemId);
    await removeFromCart(itemId);
    setUpdatingId(null);
  };

  if (authLoading || (loading && cartItems.length === 0)) {
    return <div className="text-center py-12 text-sm text-gray-500">Loading cart...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 bg-white border border-gray-300 rounded p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900">Please Sign In</h2>
        <p className="text-xs text-gray-500">
          You need to sign in to access your shopping cart and manage your items.
        </p>
        <Link
          href="/signin"
          className="w-full inline-block text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white border border-gray-300 rounded p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/products"
          className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-300 rounded overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-700 uppercase">
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5">Total</th>
                    <th className="px-4 py-2.5 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-50 border border-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] text-gray-400">No img</span>
                            )}
                          </div>
                          <div>
                            <Link href={`/products/${item.product_id}`} className="font-bold text-gray-950 hover:underline">
                              {item.name}
                            </Link>
                            <p className="text-[10px] text-gray-500">Stock: {item.stock}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-900">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-1 border border-gray-300 rounded w-fit mx-auto bg-white">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, -1)}
                            disabled={item.quantity <= 1 || updatingId === item.id}
                            className="px-2 py-0.5 text-gray-500 hover:bg-gray-150 font-bold disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-gray-800 text-center min-w-6">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, 1)}
                            disabled={item.quantity >= item.stock || updatingId === item.id}
                            className="px-2 py-0.5 text-gray-500 hover:bg-gray-150 font-bold disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-900 font-bold">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveClick(item.id)}
                          disabled={updatingId === item.id}
                          className="px-2 py-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1 bg-white p-4 border border-gray-300 rounded space-y-4">
          <h3 className="text-base font-bold text-gray-900 border-b border-gray-150 pb-2">
            Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-gray-150 pt-2 flex justify-between font-bold text-gray-900">
              <span>Grand Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full inline-block text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition"
          >
            Checkout &rarr;
          </Link>
          <div className="text-center">
            <Link href="/products" className="text-xs text-indigo-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
