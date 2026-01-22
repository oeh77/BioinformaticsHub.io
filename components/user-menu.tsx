"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, Settings, Bookmark, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-9 w-9 rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="rounded-full">
            Sign In
          </Button>
        </Link>
        <Link href="/register" className="hidden sm:block">
          <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-accent">
            Get Started
          </Button>
        </Link>
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0].toUpperCase() || "U";

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-secondary/50 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/10 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="font-medium truncate">{session.user.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {session.user.email}
            </p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/bookmarks"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors text-primary"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="pt-1 border-t border-white/10">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary/50 transition-colors w-full text-left text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
