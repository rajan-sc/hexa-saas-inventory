import { z } from "zod";

export const signupSchema = z
  .object({
    organizationName: z
      .string()
      .min(2, "Organization name must be at least 2 characters")
      .max(100, "Organization name cannot exceed 100 characters"),
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(150),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50)
    .transform((val) => val.trim().toUpperCase()),
  description: z.string().max(500).optional().nullable(),
  quantityOnHand: z.coerce.number().int().min(0, "Quantity must be 0 or greater").default(0),
  costPrice: z.coerce.number().min(0, "Cost price must be positive").optional().nullable(),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive").optional().nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).optional().nullable(),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, "Product name is required").max(150).optional(),
  sku: z
    .string()
    .min(1, "SKU is required")
    .max(50)
    .transform((val) => val.trim().toUpperCase())
    .optional(),
  description: z.string().max(500).optional().nullable(),
  quantityOnHand: z.coerce.number().int().min(0, "Quantity must be 0 or greater").optional(),
  costPrice: z.coerce.number().min(0, "Cost price must be positive").optional().nullable(),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive").optional().nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).optional().nullable(),
});

export const stockAdjustSchema = z.object({
  delta: z
    .coerce
    .number()
    .int()
    .refine((val) => val !== 0, "Adjustment cannot be 0 (enter +N to add or -N to deduct)"),
  note: z.string().max(255).optional().nullable(),
});

export const settingsSchema = z.object({
  defaultLowStockThreshold: z.coerce
    .number()
    .int()
    .min(0, "Threshold must be 0 or greater")
    .max(10000, "Threshold too large"),
});

