"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { 
  Loader2, DollarSign, ShoppingBag, Users, FolderKanban, 
  ChevronDown, ChevronUp, RefreshCw, Calendar, Mail, User
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const { token, user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Track expanded order row IDs
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  // Track status updating state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Active Tab: 'orders' or 'users'
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (authLoading) return;

    if (!token || !isAdmin) {
      router.push("/products"); // Non-admins or unauthenticated users redirected
      return;
    }

    loadAdminData();
  }, [authLoading, token, isAdmin, router]);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
      if (!statsRes.ok) throw new Error("Failed to load dashboard metrics");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Orders
      const ordersRes = await fetch(`${API_URL}/admin/orders`, { headers });
      if (!ordersRes.ok) throw new Error("Failed to load customer orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      // Fetch Users
      const usersRes = await fetch(`${API_URL}/admin/users`, { headers });
      if (!usersRes.ok) throw new Error("Failed to load user accounts");
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err) {
      setError(err.message || "An error occurred fetching admin panels data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update order status");

      // Update state locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Reload stats in case total changes or similar
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl mb-4 font-semibold">
          {error}
        </div>
        <button
          onClick={loadAdminData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage store products, catalog categories, users, and customer orders.</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <FolderKanban className="mr-2 h-4 w-4 text-gray-500" />
            Manage Products
          </Link>
          <button
            onClick={loadAdminData}
            className="p-2.5 text-gray-500 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-lg text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Sales</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">₹{parseFloat(stats.total_revenue).toFixed(2)}</h3>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Orders Received</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{stats.total_orders}</h3>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{stats.total_products}</h3>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Registered Users</p>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">{stats.total_users}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Toggles */}
      <div className="border-b border-gray-200 flex space-x-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 text-sm font-bold border-b-2 transition ${
            activeTab === "orders"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-sm font-bold border-b-2 transition ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          User Accounts ({users.length})
        </button>
      </div>

      {/* Tab Contents: Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders recorded in the system yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Total Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        {/* Main row */}
                        <tr className={`hover:bg-gray-50/50 ${isExpanded ? "bg-indigo-50/10" : ""}`}>
                          <td className="px-6 py-4 font-mono font-bold text-gray-900">
                            #{order.id}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-950">{order.user_name}</p>
                              <p className="text-xs text-gray-500">{order.user_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{parseFloat(order.total_amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {/* Dropdown status update */}
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                              className={`border rounded-lg text-xs font-semibold px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white ${getStatusBadgeClass(order.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleOrderExpand(order.id)}
                              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                              <span>Items</span>
                              {isExpanded ? <ChevronUp className="h-4 w-4 ml-0.5" /> : <ChevronDown className="h-4 w-4 ml-0.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible item details row */}
                        {isExpanded && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="border border-gray-200 rounded-lg bg-white p-4 max-w-3xl space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <h4 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Information</h4>
                                    <p className="flex items-start space-x-1 mt-1">
                                      <span className="font-bold text-gray-700 w-16">Address:</span>
                                      <span className="text-gray-600 whitespace-pre-line flex-1">{order.shipping_address}</span>
                                    </p>
                                    <p className="flex items-center space-x-1 mt-1">
                                      <span className="font-bold text-gray-700 w-16">Phone:</span>
                                      <span className="text-gray-600">{order.phone}</span>
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Metadata</h4>
                                    <p className="mt-1">
                                      <span className="font-bold text-gray-700 w-24 inline-block">Registered name:</span>
                                      <span className="text-gray-600">{order.user_name}</span>
                                    </p>
                                    <p className="mt-1">
                                      <span className="font-bold text-gray-700 w-24 inline-block">Order Placed:</span>
                                      <span className="text-gray-600">{new Date(order.created_at).toLocaleString()}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="border-t border-gray-150 pt-3">
                                  <h4 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2">Products Purchased</h4>
                                  <div className="divide-y divide-gray-150 text-xs">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="py-2 flex justify-between">
                                        <span className="font-medium text-gray-800">
                                          {item.product_name} <span className="text-gray-500 font-semibold">(Qty: {item.quantity})</span>
                                        </span>
                                        <span className="font-bold text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    <div className="pt-2 flex justify-between font-bold text-gray-900 border-t border-gray-150 mt-1">
                                      <span>Order Subtotal</span>
                                      <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Users */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Role Status</th>
                  <th className="px-6 py-3">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-sm text-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-gray-500">{u.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-950 flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex-row items-center space-x-1">
                      <span className="inline-flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span>{u.email}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        u.role === "admin" 
                          ? "bg-red-50 text-red-700 border border-red-200" 
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
