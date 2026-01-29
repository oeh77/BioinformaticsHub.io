import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      href,
      sectionId,
      parentId,
      position,
      icon,
      iconColor,
      gradient,
      description,
      itemType,
      isEnabled,
      openInNewTab,
    } = body;

    const item = await prisma.menuItem.create({
      data: {
        label,
        href,
        sectionId,
        parentId,
        position: position || 0,
        icon,
        iconColor,
        gradient,
        description,
        itemType: itemType || "link",
        isEnabled: isEnabled ?? true,
        openInNewTab: openInNewTab ?? false,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PUT - Update a menu item
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a menu item
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
