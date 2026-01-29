import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Create a new menu section
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, location, position, icon, iconColor, isEnabled } = body;

    // Check for duplicate slug
    const existing = await prisma.menuSection.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A section with this slug already exists" },
        { status: 400 }
      );
    }

    const section = await prisma.menuSection.create({
      data: {
        name,
        slug,
        location,
        position: position || 0,
        icon,
        iconColor,
        isEnabled: isEnabled ?? true,
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error creating menu section:", error);
    return NextResponse.json(
      { error: "Failed to create menu section" },
      { status: 500 }
    );
  }
}

// PUT - Update a menu section
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Section ID required" }, { status: 400 });
    }

    const section = await prisma.menuSection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Error updating menu section:", error);
    return NextResponse.json(
      { error: "Failed to update menu section" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a menu section
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Section ID required" }, { status: 400 });
    }

    await prisma.menuSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu section:", error);
    return NextResponse.json(
      { error: "Failed to delete menu section" },
      { status: 500 }
    );
  }
}
