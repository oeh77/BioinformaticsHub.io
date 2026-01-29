/**
 * Elasticsearch Index Management
 * 
 * Handles index creation, data sync from Prisma database
 * Uses plain objects for Elasticsearch v9.x compatibility
 */

import { getElasticsearchClient, getIndexName, isElasticsearchEnabled } from "./client";
import { analysisSettings, indexMappings } from "./mappings";
import { prisma } from "@/lib/prisma";

type IndexType = "tools" | "posts" | "courses";

/**
 * Create an index with proper mappings
 */
export async function createIndex(indexType: IndexType): Promise<boolean> {
  if (!isElasticsearchEnabled()) {
    console.log("Elasticsearch is disabled, skipping index creation");
    return false;
  }

  const client = getElasticsearchClient();
  const indexName = getIndexName(indexType);

  try {
    const exists = await client.indices.exists({ index: indexName });
    
    if (exists) {
      console.log(`Index ${indexName} already exists`);
      return true;
    }

    // Create index with simple settings (custom analyzers removed for v9.x compatibility)
    await client.indices.create({
      index: indexName,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        refresh_interval: "1s",
      },
      mappings: {
        properties: {
          id: { type: "keyword" },
          name: { type: "text", fields: { keyword: { type: "keyword" } } },
          title: { type: "text", fields: { keyword: { type: "keyword" } } },
          slug: { type: "keyword" },
          description: { type: "text" },
          excerpt: { type: "text" },
          content: { type: "text" },
          categoryId: { type: "keyword" },
          categoryName: { type: "text", fields: { keyword: { type: "keyword" } } },
          categorySlug: { type: "keyword" },
          pricing: { type: "keyword" },
          level: { type: "keyword" },
          provider: { type: "keyword" },
          url: { type: "keyword" },
          image: { type: "keyword" },
          published: { type: "boolean" },
          featured: { type: "boolean" },
          createdAt: { type: "date" },
          updatedAt: { type: "date" },
          suggest: { type: "completion" },
        },
      },
    });

    console.log(`✅ Created index: ${indexName}`);
    return true;
  } catch (error) {
    console.error(`Failed to create index ${indexName}:`, error);
    return false;
  }
}

/**
 * Delete an index
 */
export async function deleteIndex(indexType: IndexType): Promise<boolean> {
  if (!isElasticsearchEnabled()) return false;

  const client = getElasticsearchClient();
  const indexName = getIndexName(indexType);

  try {
    const exists = await client.indices.exists({ index: indexName });
    
    if (!exists) {
      console.log(`Index ${indexName} does not exist`);
      return true;
    }

    await client.indices.delete({ index: indexName });
    console.log(`🗑️ Deleted index: ${indexName}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete index ${indexName}:`, error);
    return false;
  }
}

/**
 * Create all indices
 */
export async function createAllIndices(): Promise<void> {
  const indexTypes: IndexType[] = ["tools", "posts", "courses"];
  
  for (const indexType of indexTypes) {
    await createIndex(indexType);
  }
}

/**
 * Recreate an index (delete and create fresh)
 */
export async function recreateIndex(indexType: IndexType): Promise<boolean> {
  await deleteIndex(indexType);
  return createIndex(indexType);
}

/**
 * Index a single document
 */
export async function indexDocument(
  indexType: IndexType,
  id: string,
  document: Record<string, unknown>
): Promise<boolean> {
  if (!isElasticsearchEnabled()) return false;

  const client = getElasticsearchClient();
  const indexName = getIndexName(indexType);

  try {
    await client.index({
      index: indexName,
      id,
      document,
      refresh: true,
    });
    return true;
  } catch (error) {
    console.error(`Failed to index document ${id} in ${indexName}:`, error);
    return false;
  }
}

/**
 * Delete a document from index
 */
export async function deleteDocument(indexType: IndexType, id: string): Promise<boolean> {
  if (!isElasticsearchEnabled()) return false;

  const client = getElasticsearchClient();
  const indexName = getIndexName(indexType);

  try {
    await client.delete({
      index: indexName,
      id,
      refresh: true,
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete document ${id} from ${indexName}:`, error);
    return false;
  }
}

/**
 * Bulk index documents
 */
export async function bulkIndex(
  indexType: IndexType,
  documents: Array<{ id: string; document: Record<string, unknown> }>
): Promise<{ success: number; failed: number }> {
  if (!isElasticsearchEnabled()) {
    return { success: 0, failed: documents.length };
  }

  const client = getElasticsearchClient();
  const indexName = getIndexName(indexType);

  const operations = documents.flatMap(({ id, document }) => [
    { index: { _index: indexName, _id: id } },
    document,
  ]);

  try {
    const response = await client.bulk({
      refresh: true,
      operations,
    });

    let success = 0;
    let failed = 0;

    if (response.items) {
      for (const item of response.items) {
        if (item.index?.error) {
          failed++;
          console.error(`Failed to index document:`, item.index.error);
        } else {
          success++;
        }
      }
    }

    return { success, failed };
  } catch (error) {
    console.error(`Bulk indexing failed:`, error);
    return { success: 0, failed: documents.length };
  }
}

/**
 * Sync all tools from database to Elasticsearch
 */
export async function syncTools(): Promise<{ success: number; failed: number }> {
  const tools = await prisma.tool.findMany({
    where: { published: true },
    include: { category: true },
  });

  const documents = tools.map((tool) => ({
    id: tool.id,
    document: {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      content: tool.content,
      categoryId: tool.categoryId,
      categoryName: tool.category.name,
      categorySlug: tool.category.slug,
      pricing: tool.pricing,
      url: tool.url,
      image: tool.image,
      published: tool.published,
      featured: tool.featured,
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt,
      suggest: {
        input: [tool.name, tool.slug].filter(Boolean),
        weight: tool.featured ? 10 : 1,
      },
    },
  }));

  console.log(`📦 Syncing ${documents.length} tools to Elasticsearch...`);
  return bulkIndex("tools", documents);
}

/**
 * Sync all posts from database to Elasticsearch
 */
export async function syncPosts(): Promise<{ success: number; failed: number }> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { category: true },
  });

  const documents = posts.map((post) => ({
    id: post.id,
    document: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      categoryId: post.categoryId,
      categoryName: post.category.name,
      categorySlug: post.category.slug,
      image: post.image,
      published: post.published,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      suggest: {
        input: [post.title],
        weight: 1,
      },
    },
  }));

  console.log(`📦 Syncing ${documents.length} posts to Elasticsearch...`);
  return bulkIndex("posts", documents);
}

/**
 * Sync all courses from database to Elasticsearch
 */
export async function syncCourses(): Promise<{ success: number; failed: number }> {
  const courses = await prisma.course.findMany({
    where: { published: true },
    include: { category: true },
  });

  const documents = courses.map((course) => ({
    id: course.id,
    document: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      categoryId: course.categoryId,
      categoryName: course.category?.name,
      level: course.level,
      provider: course.provider,
      url: course.url,
      image: course.image,
      published: course.published,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      suggest: {
        input: [course.title],
        weight: 1,
      },
    },
  }));

  console.log(`📦 Syncing ${documents.length} courses to Elasticsearch...`);
  return bulkIndex("courses", documents);
}

/**
 * Full sync of all indices
 */
export async function syncAll(): Promise<void> {
  console.log("🔄 Starting full Elasticsearch sync...\n");
  
  // Create indices if they don't exist
  await createAllIndices();
  
  // Sync each content type
  const toolsResult = await syncTools();
  console.log(`   Tools: ${toolsResult.success} indexed, ${toolsResult.failed} failed`);
  
  const postsResult = await syncPosts();
  console.log(`   Posts: ${postsResult.success} indexed, ${postsResult.failed} failed`);
  
  const coursesResult = await syncCourses();
  console.log(`   Courses: ${coursesResult.success} indexed, ${coursesResult.failed} failed`);
  
  console.log("\n✅ Elasticsearch sync complete!");
}
