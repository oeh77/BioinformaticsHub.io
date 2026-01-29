"use client";

/**
 * Header Search Component
 * 
 * Compact search with dropdown autocomplete for header integration
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "tool" | "post" | "course";
  title: string;
  slug: string;
  url: string;
  category?: string;
}

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search/advanced?q=${encodeURIComponent(query)}&limit=6&mode=search`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.hits || []);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToResult = useCallback((result: SearchResult) => {
    setShowResults(false);
    setQuery("");
    router.push(result.url);
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults) {
      if (e.key === "Enter" && query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      return;
    }

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
          navigateToResult(results[selectedIndex]);
        } else if (query) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setShowResults(false);
        }
        break;
      case "Escape":
        setShowResults(false);
        inputRef.current?.blur();
        break;
    }
  }, [showResults, selectedIndex, results, query, router, navigateToResult]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tool": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "post": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "course": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "";
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search tools, articles..."
          className="h-9 w-[220px] lg:w-[280px] rounded-full bg-secondary/50 hover:bg-secondary/70 focus:bg-secondary border-none pl-10 pr-8 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          autoComplete="off"
          role="combobox"
          aria-label="Search"
          aria-expanded={showResults ? "true" : "false"}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={showResults ? "header-search-results" : undefined}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div id="header-search-results" className="absolute z-50 w-[320px] lg:w-[400px] right-0 mt-2 bg-popover border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95">
          {results.length > 0 ? (
            <>
              <ul className="max-h-[320px] overflow-y-auto py-2">
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    className={cn(
                      "px-3 py-2 cursor-pointer transition-colors",
                      index === selectedIndex ? "bg-accent" : "hover:bg-accent/50"
                    )}
                    onClick={() => navigateToResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-[10px] shrink-0", getTypeColor(result.type))}>
                        {result.type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{result.title}</div>
                        {result.category && (
                          <span className="text-xs text-muted-foreground">{result.category}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t p-2 bg-muted/30">
                <button
                  onClick={() => {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                    setShowResults(false);
                  }}
                  className="w-full text-sm text-center py-2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  View all results <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                <>
                  <p className="text-sm">No results for &quot;{query}&quot;</p>
                  <p className="text-xs mt-1">Try different keywords</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
