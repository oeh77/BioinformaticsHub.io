/**
 * Affiliate Product Card Component
 * 
 * A reusable card component for displaying affiliate products in content.
 * Includes affiliate disclosure and proper tracking.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Star, Check, Info } from "lucide-react";

export interface AffiliateProductProps {
  productId: string;
  name: string;
  partner: string;
  description?: string;
  price?: number | null;
  pricingModel?: "one_time" | "subscription" | "usage_based";
  currency?: string;
  imageUrl?: string;
  rating?: number;
  features?: string[];
  category?: string;
  affiliateUrl: string;
  shortCode?: string;
  isFeatured?: boolean;
  showDisclosure?: boolean;
  variant?: "compact" | "default" | "featured";
}

export function AffiliateProductCard({
  productId,
  name,
  partner,
  description,
  price,
  pricingModel = "one_time",
  currency = "USD",
  imageUrl,
  rating,
  features,
  category,
  affiliateUrl,
  shortCode,
  isFeatured,
  showDisclosure = true,
  variant = "default",
}: AffiliateProductProps) {
  const [imageError, setImageError] = useState(false);

  const trackingUrl = shortCode 
    ? `/go/${shortCode}` 
    : affiliateUrl;

  function formatPrice(): string {
    if (price === null || price === undefined) {
      return pricingModel === "usage_based" ? "Pay-per-use" : "Contact for pricing";
    }
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    if (pricingModel === "subscription") return `${formattedPrice}/mo`;
    return formattedPrice;
  }

  if (variant === "compact") {
    return (
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener sponsored"
        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary/50 transition-all group"
      >
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 rounded-lg object-cover bg-white/10"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-2xl">{name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold group-hover:text-primary transition-colors truncate">
            {name}
          </h4>
          <p className="text-sm text-white/60">{partner}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-primary">{formatPrice()}</p>
          {showDisclosure && (
            <p className="text-xs text-white/40">Affiliate</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
        isFeatured
          ? "border-primary/50 ring-1 ring-primary/20"
          : "border-white/10 hover:border-primary/30"
      }`}
    >
      {/* Featured Badge */}
      {isFeatured && (
        <div className="bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-center text-sm font-medium">
          Featured Product
        </div>
      )}

      {/* Image */}
      {imageUrl && !imageError && (
        <div className="relative h-48 bg-white/5">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {category && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs">
              {category}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <p className="text-sm text-white/60 mb-1">{partner}</p>
          <h3 className="text-lg font-semibold line-clamp-2">{name}</h3>
        </div>

        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-white/20"
                }`}
              />
            ))}
            <span className="text-sm text-white/60 ml-1">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-white/70 line-clamp-2 mb-4">{description}</p>
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {features.slice(0, 4).map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span className="text-white/80">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-primary">{formatPrice()}</p>
            {pricingModel === "subscription" && (
              <p className="text-xs text-white/50">Billed monthly</p>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener sponsored"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/80 rounded-lg font-medium transition-colors"
        >
          {pricingModel === "usage_based" || price === null
            ? "Get Started"
            : "View Pricing"}
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Disclosure */}
        {showDisclosure && (
          <p className="text-xs text-white/40 text-center mt-3 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            Affiliate link. We may earn a commission.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Affiliate Product Grid
 * 
 * Display multiple products in a grid layout
 */
export interface AffiliateProductGridProps {
  products: AffiliateProductProps[];
  columns?: 2 | 3 | 4;
  showDisclosure?: boolean;
}

export function AffiliateProductGrid({
  products,
  columns = 3,
  showDisclosure = true,
}: AffiliateProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className="space-y-4">
      {showDisclosure && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400">
          <Info className="w-4 h-4 shrink-0" />
          <p>
            The following products contain affiliate links. We may earn a commission
            at no extra cost to you.{" "}
            <Link href="/affiliate/disclosure" className="underline">
              Learn more
            </Link>
          </p>
        </div>
      )}
      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {products.map((product) => (
          <AffiliateProductCard
            key={product.productId}
            {...product}
            showDisclosure={false}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Inline Affiliate Link
 * 
 * For embedding affiliate links naturally in content
 */
export interface InlineAffiliateLinkProps {
  href: string;
  shortCode?: string;
  children: React.ReactNode;
  showIndicator?: boolean;
}

export function InlineAffiliateLink({
  href,
  shortCode,
  children,
  showIndicator = true,
}: InlineAffiliateLinkProps) {
  const trackingUrl = shortCode ? `/go/${shortCode}` : href;

  return (
    <a
      href={trackingUrl}
      target="_blank"
      rel="noopener sponsored"
      className="text-primary hover:underline inline-flex items-center gap-1"
    >
      {children}
      {showIndicator && (
        <span className="text-xs text-white/40 ml-0.5" title="Affiliate link">
          *
        </span>
      )}
    </a>
  );
}
