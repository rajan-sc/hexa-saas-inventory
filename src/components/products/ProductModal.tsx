"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

export interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  description?: string | null;
  quantityOnHand: number;
  costPrice?: number | null;
  sellingPrice?: number | null;
  lowStockThreshold?: number | null;
}

interface ProductModalProps {
  isOpen: boolean;
  product?: ProductFormData | null;
  defaultThreshold: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductModal({
  isOpen,
  product,
  defaultThreshold,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const isEditing = Boolean(product?.id);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [quantityOnHand, setQuantityOnHand] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [lowStockThreshold, setLowStockThreshold] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSku(product.sku || "");
      setDescription(product.description || "");
      setQuantityOnHand(product.quantityOnHand ?? 0);
      setCostPrice(product.costPrice !== null && product.costPrice !== undefined ? String(product.costPrice) : "");
      setSellingPrice(product.sellingPrice !== null && product.sellingPrice !== undefined ? String(product.sellingPrice) : "");
      setLowStockThreshold(
        product.lowStockThreshold !== null && product.lowStockThreshold !== undefined
          ? String(product.lowStockThreshold)
          : ""
      );
    } else {
      setName("");
      setSku("");
      setDescription("");
      setQuantityOnHand(0);
      setCostPrice("");
      setSellingPrice("");
      setLowStockThreshold("");
    }
    setError("");
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description: description.trim() || null,
      quantityOnHand: Number(quantityOnHand) || 0,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
      lowStockThreshold: lowStockThreshold !== "" ? parseInt(lowStockThreshold, 10) : null,
    };

    try {
      const url = isEditing ? `/api/products/${product?.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save product");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-linen-white rounded-cards max-w-lg w-full p-6 shadow-sm border border-hairline-gray max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-hairline-gray">
          <div>
            <h3 className="text-lg font-medium text-forest-ink">
              {isEditing ? "Edit Product" : "Create New Product"}
            </h3>
            <p className="text-xs text-graphite">
              {isEditing ? "Update product specifications and stock" : "Add a new item to your organization's inventory"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-nav text-graphite hover:text-forest-ink hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-buttons bg-danger-50 text-danger-700 text-sm border border-danger-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wireless Ergonomic Mouse"
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                SKU (Stock Keeping Unit) *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. MS-ERGO-01"
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm font-mono uppercase bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
              <span className="text-[11px] text-graphite mt-0.5 block">Unique per organization</span>
            </div>

            {/* Quantity on Hand */}
            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Quantity on Hand *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(parseInt(e.target.value, 10) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Selling Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>

            {/* Low Stock Threshold */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder={`Leave blank to use organization default (${defaultThreshold})`}
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
              <span className="text-[11px] text-graphite mt-0.5 block">
                Triggers warning when stock &le; threshold. If empty, uses {defaultThreshold}.
              </span>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or supplier details..."
                className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-hairline-gray">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

