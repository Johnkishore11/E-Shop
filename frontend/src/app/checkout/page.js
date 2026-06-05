"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Loader2, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CheckoutPage() {
  const { cartItems, cartTotal, loading: cartLoading, clearCartLocal } = useCart();
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If user is not authenticated after loading completes, redirect to signin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // If cart is loaded, user is authenticated, and cart is empty, redirect to cart page
  useEffect(() => {
    if (!authLoading && !cartLoading && isAuthenticated && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [authLoading, cartLoading, isAuthenticated, cartItems, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!shippingAddress.trim() || !phone.trim()) {
      setError("Please fill in shipping address and phone number");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      // Order placed successfully!
      // Clear cart locally
      clearCartLocal();
      
      // Redirect to success page
      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong during checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/cart" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Cart
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-3">
            Shipping Information
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834 or 9876543210"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Full Shipping Address
              </label>
              <textarea
                id="address"
                required
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Street Address, Apartment/Suite, City, State, ZIP Code"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              />
            </div>
          </div>

          {/* Payment Method Notice */}
          <div className="bg-indigo-50 border border-indigo-150 rounded-lg p-4 flex items-start space-x-3">
            <CreditCard className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Payment Method: Test Flow</h4>
              <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                This is a demo training project. Actual credit cards are not processed. Placing this order will mock a payment step and trigger an "Order Placed Successfully" workflow immediately.
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Place Order (₹{cartTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Checkout Items Summary */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-150 pb-3">
            Review Items
          </h3>

          <div className="divide-y divide-gray-150 max-h-96 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center space-x-3 text-sm">
                <div className="h-12 w-12 bg-gray-50 border border-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-gray-400">No img</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-950 truncate">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} &times; ₹{parseFloat(item.price).toFixed(2)}</p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-150 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items Total</span>
              <span className="font-medium text-gray-900">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping Charge</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-150 pt-3 flex justify-between text-base font-extrabold text-gray-900">
              <span>Order Grand Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
