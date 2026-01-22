import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dna, Database, BookOpen, Search, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-20">
         <div 
            className="absolute inset-0 bg-cover bg-center animate-pulse-slow opacity-20 dark:opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2670&auto=format&fit=crop)' }}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70" />
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-blob [animation-delay:2s] mix-blend-multiply dark:mix-blend-screen opacity-70" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        
        {/* Pill Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 animate-slide-up backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span className="relative flex h-2 w-2 mx-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          The #1 Resource for Bioinformatics
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up [animation-delay:100ms] leading-[1.1]">
          Accelerate Your <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">Bioinformatics</span> Research
        </h1>
        
        <p className="text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 animate-slide-up [animation-delay:200ms] leading-relaxed">
          Discover a curated universe of 120+ tools, databases, and learning paths. 
          Built for students, researchers, and professionals pushing science forward.
        </p>

        {/* Hero Search Bar - The User Requested "Search Engine Bar in Hero" */}
        <div className="w-full max-w-2xl mx-auto mb-12 relative group animate-slide-up [animation-delay:250ms]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative flex items-center bg-white/10 dark:bg-black/40 border border-white/20 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
                  <Search className="ml-4 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search tools, databases, resources..."
                    className="flex-1 bg-transparent border-none outline-none px-4 h-12 text-lg placeholder:text-muted-foreground/60 text-foreground"
                  />
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-transform active:scale-95 shadow-lg shadow-primary/20">
                    Search
                  </button>
              </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up [animation-delay:300ms]">
          <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            <Link href="/directory" className="flex items-center">
              Browse Tools Directory <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg glass border-white/20 hover:bg-white/40 dark:hover:bg-white/10" asChild>
             <Link href="/resources/beginner-guide">Start Beginner's Guide</Link>
          </Button>
        </div>

        {/* Visual Mockup - Glass Cards */}
        <div className="relative max-w-5xl mx-auto animate-slide-up [animation-delay:400ms]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="glass-card p-8 flex flex-col items-start text-left transform md:-rotate-2 hover:rotate-0 transition-transform duration-500 group border border-white/40 dark:border-white/10">
                    <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                        <Dna className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3">Genomics Tools</h3>
                    <p className="text-muted-foreground leading-relaxed">Current, vetted NGS, Variant Calling, and Assembly workflows at your fingertips.</p>
                </div>
                
                <div className="glass-card p-8 flex flex-col items-start text-left transform md:-translate-y-8 hover:-translate-y-10 transition-transform duration-500 shadow-2xl shadow-primary/10 border border-white/40 dark:border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-2xl text-xs font-bold text-primary">POPULAR</div>
                    <div className="p-3.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 mb-5">
                        <Database className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3">Curated Databases</h3>
                    <p className="text-muted-foreground leading-relaxed">Instant access to essential biological databases and datasets for your research.</p>
                </div>
                
                <div className="glass-card p-8 flex flex-col items-start text-left transform md:rotate-2 hover:rotate-0 transition-transform duration-500 group border border-white/40 dark:border-white/10">
                    <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3">Learning Paths</h3>
                    <p className="text-muted-foreground leading-relaxed">Structured, zero-to-hero guides to master Python, R, and pipeline development.</p>
                </div>
            </div>
            {/* Glow effect behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-gradient-to-r from-primary/10 to-purple-500/10 blur-3xl rounded-full -z-10" />
        </div>
      </div>
    </section>
  );
}
