/**
 * Affiliate Disclosure Components
 * 
 * FTC-compliant disclosure banners and inline notices
 */

"use client";

import Link from "next/link";
import { Info, X } from "lucide-react";
import { useState } from "react";

export interface AffiliateDisclosureBannerProps {
  variant?: "info" | "minimal" | "prominent";
  dismissible?: boolean;
  className?: string;
}

export function AffiliateDisclosureBanner({
  variant = "info",
  dismissible = false,
  className = "",
}: AffiliateDisclosureBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const variants = {
    info: {
      container: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      icon: "text-blue-400",
    },
    minimal: {
      container: "bg-white/5 border-white/10 text-white/60",
      icon: "text-white/40",
    },
    prominent: {
      container: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      icon: "text-yellow-400",
    },
  };

  const style = variants[variant];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${style.container} ${className}`}
      role="note"
      aria-label="Affiliate disclosure"
    >
      <Info className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
      <div className="flex-1">
        <p className="text-sm">
          <strong>Affiliate Disclosure:</strong> This content contains affiliate links.
          When you make a purchase through these links, we may earn a commission at no
          additional cost to you. This helps support our work in providing free resources
          to the bioinformatics community.{" "}
          <Link href="/affiliate/disclosure" className="underline hover:no-underline">
            Learn more
          </Link>
        </p>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss disclosure"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export interface AffiliateDisclosureInlineProps {
  className?: string;
}

export function AffiliateDisclosureInline({ className = "" }: AffiliateDisclosureInlineProps) {
  return (
    <p className={`text-xs text-white/40 italic ${className}`}>
      * This is an affiliate link. We may earn a commission if you make a purchase.
      See our{" "}
      <Link href="/affiliate/disclosure" className="underline hover:text-white/60">
        disclosure policy
      </Link>
      .
    </p>
  );
}

/**
 * Auto-Insert Disclosure Hook
 * 
 * Use this hook in pages/components that contain affiliate content
 * to automatically track and insert disclosures as needed
 */
export function useAffiliateDisclosure() {
  const [hasAffiliateContent, setHasAffiliateContent] = useState(false);

  const markAffiliateContent = () => {
    if (!hasAffiliateContent) {
      setHasAffiliateContent(true);
    }
  };

  return {
    hasAffiliateContent,
    markAffiliateContent,
    DisclosureBanner: hasAffiliateContent ? AffiliateDisclosureBanner : () => null,
  };
}
