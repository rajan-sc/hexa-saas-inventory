import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { productCreateSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    // Fetch org's default threshold
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const defaultThreshold = org?.defaultLowStockThreshold ?? 5;

    // Build filter scoped strictly to user's organization
    const whereClause: any = {
      organizationId: session.organizationId,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
    });

    // Annotate products with low-stock status
    const formattedProducts = products.map((p) => {
      const effectiveThreshold = p.lowStockThreshold ?? defaultThreshold;
      return {
        ...p,
        effectiveThreshold,
        isLowStock: p.quantityOnHand <= effectiveThreshold,
        isOutOfStock: p.quantityOnHand === 0,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      defaultLowStockThreshold: defaultThreshold,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } =
      parsed.data;

    // Check SKU uniqueness per organization
    const existing = await prisma.product.findUnique({
      where: {
        organizationId_sku: {
          organizationId: session.organizationId,
          sku,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A product with SKU "${sku}" already exists in your organization.` },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        organizationId: session.organizationId,
        name,
        sku,
        description: description || null,
        quantityOnHand,
        costPrice: costPrice ?? null,
        sellingPrice: sellingPrice ?? null,
        lowStockThreshold: lowStockThreshold ?? null,
      },
    });

    // If initial quantity > 0, log initial stock entry
    if (quantityOnHand > 0) {
      await prisma.stockLog.create({
        data: {
          organizationId: session.organizationId,
          productId: product.id,
          delta: quantityOnHand,
          quantityAfter: quantityOnHand,
          note: "Initial stock upon creation",
          createdByUserId: session.userId,
        },
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

