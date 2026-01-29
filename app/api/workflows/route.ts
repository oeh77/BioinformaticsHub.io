/**
 * Workflows API Routes
 * 
 * GET /api/workflows - List public workflows
 * POST /api/workflows - Create a new workflow
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List public workflows
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

    const whereClause: Record<string, unknown> = {
      isPublic: true,
    };

    if (featured) {
      whereClause.isFeatured = true;
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where: whereClause,
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.workflow.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      workflows,
      total,
      hasMore: offset + workflows.length < total,
    });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

// POST - Create a new workflow
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
    const { name, description, nodes, edges, isPublic, tags } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Workflow name is required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    
    while (await prisma.workflow.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workflow = await prisma.workflow.create({
      data: {
        slug,
        name,
        description: description || null,
        authorId: user.id,
        nodes: JSON.stringify(nodes || []),
        edges: JSON.stringify(edges || []),
        isPublic: isPublic || false,
        tags: JSON.stringify(tags || []),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
