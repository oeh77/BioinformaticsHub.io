"use client";

import { create, search, insertMultiple, Orama } from "@orama/orama";

export interface SearchTool {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  pricing: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let toolsIndex: Orama<any> | null = null;

export async function initializeSearch(tools: SearchTool[]) {
  toolsIndex = await create({
    schema: {
      id: "string",
      name: "string",
      description: "string",
      slug: "string",
      category: "string",
      pricing: "string",
    },
  });

  await insertMultiple(toolsIndex, tools);
  return toolsIndex;
}

export async function searchTools(query: string, limit = 10): Promise<SearchTool[]> {
  if (!toolsIndex) {
    return [];
  }

  const results = await search(toolsIndex, {
    term: query,
    limit,
    tolerance: 2, // Allows typos
    boost: {
      name: 2, // Prioritize name matches
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.hits.map((hit: any) => ({
    id: hit.document.id as string,
    name: hit.document.name as string,
    description: hit.document.description as string,
    slug: hit.document.slug as string,
    category: hit.document.category as string,
    pricing: hit.document.pricing as string,
  }));
}

export function isSearchInitialized(): boolean {
  return toolsIndex !== null;
}
