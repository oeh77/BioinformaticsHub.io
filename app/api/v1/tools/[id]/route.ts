import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth-middleware";

// GET /api/v1/tools/[id] - Get tool by ID
export const GET = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const { id } = await context.params;

      const tool = await prisma.tool.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!tool || !tool.published) {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
      }

      return NextResponse.json({ tool });
    } catch (error) {
      console.error("Error fetching tool:", error);
      return NextResponse.json(
        { error: "Failed to fetch tool" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "tools:read" }
);

// PUT /api/v1/tools/[id] - Update a tool
export const PUT = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const { id } = await context.params;
      const body = await req.json();

      const tool = await prisma.tool.update({
        where: { id },
        data: body,
        include: {
          category: true,
        },
      });

      return NextResponse.json({ tool });
    } catch (error: any) {
      console.error("Error updating tool:", error);

      if (error.code === "P2025") {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to update tool" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "tools:write" }
);

// DELETE /api/v1/tools/[id] - Delete a tool
export const DELETE = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const { id } = await context.params;

      await prisma.tool.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting tool:", error);

      if (error.code === "P2025") {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to delete tool" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "tools:write" }
);
