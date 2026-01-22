import Link from "next/link";
import { Search } from "lucide-react";

const popularCategories = [
  "RNA-seq", "Variant Calling", "Single-cell", "Nextflow", "Python", "R/Bioconductor", "Cloud", "Machine Learning"
];

export function SearchSection() {
  return (
    <section className="container mx-auto px-4 -mt-8 relative z-20">
      <form action="/search" method="GET" className="glass-card max-w-4xl mx-auto p-2 rounded-full flex items-center shadow-xl">
        <Search className="ml-4 w-5 h-5 text-muted-foreground shrink-0" />
        <input 
            type="text"
            name="q"
            placeholder="Search tools, courses, or topics (e.g. 'Single-cell analysis')..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-base h-12 px-4 placeholder:text-muted-foreground/70"
            autoComplete="off"
        />
        <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 rounded-full font-medium transition-colors mr-1">
            Search
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="text-sm text-muted-foreground mr-2">Popular:</span>
        {popularCategories.map((cat) => (
            <Link 
                key={cat} 
                href={`/directory/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
            >
                {cat}
            </Link>
        ))}
      </div>
    </section>
  );
}
