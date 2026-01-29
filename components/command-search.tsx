"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOramaSearch } from "@/hooks/use-orama-search";
import type { SearchTool } from "@/lib/search";

interface CommandSearchProps {
  tools: SearchTool[];
  placeholder?: string;
}

export function CommandSearch({
  tools,
  placeholder = "Search tools... (fuzzy search enabled)",
}: CommandSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { query, setQuery, results, isLoading, isInitialized } =
    useOramaSearch({ tools });

  const handleSelect = useCallback(
    (tool: SearchTool) => {
      router.push(`/directory/tool/${tool.slug}`);
      setOpen(false);
      setQuery("");
    },
    [router, setQuery]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          setOpen(false);
          setQuery("");
          break;
      }
    },
    [open, results, selectedIndex, handleSelect, setQuery]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [isMounted, setIsMounted] = useState(false);
  // Track previous results to reset index when they change
  const [prevResults, setPrevResults] = useState(results);
  
  if (results !== prevResults) {
    setPrevResults(results);
    setSelectedIndex(0);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-4 h-11 bg-background/60 backdrop-blur-md border-border/50"
          aria-label="Search tools"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && query.length > 0 && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-lg overflow-hidden"
        >
          {!isInitialized ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing search...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tools found for &quot;{query}&quot;
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto" role="listbox" aria-label="Search results">
              {results.map((tool, index) => (
                <li
                  key={tool.id}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{tool.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {tool.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {tool.category}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
