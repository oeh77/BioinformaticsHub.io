import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Search History API
 * 
 * GET - Fetch user's search history
 * POST - Record a new search
 * DELETE - Clear search history
 */

// GET /api/search/history - Get user's search history
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const history = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/search/history - Record a new search
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query, resultCount, filters } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    // Create history entry
    const entry = await prisma.searchHistory.create({
      data: {
        userId: session.user.id,
        query: query.trim(),
        resultCount: resultCount || 0,
        filters: filters ? JSON.stringify(filters) : null,
      },
    });

    // Keep only the last 100 entries per user (cleanup)
    const oldEntries = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: 100,
      select: { id: true },
    });

    if (oldEntries.length > 0) {
      await prisma.searchHistory.deleteMany({
        where: {
          id: { in: oldEntries.map((e) => e.id) },
        },
      });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Error recording search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/search/history - Clear search history
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Delete specific entry
      await prisma.searchHistory.deleteMany({
        where: {
          id,
          userId: session.user.id,
        },
      });
    } else {
      // Clear all history
      await prisma.searchHistory.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing search history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
