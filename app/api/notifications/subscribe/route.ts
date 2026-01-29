/**
 * Push Subscription API
 * 
 * POST /api/notifications/subscribe - Subscribe to push notifications
 * DELETE /api/notifications/subscribe - Unsubscribe from push
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Subscribe to push notifications
export async function POST(request: Request) {
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
    const { endpoint, p256dh, auth: authKey, userAgent } = body;

    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json(
        { error: "endpoint, p256dh, and auth are required" },
        { status: 400 }
      );
    }

    // Upsert subscription (update if exists, create if not)
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: user.id,
        p256dh,
        auth: authKey,
        userAgent,
        isActive: true,
        lastUsedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint,
        p256dh,
        auth: authKey,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (error) {
    console.error("Error creating push subscription:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to push notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint) {
      // Delete specific subscription
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: user.id,
          endpoint,
        },
      });
    } else {
      // Delete all subscriptions for user
      await prisma.pushSubscription.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from push notifications" },
      { status: 500 }
    );
  }
}
