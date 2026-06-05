"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { 
  Loader2, Plus, Edit, Trash2, ArrowLeft, Search, RefreshCw, AlertCircle 
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminProductsPage() {
  const { token, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Track product deletion
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!token || !isAdmin) {
      router.push("/products");
      return;
    }

    fetchProducts();
  }, [authLoading, token, isAdmin, router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to load catalog products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message || "An error occurred fetching products list");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}" from the catalog?`);
    if (!confirmDelete) return;

    setDeletingId(productId);
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete product");

      // Filter out deleted product locally
      setProducts(prev => prev.filter(prod => prod.id !== productId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <Link href="/admin" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-indigo-600 transition">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Manage Products
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit, or remove items in the e-commerce catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-xs transition"
        >
          <Plus className="mr-1.5 h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Search and reload toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
          />
        </div>
        <button
          onClick={fetchProducts}
          className="p-2 text-gray-500 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg shadow-xs"
          title="Refresh List"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Products table list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-600 flex items-center justify-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products match your search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock Available</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/50">
                    {/* Item */}
                    <td className="px-6 py-4 flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-50 border border-gray-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-gray-400">No img</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/products/${prod.id}`} className="font-bold text-gray-950 hover:text-indigo-600 truncate block max-w-xs sm:max-w-sm">
                          {prod.name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{prod.description}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {prod.category_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{parseFloat(prod.price).toFixed(2)}
                    </td>

                    {/* Stock level details */}
                    <td className="px-6 py-4">
                      {prod.stock === 0 ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          Out of Stock
                        </span>
                      ) : prod.stock < 5 ? (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          Critical: {prod.stock} left
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          In stock: {prod.stock}
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        {/* Edit Pencil Link */}
                        <Link
                          href={`/admin/products/edit/${prod.id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition"
                          title="Edit Product"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </Link>
                        
                        {/* Delete Trash Button */}
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          disabled={deletingId === prod.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
