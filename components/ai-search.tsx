"use client";

import { useState, useCallback } from "react";
import { Search, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface AISearchResult {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  score: number;
}

interface AISearchProps {
  placeholder?: string;
}

export function AISearch({ placeholder = "Ask AI anything about bioinformatics tools..." }: AISearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/ai-search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-12 pr-24 py-6 text-lg rounded-2xl bg-background/80 backdrop-blur-md border-primary/20 focus:border-primary/50 shadow-lg"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* AI Badge */}
      <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
        <Sparkles className="h-3 w-3" />
        Powered by AI semantic search — finds tools by meaning, not just keywords
      </p>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !isSearching && results.length === 0 && !error && (
        <div className="mt-6 p-8 rounded-xl bg-secondary/30 text-center text-muted-foreground">
          No tools found matching your query. Try different terms!
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Results
          </h3>
          <div className="grid gap-3">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/directory/tool/${result.slug}`}
                className="group flex items-start gap-4 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {result.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">
                      {result.name}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {result.category}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {Math.round(result.score * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {result.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
