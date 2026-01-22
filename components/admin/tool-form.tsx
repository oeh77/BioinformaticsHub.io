"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tool {
  id?: string;
  name: string;
  slug: string;
  description: string;
  content?: string | null;
  url?: string | null;
  pricing?: string | null;
  image?: string | null;
  categoryId: string;
  published: boolean;
  featured: boolean;
}

interface ToolFormProps {
  categories: Category[];
  tool?: Tool;
}

export function ToolForm({ categories, tool }: ToolFormProps) {
  const router = useRouter();
  const isEditing = !!tool?.id;
  
  const [formData, setFormData] = useState({
    name: tool?.name || "",
    slug: tool?.slug || "",
    description: tool?.description || "",
    content: tool?.content || "",
    url: tool?.url || "",
    pricing: tool?.pricing || "",
    image: tool?.image || "",
    categoryId: tool?.categoryId || categories[0]?.id || "",
    published: tool?.published ?? true,
    featured: tool?.featured ?? false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const url = isEditing ? `/api/admin/tools/${tool.id}` : "/api/admin/tools";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save tool");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/tools");
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

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Tool name"
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
              placeholder="tool-slug"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the tool"
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Detailed Content</label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="Write detailed information about this tool..."
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">Website URL</label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="pricing" className="block text-sm font-medium mb-2">Pricing</label>
            <select
              id="pricing"
              value={formData.pricing}
              onChange={(e) => setFormData(prev => ({ ...prev, pricing: e.target.value }))}
              title="Pricing Model"
              aria-label="Pricing Model"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Select pricing</option>
              <option value="Free">Free</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Paid</option>
              <option value="Open Source">Open Source</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category *</label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              required
              title="Tool Category"
              aria-label="Tool Category"
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tool Image</label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
              folder="tools"
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Publishing</h2>
        
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
            />
            <span className="text-sm">Published</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 bg-secondary/50 text-primary focus:ring-primary"
            />
            <span className="text-sm">Featured</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/tools">
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
          {isEditing ? "Update Tool" : "Create Tool"}
        </Button>
      </div>
    </form>
  );
}
