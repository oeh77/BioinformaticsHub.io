"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { MegaMenu } from "@/components/layout/mega-menu";
import { useToast } from "@/hooks/use-toast";
import { SubscribeDialog } from "@/components/ui/subscribe-dialog";
import { HeaderSearch } from "@/components/search/header-search";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CarbonAd } from "@/components/ads";

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
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="w-full px-3 md:px-4 h-12 flex items-center gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="BioinformaticsHub.io"
              width={32}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0">
            <MegaMenu />
          </nav>

          {/* Spacer for smaller screens */}
          <div className="flex-1 lg:hidden" />

          {/* Actions - all items visible */}
          <div className="flex items-center gap-1 shrink-0">
            <HeaderSearch className="hidden md:block" />
            <ThemeToggle />
            <NotificationBell />
            
            <Button size="sm" variant="ghost" className="hidden lg:flex rounded-full text-xs h-8 px-2" onClick={() => setIsDialogOpen(true)}>
              Subscribe
            </Button>

            <UserMenu />
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
