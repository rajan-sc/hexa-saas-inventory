import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { stockAdjustSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = stockAdjustSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { delta, note } = parsed.data;

    // Use Prisma transaction for ACID isolation & concurrency safety
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch product strictly scoped to this organization
      const product = await tx.product.findFirst({
        where: {
          id,
          organizationId: session.organizationId,
        },
      });

      if (!product) {
        throw new Error("NOT_FOUND");
      }

      const newQuantity = product.quantityOnHand + delta;

      // Prevent negative stock
      if (newQuantity < 0) {
        throw new Error("NEGATIVE_STOCK");
      }

      // 2. Update product quantity
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          quantityOnHand: newQuantity,
        },
      });

      // 3. Create audit trail in stock_logs
      const log = await tx.stockLog.create({
        data: {
          organizationId: session.organizationId,
          productId: product.id,
          delta,
          quantityAfter: newQuantity,
          note: note || (delta > 0 ? `Restocked +${delta} units` : `Removed ${Math.abs(delta)} units`),
          createdByUserId: session.userId,
        },
      });

      return { product: updatedProduct, log };
    });

    return NextResponse.json({
      success: true,
      product: result.product,
      log: result.log,
    });
  } catch (error: any) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (error.message === "NEGATIVE_STOCK") {
      return NextResponse.json(
        { error: "Cannot deduct more units than currently on hand." },
        { status: 400 }
      );
    }

    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
  }
}

