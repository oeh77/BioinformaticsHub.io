"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Link } from "lucide-react"; // Wait, Link is imported from next/link in original file, but lucide-react in replacement? 
// Checking imports.
import NextLink from "next/link";

interface CategoryFiltersProps {
  initialSearch: string;
  initialSort: string;
  initialPricing: string;
  categorySlug: string;
}

export function CategoryFilters({
  initialSearch,
  initialSort,
  initialPricing,
  categorySlug
}: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "featured", label: "Featured First" },
  ];

  const pricingOptions = [
    { value: "", label: "All Pricing" },
    { value: "free", label: "Free" },
    { value: "freemium", label: "Freemium" },
    { value: "paid", label: "Paid" },
  ];

  const buildUrl = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updates.sort) {
       if (updates.sort === "newest") params.delete("sort");
       else params.set("sort", updates.sort);
    }
    
    if (updates.pricing !== undefined) {
       if (!updates.pricing) params.delete("pricing");
       else params.set("pricing", updates.pricing);
    }
    
    if (updates.q !== undefined) {
       if (!updates.q) params.delete("q");
       else params.set("q", updates.q);
    }

    const queryString = params.toString();
    return `/directory/${categorySlug}${queryString ? `?${queryString}` : ""}`;
  };

  const handleFilterChange = (key: string, value: string) => {
    router.push(buildUrl({ [key]: value }));
  };

  const hasFilters = initialSearch || initialPricing || initialSort !== "newest";

  return (
    <div className="flex flex-wrap gap-4 mb-6 p-4 glass rounded-xl">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          defaultValue={initialSearch}
          placeholder="Search tools..."
          className="w-full px-4 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
                handleFilterChange('q', e.currentTarget.value);
            }
          }}
          onBlur={(e) => {
             if (e.target.value !== initialSearch) {
                 handleFilterChange('q', e.target.value);
             }
          }}
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground">Sort:</label>
        <select
          id="sort-select"
          title="Sort tools"
          value={initialSort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="pricing-select" className="text-sm text-muted-foreground">Pricing:</label>
        <select
          id="pricing-select"
          title="Filter by pricing"
          value={initialPricing}
          onChange={(e) => handleFilterChange('pricing', e.target.value)}
          className="px-3 py-2 rounded-lg glass border border-white/10 focus:border-primary outline-none text-sm cursor-pointer"
        >
          {pricingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <NextLink
          href={`/directory/${categorySlug}`}
          className="text-sm text-red-500 hover:text-red-400 flex items-center"
        >
          Clear Filters
        </NextLink>
      )}
    </div>
  );
}
