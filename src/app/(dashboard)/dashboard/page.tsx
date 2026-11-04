"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Boxes,
  AlertTriangle,
  ArrowRight,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import StockAdjustModal from "@/components/products/StockAdjustModal";

interface DashboardData {
  organizationName: string;
  totalProducts: number;
  totalUnitsOnHand: number;
  lowStockCount: number;
  defaultLowStockThreshold: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    quantityOnHand: number;
    lowStockThreshold: number;
    effectiveThreshold: number;
    isOutOfStock: boolean;
    sellingPrice: number | null;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    quantityOnHand: number;
  } | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-hairline-gray/60 rounded-nav" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white rounded-cards border border-hairline-gray" />
          <div className="h-32 bg-white rounded-cards border border-hairline-gray" />
          <div className="h-32 bg-white rounded-cards border border-hairline-gray" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-forest-ink">Inventory Overview</h1>
          <p className="text-sm text-graphite mt-1">
            Real-time stock summary for{" "}
            <span className="font-medium text-forest-ink">
              {data?.organizationName || "your organization"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products" className="btn-secondary">
            <span>Manage Catalog</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
          <Link href="/products?create=true" className="btn-primary">
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Products */}
        <div className="sc-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-graphite uppercase tracking-wider">
              Total Products
            </span>
            <div className="h-9 w-9 rounded-nav bg-linen flex items-center justify-center text-forest-ink border border-sage-wash/60">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-light text-forest-ink">{data?.totalProducts ?? 0}</p>
            <p className="text-xs text-graphite mt-1">Active SKUs in catalog</p>
          </div>
        </div>

        {/* Metric 2: Total Units */}
        <div className="sc-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-graphite uppercase tracking-wider">
              Total Units in Stock
            </span>
            <div className="h-9 w-9 rounded-nav bg-linen flex items-center justify-center text-forest-ink border border-sage-wash/60">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-light text-forest-ink">{data?.totalUnitsOnHand ?? 0}</p>
            <p className="text-xs text-graphite mt-1">Across all products</p>
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div
          className={`sc-card ${
            (data?.lowStockCount ?? 0) > 0 ? "border-warning-500/40 bg-warning-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-graphite uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div
              className={`h-9 w-9 rounded-nav flex items-center justify-center ${
                (data?.lowStockCount ?? 0) > 0
                  ? "bg-warning-100 text-warning-700 border border-warning-200"
                  : "bg-linen text-forest-ink border border-sage-wash/60"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <p
              className={`text-3xl font-light ${
                (data?.lowStockCount ?? 0) > 0 ? "text-warning-700" : "text-forest-ink"
              }`}
            >
              {data?.lowStockCount ?? 0}
            </p>
            <p className="text-xs text-graphite mt-1">
              {(data?.lowStockCount ?? 0) > 0
                ? "Items require replenishment"
                : "All items adequately stocked"}
            </p>
          </div>
        </div>
      </div>

      {/* Low-Stock Alert Section */}
      <div className="sc-card">
        <div className="flex items-center justify-between pb-4 border-b border-hairline-gray">
          <div>
            <h2 className="text-lg font-medium text-forest-ink">Items Requiring Attention</h2>
            <p className="text-xs text-graphite mt-0.5">
              Products at or below their alert threshold (Default:{" "}
              {data?.defaultLowStockThreshold ?? 5} units)
            </p>
          </div>
          {(data?.lowStockCount ?? 0) > 0 && (
            <span className="sc-badge bg-warning-100 text-warning-700 border border-warning-200">
              {data?.lowStockCount} items low
            </span>
          )}
        </div>

        {(!data?.lowStockItems || data.lowStockItems.length === 0) ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 rounded-badges bg-linen text-forest-ink flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium text-forest-ink">Healthy Inventory Levels</h3>
            <p className="text-xs text-graphite mt-1 max-w-sm mx-auto">
              No products are currently low on stock. All items meet or exceed their replenishment
              thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline-gray text-xs text-graphite uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Product Name</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium text-right">Quantity on Hand</th>
                  <th className="py-3 px-4 font-medium text-right">Threshold</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-gray">
                {data.lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-medium text-charcoal">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-graphite">{item.sku}</td>
                    <td className="py-3.5 px-4 font-medium text-right text-charcoal">
                      {item.quantityOnHand}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-graphite text-right">
                      {item.effectiveThreshold}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isOutOfStock ? (
                        <span className="sc-badge bg-danger-100 text-danger-700 border border-danger-200">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="sc-badge bg-warning-100 text-warning-700 border border-warning-200">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsAdjustOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-nav text-xs font-medium bg-linen hover:bg-sage-wash/40 text-forest-ink border border-sage-wash/60 transition cursor-pointer"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        product={selectedProduct}
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={fetchDashboard}
      />
    </div>
  );
}

