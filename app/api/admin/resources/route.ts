import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Create a new resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, type, description, url, categoryId } = body;

    if (!title || !slug || !type || !description) {
      return NextResponse.json(
        { error: "Title, slug, type, and description are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingResource = await prisma.resource.findUnique({
      where: { slug },
    });

    if (existingResource) {
      return NextResponse.json(
        { error: "A resource with this slug already exists" },
        { status: 409 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        slug,
        type,
        description,
        url: url || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

// Get all resources (admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resources = await prisma.resource.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
