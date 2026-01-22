"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminLogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

interface AdminMobileSidebarProps {
  userName?: string | null;
}

export function AdminMobileSidebar({ userName }: AdminMobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-20 left-4 z-50 p-2.5 rounded-lg bg-card/80 backdrop-blur-sm border border-white/10 shadow-lg hover:bg-primary/10 transition-all duration-200"
        aria-label="Open navigation menu"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card/95 backdrop-blur-md border-r border-white/10 z-[70] transform transition-transform duration-300 ease-out md:hidden shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar Content */}
        <div className="pt-12 h-full flex flex-col">
          <AdminSidebar userName={userName} onNavClick={() => setIsOpen(false)} />
          
          <div className="mt-auto p-6 border-t border-white/10">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
