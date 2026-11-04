"use client";

import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productName: string;
  sku: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  productName,
  sku,
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-linen-white rounded-cards max-w-sm w-full p-6 shadow-sm border border-hairline-gray">
        <div className="flex items-center justify-between pb-3 border-b border-hairline-gray">
          <div className="flex items-center gap-2 text-danger-700">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-base font-medium">Delete Product</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-nav text-graphite hover:text-charcoal hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-charcoal">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-forest-ink">{productName}</span> ({sku})?
          </p>
          <p className="text-xs text-graphite mt-1.5">
            This action cannot be undone. All associated inventory logs will be permanently deleted.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center bg-danger-700 text-white rounded-buttons px-4 py-2 text-sm font-medium hover:bg-danger-800 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

