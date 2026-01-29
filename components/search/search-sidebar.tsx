"use client";

/**
 * Search Sidebar Component
 * 
 * Provides:
 * - Filter results by type, category, pricing
 * - Search history (authenticated users)
 * - Saved searches (authenticated users)
 * - Sort options
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  Star, 
  StarOff, 
  Trash2, 
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  SortAsc,
  Bell,
  BellOff,
  Bookmark,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SearchFilters {
  type?: string[];
  category?: string[];
  pricing?: string[];
  sort?: string;
}

interface ResultCounts {
  tools: number;
  courses: number;
  articles: number;
  resources: number;
  jobs: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  resultCount: number;
  createdAt: string;
}

interface SavedSearchItem {
  id: string;
  name: string;
  query: string;
  filters: string | null;
  notifications: boolean;
}

interface SearchSidebarProps {
  query: string;
  filters?: SearchFilters;
  resultCounts?: ResultCounts;
  categories?: Category[];
}

const typeOptions = [
  { value: "tools", label: "Tools", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { value: "courses", label: "Courses", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { value: "articles", label: "Articles", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "resources", label: "Resources", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "jobs", label: "Jobs", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
];

const pricingOptions = [
  { value: "Free", label: "Free" },
  { value: "Freemium", label: "Freemium" },
  { value: "Paid", label: "Paid" },
  { value: "Open Source", label: "Open Source" },
];

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Alphabetical" },
];

export function SearchSidebar({ 
  query, 
  filters = {}, 
  resultCounts,
  categories = []
}: SearchSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    history: false,
    saved: false,
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Selected filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>(filters.type || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.category || []);
  const [selectedPricing, setSelectedPricing] = useState<string[]>(filters.pricing || []);
  const [selectedSort, setSelectedSort] = useState(filters.sort || "relevance");

  // Fetch search history and saved searches
  useEffect(() => {
    if (session?.user) {
      fetchSearchHistory();
      fetchSavedSearches();
    }
  }, [session]);

  const recordSearch = useCallback(async () => {
    if (!query || !resultCounts) return;
    try {
      await fetch("/api/search/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          resultCount: Object.values(resultCounts).reduce((a, b) => a + b, 0),
          filters: filters,
        }),
      });
    } catch (error) {
      console.error("Failed to record search:", error);
    }
  }, [query, resultCounts, filters]);

  // Record search when query changes
  useEffect(() => {
    if (session?.user && query && resultCounts) {
      recordSearch();
    }
  }, [query, session, resultCounts, recordSearch]);

  const fetchSearchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/search/history?limit=10");
      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch search history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchSavedSearches = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch("/api/search/saved");
      if (response.ok) {
        const data = await response.json();
        setSavedSearches(data.savedSearches || []);
      }
    } catch (error) {
      console.error("Failed to fetch saved searches:", error);
    } finally {
      setIsLoadingSaved(false);
    }
  };



  const clearSearchHistory = async () => {
    try {
      await fetch("/api/search/history", { method: "DELETE" });
      setSearchHistory([]);
      toast({ title: "History cleared" });
    } catch (error) {
      toast({ title: "Failed to clear history", variant: "destructive" });
    }
  };

  const removeHistoryItem = async (id: string) => {
    try {
      await fetch(`/api/search/history?id=${id}`, { method: "DELETE" });
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
  };

  const saveCurrentSearch = async () => {
    if (!saveName.trim() || !query) return;
    try {
      const response = await fetch("/api/search/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveName.trim(),
          query,
          filters,
          notifications: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedSearches((prev) => [data.savedSearch, ...prev]);
        setSaveName("");
        setShowSaveInput(false);
        toast({ title: "Search saved!" });
      } else {
        const error = await response.json();
        toast({ title: error.error || "Failed to save", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to save search", variant: "destructive" });
    }
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      await fetch(`/api/search/saved?id=${id}`, { method: "DELETE" });
      setSavedSearches((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Saved search removed" });
    } catch (error) {
      toast({ title: "Failed to remove", variant: "destructive" });
    }
  };

  const toggleNotifications = async (item: SavedSearchItem) => {
    try {
      const response = await fetch("/api/search/saved", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          notifications: !item.notifications,
        }),
      });

      if (response.ok) {
        setSavedSearches((prev) =>
          prev.map((s) =>
            s.id === item.id ? { ...s, notifications: !s.notifications } : s
          )
        );
        toast({
          title: item.notifications ? "Notifications disabled" : "Notifications enabled",
        });
      }
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedTypes.length) params.set("type", selectedTypes.join(","));
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedPricing.length) params.set("pricing", selectedPricing.join(","));
    if (selectedSort !== "relevance") params.set("sort", selectedSort);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedPricing([]);
    setSelectedSort("relevance");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const runSavedSearch = (item: SavedSearchItem) => {
    const savedFilters = item.filters ? JSON.parse(item.filters) : {};
    const params = new URLSearchParams();
    params.set("q", item.query);
    if (savedFilters.type?.length) params.set("type", savedFilters.type.join(","));
    if (savedFilters.category?.length) params.set("category", savedFilters.category.join(","));
    if (savedFilters.pricing?.length) params.set("pricing", savedFilters.pricing.join(","));
    if (savedFilters.sort && savedFilters.sort !== "relevance") params.set("sort", savedFilters.sort);
    router.push(`/search?${params.toString()}`);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedCategories.length > 0 || selectedPricing.length > 0 || selectedSort !== "relevance";

  return (
    <div className="space-y-6">
      {/* Filter Results */}
      <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
        <button
          onClick={() => toggleSection("filters")}
          className="w-full flex items-center justify-between font-bold text-lg"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" /> Filter Results
          </span>
          {expandedSections.filters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expandedSections.filters && (
          <div className="space-y-5 pt-2">
            {/* Result type counts */}
            {resultCounts && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Content Type</label>
                <div className="space-y-1.5">
                  {typeOptions.map((option) => {
                    const count = resultCounts[option.value as keyof ResultCounts] || 0;
                    const isSelected = selectedTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedTypes((prev) =>
                            isSelected
                              ? prev.filter((t) => t !== option.value)
                              : [...prev, option.value]
                          );
                        }}
                        className={cn(
                          "w-full flex items-center justify-between text-sm py-1.5 px-2 rounded-lg transition-colors",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-white/5"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", option.color.split(" ")[0])} />
                          {option.label}
                        </span>
                        <span className="font-medium bg-secondary/50 px-2 py-0.5 rounded-md text-xs">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Category filter */}
            {categories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {categories.slice(0, 8).map((cat) => {
                    const isSelected = selectedCategories.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategories((prev) =>
                            isSelected
                              ? prev.filter((c) => c !== cat.slug)
                              : [...prev, cat.slug]
                          );
                        }}
                        className={cn(
                          "w-full text-left text-sm py-1 px-2 rounded-lg transition-colors truncate",
                          isSelected ? "bg-primary/10 text-primary" : "hover:bg-white/5"
                        )}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pricing filter */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Pricing</label>
              <div className="flex flex-wrap gap-2">
                {pricingOptions.map((option) => {
                  const isSelected = selectedPricing.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPricing((prev) =>
                          isSelected
                            ? prev.filter((p) => p !== option.value)
                            : [...prev, option.value]
                        );
                      }}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full border transition-colors",
                        isSelected
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <SortAsc className="w-3 h-3" /> Sort By
              </label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full text-sm bg-secondary/50 border border-white/10 rounded-lg px-3 py-2"
                aria-label="Sort results by"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply/Clear buttons */}
            <div className="flex gap-2 pt-2">
              <Button onClick={applyFilters} size="sm" className="flex-1">
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search History - Only for authenticated users */}
      {session?.user && (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <button
            onClick={() => toggleSection("history")}
            className="w-full flex items-center justify-between font-bold text-lg"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" /> Recent Searches
            </span>
            {expandedSections.history ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.history && (
            <div className="space-y-2 pt-2">
              {isLoadingHistory ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : searchHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent searches
                </p>
              ) : (
                <>
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm py-1.5 group"
                    >
                      <button
                        onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
                        className="flex-1 text-left hover:text-primary transition-colors truncate"
                      >
                        {item.query}
                      </button>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {item.resultCount} results
                      </span>
                      <button
                        onClick={() => removeHistoryItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        aria-label="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-destructive hover:text-destructive mt-2"
                    onClick={clearSearchHistory}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Clear History
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Saved Searches - Only for authenticated users */}
      {session?.user && (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <button
            onClick={() => toggleSection("saved")}
            className="w-full flex items-center justify-between font-bold text-lg"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" /> Saved Searches
            </span>
            {expandedSections.saved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedSections.saved && (
            <div className="space-y-3 pt-2">
              {/* Save current search */}
              {query && (
                <div className="space-y-2">
                  {showSaveInput ? (
                    <div className="flex gap-2">
                      <Input
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Name this search..."
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && saveCurrentSearch()}
                      />
                      <Button size="sm" onClick={saveCurrentSearch} disabled={!saveName.trim()}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowSaveInput(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowSaveInput(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Save Current Search
                    </Button>
                  )}
                </div>
              )}

              {isLoadingSaved ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : savedSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved searches yet
                </p>
              ) : (
                <div className="space-y-2">
                  {savedSearches.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-sm py-2 px-2 rounded-lg hover:bg-white/5 group"
                    >
                      <button
                        onClick={() => runSavedSearch(item)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          &quot;{item.query}&quot;
                        </div>
                      </button>
                      <button
                        onClick={() => toggleNotifications(item)}
                        className={cn(
                          "p-1 rounded transition-colors",
                          item.notifications
                            ? "text-amber-500 hover:text-amber-400"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={item.notifications ? "Disable notifications" : "Enable notifications"}
                      >
                        {item.notifications ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteSavedSearch(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                        aria-label="Delete saved search"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!session?.user && (
        <div className="glass p-6 rounded-2xl border border-white/5 text-center">
          <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to save searches and view your search history
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
