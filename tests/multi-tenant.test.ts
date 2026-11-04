import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";

describe("Multi-Tenancy Isolation", () => {
  let orgAId: string;
  let orgBId: string;
  let prodAId: string;

  beforeAll(async () => {
    // Create Tenant A
    const orgA = await prisma.organization.create({
      data: {
        name: "Test Tenant Alpha",
        defaultLowStockThreshold: 5,
        users: {
          create: {
            email: `alpha_${Date.now()}@test.com`,
            passwordHash: "hash123",
          },
        },
      },
    });
    orgAId = orgA.id;

    // Create Tenant B
    const orgB = await prisma.organization.create({
      data: {
        name: "Test Tenant Beta",
        defaultLowStockThreshold: 10,
        users: {
          create: {
            email: `beta_${Date.now()}@test.com`,
            passwordHash: "hash123",
          },
        },
      },
    });
    orgBId = orgB.id;
  });

  afterAll(async () => {
    await prisma.organization.deleteMany({
      where: { id: { in: [orgAId, orgBId] } },
    });
  });

  it("allows Tenant A to create a product with SKU 'SKU-MULTI-01'", async () => {
    const prodA = await prisma.product.create({
      data: {
        organizationId: orgAId,
        name: "Alpha Widget",
        sku: "SKU-MULTI-01",
        quantityOnHand: 25,
      },
    });
    prodAId = prodA.id;

    expect(prodA.id).toBeDefined();
    expect(prodA.organizationId).toBe(orgAId);
  });

  it("prevents Tenant A from creating a duplicate SKU 'SKU-MULTI-01'", async () => {
    await expect(
      prisma.product.create({
        data: {
          organizationId: orgAId,
          name: "Alpha Widget Duplicate",
          sku: "SKU-MULTI-01",
          quantityOnHand: 10,
        },
      })
    ).rejects.toThrow();
  });

  it("allows Tenant B to use the exact same SKU 'SKU-MULTI-01' without conflict", async () => {
    const prodB = await prisma.product.create({
      data: {
        organizationId: orgBId,
        name: "Beta Gadget with Same SKU",
        sku: "SKU-MULTI-01", // Exact same SKU
        quantityOnHand: 100,
      },
    });

    expect(prodB.id).toBeDefined();
    expect(prodB.organizationId).toBe(orgBId);
    expect(prodB.sku).toBe("SKU-MULTI-01");
  });

  it("guarantees Tenant B's product queries NEVER leak Tenant A's products", async () => {
    const betaProducts = await prisma.product.findMany({
      where: { organizationId: orgBId },
    });

    expect(betaProducts.length).toBe(1);
    expect(betaProducts[0].name).toBe("Beta Gadget with Same SKU");

    const leaked = betaProducts.find((p) => p.id === prodAId);
    expect(leaked).toBeUndefined();
  });

  it("prevents Tenant B from modifying or deleting Tenant A's product", async () => {
    const updated = await prisma.product.updateMany({
      where: {
        id: prodAId,
        organizationId: orgBId, // Cross-tenant boundary check
      },
      data: {
        name: "Hacked by Tenant B",
      },
    });

    expect(updated.count).toBe(0);

    const untouched = await prisma.product.findUnique({
      where: { id: prodAId },
    });
    expect(untouched?.name).toBe("Alpha Widget");
  });
});

