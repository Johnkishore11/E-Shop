"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-10">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Success!
        </h1>
        <h2 className="text-lg font-bold text-gray-900">
          Order Successful!
        </h2>
        <p className="text-sm text-gray-600">
          Your order has been processed. Your cart is now empty.
        </p>
      </div>

      {orderId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 inline-block">
          <p className="text-sm font-semibold text-gray-700">
            Order Reference: <span className="text-indigo-600 font-mono">#{orderId}</span>
          </p>
        </div>
      )}

      <div className="border-t border-gray-150 pt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center space-x-1 py-2.5 px-4 border border-indigo-600 hover:bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold transition"
        >
          <span>View My Orders</span>
        </Link>
        
        <Link
          href="/products"
          className="flex-1 flex items-center justify-center space-x-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-20 text-center">
          <p className="text-gray-500">Loading receipt...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
