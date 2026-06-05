"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Package, Calendar, MapPin, Phone, ArrowRight } from "lucide-react";

export default function UserOrdersPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load user orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, token, router]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 font-semibold";
      case "Shipped":
        return "bg-blue-50 border-blue-200 text-blue-800 font-semibold";
      case "Delivered":
        return "bg-green-50 border-green-200 text-green-800 font-semibold";
      case "Cancelled":
        return "bg-red-50 border-red-200 text-red-800 font-semibold";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 font-semibold";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-10">
        <div className="flex justify-center">
          <Package className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">No Orders Yet</h2>
        <p className="text-sm text-gray-500">
          You haven't placed any orders with us. Add some items to your cart and checkout!
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        My Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            {/* Header info bar */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center text-sm">
              <div className="flex gap-4 sm:gap-6 flex-wrap">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order Placed</p>
                  <div className="flex items-center space-x-1.5 text-gray-700 font-semibold">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Total Amount</p>
                  <p className="text-gray-900 font-extrabold">₹{parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Order ID</p>
                  <p className="text-gray-700 font-mono font-semibold">#{order.id}</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-3 py-1 rounded-full text-xs border ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Inner details container */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product items (occupies 2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items Ordered</h4>
                <div className="divide-y divide-gray-150">
                  {order.items.map((item, index) => (
                    <div key={index} className="py-3 flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-50 border border-gray-200 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-gray-400">No img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.product_id ? (
                          <Link href={`/products/${item.product_id}`} className="font-bold text-gray-900 hover:text-indigo-600 block truncate">
                            {item.product_name}
                          </Link>
                        ) : (
                          <span className="font-bold text-gray-400 block truncate">
                            {item.product_name} (No longer available)
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} &times; ₹{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery and Address details */}
              <div className="md:col-span-1 bg-gray-50/50 rounded-xl p-5 border border-gray-200 space-y-4 self-start text-xs text-gray-700">
                <h4 className="font-bold text-gray-500 uppercase tracking-wider border-b border-gray-150 pb-2">
                  Delivery Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-600 mb-0.5">Shipping Address</p>
                      <p className="leading-relaxed text-gray-800 font-medium whitespace-pre-line">{order.shipping_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-600 mb-0.5">Contact Number</p>
                      <p className="text-gray-800 font-semibold">{order.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
