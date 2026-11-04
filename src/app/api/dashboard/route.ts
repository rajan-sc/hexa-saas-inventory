import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true, defaultLowStockThreshold: true },
    });

    const defaultThreshold = org?.defaultLowStockThreshold ?? 5;

    // Fetch all products for the tenant
    const products = await prisma.product.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { updatedAt: "desc" },
    });

    // Compute metrics
    const totalProducts = products.length;
    const totalUnitsOnHand = products.reduce((sum, p) => sum + p.quantityOnHand, 0);

    // Identify low-stock items
    const lowStockItems = products
      .filter((p) => {
        const threshold = p.lowStockThreshold ?? defaultThreshold;
        return p.quantityOnHand <= threshold;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        quantityOnHand: p.quantityOnHand,
        lowStockThreshold: p.lowStockThreshold ?? defaultThreshold,
        effectiveThreshold: p.lowStockThreshold ?? defaultThreshold,
        isOutOfStock: p.quantityOnHand === 0,
        sellingPrice: p.sellingPrice,
      }));

    return NextResponse.json({
      organizationName: org?.name || "Your Organization",
      totalProducts,
      totalUnitsOnHand,
      lowStockCount: lowStockItems.length,
      defaultLowStockThreshold: defaultThreshold,
      lowStockItems,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

