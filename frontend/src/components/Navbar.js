"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();

  return (
    <nav className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-14 items-center">
          {/* Brand Logo & Catalog Link */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight hover:text-indigo-600">
              E-Shop
            </Link>
            <Link
              href="/products"
              className="text-xs font-semibold text-gray-600 hover:text-indigo-600"
            >
              All Products
            </Link>
          </div>

          {/* Right-side Auth & Actions */}
          <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-gray-500 font-normal">
                  Hello, <span className="font-bold text-gray-800">{user.name}</span>
                </span>

                {isAdmin && (
                  <Link href="/admin" className="hover:text-indigo-600">
                    Admin Panel
                  </Link>
                )}

                <Link href="/orders" className="hover:text-indigo-600">
                  My Orders
                </Link>

                <Link href="/cart" className="hover:text-indigo-600 flex items-center space-x-1">
                  <span>Cart</span>
                  <span className="bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                    {cartCount}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="text-red-600 hover:underline"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  href="/signin"
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 bg-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
