/**
 * Search API Endpoint
 * 
 * GET /api/search?q=query&mode=search|autocomplete
 * 
 * Uses Elasticsearch when available, falls back to Prisma database search.
 * Provides full-text search across all content types with fuzzy matching.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  globalSearch, 
  autocomplete,
  isElasticsearchEnabled 
} from "@/lib/elasticsearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const mode = searchParams.get("mode") || "search"; // search | autocomplete

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
    // Autocomplete mode - fast prefix matching
    if (mode === "autocomplete") {
      if (isElasticsearchEnabled()) {
        const results = await autocomplete(query, 8);
        return NextResponse.json({ results });
      }
      // Fallback autocomplete
      return fallbackAutocomplete(query);
    }

    // Full search mode
    if (isElasticsearchEnabled()) {
      console.log(`🔍 Elasticsearch search for: "${query}"`);
      const esResults = await globalSearch(query, 20);
      
      return NextResponse.json({
        tools: esResults.tools.map(t => ({ ...t, source: "elasticsearch" })),
        courses: esResults.courses.map(c => ({ ...c, source: "elasticsearch" })),
        blog: esResults.posts.map(p => ({ 
          id: p.id, 
          title: p.title, 
          slug: p.slug, 
          source: "elasticsearch" 
        })),
        resources: [],
        total: esResults.tools.length + esResults.posts.length + esResults.courses.length,
        engine: "elasticsearch",
      });
    }

    // Fallback to Prisma database search
    console.log(`📄 Prisma search for: "${query}"`);
    return fallbackPrismaSearch(query);

  } catch (error) {
    console.error("Search API Error:", error);
    // On Elasticsearch error, fall back to Prisma
    return fallbackPrismaSearch(query || "");
  }
}

/**
 * Fallback search using Prisma when Elasticsearch is unavailable
 */
async function fallbackPrismaSearch(query: string) {
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
    engine: "prisma",
  });
}

/**
 * Fallback autocomplete using Prisma
 */
async function fallbackAutocomplete(query: string) {
  const [tools, posts] = await Promise.all([
    prisma.tool.findMany({
      where: {
        published: true,
        name: { contains: query },
      },
      select: { name: true, slug: true, category: { select: { name: true } } },
      take: 4,
    }),
    prisma.post.findMany({
      where: {
        published: true,
        title: { contains: query },
      },
      select: { title: true, slug: true, category: { select: { name: true } } },
      take: 4,
    }),
  ]);

  const results = [
    ...tools.map((t) => ({
      text: t.name,
      type: "tool" as const,
      slug: t.slug,
      category: t.category.name,
    })),
    ...posts.map((p) => ({
      text: p.title,
      type: "post" as const,
      slug: p.slug,
      category: p.category.name,
    })),
  ];

  return NextResponse.json({ results: results.slice(0, 8) });
}
