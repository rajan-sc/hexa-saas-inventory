"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linen-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-cards bg-forest-ink items-center justify-center text-linen-white mb-3">
          <Package className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-light text-forest-ink">
          Sign in to StockFlow
        </h1>
        <p className="mt-1 text-sm text-graphite">
          Access your multi-tenant inventory workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="sc-card sm:px-10">
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-buttons bg-danger-50 text-danger-700 text-sm border border-danger-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Email address
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-graphite/60">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@acme.com"
                  className="block w-full pl-9 pr-3 py-2.5 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-forest-ink uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-graphite/60">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 border border-hairline-gray rounded-buttons text-sm bg-white focus:outline-none focus:border-forest-ink text-charcoal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-hairline-gray text-center">
            <p className="text-xs text-graphite">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-forest-ink hover:underline">
                Create an organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

