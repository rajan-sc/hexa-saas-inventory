"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Search,
  Plus,
  SlidersHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import ProductModal, { ProductFormData } from "@/components/products/ProductModal";
import StockAdjustModal from "@/components/products/StockAdjustModal";
import DeleteConfirmModal from "@/components/products/DeleteConfirmModal";

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantityOnHand: number;
  costPrice: number | null;
  sellingPrice: number | null;
  lowStockThreshold: number | null;
  effectiveThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const autoCreate = searchParams.get("create") === "true";

  const [products, setProducts] = useState<Product[]>([]);
  const [defaultThreshold, setDefaultThreshold] = useState<number>(5);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(autoCreate);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setDefaultThreshold(data.defaultLowStockThreshold);
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Client-side real-time search filter
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal text-forest-ink">Product Catalog</h1>
          <p className="text-sm text-graphite mt-1">
            Manage your inventory, SKU assignments, and stock quantities
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar & Stats Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-graphite/60">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="block w-full pl-10 pr-4 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
          />
        </div>
        <div className="text-xs text-graphite font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table Card */}
      <div className="sc-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-graphite text-sm">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-12 w-12 rounded-badges bg-linen text-forest-ink flex items-center justify-center mx-auto mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium text-forest-ink">
              {search ? "No matching products found" : "No products yet"}
            </h3>
            <p className="text-xs text-graphite mt-1 max-w-xs mx-auto">
              {search
                ? `No products matched "${search}". Try searching by another keyword.`
                : "Get started by creating your first product in the inventory."}
            </p>
            {!search && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="mt-4 btn-secondary"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Add First Product</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline-gray bg-linen/30 text-xs text-graphite uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium text-right">Quantity</th>
                  <th className="py-3 px-4 font-medium">Stock Status</th>
                  <th className="py-3 px-4 font-medium text-right">Selling Price</th>
                  <th className="py-3 px-4 font-medium text-right">Alert Threshold</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-gray">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      <div>
                        <span>{p.name}</span>
                        {p.description && (
                          <p className="text-xs text-graphite truncate max-w-xs font-normal">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-forest-ink font-medium">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-charcoal">
                      {p.quantityOnHand}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isOutOfStock ? (
                        <span className="sc-badge bg-danger-100 text-danger-700 border border-danger-200">
                          Out of Stock
                        </span>
                      ) : p.isLowStock ? (
                        <span className="sc-badge bg-warning-100 text-warning-700 border border-warning-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="sc-badge bg-linen text-forest-ink border border-sage-wash/60">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-graphite">
                      {p.sellingPrice !== null ? `$${p.sellingPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-graphite">
                      {p.lowStockThreshold !== null ? (
                        <span>{p.lowStockThreshold} units</span>
                      ) : (
                        <span className="text-graphite/70" title="Using organization default">
                          {defaultThreshold} (default)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setAdjustingProduct(p);
                            setIsAdjustOpen(true);
                          }}
                          title="Quick stock adjustment (+/-)"
                          className="btn-ghost text-forest-ink"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                          <span>Adjust</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          title="Edit product"
                          className="btn-ghost"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingProduct(p);
                            setIsDeleteOpen(true);
                          }}
                          title="Delete product"
                          className="btn-ghost text-danger-700 hover:bg-danger-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        defaultThreshold={defaultThreshold}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
      />

      <StockAdjustModal
        product={adjustingProduct}
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false);
          setAdjustingProduct(null);
        }}
        onSuccess={fetchProducts}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        productName={deletingProduct?.name || ""}
        sku={deletingProduct?.sku || ""}
        loading={deleteLoading}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-graphite text-sm">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
