# StockFlow SaaS – Multi-Tenant Inventory Management System

A production-ready, multi-tenant SaaS inventory management system designed for small to medium enterprises. Built with a modern fullstack architecture using **Next.js 15 (App Router)**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, and **JWT Authentication**.

---

## Key Features

- **Strict Multi-Tenancy**: Complete tenant data isolation. All products, stock logs, and metrics are strictly scoped by Organization ID.
- **Organization-Scoped SKU Uniqueness**: Enforces compound unique constraints `UNIQUE(organizationId, sku)`. Different organizations can safely utilize identical SKUs (e.g. `ITEM-001`) without collisions.
- **Product Management (CRUD)**: Create, search, view, edit, and delete products (Name, SKU, Quantity on Hand, Cost Price, Selling Price, Low Stock Threshold, Description).
- **Fast Real-Time Search**: Instant filtering across the product catalog by SKU or product name.
- **Inline Quick Stock Adjustment**: Atomically adjust stock (+/- units) with audit reason logging and race-condition prevention.
- **Dashboard Overview**: Summary KPI cards (Total Products, Total Units in Stock, Low Stock Items count) and an interactive Low-Stock Alert table.
- **Configurable Global Thresholds**: Organization-level default low-stock threshold that automatically applies to products without custom thresholds.
- **Secure Authentication**: Password hashing with `bcryptjs` and session tokens managed via secure `HttpOnly` cookies.

---

## Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router) with React 19 & TypeScript
- **Database & ORM**: Prisma ORM with Relational Database (SQLite for development & test suites, PostgreSQL/MySQL compatible for production)
- **Styling**: Tailwind CSS & Lucide React
- **Validation**: Zod runtime schema validation
- **Testing**: Vitest automated test suite covering multi-tenant isolation, SKU constraints, and inventory math

---

## Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd hexa-saas
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Sync Database & Seed Demo Data
```bash
# Push schema to database
npm run db:push

# Seed demo organizations & products
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```

---

## Demo Accounts (Pre-Seeded)

| Organization | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Acme Wholesale** | `owner@acme.com` | `password123` | Owner | 5 sample products with low-stock alerts |
| **Beta Electronics** | `seller@beta.com` | `password123` | Owner | Uses overlapping SKUs to demonstrate multi-tenant isolation |
