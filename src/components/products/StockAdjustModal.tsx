"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  quantityOnHand: number;
}

interface StockAdjustModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockAdjustModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustModalProps) {
  const [deltaStr, setDeltaStr] = useState<string>("5");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const delta = parseInt(deltaStr, 10) || 0;
  const resultantStock = product.quantityOnHand + delta;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (delta === 0) {
      setError("Please enter a non-zero adjustment (+/- units)");
      return;
    }

    if (resultantStock < 0) {
      setError(`Cannot reduce stock below 0. Current stock is ${product.quantityOnHand}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, note: note.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to adjust stock");
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-linen-white rounded-cards max-w-md w-full p-6 shadow-sm border border-hairline-gray">
        <div className="flex items-center justify-between pb-4 border-b border-hairline-gray">
          <div>
            <h3 className="text-lg font-medium text-forest-ink">Adjust Stock</h3>
            <p className="text-xs text-graphite">
              {product.name} ({product.sku})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-nav text-graphite hover:text-forest-ink hover:bg-slate-100 transition"
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

        <form onSubmit={handleAdjust} className="mt-5 space-y-4">
          <div className="bg-linen/60 p-4 rounded-cards border border-sage-wash/40 flex items-center justify-between text-center">
            <div>
              <p className="text-xs text-graphite font-medium">Current Stock</p>
              <p className="text-xl font-bold text-forest-ink">{product.quantityOnHand}</p>
            </div>
            <div className="text-forest-ink/60 font-bold text-lg">→</div>
            <div>
              <p className="text-xs text-graphite font-medium">New Stock</p>
              <p
                className={`text-xl font-bold ${
                  resultantStock < 0
                    ? "text-danger-700"
                    : resultantStock === 0
                    ? "text-warning-700"
                    : "text-forest-ink"
                }`}
              >
                {resultantStock}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-ink">
              Quantity Adjustment (+/- units)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                required
                value={deltaStr}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[-+]?[0-9]*$/.test(val)) {
                    setDeltaStr(val);
                  }
                }}
                placeholder="+10 or -5"
                className="block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal font-medium"
              />
            </div>
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {[-10, -5, -1, 1, 5, 10, 25].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDeltaStr(val > 0 ? `+${val}` : `${val}`)}
                  className="px-2.5 py-1 text-xs font-medium rounded-nav bg-linen hover:bg-sage-wash/40 text-forest-ink border border-sage-wash/60 transition cursor-pointer"
                >
                  {val > 0 ? `+${val}` : val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-ink">
              Note / Reason (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Restock shipment, damaged unit, return"
              className="mt-1 block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
            />
          </div>

          <div className="pt-3 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || resultantStock < 0 || delta === 0}
              className="btn-primary"
            >
              {loading ? "Updating..." : "Confirm Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

