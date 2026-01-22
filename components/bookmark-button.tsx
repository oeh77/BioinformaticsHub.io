"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  itemType: "TOOL" | "COURSE" | "RESOURCE";
  itemId: string;
  variant?: "default" | "icon";
  className?: string;
}

export function BookmarkButton({ 
  itemType, 
  itemId, 
  variant = "default",
  className 
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if item is already bookmarked
  useEffect(() => {
    if (session?.user) {
      checkBookmarkStatus();
    } else {
      setIsChecking(false);
    }
  }, [session, itemId, itemType]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        const bookmarks = await response.json();
        const exists = bookmarks.some(
          (b: { itemType: string; itemId: string }) => 
            b.itemType === itemType && b.itemId === itemId
        );
        setIsBookmarked(exists);
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggle = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(
          `/api/bookmarks?itemType=${itemType}&itemId=${itemId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          setIsBookmarked(false);
        }
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemType, itemId }),
        });
        if (response.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return variant === "icon" ? (
      <Button variant="ghost" size="icon" className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    ) : (
      <Button variant="outline" className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "transition-all",
          isBookmarked && "text-primary",
          className
        )}
        title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Bookmark 
            className={cn("h-5 w-5", isBookmarked && "fill-current")} 
          />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "transition-all",
        isBookmarked && "bg-primary hover:bg-primary/90",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Bookmark 
          className={cn("h-4 w-4 mr-2", isBookmarked && "fill-current")} 
        />
      )}
      {isBookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
