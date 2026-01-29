/**
 * Internal Linking Engine
 * 
 * Intelligent auto-linking system powered by Elasticsearch:
 * - Finds semantically related content
 * - Suggests contextual internal links
 * - Builds link graph for PageRank-style analysis
 */

import { prisma } from "@/lib/prisma";
import { isElasticsearchEnabled, getElasticsearchClient, getIndexName } from "@/lib/elasticsearch/client";

export interface RelatedContent {
  id: string;
  title: string;
  slug: string;
  type: "tool" | "post" | "course";
  url: string;
  relevanceScore: number;
  excerpt?: string;
}

export interface LinkSuggestion {
  anchorText: string;
  targetUrl: string;
  targetTitle: string;
  relevance: number;
  context: string; // Surrounding text
}

/**
 * Find related content using Elasticsearch More Like This query
 */
export async function findRelatedContent(params: {
  type: "tool" | "post" | "course";
  id: string;
  title: string;
  content?: string;
  limit?: number;
}): Promise<RelatedContent[]> {
  const { type, id, title, content = "", limit = 5 } = params;

  // Try Elasticsearch first
  if (isElasticsearchEnabled()) {
    try {
      return await findRelatedViaElasticsearch(type, id, title, content, limit);
    } catch (error) {
      console.error("Elasticsearch related content failed:", error);
    }
  }

  // Fallback to database-based related content
  return await findRelatedViaDatabase(type, id, limit);
}

/**
 * Find related content via Elasticsearch MLT query
 */
async function findRelatedViaElasticsearch(
  type: "tool" | "post" | "course",
  currentId: string,
  title: string,
  content: string,
  limit: number
): Promise<RelatedContent[]> {
  const client = getElasticsearchClient();
  const indexName = getIndexName(`${type}s` as "tools" | "posts" | "courses");

  const response = await client.search({
    index: indexName,
    size: limit,
    query: {
      bool: {
        must: [
          {
            more_like_this: {
              fields: ["title", "description", "content", "name"],
              like: [
                { _index: indexName, _id: currentId },
                title,
                content.substring(0, 1000),
              ],
              min_term_freq: 1,
              min_doc_freq: 1,
              max_query_terms: 25,
            },
          },
        ],
        must_not: [
          { term: { id: currentId } },
        ],
        filter: [
          { term: { published: true } },
        ],
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.hits.hits.map((hit: any) => {
    const source = hit._source;
    return {
      id: source.id,
      title: source.title || source.name,
      slug: source.slug,
      type,
      url: getUrlForType(type, source.slug),
      relevanceScore: hit._score || 0,
      excerpt: source.excerpt || source.description,
    };
  });
}

/**
 * Find related content via database queries (fallback)
 */
async function findRelatedViaDatabase(
  type: "tool" | "post" | "course",
  currentId: string,
  limit: number
): Promise<RelatedContent[]> {
  switch (type) {
    case "tool": {
      const currentTool = await prisma.tool.findUnique({
        where: { id: currentId },
        select: { categoryId: true },
      });

      if (!currentTool) return [];

      const related = await prisma.tool.findMany({
        where: {
          published: true,
          categoryId: currentTool.categoryId,
          id: { not: currentId },
        },
        select: { id: true, name: true, slug: true, description: true },
        take: limit,
        orderBy: { featured: "desc" },
      });

      return related.map((t, i) => ({
        id: t.id,
        title: t.name,
        slug: t.slug,
        type: "tool",
        url: `/directory/tool/${t.slug}`,
        relevanceScore: 1 - i * 0.1,
        excerpt: t.description,
      }));
    }

    case "post": {
      const currentPost = await prisma.post.findUnique({
        where: { id: currentId },
        select: { categoryId: true },
      });

      if (!currentPost) return [];

      const related = await prisma.post.findMany({
        where: {
          published: true,
          categoryId: currentPost.categoryId,
          id: { not: currentId },
        },
        select: { id: true, title: true, slug: true, excerpt: true },
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      return related.map((p, i) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: "post",
        url: `/blog/${p.slug}`,
        relevanceScore: 1 - i * 0.1,
        excerpt: p.excerpt || undefined,
      }));
    }

    case "course": {
      const currentCourse = await prisma.course.findUnique({
        where: { id: currentId },
        select: { categoryId: true, level: true },
      });

      if (!currentCourse) return [];

      const related = await prisma.course.findMany({
        where: {
          published: true,
          id: { not: currentId },
          OR: [
            { categoryId: currentCourse.categoryId },
            { level: currentCourse.level },
          ],
        },
        select: { id: true, title: true, slug: true, description: true },
        take: limit,
      });

      return related.map((c, i) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        type: "course",
        url: `/courses/${c.slug}`,
        relevanceScore: 1 - i * 0.1,
        excerpt: c.description,
      }));
    }
  }
}

/**
 * Extract potential anchor texts from content
 */
export function extractAnchorCandidates(content: string): string[] {
  const candidates: string[] = [];
  
  // Scientific terms (capitalized words, acronyms)
  const scientificTerms = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  candidates.push(...scientificTerms);
  
  // Acronyms
  const acronyms = content.match(/\b[A-Z]{2,6}\b/g) || [];
  candidates.push(...acronyms);
  
  // Tool names commonly mentioned
  const toolPatterns = [
    /\b(BLAST|BWA|Bowtie|GATK|Samtools|BCFtools|STAR|HISAT|Salmon|Kallisto)\b/gi,
    /\b(MultiQC|FastQC|Nextflow|Snakemake|Galaxy|Bioconductor)\b/gi,
    /\b(Seurat|Scanpy|CellRanger|Monocle|Velocyto)\b/gi,
  ];
  
  for (const pattern of toolPatterns) {
    const matches = content.match(pattern) || [];
    candidates.push(...matches);
  }

  // Remove duplicates and filter
  return [...new Set(candidates)].filter((c) => c.length > 2);
}

/**
 * Suggest internal links for content
 */
export async function suggestInternalLinks(params: {
  content: string;
  currentUrl?: string;
  maxLinks?: number;
}): Promise<LinkSuggestion[]> {
  const { content, currentUrl, maxLinks = 5 } = params;
  const suggestions: LinkSuggestion[] = [];

  // Extract anchor candidates
  const candidates = extractAnchorCandidates(content);
  
  // Search for matching content
  for (const candidate of candidates.slice(0, 10)) {
    // Search for tools with this name
    const tool = await prisma.tool.findFirst({
      where: {
        published: true,
        OR: [
          { name: { contains: candidate } },
          { slug: { contains: candidate.toLowerCase() } },
        ],
      },
      select: { name: true, slug: true, description: true },
    });

    if (tool) {
      const targetUrl = `/directory/tool/${tool.slug}`;
      if (targetUrl !== currentUrl) {
        suggestions.push({
          anchorText: candidate,
          targetUrl,
          targetTitle: tool.name,
          relevance: 0.9,
          context: getContextAroundText(content, candidate),
        });
      }
    }

    // Search for posts with this term
    const post = await prisma.post.findFirst({
      where: {
        published: true,
        OR: [
          { title: { contains: candidate } },
          { slug: { contains: candidate.toLowerCase() } },
        ],
      },
      select: { title: true, slug: true },
    });

    if (post) {
      const targetUrl = `/blog/${post.slug}`;
      if (targetUrl !== currentUrl) {
        suggestions.push({
          anchorText: candidate,
          targetUrl,
          targetTitle: post.title,
          relevance: 0.8,
          context: getContextAroundText(content, candidate),
        });
      }
    }
  }

  // Sort by relevance and deduplicate by target URL
  const seen = new Set<string>();
  return suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .filter((s) => {
      if (seen.has(s.targetUrl)) return false;
      seen.add(s.targetUrl);
      return true;
    })
    .slice(0, maxLinks);
}

/**
 * Get context around a text match
 */
function getContextAroundText(content: string, text: string): string {
  const plainText = content.replace(/<[^>]+>/g, " ");
  const index = plainText.toLowerCase().indexOf(text.toLowerCase());
  
  if (index === -1) return "";
  
  const start = Math.max(0, index - 50);
  const end = Math.min(plainText.length, index + text.length + 50);
  
  return "..." + plainText.substring(start, end).trim() + "...";
}

/**
 * Get URL for content type
 */
function getUrlForType(type: "tool" | "post" | "course", slug: string): string {
  switch (type) {
    case "tool":
      return `/directory/tool/${slug}`;
    case "post":
      return `/blog/${slug}`;
    case "course":
      return `/courses/${slug}`;
  }
}

/**
 * Build a simple link graph for orphan page detection
 */
export async function findOrphanPages(): Promise<{
  tools: Array<{ id: string; name: string; slug: string }>;
  posts: Array<{ id: string; title: string; slug: string }>;
}> {
  // Find tools that are not linked from any post
  const tools = await prisma.tool.findMany({
    where: { published: true },
    select: { id: true, name: true, slug: true },
  });

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, content: true },
  });

  // Check which tools are mentioned in posts
  const mentionedTools = new Set<string>();
  for (const post of posts) {
    const content = post.content?.toLowerCase() || "";
    for (const tool of tools) {
      if (content.includes(tool.slug) || content.includes(tool.name.toLowerCase())) {
        mentionedTools.add(tool.id);
      }
    }
  }

  const orphanTools = tools.filter((t) => !mentionedTools.has(t.id));
  
  // Find posts not linked from other posts
  const mentionedPosts = new Set<string>();
  for (const post of posts) {
    const content = post.content?.toLowerCase() || "";
    for (const otherPost of posts) {
      if (post.id !== otherPost.id && content.includes(otherPost.slug)) {
        mentionedPosts.add(otherPost.id);
      }
    }
  }

  const orphanPosts = posts
    .filter((p) => !mentionedPosts.has(p.id))
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug }));

  return {
    tools: orphanTools,
    posts: orphanPosts,
  };
}
