"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "", id: null });

  // Load categories and initial products
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Update selection state when URL parameters change
  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    const searchParam = searchParams.get("search") || "";

    setSelectedCategory(categoryParam);
    setSearchTerm(searchParam);

    fetchProducts(categoryParam, searchParam);
  }, [searchParams]);

  const fetchProducts = async (catId, keyword) => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/products";
      const params = [];
      if (catId) params.push(`category=${catId}`);
      if (keyword) params.push(`search=${encodeURIComponent(keyword)}`);

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams(selectedCategory, searchTerm);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    updateUrlParams(catId, searchTerm);
  };

  const updateUrlParams = (catId, searchKeyword) => {
    const params = new URLSearchParams();
    if (catId) params.set("category", catId);
    if (searchKeyword) params.set("search", searchKeyword);

    const queryStr = params.toString();
    router.push(`/products${queryStr ? `?${queryStr}` : ""}`);
  };

  const handleAddToCartClick = async (productId, productName) => {
    setFeedback({ type: "", message: "", id: null });
    const res = await addToCart(productId, 1);

    if (res.success) {
      setFeedback({ type: "success", message: `Added ${productName} to cart!`, id: productId });
      setTimeout(() => setFeedback({ type: "", message: "", id: null }), 2000);
    } else {
      setFeedback({ type: "error", message: res.message || "Failed to add to cart", id: productId });
      setTimeout(() => setFeedback({ type: "", message: "", id: null }), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <div className="md:col-span-1 bg-white p-4 border border-gray-300 rounded">
        <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => handleCategorySelect("")}
            className={`w-full text-left px-2 py-1.5 rounded text-xs font-semibold ${
              selectedCategory === ""
                ? "bg-indigo-600 text-white"
                : "text-gray-750 hover:bg-gray-100"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id.toString())}
              className={`w-full text-left px-2 py-1.5 rounded text-xs font-semibold ${
                selectedCategory === cat.id.toString()
                  ? "bg-indigo-600 text-white"
                  : "text-gray-750 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid area */}
      <div className="md:col-span-3 space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded p-8 text-center text-sm text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white border border-gray-300 rounded overflow-hidden flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="h-40 bg-gray-100 relative border-b border-gray-200">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                  {/* Category Tag */}
                  <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {prod.category_name}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Price & Stock */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-sm font-bold text-gray-900">₹{parseFloat(prod.price).toFixed(2)}</span>
                      {prod.stock === 0 ? (
                        <span className="text-red-600 font-bold">Out of Stock</span>
                      ) : (
                        <span className="text-gray-500">Stock: {prod.stock}</span>
                      )}
                    </div>

                    {/* Feedback Alert */}
                    {feedback.id === prod.id && (
                      <div
                        className={`text-[10px] py-0.5 rounded text-center border font-bold ${
                          feedback.type === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {feedback.message}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link
                        href={`/products/${prod.id}`}
                        className="py-1.5 border border-gray-300 rounded text-center font-semibold text-gray-750 bg-white hover:bg-gray-100"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCartClick(prod.id, prod.name)}
                        disabled={prod.stock === 0}
                        className="py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded text-center font-bold text-white"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="text-center py-12 text-sm text-gray-500">Loading catalog...</div>}
    >
      <ProductListContent />
    </Suspense>
  );
}
