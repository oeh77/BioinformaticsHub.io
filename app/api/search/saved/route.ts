import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Saved Searches API
 * 
 * GET - Fetch user's saved searches
 * POST - Save a new search
 * PUT - Update a saved search
 * DELETE - Delete a saved search
 */

// GET /api/search/saved - Get user's saved searches
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedSearches });
  } catch (error) {
    console.error("Error fetching saved searches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/search/saved - Save a new search
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, query, filters, notifications } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!query || typeof query !== "string" || query.trim().length < 1) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check for duplicate names
    const existing = await prisma.savedSearch.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A saved search with this name already exists" },
        { status: 409 }
      );
    }

    // Limit to 50 saved searches per user
    const count = await prisma.savedSearch.count({
      where: { userId: session.user.id },
    });

    if (count >= 50) {
      return NextResponse.json(
        { error: "Maximum saved searches limit reached (50)" },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        query: query.trim(),
        filters: filters ? JSON.stringify(filters) : null,
        notifications: notifications || false,
      },
    });

    return NextResponse.json({ savedSearch }, { status: 201 });
  } catch (error) {
    console.error("Error saving search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/search/saved - Update a saved search
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, query, filters, notifications } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.savedSearch.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(query && { query: query.trim() }),
        ...(filters !== undefined && { filters: filters ? JSON.stringify(filters) : null }),
        ...(notifications !== undefined && { notifications }),
      },
    });

    return NextResponse.json({ savedSearch: updatedSearch });
  } catch (error) {
    console.error("Error updating saved search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/search/saved - Delete a saved search
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify ownership and delete
    const deleted = await prisma.savedSearch.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting saved search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
