import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ 
      tools: [], 
      courses: [], 
      blog: [], 
      resources: [],
      total: 0 
    });
  }

  try {
    const [tools, courses, blog, resources] = await Promise.all([
      // Search Tools
      prisma.tool.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
          published: true,
        },
        include: { category: true },
        take: 5,
      }),

      // Search Courses
      prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
          published: true,
        },
        include: { category: true },
        take: 5,
      }),

      // Search Blog Posts
      prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
          ],
          published: true,
        },
        include: { category: true },
        take: 5,
      }),

      // Search Resources
      prisma.resource.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: { category: true },
        take: 5,
      }),
    ]);

    const total = tools.length + courses.length + blog.length + resources.length;

    return NextResponse.json({
      tools,
      courses,
      blog,
      resources,
      total,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
