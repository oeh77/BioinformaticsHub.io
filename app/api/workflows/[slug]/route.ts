/**
 * Single Workflow API Routes
 * 
 * GET /api/workflows/[slug] - Get workflow by slug
 * PUT /api/workflows/[slug] - Update workflow
 * DELETE /api/workflows/[slug] - Delete workflow
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET - Get workflow by slug
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    
    const workflow = await prisma.workflow.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        exports: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Check if user can view private workflow
    if (!workflow.isPublic) {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      if (user?.id !== workflow.authorId && user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Increment views
    await prisma.workflow.update({
      where: { id: workflow.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      ...workflow,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges),
      tags: JSON.parse(workflow.tags),
    });
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

// PUT - Update workflow
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    const workflow = await prisma.workflow.findUnique({
      where: { slug },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.id !== workflow.authorId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, nodes, edges, viewport, isPublic, tags } = body;

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        name: name ?? workflow.name,
        description: description ?? workflow.description,
        nodes: nodes ? JSON.stringify(nodes) : workflow.nodes,
        edges: edges ? JSON.stringify(edges) : workflow.edges,
        viewport: viewport ? JSON.stringify(viewport) : workflow.viewport,
        isPublic: isPublic ?? workflow.isPublic,
        tags: tags ? JSON.stringify(tags) : workflow.tags,
      },
    });

    return NextResponse.json({
      ...updatedWorkflow,
      nodes: JSON.parse(updatedWorkflow.nodes),
      edges: JSON.parse(updatedWorkflow.edges),
      tags: JSON.parse(updatedWorkflow.tags),
    });
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

// DELETE - Delete workflow
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    const workflow = await prisma.workflow.findUnique({
      where: { slug },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.id !== workflow.authorId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.workflow.delete({
      where: { id: workflow.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
