"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  categoryId: string;
  published: boolean;
  metaTitle?: string | null;
  metaDesc?: string | null;
}

interface PostFormProps {
  categories: Category[];
  post?: Post;
}

export function PostForm({ categories, post }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post?.id;
  
  const [formData, setFormData] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    image: post?.image || "",
    categoryId: post?.categoryId || categories[0]?.id || "",
    published: post?.published ?? false,
    metaTitle: post?.metaTitle || "",
    metaDesc: post?.metaDesc || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSeo, setShowSeo] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditing ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save post");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      {categories.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between text-yellow-500">
          <span>You need to create a post category before you can publish posts.</span>
          <Link href="/admin/categories">
            <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-500">
              Create Category
            </Button>
          </Link>
        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Post title"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">Slug *</label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="post-slug"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Brief summary of the post (shown in listings)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="Write your blog post content here..."
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Post Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category *</label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              required
              title="Post Category"
              aria-label="Post Category"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
              folder="posts"
            />
          </div>
        </div>
      </div>

      {/* SEO Section */}
      <div className="glass-card p-6 space-y-4">
        <button
          type="button"
          onClick={() => setShowSeo(!showSeo)}
          className="flex items-center justify-between w-full font-semibold"
        >
          <span>SEO Settings</span>
          {showSeo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        {showSeo && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                id="metaTitle"
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO title (defaults to post title)"
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label htmlFor="metaDesc" className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                id="metaDesc"
                value={formData.metaDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDesc: e.target.value }))}
                placeholder="SEO description (defaults to excerpt)"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Publishing</h2>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
          />
          <span className="text-sm">Publish immediately</span>
        </label>
        <p className="text-xs text-muted-foreground">
          {formData.published 
            ? "This post will be visible to all visitors." 
            : "This post will be saved as a draft and won't be visible to visitors."}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/posts">
          <Button type="button" variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEditing ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
