"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Simple Hero Section */}
      <div className="bg-gray-150 border border-gray-300 rounded p-8 sm:p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Online Shopping
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto mb-6">
          Find electronics, clothing, books, footwear, and more. A simple store to browse products and place test orders.
        </p>
        <div className="flex justify-center">
          <Link
            href="/products"
            className="px-6 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
          >
            Browse All Products
          </Link>
        </div>
      </div>

      {/* Categories List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Shop by Category
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded border border-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="bg-white border border-gray-200 p-6 rounded text-center block hover:border-indigo-500 hover:bg-gray-50 transition"
              >
                <h3 className="text-base font-bold text-indigo-700 mb-1">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Store Information */}
      <div className="border border-gray-200 rounded p-6 bg-white space-y-4">
        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Store Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-650">
          <div>
            <h4 className="font-bold text-gray-800">INR Pricing</h4>
            <p className="text-xs text-gray-500 mt-1">All catalog prices and totals are displayed in Indian Rupees (₹).</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Simple Orders</h4>
            <p className="text-xs text-gray-500 mt-1">No payment gateways required. Place mock test orders instantly.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Admin Control</h4>
            <p className="text-xs text-gray-500 mt-1">Manage stocks, products, and update dispatch orders easily.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
