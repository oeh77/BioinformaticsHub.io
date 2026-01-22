"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  categories: Category[];
  totalItems: number;
  itemType: string;
  sortOptions?: { value: string; label: string }[];
  showPricing?: boolean;
}

export function FilterBar({ 
  categories, 
  totalItems, 
  itemType,
  sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
  ],
  showPricing = true,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPricing = searchParams.get("pricing") || "";
  const currentSearch = searchParams.get("q") || "";
  
  const [search, setSearch] = useState(currentSearch);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("");
    });
    setSearch("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search });
  };

  const hasActiveFilters = currentCategory || currentPricing || currentSearch;

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${itemType}...`}
              className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
          
          <select
            title="Sort order"
            aria-label="Sort order"
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary outline-none text-sm cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="glass-card p-6 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filter Options</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600">
                <X className="w-4 h-4 mr-1" /> Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                id="category-filter"
                title="Filter by category"
                aria-label="Filter by category"
                value={currentCategory}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg glass border border-white/10 focus:border-primary outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Filter */}
            {showPricing && (
              <div>
                <label className="block text-sm font-medium mb-2">Pricing</label>
                <select
                  id="pricing-filter"
                  title="Filter by pricing"
                  aria-label="Filter by pricing"
                  value={currentPricing}
                  onChange={(e) => updateFilters({ pricing: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg glass border border-white/10 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">All Pricing</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {isPending ? (
            "Loading..."
          ) : (
            `Showing ${totalItems} ${itemType}${totalItems !== 1 ? 's' : ''}`
          )}
        </span>
        {hasActiveFilters && (
          <Button variant="link" size="sm" onClick={clearFilters} className="text-primary">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
