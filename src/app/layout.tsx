import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockFlow | SaaS Inventory Management",
  description: "Minimal multi-tenant SaaS inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-linen-white text-true-black">
        {children}
      </body>
    </html>
  );
}

