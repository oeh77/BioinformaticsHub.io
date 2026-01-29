import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const addToolSchema = z.object({
  toolId: z.string().min(1),
});

// POST /api/stacks/[stackId]/tools - Add a tool
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { stackId } = await params;

    const stack = await prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack || stack.userId !== user.id) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = addToolSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { toolId } = parsed.data;

    // Check tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Check if already in stack
    const existing = await prisma.stackTool.findUnique({
      where: {
        stackId_toolId: {
          stackId,
          toolId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tool already in stack" },
        { status: 409 }
      );
    }

    const stackTool = await prisma.stackTool.create({
      data: {
        stackId,
        toolId,
      },
      include: {
        tool: {
          include: { category: true },
        },
      },
    });

    // Update stack's updatedAt
    await prisma.stack.update({
      where: { id: stackId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(stackTool, { status: 201 });
  } catch (error) {
    console.error("Failed to add tool to stack:", error);
    return NextResponse.json(
      { error: "Failed to add tool to stack" },
      { status: 500 }
    );
  }
}

// DELETE /api/stacks/[stackId]/tools?toolId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { stackId } = await params;

    const stack = await prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack || stack.userId !== user.id) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get("toolId");

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    await prisma.stackTool.delete({
      where: {
        stackId_toolId: {
          stackId,
          toolId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove tool from stack:", error);
    return NextResponse.json(
      { error: "Failed to remove tool from stack" },
      { status: 500 }
    );
  }
}
