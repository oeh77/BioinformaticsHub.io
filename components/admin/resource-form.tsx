"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Resource {
  id?: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  url?: string | null;
  categoryId?: string | null;
}

interface ResourceFormProps {
  categories: Category[];
  resource?: Resource;
}

const RESOURCE_TYPES = [
  "Database",
  "Tutorial",
  "Documentation",
  "Dataset",
  "Software",
  "Protocol",
  "Reference",
  "Community",
  "Other"
];

export function ResourceForm({ categories, resource }: ResourceFormProps) {
  const router = useRouter();
  const isEditing = !!resource?.id;
  
  const [formData, setFormData] = useState({
    title: resource?.title || "",
    slug: resource?.slug || "",
    type: resource?.type || RESOURCE_TYPES[0],
    description: resource?.description || "",
    url: resource?.url || "",
    categoryId: resource?.categoryId || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const url = isEditing ? `/api/admin/resources/${resource.id}` : "/api/admin/resources";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save resource");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/resources");
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
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Resource title"
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
              placeholder="resource-slug"
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
            placeholder="Brief description of the resource"
            required
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold">Resource Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">Type *</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">No Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">Resource URL</label>
          <input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com/resource"
            className="w-full px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/resources">
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
          {isEditing ? "Update Resource" : "Create Resource"}
        </Button>
      </div>
    </form>
  );
}
