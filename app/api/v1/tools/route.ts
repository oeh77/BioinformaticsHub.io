import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth-middleware";

// GET /api/v1/tools - List all tools
export const GET = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const category = url.searchParams.get("category");
      const featured = url.searchParams.get("featured") === "true";
      const search = url.searchParams.get("search");

      const skip = (page - 1) * limit;

      // Build query
      const where: any = { published: true };
      if (category) {
        where.category = { slug: category };
      }
      if (featured) {
        where.featured = true;
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
        ];
      }

      // Execute query
      const [tools, total] = await Promise.all([
        prisma.tool.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.tool.count({ where }),
      ]);

      return NextResponse.json({
        tools,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching tools:", error);
      return NextResponse.json(
        { error: "Failed to fetch tools" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "tools:read" }
);

// POST /api/v1/tools - Create a new tool
export const POST = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const body = await req.json();
      const {
        name,
        slug,
        description,
        content,
        url,
        pricing,
        image,
        categoryId,
        featured,
        metaTitle,
        metaDesc,
      } = body;

      if (!name || !slug || !description || !categoryId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
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
          image: image || null,
          categoryId,
          featured: featured || false,
          published: true,
          metaTitle: metaTitle || null,
          metaDesc: metaDesc || null,
        },
        include: {
          category: true,
        },
      });

      return NextResponse.json({ tool }, { status: 201 });
    } catch (error: any) {
      console.error("Error creating tool:", error);
      
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A tool with this slug already exists" },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create tool" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "tools:write" }
);
