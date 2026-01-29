import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: string;
    backgroundImage?: string;
    className?: string;
}

export function PageHeader({ title, subtitle, backgroundImage, className }: PageHeaderProps) {
  return (
    <div className={cn("relative w-full overflow-hidden text-center flex flex-col items-center justify-center py-20 px-4", className)} 
         style={{ minHeight: '320px' }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
         {/* Fallback gradient if no image */}
         <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/10" />
         
         {backgroundImage && (
             <div className="absolute inset-0 opacity-30 dark:opacity-20 animate-pulse-slow">
                <Image 
                    src={backgroundImage} 
                    alt="Background" 
                    fill 
                    className="object-cover object-center"
                    priority
                />
             </div>
         )}
         {/* Gradient Overlay for Fade */}
         <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-sm text-foreground">
            {title}
          </h1>
          
          {subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {subtitle}
              </p>
          )}

          {/* Large Hero Search Bar */}
          <div className="w-full max-w-2xl mx-auto mt-8 relative group text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity" />
              <form action="/search" method="GET" className="relative flex items-center bg-white/10 dark:bg-black/40 border border-white/20 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">
                  <Search className="ml-4 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors shrink-0" />
                  <input 
                    type="text" 
                    name="q"
                    placeholder="Search tools, topics, or resources..."
                    className="flex-1 bg-transparent border-none outline-none px-4 h-10 text-lg placeholder:text-muted-foreground/60 text-foreground"
                    autoComplete="off"
                  />
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-full transition-transform active:scale-95 shadow-lg shadow-primary/20 shrink-0">
                    Search
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
}
