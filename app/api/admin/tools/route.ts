import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new tool
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, content, url, pricing, categoryId, published, featured } = body;

    if (!name || !slug || !description || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, description, and category are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTool = await prisma.tool.findUnique({
      where: { slug },
    });

    if (existingTool) {
      return NextResponse.json(
        { error: "A tool with this slug already exists" },
        { status: 409 }
      );
    }

    const tool = await prisma.tool.create({
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

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error("Create tool error:", error);
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    );
  }
}

// Get all tools (admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tools = await prisma.tool.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error("Get tools error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
