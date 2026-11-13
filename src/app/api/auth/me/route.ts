import { NextResponse } from "next/server";
import { getCurrentUser, createSessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ authenticated: true, user });

    // Set cookie so any subsequent client requests are automatically authenticated
    response.cookies.set("lifesync_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Auth me error:", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}

