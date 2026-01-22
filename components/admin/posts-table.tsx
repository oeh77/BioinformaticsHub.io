"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, ExternalLink, Pencil, Eye } from "lucide-react";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { BulkActions } from "@/components/admin/bulk-actions";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  };
}

interface PostsTableProps {
  posts: Post[];
}

export function PostsTable({ posts }: PostsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggle = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const selectAll = () => {
    setSelectedIds(posts.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        totalItems={posts.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        deleteEndpoint="/api/admin/posts"
        itemName="post"
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === posts.length && posts.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    aria-label="Select all posts"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Post</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isSelected(post.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected(post.id)}
                        onCheckedChange={(checked) => toggle(post.id, checked)}
                        aria-label={`Select ${post.title}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                          {post.title[0]}
                        </div>
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {post.excerpt || post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm px-2 py-1 rounded-full bg-secondary/50">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/posts/${post.id}/preview`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview post">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View post">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit post">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeletePostButton postId={post.id} postName={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
