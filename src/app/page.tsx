import Link from "next/link";
import { Package, ArrowRight, ShieldCheck, Layers, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linen-white flex flex-col justify-between p-6 sm:p-12">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-forest-ink font-semibold text-lg">
          <div className="h-8 w-8 rounded-nav bg-forest-ink flex items-center justify-center text-linen-white">
            <Package className="h-5 w-5" />
          </div>
          <span>StockFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto text-center py-16 sm:py-24 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badges bg-linen text-forest-ink text-xs font-medium border border-sage-wash/60">
          <ShieldCheck className="h-4 w-4" />
          <span>Multi-Tenant Architecture &bull; Strict Tenant Isolation</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-light text-forest-ink tracking-tight">
          Modern Inventory Management, Built for Clarity
        </h1>

        <p className="text-base sm:text-lg text-graphite max-w-xl mx-auto font-normal">
          Track stock levels, prevent inventory stockouts with intelligent thresholds, and manage
          catalog SKUs with complete tenant security.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="btn-primary text-base px-6 py-3">
            <span>Start Free Workspace</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Sign In to Existing Store
          </Link>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 w-full">
        <div className="sc-card">
          <div className="h-9 w-9 rounded-nav bg-linen text-forest-ink flex items-center justify-center mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-medium text-forest-ink">Multi-Tenant Isolation</h2>
          <p className="text-xs text-graphite mt-1">
            Data and SKUs are strictly scoped by Organization. Zero cross-tenant data leaks.
          </p>
        </div>

        <div className="sc-card">
          <div className="h-9 w-9 rounded-nav bg-linen text-forest-ink flex items-center justify-center mb-3">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-base font-medium text-forest-ink">Atomic Stock Adjustments</h2>
          <p className="text-xs text-graphite mt-1">
            ACID-compliant stock increment/decrement with complete audit logging and concurrency safety.
          </p>
        </div>

        <div className="sc-card">
          <div className="h-9 w-9 rounded-nav bg-linen text-forest-ink flex items-center justify-center mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-medium text-forest-ink">Smart Low-Stock Alerts</h2>
          <p className="text-xs text-graphite mt-1">
            Product-level and organization-wide default thresholds trigger proactive replenishment warnings.
          </p>
        </div>
      </div>
    </main>
  );
}

