import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Category color mapping for consistent styling
const categoryColors: Record<string, { bg: string; text: string; border: string; glow: string; gradient: string }> = {
  "sequence-analysis": { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/30", gradient: "bg-gradient-to-r from-blue-500 to-blue-600" },
  "genomics": { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", glow: "shadow-emerald-500/30", gradient: "bg-gradient-to-r from-emerald-500 to-emerald-600" },
  "proteomics": { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/30", gradient: "bg-gradient-to-r from-purple-500 to-purple-600" },
  "structural-biology": { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", glow: "shadow-orange-500/30", gradient: "bg-gradient-to-r from-orange-500 to-orange-600" },
  "phylogenetics": { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20", glow: "shadow-cyan-500/30", gradient: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
  "machine-learning": { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20", glow: "shadow-pink-500/30", gradient: "bg-gradient-to-r from-pink-500 to-pink-600" },
  "data-visualization": { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20", glow: "shadow-yellow-500/30", gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
  "workflow": { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20", glow: "shadow-indigo-500/30", gradient: "bg-gradient-to-r from-indigo-500 to-indigo-600" },
};

const defaultCategoryStyle = { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", glow: "shadow-primary/30", gradient: "bg-gradient-to-r from-primary to-primary/80" };

export function getCategoryStyle(slug: string) {
  return categoryColors[slug] || defaultCategoryStyle;
}



// Category background images
const categoryImages: Record<string, string> = {
  "sequence-analysis": "/images/categories/sequence-analysis-bg.jpg",
  "genomics": "/images/categories/genomics-bg.jpg",
  "proteomics": "/images/categories/proteomics-bg.jpg",
  "structural-biology": "/images/categories/structural-biology-bg.jpg",
  "phylogenetics": "/images/categories/phylogenetics-bg.jpg",
  "machine-learning": "/images/categories/machine-learning-bg.jpg",
  "data-visualization": "/images/categories/data-visualization-bg.jpg",
  "workflow": "/images/categories/workflow-bg.jpg",
  "tools": "/images/categories/tools-bg.jpg",
  "courses": "/images/categories/courses-bg.jpg",
  "resources": "/images/categories/resources-bg.jpg",
  "default": "/images/categories/default-bg.jpg",
};

export function getCategoryImage(slug: string): string {
  return categoryImages[slug] || categoryImages["default"];
}
