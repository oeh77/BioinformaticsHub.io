/**
 * Related Content API
 * 
 * Finds semantically related content using:
 * - Elasticsearch More Like This query
 * - Fallback to database category matching
 */

import { NextRequest, NextResponse } from "next/server";
import { findRelatedContent } from "@/lib/seo/internal-linking";
import { httpCacheHeaders } from "@/lib/performance-cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const type = searchParams.get("type") as "tool" | "post" | "course";
  const id = searchParams.get("id");
  const title = searchParams.get("title") || "";
  const content = searchParams.get("content") || "";
  const limit = parseInt(searchParams.get("limit") || "4");

  if (!type || !id) {
    return NextResponse.json(
      { error: "Missing required parameters: type and id" },
      { status: 400 }
    );
  }

  try {
    const items = await findRelatedContent({
      type,
      id,
      title,
      content,
      limit,
    });

    return NextResponse.json(
      { items },
      { headers: httpCacheHeaders.api }
    );
  } catch (error) {
    console.error("Related content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch related content", items: [] },
      { status: 500 }
    );
  }
}
