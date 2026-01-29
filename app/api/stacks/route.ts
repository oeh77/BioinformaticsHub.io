import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stackSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional().default(true),
});

function generateSlug(name: string, uniqueId: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${uniqueId.slice(0, 6)}`;
}

// GET /api/stacks - List user's stacks OR get public stack by slug
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const userId = searchParams.get("userId");

    // Get specific public stack by slug
    if (slug) {
      const stack = await prisma.stack.findUnique({
        where: { slug },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          tools: {
            include: {
              tool: {
                include: { category: true },
              },
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });

      if (!stack) {
        return NextResponse.json({ error: "Stack not found" }, { status: 404 });
      }

      // Check visibility
      if (!stack.isPublic) {
        const session = await auth();
        if (!session?.user?.email) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const currentUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (currentUser?.id !== stack.userId) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
      }

      return NextResponse.json(stack);
    }

    // List stacks for a user
    if (userId) {
      const stacks = await prisma.stack.findMany({
        where: { userId, isPublic: true },
        include: {
          user: { select: { id: true, name: true, image: true } },
          tools: {
            include: { tool: true },
            take: 5,
          },
        },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json(stacks);
    }

    // List authenticated user's own stacks
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

    const stacks = await prisma.stack.findMany({
      where: { userId: user.id },
      include: {
        tools: {
          include: { tool: { include: { category: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(stacks);
  } catch (error) {
    console.error("Failed to fetch stacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch stacks" },
      { status: 500 }
    );
  }
}

// POST /api/stacks - Create a new stack
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = stackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, isPublic } = parsed.data;
    const slug = generateSlug(name, user.id);

    const stack = await prisma.stack.create({
      data: {
        name,
        slug,
        description,
        isPublic,
        userId: user.id,
      },
    });

    return NextResponse.json(stack, { status: 201 });
  } catch (error) {
    console.error("Failed to create stack:", error);
    return NextResponse.json(
      { error: "Failed to create stack" },
      { status: 500 }
    );
  }
}

// PUT /api/stacks - Update a stack
export async function PUT(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const stackId = searchParams.get("id");

    if (!stackId) {
      return NextResponse.json(
        { error: "Stack ID is required" },
        { status: 400 }
      );
    }

    const stack = await prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack || stack.userId !== user.id) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = stackSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.stack.update({
      where: { id: stackId },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update stack:", error);
    return NextResponse.json(
      { error: "Failed to update stack" },
      { status: 500 }
    );
  }
}

// DELETE /api/stacks?id=xxx
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const stackId = searchParams.get("id");

    if (!stackId) {
      return NextResponse.json(
        { error: "Stack ID is required" },
        { status: 400 }
      );
    }

    const stack = await prisma.stack.findUnique({
      where: { id: stackId },
    });

    if (!stack || stack.userId !== user.id) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    await prisma.stack.delete({
      where: { id: stackId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete stack:", error);
    return NextResponse.json(
      { error: "Failed to delete stack" },
      { status: 500 }
    );
  }
}
