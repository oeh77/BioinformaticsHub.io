/**
 * Notifications API Routes
 * 
 * GET /api/notifications - Get user's notifications
 * POST /api/notifications - Mark notifications as read
 * DELETE /api/notifications - Delete notifications
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's notifications
export async function GET(request: Request) {
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread") === "true";
    const type = searchParams.get("type");

    const whereClause: Record<string, unknown> = {
      userId: user.id,
      isArchived: false,
    };

    if (unreadOnly) {
      whereClause.isRead = false;
    }

    if (type) {
      whereClause.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { userId: user.id, isArchived: false },
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false, isArchived: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Mark notifications as read
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
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds array is required" },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Archive or delete notifications
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
    const notificationId = searchParams.get("id");
    const archiveAll = searchParams.get("archiveAll") === "true";
    const deleteAll = searchParams.get("deleteAll") === "true";

    if (deleteAll) {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true, message: "All notifications deleted" });
    }

    if (archiveAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id },
        data: { isArchived: true },
      });
      return NextResponse.json({ success: true, message: "All notifications archived" });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
