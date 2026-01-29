import OpenAI from "openai";

// Lazy-initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface VectorSearchResult {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  score: number;
}

// In-memory vector store (for production, use Pinecone, Weaviate, or a database with pgvector)
const vectorStore: Map<string, { embedding: number[]; tool: VectorSearchResult }> = new Map();

/**
 * Generate embedding for a text using OpenAI's embedding model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Index a tool with its embedding
 */
export async function indexTool(tool: VectorSearchResult): Promise<void> {
  const text = `${tool.name} ${tool.description} ${tool.category}`;
  const embedding = await generateEmbedding(text);
  vectorStore.set(tool.id, { embedding, tool });
}

/**
 * Index multiple tools in batch
 */
export async function indexTools(tools: VectorSearchResult[]): Promise<void> {
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < tools.length; i += batchSize) {
    const batch = tools.slice(i, i + batchSize);
    await Promise.all(batch.map(indexTool));
  }
}

/**
 * Semantic search for tools using vector embeddings
 */
export async function semanticSearch(
  query: string,
  limit: number = 10
): Promise<VectorSearchResult[]> {
  if (vectorStore.size === 0) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(query);
  
  const results: { tool: VectorSearchResult; score: number }[] = [];
  
  vectorStore.forEach(({ embedding, tool }) => {
    const score = cosineSimilarity(queryEmbedding, embedding);
    results.push({ tool, score });
  });
  
  // Sort by similarity score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // Return top results with scores
  return results.slice(0, limit).map(({ tool, score }) => ({
    ...tool,
    score: Math.round(score * 100) / 100,
  }));
}

/**
 * Check if the vector store is initialized
 */
export function isVectorStoreInitialized(): boolean {
  return vectorStore.size > 0;
}

/**
 * Get vector store size
 */
export function getVectorStoreSize(): number {
  return vectorStore.size;
}

/**
 * Clear the vector store
 */
export function clearVectorStore(): void {
  vectorStore.clear();
}
