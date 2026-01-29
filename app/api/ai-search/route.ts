import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  semanticSearch, 
  indexTools, 
  isVectorStoreInitialized,
  getVectorStoreSize 
} from "@/lib/vector-search";

// API endpoint for AI-powered semantic search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI search is not configured. Missing OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    // Initialize vector store if needed
    if (!isVectorStoreInitialized()) {
      const tools = await prisma.tool.findMany({
        where: { published: true },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          category: { select: { name: true } },
        },
      });

      const formattedTools = tools.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        slug: t.slug,
        category: t.category.name,
        score: 0,
      }));

      await indexTools(formattedTools);
    }

    // Perform semantic search
    const results = await semanticSearch(query, limit);

    return NextResponse.json({
      query,
      results,
      totalIndexed: getVectorStoreSize(),
      searchType: "semantic",
    });
  } catch (error: unknown) {
    console.error("AI search error:", error);
    const errorMessage = error instanceof Error ? error.message : "AI search failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST endpoint to reindex all tools
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (simplified check)
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get("key");
    
    if (adminKey !== process.env.ADMIN_REINDEX_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 503 }
      );
    }

    const tools = await prisma.tool.findMany({
      where: { published: true },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        category: { select: { name: true } },
      },
    });

    const formattedTools = tools.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      slug: t.slug,
      category: t.category.name,
      score: 0,
    }));

    await indexTools(formattedTools);

    return NextResponse.json({
      message: "Reindexing complete",
      indexedCount: formattedTools.length,
    });
  } catch (error: unknown) {
    console.error("Reindex error:", error);
    const errorMessage = error instanceof Error ? error.message : "Reindex failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
