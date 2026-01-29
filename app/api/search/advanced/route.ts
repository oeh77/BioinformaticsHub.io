/**
 * Advanced Search API Endpoint
 * 
 * Enhanced search with:
 * - Full-text search with highlighting
 * - Faceted search (filters)
 * - Autocomplete suggestions
 * - Search analytics tracking
 * - Elasticsearch + Prisma fallback
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isElasticsearchEnabled, getElasticsearchClient, getIndexName } from "@/lib/elasticsearch/client";
import { cacheGetOrFetch, httpCacheHeaders, createCacheKey } from "@/lib/performance-cache";

export const dynamic = "force-dynamic";

interface SearchParams {
  q: string;
  type?: "all" | "tools" | "posts" | "courses";
  category?: string;
  pricing?: string;
  level?: string;
  page?: number;
  limit?: number;
  sort?: "relevance" | "newest" | "name";
  mode?: "search" | "autocomplete" | "suggest";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const params: SearchParams = {
    q: searchParams.get("q") || "",
    type: (searchParams.get("type") as SearchParams["type"]) || "all",
    category: searchParams.get("category") || undefined,
    pricing: searchParams.get("pricing") || undefined,
    level: searchParams.get("level") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: Math.min(parseInt(searchParams.get("limit") || "12"), 50),
    sort: (searchParams.get("sort") as SearchParams["sort"]) || "relevance",
    mode: (searchParams.get("mode") as SearchParams["mode"]) || "search",
  };

  try {
    // Autocomplete mode
    if (params.mode === "autocomplete") {
      const suggestions = await getAutocompleteSuggestions(params.q);
      return NextResponse.json({ suggestions }, { headers: httpCacheHeaders.api });
    }

    // Suggest mode (did you mean)
    if (params.mode === "suggest") {
      const suggestions = await getSpellingSuggestions(params.q);
      return NextResponse.json({ suggestions }, { headers: httpCacheHeaders.api });
    }

    // Full search with caching
    const cacheKey = createCacheKey("search", params as unknown as Record<string, unknown>);
    const results = await cacheGetOrFetch(
      cacheKey,
      () => performSearch(params),
      120 // 2 minute cache
    );

    // Track search query (async, don't wait)
    trackSearchQuery(params.q, results.total);

    return NextResponse.json(results, { headers: httpCacheHeaders.api });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

/**
 * Perform full search with Elasticsearch or Prisma fallback
 */
async function performSearch(params: SearchParams) {
  const { q, type, category, pricing, level, page = 1, limit = 12, sort } = params;

  // Try Elasticsearch first
  if (isElasticsearchEnabled() && q) {
    try {
      return await elasticsearchSearch(params);
    } catch (error) {
      console.error("Elasticsearch search failed, falling back to Prisma:", error);
    }
  }

  // Prisma fallback
  return await prismaSearch(params);
}

/**
 * Elasticsearch powered search
 */
async function elasticsearchSearch(params: SearchParams) {
  const { q, type, category, pricing, level, page = 1, limit = 12, sort } = params;
  const client = getElasticsearchClient();

  // Build multi-index search
  const indices: string[] = [];
  if (type === "all" || type === "tools") indices.push(getIndexName("tools"));
  if (type === "all" || type === "posts") indices.push(getIndexName("posts"));
  if (type === "all" || type === "courses") indices.push(getIndexName("courses"));

  // Build query
  const must: object[] = [{
    multi_match: {
      query: q,
      fields: ["name^3", "title^3", "description^2", "content", "excerpt"],
      type: "best_fields",
      fuzziness: "AUTO",
      prefix_length: 2,
    },
  }];

  const filter: object[] = [{ term: { published: true } }];

  if (category) {
    filter.push({ term: { categorySlug: category } });
  }
  if (pricing) {
    filter.push({ term: { pricing } });
  }
  if (level) {
    filter.push({ term: { level } });
  }

  // Sort - using any[] for ES compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortOptions: any[] = [];
  switch (sort) {
    case "newest":
      sortOptions.push({ createdAt: "desc" });
      break;
    case "name":
      sortOptions.push({ "name.keyword": "asc" });
      break;
    default:
      sortOptions.push({ _score: "desc" });
      sortOptions.push({ featured: "desc" });
  }

  const response = await client.search({
    index: indices.join(","),
    from: (page - 1) * limit,
    size: limit,
    query: { bool: { must, filter } },
    sort: sortOptions,
    highlight: {
      fields: {
        name: { number_of_fragments: 0 },
        title: { number_of_fragments: 0 },
        description: { number_of_fragments: 1, fragment_size: 200 },
        content: { number_of_fragments: 2, fragment_size: 150 },
      },
      pre_tags: ["<mark>"],
      post_tags: ["</mark>"],
    },
    aggs: {
      types: { terms: { field: "_index", size: 10 } },
      categories: { terms: { field: "categoryName.keyword", size: 20 } },
      pricing: { terms: { field: "pricing", size: 10 } },
      levels: { terms: { field: "level", size: 10 } },
    },
  });

  const total = typeof response.hits.total === "number" 
    ? response.hits.total 
    : response.hits.total?.value || 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hits = response.hits.hits.map((hit: any) => {
    const source = hit._source;
    const indexName = hit._index;
    const contentType = indexName.includes("tools") ? "tool" 
      : indexName.includes("posts") ? "post" 
      : "course";

    return {
      id: source.id,
      type: contentType,
      title: source.name || source.title,
      slug: source.slug,
      description: source.description || source.excerpt,
      category: source.categoryName,
      categorySlug: source.categorySlug,
      url: getContentUrl(contentType, source.slug),
      image: source.image,
      pricing: source.pricing,
      level: source.level,
      featured: source.featured,
      highlight: hit.highlight,
      score: hit._score,
    };
  });

  // Parse aggregations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aggs = response.aggregations as any;
  const facets = {
    types: parseBuckets(aggs?.types?.buckets),
    categories: parseBuckets(aggs?.categories?.buckets),
    pricing: parseBuckets(aggs?.pricing?.buckets),
    levels: parseBuckets(aggs?.levels?.buckets),
  };

  return {
    hits,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    facets,
    source: "elasticsearch",
  };
}

/**
 * Prisma fallback search
 */
async function prismaSearch(params: SearchParams) {
  const { q, type, category, pricing, level, page = 1, limit = 12, sort } = params;
  const skip = (page - 1) * limit;

  const results: {
    id: string;
    type: string;
    title: string;
    slug: string;
    description: string | null;
    category?: string;
    url: string;
  }[] = [];

  // Search tools
  if (type === "all" || type === "tools") {
    const tools = await prisma.tool.findMany({
      where: {
        published: true,
        AND: [
          q ? { OR: [
            { name: { contains: q } },
            { description: { contains: q } },
          ]} : {},
          category ? { category: { slug: category } } : {},
          pricing ? { pricing } : {},
        ],
      },
      include: { category: true },
      take: type === "tools" ? limit : Math.ceil(limit / 3),
      skip: type === "tools" ? skip : 0,
      orderBy: sort === "newest" ? { createdAt: "desc" } : sort === "name" ? { name: "asc" } : { featured: "desc" },
    });

    results.push(...tools.map(t => ({
      id: t.id,
      type: "tool",
      title: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category.name,
      url: `/directory/tool/${t.slug}`,
    })));
  }

  // Search posts
  if (type === "all" || type === "posts") {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        AND: [
          q ? { OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ]} : {},
          category ? { category: { slug: category } } : {},
        ],
      },
      include: { category: true },
      take: type === "posts" ? limit : Math.ceil(limit / 3),
      skip: type === "posts" ? skip : 0,
      orderBy: sort === "newest" ? { createdAt: "desc" } : { createdAt: "desc" },
    });

    results.push(...posts.map(p => ({
      id: p.id,
      type: "post",
      title: p.title,
      slug: p.slug,
      description: p.excerpt,
      category: p.category.name,
      url: `/blog/${p.slug}`,
    })));
  }

  // Search courses
  if (type === "all" || type === "courses") {
    const courses = await prisma.course.findMany({
      where: {
        published: true,
        AND: [
          q ? { OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ]} : {},
          category ? { category: { slug: category } } : {},
          level ? { level } : {},
        ],
      },
      include: { category: true },
      take: type === "courses" ? limit : Math.ceil(limit / 3),
      skip: type === "courses" ? skip : 0,
    });

    results.push(...courses.map(c => ({
      id: c.id,
      type: "course",
      title: c.title,
      slug: c.slug,
      description: c.description,
      category: c.category?.name,
      url: `/courses/${c.slug}`,
    })));
  }

  return {
    hits: results.slice(0, limit),
    total: results.length,
    page,
    totalPages: Math.ceil(results.length / limit),
    facets: null,
    source: "prisma",
  };
}

/**
 * Get autocomplete suggestions
 */
async function getAutocompleteSuggestions(prefix: string) {
  if (!prefix || prefix.length < 2) return [];

  if (isElasticsearchEnabled()) {
    try {
      const client = getElasticsearchClient();
      const indices = [getIndexName("tools"), getIndexName("posts"), getIndexName("courses")];

      const response = await client.search({
        index: indices.join(","),
        size: 8,
        query: {
          bool: {
            should: [
              { prefix: { "name": { value: prefix.toLowerCase(), boost: 2 } } },
              { prefix: { "title": { value: prefix.toLowerCase(), boost: 2 } } },
              { match_phrase_prefix: { name: prefix } },
              { match_phrase_prefix: { title: prefix } },
            ],
            filter: { term: { published: true } },
          },
        },
        _source: ["id", "name", "title", "slug"],
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return response.hits.hits.map((hit: any) => ({
        text: hit._source.name || hit._source.title,
        slug: hit._source.slug,
        type: hit._index.includes("tools") ? "tool" : hit._index.includes("posts") ? "post" : "course",
      }));
    } catch (error) {
      console.error("Autocomplete failed:", error);
    }
  }

  // Fallback to Prisma
  const tools = await prisma.tool.findMany({
    where: { published: true, name: { contains: prefix } },
    select: { name: true, slug: true },
    take: 4,
  });

  const posts = await prisma.post.findMany({
    where: { published: true, title: { contains: prefix } },
    select: { title: true, slug: true },
    take: 4,
  });

  return [
    ...tools.map(t => ({ text: t.name, slug: t.slug, type: "tool" })),
    ...posts.map(p => ({ text: p.title, slug: p.slug, type: "post" })),
  ].slice(0, 8);
}

/**
 * Get spelling suggestions (did you mean)
 */
async function getSpellingSuggestions(query: string) {
  if (!query || !isElasticsearchEnabled()) return [];

  try {
    const client = getElasticsearchClient();
    
    const response = await client.search({
      index: getIndexName("tools"),
      size: 0,
      suggest: {
        text: query,
        suggestions: {
          term: {
            field: "name",
            suggest_mode: "popular",
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const suggestions = response.suggest?.suggestions as any;
    if (!suggestions || !Array.isArray(suggestions)) return [];

    return suggestions
      .flatMap((s: { options: Array<{ text: string; score: number }> }) => s.options)
      .map((o: { text: string }) => o.text)
      .slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Track search query for analytics
 */
function trackSearchQuery(query: string, resultsCount: number) {
  // Fire and forget - don't await
  if (!query) return;

  // Could log to database, Elasticsearch, or analytics service
  console.log(`[Search] Query: "${query}" | Results: ${resultsCount}`);
}

/**
 * Get content URL by type
 */
function getContentUrl(type: string, slug: string): string {
  switch (type) {
    case "tool": return `/directory/tool/${slug}`;
    case "post": return `/blog/${slug}`;
    case "course": return `/courses/${slug}`;
    default: return `/${slug}`;
  }
}

/**
 * Parse Elasticsearch aggregation buckets
 */
function parseBuckets(buckets?: Array<{ key: string; doc_count: number }>) {
  if (!buckets) return [];
  return buckets.map(b => ({ key: b.key, count: b.doc_count }));
}
