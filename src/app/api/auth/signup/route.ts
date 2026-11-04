import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, signToken, COOKIE_NAME } from "@/lib/auth";
import { signupSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, organizationName } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create Organization and User in an atomic transaction
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        defaultLowStockThreshold: 5,
        users: {
          create: {
            email: email.toLowerCase(),
            passwordHash,
            role: "OWNER",
          },
        },
      },
      include: {
        users: true,
      },
    });

    const user = organization.users[0];

    // Issue JWT session token
    const token = await signToken({
      userId: user.id,
      organizationId: organization.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, role: user.role },
        organization: { id: organization.id, name: organization.name },
      },
      { status: 201 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

