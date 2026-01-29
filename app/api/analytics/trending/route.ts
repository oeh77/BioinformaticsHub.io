/**
 * Trending Content API
 * 
 * GET /api/analytics/trending - Get trending content
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TrendingItem {
  id: string;
  contentId: string;
  contentType: string;
  rank: number;
  score: number;
  period: string;
  pageViews: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly";
    const contentType = searchParams.get("type") || "tool";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Try to get trending content if the table exists
    let trending: TrendingItem[] = [];
    try {
      const rawTrending = await prisma.$queryRaw<TrendingItem[]>`
        SELECT * FROM TrendingContent 
        WHERE period = ${period} AND contentType = ${contentType}
        ORDER BY rank ASC
        LIMIT ${limit}
      `;
      trending = rawTrending;
    } catch {
      // TrendingContent table may not exist yet, return empty for now
      return NextResponse.json({
        period,
        contentType,
        trending: [],
        message: "Trending data will be available after analytics data is collected",
      });
    }

    // Fetch actual content details based on contentType
    const contentIds = trending.map((t: TrendingItem) => t.contentId);
    
    let contentDetails: Record<string, unknown>[] = [];
    
    if (contentType === "tool") {
      const tools = await prisma.tool.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          category: { select: { name: true, slug: true } },
        },
      });
      contentDetails = tools;
    } else if (contentType === "course") {
      const courses = await prisma.course.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          image: true,
          category: { select: { name: true, slug: true } },
        },
      });
      contentDetails = courses;
    } else if (contentType === "post") {
      const posts = await prisma.post.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
        },
      });
      contentDetails = posts;
    }

    // Merge trending data with content details
    const result = trending.map((t: TrendingItem) => {
      const content = contentDetails.find((c: Record<string, unknown>) => c.id === t.contentId);
      return {
        ...t,
        content,
      };
    });

    return NextResponse.json({
      period,
      contentType,
      trending: result,
    });
  } catch (error) {
    console.error("Error fetching trending content:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending content" },
      { status: 500 }
    );
  }
}
