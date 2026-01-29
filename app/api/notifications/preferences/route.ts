/**
 * Notification Preferences API Routes
 * 
 * GET /api/notifications/preferences - Get user's notification preferences
 * PUT /api/notifications/preferences - Update preferences
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's notification preferences
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT - Update user's notification preferences
export async function PUT(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate and sanitize input
    const allowedFields = [
      'enabled',
      'emailEnabled',
      'emailFrequency',
      'pushEnabled',
      'toolUpdates',
      'reviewReplies',
      'jobMatches',
      'newInCategory',
      'weeklyDigest',
      'mentions',
      'systemAnnouncements',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'timezone',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
