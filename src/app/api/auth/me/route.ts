import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            defaultLowStockThreshold: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organization: user.organization,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

