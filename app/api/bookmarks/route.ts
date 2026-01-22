import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all bookmarks for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Fetch the actual items for each bookmark
    const enrichedBookmarks = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let item = null;
        
        if (bookmark.itemType === "TOOL") {
          item = await prisma.tool.findUnique({
            where: { id: bookmark.itemId },
            include: { category: true },
          });
        } else if (bookmark.itemType === "COURSE") {
          item = await prisma.course.findUnique({
            where: { id: bookmark.itemId },
            include: { category: true },
          });
        } else if (bookmark.itemType === "RESOURCE") {
          item = await prisma.resource.findUnique({
            where: { id: bookmark.itemId },
            include: { category: true },
          });
        }

        return {
          ...bookmark,
          item,
        };
      })
    );

    // Filter out bookmarks where the item no longer exists
    const validBookmarks = enrichedBookmarks.filter((b) => b.item !== null);

    return NextResponse.json(validBookmarks);
  } catch (error) {
    console.error("Bookmarks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// Add a new bookmark
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemType, itemId } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "itemType and itemId are required" },
        { status: 400 }
      );
    }

    if (!["TOOL", "COURSE", "RESOURCE"].includes(itemType)) {
      return NextResponse.json(
        { error: "Invalid itemType. Must be TOOL, COURSE, or RESOURCE" },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: session.user.id,
          itemType,
          itemId,
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "Item already bookmarked" },
        { status: 409 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        itemType,
        itemId,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Bookmark create error:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

// Remove a bookmark
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "itemType and itemId are required" },
        { status: 400 }
      );
    }

    await prisma.bookmark.delete({
      where: {
        userId_itemType_itemId: {
          userId: session.user.id,
          itemType,
          itemId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmark delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
