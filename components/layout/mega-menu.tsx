"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Dna,
  Microscope,
  GraduationCap,
  BookOpen,
  Database,
  Sparkles,
  TrendingUp,
  Layers,
  FileText,
  Users,
  Beaker,
  Network
} from "lucide-react"

const categoryItems = [
  { 
    title: "RNA-seq", 
    href: "/directory/rna-seq-analysis", 
    description: "Quantification and analysis of transcriptome",
    icon: Dna,
    gradient: "from-emerald-500/20 to-teal-500/20",
    color: "text-emerald-400"
  },
  { 
    title: "Variant Calling", 
    href: "/directory/variant-calling", 
    description: "Identify SNVs and Indels from NGS data",
    icon: Layers,
    gradient: "from-blue-500/20 to-cyan-500/20",
    color: "text-blue-400"
  },
  { 
    title: "Single-cell", 
    href: "/directory/single-cell-analysis", 
    description: "Analyze scRNA-seq and spatial data",
    icon: Microscope,
    gradient: "from-purple-500/20 to-pink-500/20",
    color: "text-purple-400"
  },
  { 
    title: "Metagenomics", 
    href: "/directory/metagenomics", 
    description: "Microbial community analysis",
    icon: Network,
    gradient: "from-orange-500/20 to-amber-500/20",
    color: "text-orange-400"
  },
  { 
    title: "Proteomics", 
    href: "/directory/proteomics", 
    description: "Mass spec and protein structure",
    icon: Beaker,
    gradient: "from-rose-500/20 to-red-500/20",
    color: "text-rose-400"
  },
  { 
    title: "All Categories", 
    href: "/directory", 
    description: "Browse all 15+ tool categories",
    icon: Sparkles,
    gradient: "from-violet-500/20 to-indigo-500/20",
    color: "text-violet-400"
  },
]

const directoryFeatures = [
  { 
    title: "Popular Tools", 
    href: "/directory",
    description: "Browse the most used tools in the field",
    icon: TrendingUp,
    color: "text-blue-400"
  },
  { 
    title: "New Arrivals", 
    href: "/directory",
    description: "Check out the latest additions this week",
    icon: Sparkles,
    color: "text-purple-400"
  },
  { 
    title: "By Platform", 
    href: "/directory",
    description: "Filter by Cloud, Desktop, R, or Python",
    icon: Layers,
    color: "text-emerald-400"
  },
]

export function MegaMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Directory Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="group relative bg-transparent hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
              <span>Directory</span>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[450px] lg:w-[550px] lg:grid-cols-[.75fr_1fr] glass-card border border-white/10 animate-fade-in">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <a
                    className="group flex h-full w-full select-none flex-col justify-end rounded-xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 p-6 no-underline outline-none hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                    href="/directory"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500" />
                    <Database className="h-12 w-12 mb-4 text-blue-400 group-hover:text-blue-300 transition-colors relative z-10" />
                    <div className="mb-2 text-lg font-bold relative z-10 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      Tools Directory
                    </div>
                    <p className="text-sm leading-tight text-white/80 relative z-10">
                      Explore over 120 bioinformatics tools curated for researchers.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              {directoryFeatures.map((item) => (
                <ColorfulListItem
                  key={item.title}
                  href={item.href}
                  title={item.title}
                  icon={item.icon}
                  color={item.color}
                >
                  {item.description}
                </ColorfulListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        {/* Categories Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="group relative bg-transparent hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
              <span>Categories</span>
            </div>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[450px] gap-3 p-4 md:w-[550px] md:grid-cols-2 lg:w-[650px] glass-card border border-white/10 animate-fade-in">
              {categoryItems.map((item) => (
                <GradientCategoryItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  gradient={item.gradient}
                  color={item.color}
                >
                  {item.description}
                </GradientCategoryItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        {/* Blog Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(
            navigationMenuTriggerStyle(), 
            "group bg-transparent hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 transition-all duration-300 pointer-events-auto"
          )}>
            <Link href="/blog">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 group-hover:text-emerald-400 transition-colors" />
                <span>Blog</span>
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Courses Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(
            navigationMenuTriggerStyle(), 
            "group bg-transparent hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-amber-500/10 transition-all duration-300 pointer-events-auto"
          )}>
            <Link href="/courses">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 group-hover:text-orange-400 transition-colors" />
                <span>Courses</span>
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Compare Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(
            navigationMenuTriggerStyle(), 
            "group bg-transparent hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300 pointer-events-auto"
          )}>
            <Link href="/compare">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 group-hover:text-cyan-400 transition-colors" />
                <span>Compare</span>
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Resources Link */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(
            navigationMenuTriggerStyle(), 
            "group bg-transparent hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-pink-500/10 transition-all duration-300 pointer-events-auto"
          )}>
            <Link href="/resources">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 group-hover:text-rose-400 transition-colors" />
                <span>Resources</span>
              </div>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ColorfulListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { 
    icon: React.ElementType;
    color: string;
  }
>(({ className, title, children, icon: Icon, color, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-300 hover:bg-white/5 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-white/10",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn("h-4 w-4 transition-all group-hover:scale-110", color)} />
            <div className="text-sm font-semibold leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground ml-6">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ColorfulListItem.displayName = "ColorfulListItem"

const GradientCategoryItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { 
    icon: React.ElementType;
    gradient: string;
    color: string;
  }
>(({ className, title, children, icon: Icon, gradient, color, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group relative block select-none space-y-2 rounded-xl p-4 leading-none no-underline outline-none transition-all duration-300 hover:scale-[1.05] overflow-hidden border border-white/5 hover:border-white/20",
            className
          )}
          {...props}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", gradient)} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110", gradient)}>
                <Icon className={cn("h-5 w-5 transition-all", color)} />
              </div>
              <div className="text-sm font-bold leading-none">{title}</div>
            </div>
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground/80 group-hover:text-muted-foreground transition-colors pl-1">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
GradientCategoryItem.displayName = "GradientCategoryItem"
