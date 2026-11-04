import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";

describe("Inventory, Stock Adjustment & Threshold Calculations", () => {
  let orgId: string;
  let prod1Id: string;
  let prod2Id: string;

  beforeAll(async () => {
    const org = await prisma.organization.create({
      data: {
        name: "Inventory Test Org",
        defaultLowStockThreshold: 8,
        users: {
          create: {
            email: `inventory_${Date.now()}@test.com`,
            passwordHash: "hash123",
          },
        },
      },
    });
    orgId = org.id;

    // Product 1: explicit threshold 5
    const p1 = await prisma.product.create({
      data: {
        organizationId: orgId,
        name: "Test Keyboard",
        sku: "TEST-KB-01",
        quantityOnHand: 10,
        lowStockThreshold: 5,
        sellingPrice: 50.0,
      },
    });
    prod1Id = p1.id;

    // Product 2: null threshold (should fallback to org default: 8)
    const p2 = await prisma.product.create({
      data: {
        organizationId: orgId,
        name: "Test Mouse",
        sku: "TEST-MS-01",
        quantityOnHand: 8,
        lowStockThreshold: null,
        sellingPrice: 25.0,
      },
    });
    prod2Id = p2.id;
  });

  afterAll(async () => {
    await prisma.organization.delete({
      where: { id: orgId },
    });
  });

  it("adjusts stock by +5 units atomically and creates a stock log", async () => {
    const delta = 5;
    const initial = await prisma.product.findUnique({ where: { id: prod1Id } });
    const expected = (initial?.quantityOnHand || 0) + delta;

    const [updated, log] = await prisma.$transaction([
      prisma.product.update({
        where: { id: prod1Id },
        data: { quantityOnHand: { increment: delta } },
      }),
      prisma.stockLog.create({
        data: {
          organizationId: orgId,
          productId: prod1Id,
          delta,
          quantityAfter: expected,
          note: "Restock test",
        },
      }),
    ]);

    expect(updated.quantityOnHand).toBe(15);
    expect(log.delta).toBe(5);
    expect(log.quantityAfter).toBe(15);
  });

  it("adjusts stock by -12 units atomically", async () => {
    const delta = -12;
    const initial = await prisma.product.findUnique({ where: { id: prod1Id } });
    const expected = (initial?.quantityOnHand || 0) + delta;

    const [updated] = await prisma.$transaction([
      prisma.product.update({
        where: { id: prod1Id },
        data: { quantityOnHand: { increment: delta } },
      }),
      prisma.stockLog.create({
        data: {
          organizationId: orgId,
          productId: prod1Id,
          delta,
          quantityAfter: expected,
        },
      }),
    ]);

    expect(updated.quantityOnHand).toBe(3);
  });

  it("evaluates low-stock status using custom threshold (3 <= 5 -> LOW STOCK)", async () => {
    const p1 = await prisma.product.findUnique({ where: { id: prod1Id } });
    expect(p1?.quantityOnHand).toBe(3);
    expect(p1?.lowStockThreshold).toBe(5);

    const isLowStock = (p1?.quantityOnHand || 0) <= (p1?.lowStockThreshold || 0);
    expect(isLowStock).toBe(true);
  });

  it("evaluates low-stock status using organization fallback default (8 <= 8 -> LOW STOCK)", async () => {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const p2 = await prisma.product.findUnique({ where: { id: prod2Id } });

    expect(p2?.lowStockThreshold).toBeNull();
    const effectiveThreshold = p2?.lowStockThreshold ?? org?.defaultLowStockThreshold ?? 5;
    expect(effectiveThreshold).toBe(8);

    const isLowStock = (p2?.quantityOnHand || 0) <= effectiveThreshold;
    expect(isLowStock).toBe(true);
  });

  it("correctly calculates aggregate dashboard metrics", async () => {
    const products = await prisma.product.findMany({ where: { organizationId: orgId } });
    const totalProducts = products.length;
    const totalUnitsOnHand = products.reduce((acc, p) => acc + p.quantityOnHand, 0);

    expect(totalProducts).toBe(2);
    expect(totalUnitsOnHand).toBe(11);
  });
});

