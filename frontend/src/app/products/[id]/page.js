"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../../context/CartContext";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setFeedback({ type: "error", message: "Product not found" });
        }
      } catch (err) {
        console.error("Error loading product details:", err);
        setFeedback({ type: "error", message: "Failed to load product details" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleQtyChange = (val) => {
    const nextQty = quantity + val;
    if (nextQty > 0 && nextQty <= product.stock) {
      setQuantity(nextQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    const res = await addToCart(product.id, quantity);
    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: "success", message: `Successfully added ${quantity} item(s) to your cart!` });
      setQuantity(1);
    } else {
      setFeedback({ type: "error", message: res.message || "Failed to add items to cart" });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm text-gray-500">Loading details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm font-medium">
          {feedback.message || "Product not found!"}
        </div>
        <Link href="/products" className="text-indigo-600 font-semibold text-sm hover:underline">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/products" className="text-sm font-semibold text-gray-500 hover:text-indigo-600">
        &larr; Back to Products
      </Link>

      <div className="bg-white border border-gray-300 rounded p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image */}
        <div className="bg-gray-50 border border-gray-200 rounded overflow-hidden aspect-square flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-400">No Image</span>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {product.category_name}
            </span>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg font-bold text-gray-900">
              ₹{parseFloat(product.price).toFixed(2)}
            </p>
            <div className="border-t border-gray-200 pt-3 mt-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Description</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs">
              {product.stock === 0 ? (
                <span className="text-red-600 font-bold">Out of stock</span>
              ) : (
                <span className="text-gray-650">Available Stock: {product.stock} items</span>
              )}
            </div>

            {/* Quantity select & Add button */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold text-gray-800 text-center min-w-8">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= product.stock}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 font-bold disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition"
                >
                  {submitting ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}

            {/* Feedback notifications */}
            {feedback.message && (
              <div
                className={`text-xs p-2 rounded border text-center font-semibold ${
                  feedback.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
