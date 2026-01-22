import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CategoryColor = "blue" | "green" | "purple" | "orange" | "pink" | "cyan" | "indigo" | "rose" | "teal" | "amber";

const categoryColors: Record<string, { bg: string, text: string, border: string, glow: string, gradient: string }> = {
  "rna-seq-analysis": { 
      bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/10", gradient: "bg-gradient-to-r from-blue-600 to-cyan-500"
  },
  "variant-calling": { 
      bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20", glow: "shadow-red-500/10", gradient: "bg-gradient-to-r from-red-600 to-orange-500"
  },
  "single-cell-analysis": { 
      bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/10", gradient: "bg-gradient-to-r from-purple-600 to-pink-500"
  },
  "metagenomics": { 
      bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", glow: "shadow-emerald-500/10", gradient: "bg-gradient-to-r from-emerald-600 to-teal-500"
  },
  "proteomics": { 
      bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", glow: "shadow-orange-500/10", gradient: "bg-gradient-to-r from-orange-600 to-yellow-500"
  },
  "structural-bioinformatics": { 
      bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20", glow: "shadow-cyan-500/10", gradient: "bg-gradient-to-r from-cyan-600 to-blue-500"
  },
  "multi-omics-integration": { 
      bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20", glow: "shadow-indigo-500/10", gradient: "bg-gradient-to-r from-indigo-600 to-purple-500"
  },
  "visualization": { 
      bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20", glow: "shadow-pink-500/10", gradient: "bg-gradient-to-r from-pink-600 to-rose-500"
  },
  "workflow-managers": { 
      bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20", glow: "shadow-slate-500/10", gradient: "bg-gradient-to-r from-slate-600 to-gray-500"
  },
  "cloud-platforms": { 
      bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20", glow: "shadow-sky-500/10", gradient: "bg-gradient-to-r from-sky-600 to-cyan-500"
  },
  "ai-ml-in-bioinformatics": { 
      bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20", glow: "shadow-violet-500/10", gradient: "bg-gradient-to-r from-violet-600 to-indigo-500"
  },
  "beginner-guides": { 
      bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", glow: "shadow-green-500/10", gradient: "bg-gradient-to-r from-green-600 to-teal-500"
  },
};

const categoryImages: Record<string, string> = {
  "rna-seq-analysis": "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2574&auto=format&fit=crop", // Abstract cells/blue
  "variant-calling": "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=2680&auto=format&fit=crop", // Red DNA/Medical
  "single-cell-analysis": "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2544&auto=format&fit=crop", // Purple abstract
  "metagenomics": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop", // Green nature/science
  "proteomics": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2670&auto=format&fit=crop", // Orange chemical structure
  "structural-bioinformatics": "https://images.unsplash.com/photo-1614935151651-0bea6508db6b?q=80&w=2625&auto=format&fit=crop", // Blue/structure
  "ai-ml-in-bioinformatics": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop", // Violet AI/Network
  "courses": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop", // Education/Learning
  "resources": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2628&auto=format&fit=crop", // Library/Books
  "default": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" // Abstract fluid
};

const palettes = [
    { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", glow: "shadow-blue-500/10", gradient: "bg-gradient-to-r from-blue-600 to-cyan-500" },
    { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20", glow: "shadow-purple-500/10", gradient: "bg-gradient-to-r from-purple-600 to-pink-500" },
    { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20", glow: "shadow-green-500/10", gradient: "bg-gradient-to-r from-green-600 to-teal-500" },
    { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20", glow: "shadow-orange-500/10", gradient: "bg-gradient-to-r from-orange-600 to-yellow-500" },
    { bg: "bg-pink-500/10", text: "text-pink-500", border: "border-pink-500/20", glow: "shadow-pink-500/10", gradient: "bg-gradient-to-r from-pink-600 to-rose-500" },
    { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20", glow: "shadow-cyan-500/10", gradient: "bg-gradient-to-r from-cyan-600 to-blue-500" },
    { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20", glow: "shadow-rose-500/10", gradient: "bg-gradient-to-r from-rose-600 to-orange-500" },
    { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", glow: "shadow-amber-500/10", gradient: "bg-gradient-to-r from-amber-600 to-orange-500" },
];

export function getCategoryStyle(slug: string) {
  if (categoryColors[slug]) return categoryColors[slug];
  let sum = 0;
  for (let i = 0; i < slug.length; i++) {
    sum += slug.charCodeAt(i);
  }
  return palettes[sum % palettes.length];
}

export function getCategoryImage(slug: string) {
    if (categoryImages[slug]) return categoryImages[slug];
    return categoryImages['default'];
}
