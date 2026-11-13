import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      isLinked: !!user.googleId,
      googleEmail: user.googleEmail || null,
      googleId: user.googleId || null,
    });
  } catch (error) {
    console.error("Check Google link status error:", error);
    return NextResponse.json({ error: "Failed to check Google link status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, googleId, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid Google account email is required" }, { status: 400 });
    }

    const effectiveGoogleId = googleId || `google_${Buffer.from(email.toLowerCase()).toString("hex").slice(0, 16)}`;

    // Ensure no other user is linked to this Google ID or Google Email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: effectiveGoogleId },
          { googleEmail: email.toLowerCase() },
        ],
        NOT: { id: user.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `This Google account is already linked to another LifeSync account (${existingUser.email})` },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: effectiveGoogleId,
        googleEmail: email.toLowerCase(),
      },
      include: { profile: true },
    });

    return NextResponse.json({
      success: true,
      message: `Google account (${email}) successfully linked to ${updatedUser.name}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        googleId: updatedUser.googleId,
        googleEmail: updatedUser.googleEmail,
      },
    });
  } catch (error) {
    console.error("Link Google account error:", error);
    return NextResponse.json({ error: "Failed to link Google account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.googleId && !user.googleEmail) {
      return NextResponse.json({ error: "No Google account is currently linked" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId: null,
        googleEmail: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Google account successfully unlinked",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        googleId: null,
        googleEmail: null,
      },
    });
  } catch (error) {
    console.error("Unlink Google account error:", error);
    return NextResponse.json({ error: "Failed to unlink Google account" }, { status: 500 });
  }
}

