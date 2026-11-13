import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "lifesync-super-secret-key-2026-production-token"
);

export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export async function createSessionToken(payload: TokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(request?: Request) {
  let token: string | undefined;

  // Check Authorization header first if request is provided
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // If no auth header, read from next/headers cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("lifesync_token")?.value;
    } catch {
      // cookies() might fail outside Next.js request context
    }
  }

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          profile: true,
        },
      });

      if (user) {
        // Don't expose password hash
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...safeUser } = user;
        return safeUser;
      }
    }
  }

  return null;
}

export async function getCurrentUser(request?: Request) {
  const authedUser = await getAuthenticatedUser(request);
  if (authedUser) {
    return authedUser;
  }

  // PUBLIC ACCESS ("FOR ALL"):
  // Gracefully fall back to demo operative user so public visitors immediately access the full platform
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@lifesync.app" },
    include: {
      profile: true,
    },
  });

  if (demoUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = demoUser;
    return safeUser;
  }

  return null;
}
