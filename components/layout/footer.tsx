"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <footer className={cn(
      "border-t border-white/10 glass-effect mt-auto transition-all duration-300",
      isAdminPage && "md:ml-64"
    )}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="font-bold text-xl tracking-tight">
              BioHub<span className="text-primary">.io</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier destination for bioinformatics tools, learning resources, and community insights.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/directory" className="hover:text-primary">Tools Directory</Link></li>
              <li><Link href="/courses" className="hover:text-primary">Courses</Link></li>
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/compare" className="hover:text-primary">Comparisons</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/resources/beginner-guide" className="hover:text-primary">Beginner's Guide</Link></li>
              <li><Link href="/resources/paths" className="hover:text-primary">Learning Paths</Link></li>
              <li><Link href="/resources/glossary" className="hover:text-primary">Glossary</Link></li>
              <li><Link href="/newsletter" className="hover:text-primary">Newsletter</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Terms of Use</Link></li>
              <li><Link href="/affiliate" className="hover:text-primary">Affiliate Disclosure</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BioinformaticsHub.io. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Twitter</Link>
            <Link href="#" className="hover:text-foreground">LinkedIn</Link>
            <Link href="#" className="hover:text-foreground">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
