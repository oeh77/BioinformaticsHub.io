/**
 * Analytics Tracking API
 * 
 * POST /api/analytics/track - Track page view
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contentType, contentId, path, referrer, userAgent } = body;

    if (!contentType || !path) {
      return NextResponse.json(
        { error: "contentType and path are required" },
        { status: 400 }
      );
    }

    // Get or create session ID from cookies
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("session_id")?.value;
    
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Create page view record
    await prisma.pageView.create({
      data: {
        contentType,
        contentId: contentId || null,
        path,
        sessionId,
        referrer: referrer || null,
        userAgent: userAgent || null,
      },
    });

    // Update daily stats (upsert)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (contentId) {
      await prisma.dailyStats.upsert({
        where: {
          date_contentType_contentId: {
            date: today,
            contentType,
            contentId,
          },
        },
        update: {
          views: { increment: 1 },
        },
        create: {
          date: today,
          contentType,
          contentId,
          views: 1,
          uniqueViews: 1,
        },
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Set session cookie if new
    if (!cookieStore.get("session_id")) {
      response.cookies.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("Error tracking page view:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}
