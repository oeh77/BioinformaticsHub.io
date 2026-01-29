"use client";

/**
 * Advanced Search Component
 * 
 * Full-featured search with:
 * - Real-time autocomplete
 * - Faceted filters
 * - Highlighted results
 * - Keyboard navigation
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "tool" | "post" | "course";
  title: string;
  slug: string;
  description: string | null;
  category?: string;
  url: string;
  highlight?: Record<string, string[]>;
}

interface Facet {
  key: string;
  count: number;
}

interface SearchResponse {
  hits: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  facets?: {
    types: Facet[];
    categories: Facet[];
    pricing: Facet[];
  };
}

interface AdvancedSearchProps {
  initialQuery?: string;
  showFilters?: boolean;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function AdvancedSearch({
  initialQuery = "",
  showFilters = true,
  onResultClick,
  className,
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery || searchParams.get("q") || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<SearchResponse["facets"]>();
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string | undefined>(
    searchParams.get("type") || undefined
  );
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    searchParams.get("category") || undefined
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);


  const performSearch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        q: query,
        ...(selectedType && { type: selectedType }),
        ...(selectedCategory && { category: selectedCategory }),
        limit: "8",
      });

      const response = await fetch(`/api/search/advanced?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Search failed");

      const data: SearchResponse = await response.json();
      
      setResults(data.hits);
      setFacets(data.facets);
      setTotal(data.total);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Search error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedType, selectedCategory]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchDebounce = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query, selectedType, selectedCategory, performSearch]);



  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query) {
          // Go to full search page
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }
        break;
      case "Escape":
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    if (onResultClick) {
      onResultClick(result);
    } else {
      router.push(result.url);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const toggleFilter = (type: "type" | "category", value: string) => {
    if (type === "type") {
      setSelectedType(selectedType === value ? undefined : value);
    } else {
      setSelectedCategory(selectedCategory === value ? undefined : value);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search tools, articles, courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-10"
          aria-label="Search"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showResults}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Active Filters */}
      {(selectedType || selectedCategory) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedType && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSelectedType(undefined)}
            >
              {selectedType} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setSelectedCategory(undefined)}
            >
              {selectedCategory} <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          id="search-results"
          className="absolute z-50 w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden"
        >
          {/* Filters Row */}
          {showFilters && facets && facets.types.length > 0 && (
            <div className="p-2 border-b bg-muted/50 flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {facets.types.map((type) => (
                <Badge
                  key={type.key}
                  variant={selectedType === type.key ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleFilter("type", type.key)}
                >
                  {formatTypeName(type.key)} ({type.count})
                </Badge>
              ))}
            </div>
          )}

          {/* Results List */}
          {results.length > 0 ? (
            <ul className="max-h-[400px] overflow-y-auto" role="listbox" aria-label="Search results">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  role="option"
                  aria-selected={index === selectedIndex ? true : false}
                  className={cn(
                    "px-4 py-3 cursor-pointer border-b last:border-0 transition-colors",
                    index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  )}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5 text-xs shrink-0">
                      {result.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        dangerouslySetInnerHTML={{
                          __html:
                            result.highlight?.title?.[0] ||
                            result.highlight?.name?.[0] ||
                            result.title,
                        }}
                      />
                      {result.description && (
                        <p
                          className="text-sm text-muted-foreground line-clamp-2 mt-0.5"
                          dangerouslySetInnerHTML={{
                            __html:
                              result.highlight?.description?.[0] ||
                              truncate(result.description, 100),
                          }}
                        />
                      )}
                      {result.category && (
                        <span className="text-xs text-muted-foreground">
                          in {result.category}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <div>
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-2 border-t bg-muted/50 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
              >
                View all {total} results →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

function formatTypeName(indexName: string): string {
  if (indexName.includes("tools")) return "Tools";
  if (indexName.includes("posts")) return "Articles";
  if (indexName.includes("courses")) return "Courses";
  return indexName;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
