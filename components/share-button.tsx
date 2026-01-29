"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Twitter, Linkedin, Facebook, Mail, Link2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  title,
  url,
  description,
  variant = "outline",
  size = "lg",
  className = "",
  showLabel = true,
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the current URL if not provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = description || title;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error - fall back to menu
        if ((err as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      // Native share not available, show menu
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-sky-500/20 hover:text-sky-400",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-blue-500/20 hover:text-blue-400",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-indigo-500/20 hover:text-indigo-400",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      color: "hover:bg-green-500/20 hover:text-green-400",
    },
  ];

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={`rounded-full glass hover:bg-white/10 ${className}`}
        onClick={handleNativeShare}
        title="Share"
        aria-label="Share"
      >
        <Share2 className={showLabel ? "mr-2 w-4 h-4" : "w-4 h-4"} />
        {showLabel && "Share"}
      </Button>

      {/* Share Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 z-50 w-64 glass-card p-4 rounded-xl shadow-xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <span className="font-medium text-sm">Share</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close share menu"
              >
                ×
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${link.color}`}
                  title={`Share on ${link.name}`}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{link.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Copy Link
                </span>
                {copied ? (
                  <span className="flex items-center gap-1 text-green-500">
                    <Check className="w-4 h-4" />
                    Copied!
                  </span>
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
