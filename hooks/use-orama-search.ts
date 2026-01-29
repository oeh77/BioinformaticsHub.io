"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SearchTool,
  initializeSearch,
  searchTools,
  isSearchInitialized,
} from "@/lib/search";

interface UseOramaSearchProps {
  tools: SearchTool[];
}

interface UseOramaSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchTool[];
  isLoading: boolean;
  isInitialized: boolean;
}

export function useOramaSearch({
  tools,
}: UseOramaSearchProps): UseOramaSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Initialize based on current state - avoids setState in effect
  const [isInitialized, setIsInitialized] = useState(() => isSearchInitialized());

  // Initialize Orama on mount
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (tools.length > 0 && !isSearchInitialized()) {
        await initializeSearch(tools);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };
    
    init();
    return () => { mounted = false; };
  }, [tools]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    const handler = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setResults([]);
        return;
      }
      setIsLoading(true);
      const searchResults = await searchTools(searchQuery);
      setResults(searchResults);
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(handler);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, isInitialized, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isInitialized,
  };
}
