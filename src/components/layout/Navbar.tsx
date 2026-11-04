"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Package, LayoutDashboard, Settings, LogOut, Store } from "lucide-react";

interface UserOrg {
  user: { email: string; role: string };
  organization: { id: string; name: string };
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<UserOrg | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline-gray bg-linen-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Organization */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-medium text-lg text-forest-ink">
            <div className="h-8 w-8 rounded-nav bg-forest-ink flex items-center justify-center text-linen-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">StockFlow</span>
          </Link>

          {data?.organization && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-badges bg-linen text-xs font-medium text-forest-ink border border-sage-wash/60">
              <Store className="h-3.5 w-3.5 text-forest-ink/70" />
              <span>{data.organization.name}</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-nav text-sm font-medium transition ${
                  isActive
                    ? "bg-linen text-forest-ink border border-sage-wash/60"
                    : "text-graphite hover:text-forest-ink hover:bg-slate-100/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-forest-ink" : "text-graphite/70"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & Logout */}
        <div className="flex items-center gap-3">
          {data?.user && (
            <div className="hidden md:flex items-center gap-2 text-xs text-graphite">
              <div className="h-7 w-7 rounded-badges bg-mint-veil flex items-center justify-center text-forest-ink font-medium">
                {data.user.email.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-charcoal">{data.user.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-nav text-xs font-medium text-graphite hover:text-danger-700 hover:bg-danger-50 border border-hairline-gray transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

