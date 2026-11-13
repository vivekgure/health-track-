import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, createSessionToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "signin"; // 'signin' or 'link'
    const error = searchParams.get("error");

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(`Google authentication failed: ${error}`)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Missing authorization code from Google")}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("Google OAuth credentials not configured on server")}`
      );
    }

    // 1. Exchange code for access & ID tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Failed to exchange code with Google")}`);
    }

    // 2. Fetch User Profile from Google
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoRes.json();
    if (!userinfoRes.ok || !googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent("Failed to fetch Google profile details")}`);
    }

    const googleId = googleUser.sub;
    const email = googleUser.email.toLowerCase();
    const name = googleUser.name || googleUser.given_name || email.split("@")[0];
    const avatar = googleUser.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // 3. Check if user wants to LINK to existing logged-in session
    const currentUser = await getCurrentUser(request);
    if (state === "link" && currentUser) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          googleId,
          googleEmail: email,
          avatar: currentUser.avatar || avatar,
        },
      });

      return NextResponse.redirect(`${baseUrl}/settings?googleLinked=true`);
    }

    // 4. SIGN IN / REGISTER
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: { profile: true },
    });

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, googleEmail: email },
          include: { profile: true },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          googleEmail: email,
          avatar,
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
    }

    const sessionToken = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.redirect(`${baseUrl}/?googleAuth=success`);

    response.cookies.set("lifesync_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    return NextResponse.redirect(`${protocol}://${host}/login?error=${encodeURIComponent("Unexpected authentication error")}`);
  }
}

