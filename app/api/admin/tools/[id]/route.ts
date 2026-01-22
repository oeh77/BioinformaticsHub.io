import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get single tool
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);

    const tool = await prisma.tool.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    return NextResponse.json(tool);
  } catch (error) {
    console.error("Get tool error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tool" },
      { status: 500 }
    );
  }
}

// Update tool
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { name, slug, description, content, url, pricing, categoryId, published, featured } = body;

    if (!name || !slug || !description || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, description, and category are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists for another tool
    const existingTool = await prisma.tool.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existingTool) {
      return NextResponse.json(
        { error: "A tool with this slug already exists" },
        { status: 409 }
      );
    }

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        content: content || null,
        url: url || null,
        pricing: pricing || null,
        categoryId,
        published: published ?? true,
        featured: featured ?? false,
      },
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error("Update tool error:", error);
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    );
  }
}

// Delete tool
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);

    await prisma.tool.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tool error:", error);
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    );
  }
}
