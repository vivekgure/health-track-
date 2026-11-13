import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, createSessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "signin"; // signin or link

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    if (!clientId) {
      // If client credentials are not configured in environment, return config status
      return NextResponse.json({
        configured: false,
        message: "Google OAuth Client ID not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        fallbackAvailable: true,
      });
    }

    // Google OAuth 2.0 authorization URL
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");
    googleAuthUrl.searchParams.set("state", action);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Google Auth initiation error:", error);
    return NextResponse.json({ error: "Failed to initiate Google authentication" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, googleId, avatar, action } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid Google account email is required" }, { status: 400 });
    }

    const effectiveGoogleId = googleId || `google_${Buffer.from(email).toString("hex").slice(0, 16)}`;
    const effectiveName = name || email.split("@")[0];
    const effectiveAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(effectiveName)}`;

    // 1. LINKING: If action is 'link'
    if (action === "link") {
      const currentUser = await getCurrentUser(request);
      if (!currentUser) {
        return NextResponse.json({ error: "You must be signed in to link a Google account" }, { status: 401 });
      }

      // Check if this Google account is already linked to another user
      const existingLink = await prisma.user.findFirst({
        where: {
          googleId: effectiveGoogleId,
          NOT: { id: currentUser.id },
        },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: `This Google account is already linked to user ${existingLink.email}` },
          { status: 409 }
        );
      }

      // Link to current user
      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          googleId: effectiveGoogleId,
          googleEmail: email,
          avatar: currentUser.avatar || effectiveAvatar,
        },
        include: { profile: true },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully linked Google account (${email}) to ${updatedUser.name}`,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          googleId: updatedUser.googleId,
          googleEmail: updatedUser.googleEmail,
          avatar: updatedUser.avatar,
          profile: updatedUser.profile,
        },
      });
    }

    // 2. SIGN IN OR REGISTER VIA GOOGLE
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: effectiveGoogleId }, { email: email.toLowerCase() }],
      },
      include: { profile: true },
    });

    if (user) {
      // If user exists by email but googleId not set, link it now
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: effectiveGoogleId,
            googleEmail: email,
          },
          include: { profile: true },
        });
      }
    } else {
      // Create new user via Google
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: effectiveName,
          googleId: effectiveGoogleId,
          googleEmail: email,
          avatar: effectiveAvatar,
          profile: {
            create: {
              age: 28,
              gender: "not_specified",
              heightCm: 175,
              weightKg: 70,
              activityLevel: "moderate",
              sleepTargetHours: 8.0,
              stepGoal: 10000,
              waterGoalMl: 2500,
              calorieGoal: 2000,
              proteinGoalG: 120,
              carbsGoalG: 220,
              fatGoalG: 60,
              screenTimeLimitMinutes: 240,
              themePreference: "dark",
            },
          },
        },
        include: { profile: true },
      });

      // Add welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome via Google Account",
          message: `Hello ${user.name}! Your account has been registered and verified with Google.`,
          type: "system",
          isRead: false,
        },
      });
    }

    // Generate JWT session token
    const token = await createSessionToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      message: `Signed in as ${user.name} via Google`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        googleEmail: user.googleEmail,
        avatar: user.avatar,
        profile: user.profile,
      },
    });

    response.cookies.set("lifesync_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google Auth processing error:", error);
    return NextResponse.json({ error: "Failed to process Google authentication" }, { status: 500 });
  }
}

