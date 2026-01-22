"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Bookmark, 
  Trash2, 
  Loader2, 
  Wrench, 
  GraduationCap, 
  FileText,
  ExternalLink,
  FolderOpen
} from "lucide-react";

interface BookmarkItem {
  id: string;
  itemType: string;
  itemId: string;
  createdAt: string;
  item: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    description: string;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/bookmarks");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBookmarks();
    }
  }, [session]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemType: string, itemId: string) => {
    setDeletingId(itemId);
    try {
      const response = await fetch(
        `/api/bookmarks?itemType=${itemType}&itemId=${itemId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        setBookmarks((prev) => prev.filter((b) => b.itemId !== itemId));
      }
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getItemLink = (bookmark: BookmarkItem) => {
    const slug = bookmark.item.slug;
    switch (bookmark.itemType) {
      case "TOOL":
        return `/directory/tool/${slug}`;
      case "COURSE":
        return `/courses/${slug}`;
      case "RESOURCE":
        return `/resources/${slug}`;
      default:
        return "#";
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "TOOL":
        return <Wrench className="h-5 w-5" />;
      case "COURSE":
        return <GraduationCap className="h-5 w-5" />;
      case "RESOURCE":
        return <FileText className="h-5 w-5" />;
      default:
        return <Bookmark className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TOOL":
        return "bg-blue-500/20 text-blue-500";
      case "COURSE":
        return "bg-green-500/20 text-green-500";
      case "RESOURCE":
        return "bg-purple-500/20 text-purple-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const filteredBookmarks = filter === "ALL" 
    ? bookmarks 
    : bookmarks.filter((b) => b.itemType === filter);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4">
            <Bookmark className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Bookmarks
          </h1>
          <p className="text-muted-foreground mt-2">
            {bookmarks.length} saved items
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {["ALL", "TOOL", "COURSE", "RESOURCE"].map((type) => (
            <Button
              key={type}
              variant={filter === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(type)}
              className="rounded-full"
            >
              {type === "ALL" ? "All" : `${type.charAt(0)}${type.slice(1).toLowerCase()}s`}
              {type !== "ALL" && (
                <span className="ml-1 text-xs opacity-70">
                  ({bookmarks.filter((b) => b.itemType === type).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-white/10">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-6">
              {filter === "ALL" 
                ? "Start exploring and save your favorite tools, courses, and resources!"
                : `You haven't saved any ${filter.toLowerCase()}s yet.`}
            </p>
            <Link href="/directory">
              <Button className="rounded-full">
                Browse Directory
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(bookmark.itemType)}`}>
                    {getItemIcon(bookmark.itemType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link 
                          href={getItemLink(bookmark)}
                          className="font-semibold hover:text-primary transition-colors line-clamp-1"
                        >
                          {bookmark.item.name || bookmark.item.title}
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {bookmark.item.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(bookmark.itemType)}`}>
                            {bookmark.itemType}
                          </span>
                          {bookmark.item.category && (
                            <span className="text-xs text-muted-foreground">
                              {bookmark.item.category.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href={getItemLink(bookmark)}>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDelete(bookmark.itemType, bookmark.itemId)}
                          disabled={deletingId === bookmark.itemId}
                        >
                          {deletingId === bookmark.itemId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
