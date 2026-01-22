"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { Search } from "lucide-react";
import { MegaMenu } from "@/components/layout/mega-menu";
import { useToast } from "@/hooks/use-toast";
import { SubscribeDialog } from "@/components/ui/subscribe-dialog";

export function Header() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubscribeSuccess = () => {
    toast({
      title: "🎉 Subscribed!",
      description: "You have successfully subscribed to our newsletter.",
      duration: 5000,
    });
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <span className="font-bold text-xl tracking-tight">BioHub<span className="text-primary">.io</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium z-50">
             <MegaMenu />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <form action="/search" method="GET" className="hidden md:flex items-center relative">
               <input 
                 type="text" 
                 name="q"
                 placeholder="Search..." 
                 className="h-9 w-[200px] rounded-full bg-secondary/50 border-none px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                 autoComplete="off"
               />
               <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </form>
            
            <ThemeToggle />
            
            <Button size="sm" variant="ghost" className="hidden md:flex rounded-full" onClick={() => setIsDialogOpen(true)}>
              Subscribe
            </Button>

            <UserMenu />
            
            {/* Mobile Menu Trigger (Placeholder) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <SubscribeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleSubscribeSuccess}
      />
    </>
  );
}
