"use client";

import { useState, useEffect } from "react";
import { Settings, Check, AlertCircle, Building, ShieldCheck } from "lucide-react";

interface OrgSettings {
  id: string;
  name: string;
  defaultLowStockThreshold: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [threshold, setThreshold] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.organization);
          setThreshold(data.organization.defaultLowStockThreshold ?? 5);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultLowStockThreshold: Number(threshold) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update settings");
        setSaving(false);
        return;
      }

      setSettings(data.organization);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-hairline-gray/60 rounded-nav" />
        <div className="h-64 bg-white rounded-cards border border-hairline-gray" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-normal text-forest-ink">Organization Settings</h1>
        <p className="text-sm text-graphite mt-1">
          Configure default thresholds and organization-wide inventory rules
        </p>
      </div>

      <div className="sc-card">
        {/* Organization Info */}
        <div className="pb-6 border-b border-hairline-gray">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-nav bg-linen text-forest-ink flex items-center justify-center border border-sage-wash/60">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-medium text-forest-ink">
                {settings?.name || "Your Organization"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-graphite">
                <ShieldCheck className="h-3.5 w-3.5 text-success-700" />
                <span>Multi-tenant isolated workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback banners */}
        {success && (
          <div className="mt-5 flex items-center gap-2 p-3 rounded-buttons bg-success-50 text-success-700 text-sm border border-success-100 animate-in fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>Settings saved successfully! Low-stock status has been updated.</span>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-center gap-2 p-3 rounded-buttons bg-danger-50 text-danger-700 text-sm border border-danger-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-forest-ink">
              Default Low Stock Alert Threshold
            </label>
            <p className="text-xs text-graphite mt-0.5">
              When a product does not specify its own custom low-stock threshold, this default
              number of units is used across your Dashboard and Product Catalog.
            </p>
            <div className="mt-2 max-w-xs">
              <input
                type="number"
                min="0"
                max="10000"
                required
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)}
                className="block w-full px-3 py-2 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-hairline-gray flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

