import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing tables in correct order
  await prisma.stockLog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Organization A: Acme Wholesale
  const acme = await prisma.organization.create({
    data: {
      name: "Acme Wholesale",
      defaultLowStockThreshold: 5,
      users: {
        create: {
          email: "owner@acme.com",
          passwordHash,
          role: "OWNER",
        },
      },
      products: {
        create: [
          {
            name: "Wireless Mechanical Keyboard",
            sku: "KB-001",
            description: "RGB backlit mechanical keyboard with tactile switches",
            quantityOnHand: 3,
            costPrice: 45.0,
            sellingPrice: 89.99,
            lowStockThreshold: 5, // 3 <= 5 -> LOW STOCK
          },
          {
            name: "Ergonomic Vertical Mouse",
            sku: "MS-001",
            description: "Wireless vertical mouse to reduce wrist strain",
            quantityOnHand: 24,
            costPrice: 20.0,
            sellingPrice: 44.99,
            lowStockThreshold: 5, // 24 > 5 -> IN STOCK
          },
          {
            name: "USB-C Braided Cable 2m",
            sku: "CB-001",
            description: "High durability 100W PD charging cable",
            quantityOnHand: 2,
            costPrice: 3.5,
            sellingPrice: 12.0,
            lowStockThreshold: null, // null falls back to org default 5 -> 2 <= 5 -> LOW STOCK
          },
          {
            name: "Noise-Cancelling Headphones",
            sku: "HP-001",
            description: "Active noise cancelling over-ear headphones",
            quantityOnHand: 0,
            costPrice: 80.0,
            sellingPrice: 149.99,
            lowStockThreshold: 4, // 0 <= 4 -> OUT OF STOCK
          },
          {
            name: "Dual-Monitor Desk Arm",
            sku: "MN-001",
            description: "Heavy duty gas-spring dual arm mount",
            quantityOnHand: 15,
            costPrice: 35.0,
            sellingPrice: 79.5,
            lowStockThreshold: 3, // 15 > 3 -> IN STOCK
          },
        ],
      },
    },
    include: {
      users: true,
      products: true,
    },
  });

  // 2. Create Organization B: Beta Electronics (Demonstrating multi-tenant SKU reuse)
  const beta = await prisma.organization.create({
    data: {
      name: "Beta Electronics",
      defaultLowStockThreshold: 10,
      users: {
        create: {
          email: "seller@beta.com",
          passwordHash,
          role: "OWNER",
        },
      },
      products: {
        create: [
          {
            name: "Beta Brand Mechanical Keyboard",
            sku: "KB-001", // Exact same SKU as Acme! Proves multi-tenancy isolation.
            description: "Beta custom keyboard",
            quantityOnHand: 50,
            costPrice: 40.0,
            sellingPrice: 75.0,
            lowStockThreshold: 10,
          },
        ],
      },
    },
    include: {
      users: true,
      products: true,
    },
  });

  console.log(`✅ Seeded Organizations:
  - ${acme.name} (${acme.users[0].email}) with ${acme.products.length} products
  - ${beta.name} (${beta.users[0].email}) with ${beta.products.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

