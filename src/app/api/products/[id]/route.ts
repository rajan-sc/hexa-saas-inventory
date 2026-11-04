import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { productUpdateSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
      include: {
        stockLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            createdByUser: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { defaultLowStockThreshold: true },
    });
    const defaultThreshold = org?.defaultLowStockThreshold ?? 5;
    const effectiveThreshold = product.lowStockThreshold ?? defaultThreshold;

    return NextResponse.json({
      product: {
        ...product,
        effectiveThreshold,
        isLowStock: product.quantityOnHand <= effectiveThreshold,
        isOutOfStock: product.quantityOnHand === 0,
      },
    });
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify product exists and belongs to this tenant
    const existing = await prisma.product.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = parsed.data;

    // If SKU is being modified, check collision within tenant
    if (data.sku && data.sku !== existing.sku) {
      const skuCollision = await prisma.product.findUnique({
        where: {
          organizationId_sku: {
            organizationId: session.organizationId,
            sku: data.sku,
          },
        },
      });

      if (skuCollision) {
        return NextResponse.json(
          { error: `A product with SKU "${data.sku}" already exists in your organization.` },
          { status: 409 }
        );
      }
    }

    const oldQty = existing.quantityOnHand;
    const newQty = data.quantityOnHand !== undefined ? data.quantityOnHand : oldQty;
    const qtyDelta = newQty - oldQty;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          ...data,
        },
      });

      if (qtyDelta !== 0) {
        await tx.stockLog.create({
          data: {
            organizationId: session.organizationId,
            productId: p.id,
            delta: qtyDelta,
            quantityAfter: newQty,
            note: "Quantity edited via product edit form",
            createdByUserId: session.userId,
          },
        });
      }

      return p;
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.product.findFirst({
      where: {
        id,
        organizationId: session.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

