"use client";

import { CommandSearch } from "@/components/command-search";
import type { SearchTool } from "@/lib/search";

interface DirectorySearchProps {
  tools: SearchTool[];
}

export function DirectorySearch({ tools }: DirectorySearchProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <CommandSearch 
        tools={tools} 
        placeholder="Search all tools... (try fuzzy search like 'blst' for BLAST)"
      />
    </div>
  );
}
