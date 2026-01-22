import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get a single resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Get resource error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

// Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, type, description, url, categoryId } = body;

    if (!title || !slug || !type || !description) {
      return NextResponse.json(
        { error: "Title, slug, type, and description are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists for a different resource
    const existingResource = await prisma.resource.findFirst({
      where: { slug, NOT: { id } },
    });

    if (existingResource) {
      return NextResponse.json(
        { error: "A resource with this slug already exists" },
        { status: 409 }
      );
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        slug,
        type,
        description,
        url: url || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error("Update resource error:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

// Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
