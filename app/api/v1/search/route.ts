import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAuth } from "@/lib/api-auth-middleware";

// GET /api/v1/search - Search across all content
export const GET = withApiAuth(
  async (req: Request, context, apiKey) => {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q") || "";
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

      if (!query || query.length < 2) {
        return NextResponse.json(
          { error: "Query must be at least 2 characters" },
          { status: 400 }
        );
      }

      const searchCondition = {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      };

      // Search tools, courses, resources, and blog posts concurrently
      const [tools, courses, resources, posts] = await Promise.all([
        prisma.tool.findMany({
          where: { ...searchCondition, published: true },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: limit,
        }),
        prisma.course.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: limit,
        }),
        prisma.resource.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: limit,
        }),
        prisma.post.findMany({
          where: {
            published: true,
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { content: { contains: query } },
            ],
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: limit,
        }),
      ]);

      return NextResponse.json({
        query,
        results: {
          tools,
          courses,
          resources,
          posts,
        },
        counts: {
          tools: tools.length,
          courses: courses.length,
          resources: resources.length,
          posts: posts.length,
          total: tools.length + courses.length + resources.length + posts.length,
        },
      });
    } catch (error) {
      console.error("Error searching:", error);
      return NextResponse.json(
        { error: "Failed to perform search" },
        { status: 500 }
      );
    }
  },
  { requiredScope: "search:read" }
);
