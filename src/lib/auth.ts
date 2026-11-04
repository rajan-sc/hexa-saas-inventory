import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "stockflow-super-secret-key-change-in-production-123456789";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = "stockflow_session";

export interface SessionPayload {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}

/**
 * Hash a plain password using bcrypt (10 salt rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a plain password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token with the session payload
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      organizationId: payload.organizationId as string,
      email: payload.email as string,
      role: (payload.role as string) || "OWNER",
    };
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies the session from the incoming Request.
 * Supports both HTTP-only Cookies and Authorization: Bearer <token> headers.
 */
export async function getSessionUser(req: Request): Promise<SessionPayload | null> {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    return verifyToken(token);
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookiesList = cookieHeader.split(";").map((c) => c.trim());
    const sessionCookie = cookiesList.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (sessionCookie) {
      const token = sessionCookie.split("=")[1];
      return verifyToken(token);
    }
  }

  return null;
}

/**
 * Helper for API routes to require authentication.
 * Returns the session payload or throws a 401 error response.
 */
export async function requireAuth(req: Request): Promise<SessionPayload> {
  const session = await getSessionUser(req);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

