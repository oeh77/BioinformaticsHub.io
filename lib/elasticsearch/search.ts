/**
 * Elasticsearch Search Service
 * 
 * High-performance search with:
 * - Full-text search across all content types
 * - Autocomplete / Typeahead
 * - Faceted search with aggregations
 * - Fuzzy matching and typo tolerance
 * 
 * Uses plain objects for Elasticsearch v9.x compatibility
 */

import { getElasticsearchClient, getIndexName, isElasticsearchEnabled } from "./client";

// Types
export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    category?: string;
    pricing?: string;
    level?: string;
    type?: string;
    featured?: boolean;
  };
  sort?: "relevance" | "newest" | "oldest" | "name";
}

export interface SearchResult<T> {
  hits: T[];
  total: number;
  page: number;
  totalPages: number;
  facets?: {
    categories: Array<{ key: string; count: number }>;
    pricing?: Array<{ key: string; count: number }>;
    levels?: Array<{ key: string; count: number }>;
  };
  took: number;
}

export interface AutocompleteResult {
  text: string;
  type: "tool" | "post" | "course";
  slug: string;
  category?: string;
}

/**
 * Search tools with full-text search, facets, and highlighting
 */
export async function searchTools(options: SearchOptions): Promise<SearchResult<{
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  pricing: string;
  featured: boolean;
}>> {
  if (!isElasticsearchEnabled()) {
    return { hits: [], total: 0, page: 1, totalPages: 0, took: 0 };
  }

  const client = getElasticsearchClient();
  const indexName = getIndexName("tools");
  const { query, page = 1, limit = 12, filters, sort = "relevance" } = options;

  // Build bool query
  const must: object[] = [];
  const filter: object[] = [{ term: { published: true } }];

  if (query && query.trim()) {
    must.push({
      multi_match: {
        query: query.trim(),
        fields: ["name^3", "name.autocomplete^2", "description", "content", "categoryName"],
        type: "best_fields",
        fuzziness: "AUTO",
        prefix_length: 2,
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  if (filters?.category) {
    filter.push({ term: { categorySlug: filters.category } });
  }
  if (filters?.pricing) {
    filter.push({ term: { pricing: filters.pricing } });
  }
  if (filters?.featured !== undefined) {
    filter.push({ term: { featured: filters.featured } });
  }

  // Sorting
  const sortOptions: object[] = [];
  switch (sort) {
    case "newest":
      sortOptions.push({ createdAt: "desc" });
      break;
    case "oldest":
      sortOptions.push({ createdAt: "asc" });
      break;
    case "name":
      sortOptions.push({ "name.keyword": "asc" });
      break;
    default:
      sortOptions.push({ _score: "desc" });
      sortOptions.push({ featured: "desc" });
  }

  try {
    const response = await client.search({
      index: indexName,
      from: (page - 1) * limit,
      size: limit,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort: sortOptions as unknown as undefined,
      highlight: {
        fields: {
          name: { number_of_fragments: 0 },
          description: { number_of_fragments: 1, fragment_size: 150 },
        },
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
      },
      aggs: {
        categories: {
          terms: { field: "categoryName.keyword", size: 20 },
        },
        pricing: {
          terms: { field: "pricing", size: 10 },
        },
      },
    });

    const total = typeof response.hits.total === "number" 
      ? response.hits.total 
      : response.hits.total?.value || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = response.hits.hits.map((hit: any) => {
      const source = hit._source;
      return {
        id: source.id,
        name: source.name,
        slug: source.slug,
        description: source.description,
        category: source.categoryName,
        categorySlug: source.categorySlug,
        pricing: source.pricing,
        featured: source.featured,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggs = response.aggregations as any;

    return {
      hits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets: {
        categories: aggs?.categories?.buckets?.map((b: { key: string; doc_count: number }) => ({ 
          key: b.key, 
          count: b.doc_count 
        })) || [],
        pricing: aggs?.pricing?.buckets?.map((b: { key: string; doc_count: number }) => ({ 
          key: b.key, 
          count: b.doc_count 
        })) || [],
      },
      took: response.took,
    };
  } catch (error) {
    console.error("Search failed:", error);
    return { hits: [], total: 0, page: 1, totalPages: 0, took: 0 };
  }
}

/**
 * Search posts
 */
export async function searchPosts(options: SearchOptions): Promise<SearchResult<{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  createdAt: string;
}>> {
  if (!isElasticsearchEnabled()) {
    return { hits: [], total: 0, page: 1, totalPages: 0, took: 0 };
  }

  const client = getElasticsearchClient();
  const indexName = getIndexName("posts");
  const { query, page = 1, limit = 12, filters, sort = "relevance" } = options;

  const must: object[] = [];
  const filter: object[] = [{ term: { published: true } }];

  if (query && query.trim()) {
    must.push({
      multi_match: {
        query: query.trim(),
        fields: ["title^3", "title.autocomplete^2", "excerpt^2", "content", "categoryName"],
        type: "best_fields",
        fuzziness: "AUTO",
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  if (filters?.category) {
    filter.push({ term: { categorySlug: filters.category } });
  }

  const sortOptions: object[] = [];
  switch (sort) {
    case "newest":
      sortOptions.push({ createdAt: "desc" });
      break;
    case "oldest":
      sortOptions.push({ createdAt: "asc" });
      break;
    default:
      sortOptions.push({ _score: "desc" });
  }

  try {
    const response = await client.search({
      index: indexName,
      from: (page - 1) * limit,
      size: limit,
      query: { bool: { must, filter } },
      sort: sortOptions as unknown as undefined,
      highlight: {
        fields: {
          title: { number_of_fragments: 0 },
          excerpt: { number_of_fragments: 1, fragment_size: 200 },
        },
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
      },
      aggs: {
        categories: {
          terms: { field: "categoryName.keyword", size: 20 },
        },
      },
    });

    const total = typeof response.hits.total === "number" 
      ? response.hits.total 
      : response.hits.total?.value || 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = response.hits.hits.map((hit: any) => {
      const source = hit._source;
      return {
        id: source.id,
        title: source.title,
        slug: source.slug,
        excerpt: source.excerpt,
        category: source.categoryName,
        categorySlug: source.categorySlug,
        createdAt: source.createdAt,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aggs = response.aggregations as any;

    return {
      hits,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      facets: {
        categories: aggs?.categories?.buckets?.map((b: { key: string; doc_count: number }) => ({ 
          key: b.key, 
          count: b.doc_count 
        })) || [],
      },
      took: response.took,
    };
  } catch (error) {
    console.error("Search posts failed:", error);
    return { hits: [], total: 0, page: 1, totalPages: 0, took: 0 };
  }
}

/**
 * Global autocomplete across all content types
 */
export async function autocomplete(query: string, limit = 8): Promise<AutocompleteResult[]> {
  if (!isElasticsearchEnabled() || !query || query.length < 2) {
    return [];
  }

  const client = getElasticsearchClient();
  const results: AutocompleteResult[] = [];

  const indices = ["tools", "posts", "courses"] as const;

  for (const indexType of indices) {
    const indexName = getIndexName(indexType);
    
    try {
      const response = await client.search({
        index: indexName,
        size: 0,
        suggest: {
          suggestions: {
            prefix: query.toLowerCase(),
            completion: {
              field: "suggest",
              size: Math.ceil(limit / indices.length),
              skip_duplicates: true,
              fuzzy: {
                fuzziness: "AUTO",
              },
            },
          },
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const suggestions = response.suggest?.suggestions as any;
      if (suggestions && Array.isArray(suggestions)) {
        for (const suggestion of suggestions) {
          if (suggestion.options && Array.isArray(suggestion.options)) {
            for (const option of suggestion.options) {
              const source = option._source;
              results.push({
                text: source.name || source.title,
                type: indexType.slice(0, -1) as "tool" | "post" | "course",
                slug: source.slug,
                category: source.categoryName,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Autocomplete failed for ${indexType}:`, error);
    }
  }

  return results.slice(0, limit);
}

/**
 * Global search across all content types
 */
export async function globalSearch(query: string, limit = 10): Promise<{
  tools: Array<{ id: string; name: string; slug: string; type: "tool" }>;
  posts: Array<{ id: string; title: string; slug: string; type: "post" }>;
  courses: Array<{ id: string; title: string; slug: string; type: "course" }>;
}> {
  if (!isElasticsearchEnabled() || !query) {
    return { tools: [], posts: [], courses: [] };
  }

  const client = getElasticsearchClient();
  const perIndex = Math.ceil(limit / 3);

  try {
    const response = await client.msearch({
      searches: [
        { index: getIndexName("tools") },
        {
          size: perIndex,
          query: {
            bool: {
              must: { multi_match: { query, fields: ["name^3", "description"], fuzziness: "AUTO" } },
              filter: { term: { published: true } },
            },
          },
        },
        { index: getIndexName("posts") },
        {
          size: perIndex,
          query: {
            bool: {
              must: { multi_match: { query, fields: ["title^3", "excerpt"], fuzziness: "AUTO" } },
              filter: { term: { published: true } },
            },
          },
        },
        { index: getIndexName("courses") },
        {
          size: perIndex,
          query: {
            bool: {
              must: { multi_match: { query, fields: ["title^3", "description"], fuzziness: "AUTO" } },
              filter: { term: { published: true } },
            },
          },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [toolsRes, postsRes, coursesRes] = response.responses as any[];

    return {
      tools: toolsRes.hits?.hits?.map((h: { _source: { id: string; name: string; slug: string } }) => ({
        id: h._source.id,
        name: h._source.name,
        slug: h._source.slug,
        type: "tool" as const,
      })) || [],
      posts: postsRes.hits?.hits?.map((h: { _source: { id: string; title: string; slug: string } }) => ({
        id: h._source.id,
        title: h._source.title,
        slug: h._source.slug,
        type: "post" as const,
      })) || [],
      courses: coursesRes.hits?.hits?.map((h: { _source: { id: string; title: string; slug: string } }) => ({
        id: h._source.id,
        title: h._source.title,
        slug: h._source.slug,
        type: "course" as const,
      })) || [],
    };
  } catch (error) {
    console.error("Global search failed:", error);
    return { tools: [], posts: [], courses: [] };
  }
}
