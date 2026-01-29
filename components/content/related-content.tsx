"use client";

/**
 * Related Content Component
 * 
 * Displays related articles, tools, or courses based on:
 * - Elasticsearch More Like This query
 * - Category/tag matching
 * - Content similarity
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedItem {
  id: string;
  title: string;
  slug: string;
  type: "tool" | "post" | "course";
  url: string;
  excerpt?: string;
  category?: string;
  relevanceScore: number;
}

interface RelatedContentProps {
  contentId: string;
  contentType: "tool" | "post" | "course";
  title: string;
  content?: string;
  limit?: number;
  className?: string;
  variant?: "cards" | "list" | "compact";
}

export function RelatedContent({
  contentId,
  contentType,
  title,
  content = "",
  limit = 4,
  className,
  variant = "cards",
}: RelatedContentProps) {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const params = new URLSearchParams({
          type: contentType,
          id: contentId,
          title,
          limit: limit.toString(),
        });

        if (content) {
          params.set("content", content.substring(0, 500));
        }

        const response = await fetch(`/api/content/related?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          setItems(data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch related content:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelated();
  }, [contentId, contentType, title, content, limit]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-semibold">Related Content</h3>
        <div className={cn(
          variant === "cards" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"
        )}>
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className={variant === "cards" ? "h-32" : "h-16"} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        Related Content
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </h3>

      {variant === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <RelatedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="space-y-3">
          {items.map((item) => (
            <RelatedListItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {variant === "compact" && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.url}
                className="text-sm hover:text-primary transition-colors flex items-center gap-2"
              >
                <Badge variant="outline" className="text-xs shrink-0">
                  {item.type}
                </Badge>
                <span className="truncate">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RelatedCard({ item }: { item: RelatedItem }) {
  return (
    <Link href={item.url}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {item.type}
            </Badge>
            {item.category && (
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            )}
          </div>
          <h4 className="font-medium line-clamp-2 mb-1">{item.title}</h4>
          {item.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.excerpt}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function RelatedListItem({ item }: { item: RelatedItem }) {
  return (
    <Link
      href={item.url}
      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
    >
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
          {item.type}
        </Badge>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.title}</h4>
          {item.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {item.excerpt}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Simple "You May Also Like" section
 */
export function YouMayAlsoLike({
  items,
  className,
}: {
  items: Array<{ title: string; url: string; type?: string }>;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cn("bg-muted/50 rounded-lg p-4", className)}>
      <h4 className="font-medium mb-3">You May Also Like</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              href={item.url}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
