import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validation";

describe("Authentication & Security", () => {
  it("hashes password and verifies successfully", async () => {
    const raw = "SecurePassword123!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(await verifyPassword(raw, hashed)).toBe(true);
    expect(await verifyPassword("WrongPassword", hashed)).toBe(false);
  });

  it("signs and verifies JWT session tokens", async () => {
    const payload = {
      userId: "user_123",
      organizationId: "org_456",
      email: "test@example.com",
      role: "OWNER",
    };

    const token = await signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.organizationId).toBe(payload.organizationId);
    expect(decoded?.email).toBe(payload.email);
  });

  it("validates signup inputs with Zod", () => {
    const valid = signupSchema.safeParse({
      organizationName: "Test Org",
      email: "valid@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(valid.success).toBe(true);

    const mismatch = signupSchema.safeParse({
      organizationName: "Test Org",
      email: "valid@example.com",
      password: "password123",
      confirmPassword: "password999",
    });
    expect(mismatch.success).toBe(false);

    const badEmail = signupSchema.safeParse({
      organizationName: "Test Org",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(badEmail.success).toBe(false);
  });
});

